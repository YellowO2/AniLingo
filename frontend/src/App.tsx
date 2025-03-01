import { useState, useRef, useEffect } from "react";
import Live2DViewer from "./Live2DViewer.tsx";
import SignupModal from "./components/SignupModal/SignupModal.tsx";
import "./App.css";

// Define the stages of onboarding
type OnboardingStage = 
  | "welcome" 
  | "askLevel" 
  | "processLevel" 
  | "askFocus" 
  | "processFocus" 
  | "suggestSignup" 
  | "complete";

// Define user preferences
interface UserPreferences {
  level: "beginner" | "intermediate" | "advanced" | null;
  focus: "daily" | "anime" | "travel" | "business" | null;
}

// Mock API service - enhanced with onboarding responses
const mockApiService = {
  async getAiResponse(userMessage: string, onboardingStage: OnboardingStage, setOnboardingStage: React.Dispatch<React.SetStateAction<OnboardingStage>>, userPreferences: UserPreferences, setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handle different onboarding stages
    if (onboardingStage === "welcome") {
      setOnboardingStage("askLevel");
      return "Great! To personalize your experience, I'll need to know a few things about you. What's your Japanese level? (Beginner/Intermediate/Advanced)";
    }
    
    if (onboardingStage === "askLevel") {
      // Process user's language level response
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes("beginner") || lowerMsg.includes("n5") || lowerMsg.includes("n4")) {
        setUserPreferences({...userPreferences, level: "beginner"});
        setOnboardingStage("processLevel");
        return "Beginner level is perfect! Everyone starts somewhere, and I'll make sure to explain things clearly. 初心者、大丈夫ですよ！(It's okay to be a beginner!)";
      } 
      else if (lowerMsg.includes("intermediate") || lowerMsg.includes("n3")) {
        setUserPreferences({...userPreferences, level: "intermediate"});
        setOnboardingStage("processLevel");
        return "Intermediate level is great! You probably know some basics already. 中級レベルですね！頑張りましょう！(Let's do our best at the intermediate level!)";
      }
      else if (lowerMsg.includes("advanced") || lowerMsg.includes("n2") || lowerMsg.includes("n1")) {
        setUserPreferences({...userPreferences, level: "advanced"});
        setOnboardingStage("processLevel");
        return "Advanced level! I'm impressed! 上級レベルですね！素晴らしい！(Advanced level! Wonderful!)";
      } 
      else {
        // If we couldn't determine the level, ask again
        return "すみません (Sorry), I didn't catch that. Are you a Beginner, Intermediate, or Advanced Japanese learner?";
      }
    }
    
    if (onboardingStage === "processLevel") {
      setOnboardingStage("askFocus");
      return "What would you like to focus on learning? (Daily Conversation/Anime & Manga/Travel/Business)";
    }
    
    if (onboardingStage === "askFocus") {
      // Process user's focus area response
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes("daily") || lowerMsg.includes("conversation") || lowerMsg.includes("everyday")) {
        setUserPreferences({...userPreferences, focus: "daily"});
        setOnboardingStage("processFocus");
        return "Daily conversation is a great choice! We'll practice useful phrases for everyday situations. 日常会話を練習しましょう！(Let's practice daily conversation!)";
      } 
      else if (lowerMsg.includes("anime") || lowerMsg.includes("manga")) {
        setUserPreferences({...userPreferences, focus: "anime"});
        setOnboardingStage("processFocus");
        return "Anime & Manga vocabulary! Fun choice! アニメの日本語を勉強しましょう！(Let's study Japanese from anime!)";
      }
      else if (lowerMsg.includes("travel") || lowerMsg.includes("tourism")) {
        setUserPreferences({...userPreferences, focus: "travel"});
        setOnboardingStage("processFocus");
        return "Travel Japanese is very practical! 旅行の日本語ですね！役に立ちますよ！(Travel Japanese! It will be useful!)";
      }
      else if (lowerMsg.includes("business") || lowerMsg.includes("work") || lowerMsg.includes("professional")) {
        setUserPreferences({...userPreferences, focus: "business"});
        setOnboardingStage("processFocus");
        return "Business Japanese! Very professional of you! ビジネス日本語を勉強しましょう！(Let's study business Japanese!)";
      }
      else {
        // If we couldn't determine the focus, ask again
        return "すみません (Sorry), I didn't understand your preference. Would you like to focus on Daily Conversation, Anime & Manga, Travel, or Business Japanese?";
      }
    }
    
    if (onboardingStage === "processFocus") {
      setOnboardingStage("suggestSignup");
      return "Perfect! I've customized your learning experience based on your preferences. Would you like to save your progress by creating an account?";
    }
    
    if (onboardingStage === "suggestSignup") {
      // Any response here will complete the onboarding
      setOnboardingStage("complete");
      return "Great! Let's start learning Japanese together! Try typing a greeting like 'こんにちは' (hello) or ask me how to say something in Japanese!";
    }
    
    // For completed onboarding or general conversation
    if (onboardingStage === "complete") {
      // Regular responses for after onboarding
      const responses = [
        "なるほど！それは面白いですね。(I see! That's interesting.)",
        "もう少し詳しく教えてください。(Please tell me more details.)",
        `そうですか！日本語で言えば「素晴らしい」です！(I see! In Japanese, you'd say "subarashii"!)`,
        "それについて、もっと話しましょう！(Let's talk more about that!)",
        "はい、分かりました。次に何をしますか？(Yes, I understand. What would you like to do next?)",
        "日本語の練習、頑張っていますね！(You're working hard on your Japanese practice!)",
      ];
      
      // Choose a random response after onboarding is complete
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Fallback response
    return "すみません, I didn't understand. Could you try asking something else?";
  }
};

function App() {
  // Message state
  const [messages, setMessages] = useState<Array<{
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
  }>>([
    {
      text: "こんにちは! Welcome to AniLingo! I'm Hiyori, your personal Japanese tutor. I can help you practice Japanese through conversation. Would you like to get started?",
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
      // Get AI response from mock API with onboarding context
      const aiResponse = await mockApiService.getAiResponse(
        userMessage, 
        onboardingStage, 
        setOnboardingStage,
        userPreferences,
        setUserPreferences
      );
      
      // Add AI response
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: aiResponse,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
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
  
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="live2d-section">
          <Live2DViewer 
          // emotion={onboardingStage === "welcome" ? "happy" : undefined}
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