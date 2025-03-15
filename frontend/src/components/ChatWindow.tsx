import { RefObject } from 'react';
import { ChatMessage } from '../context/ChatContext';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const ChatWindow = ({ messages, isLoading, messagesEndRef }: ChatWindowProps) => {
  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
        >
          <div className="message-bubble">{message.text}</div>
          <div className="message-timestamp">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="message ai-message">
          <div className="message-bubble typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
