import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  addUserMessage: (text: string) => void;
  addAIMessage: (text: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { 
      text, 
      sender: 'user', 
      timestamp: new Date() 
    }]);
  };

  const addAIMessage = (text: string) => {
    setMessages(prev => [...prev, { 
      text, 
      sender: 'ai', 
      timestamp: new Date() 
    }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      addUserMessage, 
      addAIMessage, 
      isLoading, 
      setIsLoading,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};