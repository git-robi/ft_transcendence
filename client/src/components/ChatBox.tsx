import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../i18n/useLanguage';
import ChatAPI from '../APIs/chat';
import SendIcon from './icons/SendIcon';
import type { ChatMessage } from '../types';

interface ChatBoxProps {
  friendId: number;
  friendName: string;
  friendAvatar: string;
  onMessageSent?: (msg: ChatMessage) => void;
}

const ChatBox = ({ friendId, friendName, friendAvatar, onMessageSent }: ChatBoxProps) => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch message history when friend changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await ChatAPI.get(`/${friendId}`);
        setMessages(res.data);
      } catch {
        // silent
      }
    };
    fetchMessages();
    setInput('');
  }, [friendId]);

  
  useEffect(() => {
    if (!socket) {
      return;
    }
    const handler = (msg: ChatMessage) => {
      if (msg.senderId === friendId) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('message:receive', handler);
    return () => { socket.off('message:receive', handler); };
  }, [socket, friendId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await ChatAPI.post(`/${friendId}`, { content: input.trim() });
      setMessages(prev => [...prev, res.data]);
      setInput('');
      onMessageSent?.(res.data);
    } catch {
      // silent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="relative">
          <img
            src={friendAvatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-primary ${
              isOnline(friendId) ? 'bg-green-400' : 'bg-gray-500'
            }`}
          />
        </div>
        <div>
          <span className="font-semibold text-sm">{friendName}</span>
          <p className={`text-xs ${isOnline(friendId) ? 'text-green-400' : 'text-text-muted'}`}>
            {isOnline(friendId) ? t.social.online : t.social.offline}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  msg.senderId === user?.id
                    ? 'bg-accent-purple/20 text-text-primary'
                    : 'bg-white/10 text-text-primary'
                }`}
              >
                <p
                  className="break-words whitespace-pre-wrap"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {msg.content}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.typeMessage}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-purple text-text-primary placeholder:text-text-muted"
            maxLength={1000}
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-accent-purple/20 hover:bg-accent-purple/30 rounded-full transition"
            title="Send message"
          >
            <SendIcon className="h-5 w-5 text-accent-purple" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
