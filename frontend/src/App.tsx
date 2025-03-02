import { useState, useRef, useEffect } from "react";
import Live2DViewer from "./Live2DViewer.tsx";
import SignupModal from "./components/SignupModal/SignupModal.tsx";
import OnboardingService, { 
  OnboardingStage, 
  UserPreferences, 
  ChatMessage 
} from "./components/OnboardingService.ts";
import "./App.css";

function App() {
  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "こんにちは! Welcome to AniLingo! I'm Hiyori, your personal Japanese tutor. I can help you practice Japanese through conversation. Let's start learning!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  
  // UI state
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Onboarding state
  const [onboardingStage, setOnboardingStage] = useState<OnboardingStage>("welcome");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    level: null,
    focus: null
  });
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Create an onboarding service instance
  const onboardingServiceRef = useRef<OnboardingService | null>(null);
  
  // Initialize onboarding service only once
  useEffect(() => {
    const addMessage = (message: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };
    
    onboardingServiceRef.current = new OnboardingService(
      onboardingStage,
      setOnboardingStage,
      userPreferences,
      setUserPreferences,
      addMessage,
      1500 // Auto-response delay in ms
    );
  }, []);
  
  // Keep onboarding service in sync with React state
  useEffect(() => {
    if (onboardingServiceRef.current) {
      onboardingServiceRef.current.updateStage(onboardingStage);
      onboardingServiceRef.current.updatePreferences(userPreferences);
    }
  }, [onboardingStage, userPreferences]);
  
  // Show signup modal when we reach that stage
  useEffect(() => {
    if (onboardingStage === "suggestSignup") {
      // Small delay to let the message appear first
      const timer = setTimeout(() => {
        setShowSignupModal(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [onboardingStage]);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === "" || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Add user message immediately
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Get AI response from onboarding service
      const aiResponse = await onboardingServiceRef.current?.processUserMessage(userMessage);
      
      if (aiResponse) {
        // Add AI response
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: aiResponse,
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message if API call fails
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "すみません、エラーが発生しました。もう一度お試しください。",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle signup completion
  const handleSignupComplete = (method: "email" | "guest") => {
    setShowSignupModal(false);
    
    // Add a message based on signup method
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text: method === "email" 
          ? "Thank you for creating an account! Your progress will be saved." 
          : "You're continuing as a guest. Let's start learning!",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };
  
  // Get current emotion for Live2D model
  const getCurrentEmotion = () => {
    return onboardingServiceRef.current?.getEmotion();
  };
  
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="live2d-section">
          <Live2DViewer 
          // emotion={getCurrentEmotion()} 
          />
        </div>
        
        <div className="chat-section">
          <div className="chat-header">
            <h1>AniLingo</h1>
            <div className="chat-controls">
              {onboardingStage === "complete" && (
                <>
                  <button className="scenario-button">
                    Change Scenario
                  </button>
                  <button className="level-button">
                    日本語 {userPreferences.level === "beginner" ? "N5" : 
                           userPreferences.level === "intermediate" ? "N3" : "N1"}
                  </button>
                </>
              )}
              {onboardingStage !== "complete" && (
                <div className="onboarding-indicator">Setting up your experience...</div>
              )}
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === "user" ? "user-message" : "ai-message"}`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
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
          
          <form className="input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={onboardingStage === "welcome" 
                ? "Type 'yes' to get started..." 
                : "Type your message in Japanese or English..."}
              className="message-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={isLoading || inputValue.trim() === ""}
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal onComplete={handleSignupComplete} onClose={() => handleSignupComplete("guest")} />
      )}
    </div>
  );
}

export default App;