import { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'opponent';
}

const Chat = () => {
  const [messages] = useState<Message[]>([
    { id: 1, text: 'Hi!', sender: 'user' },
    { id: 2, text: 'Hello!', sender: 'opponent' },
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 bg-white rounded-t-lg p-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'bg-neutral-500 text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message input area */}
      <div className="bg-white rounded-b-lg p-4 border-t border-neutral-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message"
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 text-neutral-900"
          />
          <div className="flex gap-2">
	          <button
              className="p-2 bg-neutral-300 hover:bg-neutral-400 rounded-full transition"
              title="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
