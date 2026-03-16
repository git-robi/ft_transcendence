import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../i18n/useLanguage';
import ChatAPI from '../APIs/chat';
import FriendsAPI from '../APIs/friends';
import type { ChatMessage, Conversation, FriendEntry } from '../types';

interface Contact {
  id: number;
  name: string;
  avatarUrl: string;
  lastMessage?: { content: string; createdAt: string; senderId: number };
}

function sortContacts(list: Contact[]): Contact[] {
  return [...list].sort((a, b) => {
    if (a.lastMessage && !b.lastMessage) return -1;
    if (!a.lastMessage && b.lastMessage) return 1;
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    }
    return a.name.localeCompare(b.name);
  });
}

const Chat = () => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const { t } = useLanguage();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const [convRes, friendsRes] = await Promise.all([
          ChatAPI.get('/conversations'),
          FriendsAPI.get('/'),
        ]);

        const conversations: Conversation[] = convRes.data;
        const friends: FriendEntry[] = friendsRes.data;

        const convMap = new Map<number, Conversation>();
        for (const conv of conversations) {
          convMap.set(conv.friendId, conv);
        }

        const contactList: Contact[] = friends.map(f => {
          const conv = convMap.get(f.friend.id);
          return {
            id: f.friend.id,
            name: f.friend.profile?.name || 'User',
            avatarUrl: f.friend.profile?.avatarUrl || '/avatars/avatar_default.png',
            lastMessage: conv?.lastMessage,
          };
        });

        setContacts(sortContacts(contactList));
      } catch {
        // silent
      }
      setLoading(false);
    };
    fetchContacts();
  }, []);

  
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: ChatMessage) => {
      setContacts(prev => {
        const updated = prev.map(c => {
          if (c.id === msg.senderId) {
            return { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId } };
          }
          return c;
        });
        return sortContacts(updated);
      });
    };
    socket.on('message:receive', handler);
    return () => { socket.off('message:receive', handler); };
  }, [socket]);

  
  const handleMessageSent = (msg: ChatMessage) => {
    setContacts(prev => {
      const updated = prev.map(c => {
        if (c.id === msg.receiverId) {
          return { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId } };
        }
        return c;
      });
      return sortContacts(updated);
    });
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-accent-purple text-xl animate-pulse">{t.common.loading}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col">
      <Header />

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-4 overflow-hidden">
        {/* Contacts sidebar */}
        <div
          className={`${
            selectedFriend ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 flex-shrink-0 flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden`}
        >
          <h2 className="p-4 font-semibold border-b border-white/10">{t.chat.title}</h2>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="p-4 text-text-muted text-sm">{t.chat.noConversations}</p>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedFriend(contact)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition text-left ${
                    selectedFriend?.id === contact.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={contact.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-primary ${
                        isOnline(contact.id) ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    {contact.lastMessage && (
                      <p className="text-xs text-text-muted truncate">
                        {contact.lastMessage.senderId === user?.id ? `${t.chat.you}: ` : ''}
                        {contact.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div
          className={`${
            selectedFriend ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden`}
        >
          {selectedFriend ? (
            <>
              <button
                className="md:hidden p-3 text-sm text-accent-purple border-b border-white/10 text-left"
                onClick={() => setSelectedFriend(null)}
              >
                &larr; {t.chat.back}
              </button>
              <ChatBox
                friendId={selectedFriend.id}
                friendName={selectedFriend.name}
                friendAvatar={selectedFriend.avatarUrl}
                onMessageSent={handleMessageSent}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-muted">{t.chat.selectConversation}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chat;
