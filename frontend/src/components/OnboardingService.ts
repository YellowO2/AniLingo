// OnboardingService.ts
import { Dispatch, SetStateAction } from "react";

// Define the stages of onboarding
export type OnboardingStage = 
  | "welcome" 
  | "askLevel" 
  | "processLevel" 
  | "askFocus" 
  | "processFocus" 
  | "suggestSignup" 
  | "complete";

// Define user preferences
export interface UserPreferences {
  level: "beginner" | "intermediate" | "advanced" | null;
  focus: "daily" | "anime" | "travel" | "business" | null;
}

// Interface for chat messages
export interface ChatMessage {
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// Type for the message handler function
type AddMessageFunction = (message: ChatMessage) => void;

class OnboardingService {
  private setStage: Dispatch<SetStateAction<OnboardingStage>>;
  private setPreferences: Dispatch<SetStateAction<UserPreferences>>;
  private addMessage: AddMessageFunction;
  private autoResponseDelay: number;

  constructor(
    private stage: OnboardingStage,
    setStage: Dispatch<SetStateAction<OnboardingStage>>,
    private preferences: UserPreferences,
    setPreferences: Dispatch<SetStateAction<UserPreferences>>,
    addMessage: AddMessageFunction,
    autoResponseDelay = 1500
  ) {
    this.setStage = setStage;
    this.setPreferences = setPreferences;
    this.addMessage = addMessage;
    this.autoResponseDelay = autoResponseDelay;
  }

  // Update stage reference
  updateStage(stage: OnboardingStage) {
    this.stage = stage;
  }

  // Update preferences reference
  updatePreferences(preferences: UserPreferences) {
    this.preferences = preferences;
  }

  // Handle user messages during onboarding
  async processUserMessage(userMessage: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch(this.stage) {
      case "welcome":
        return this.handleWelcomeStage();
      
      case "askLevel":
        return this.handleAskLevelStage(userMessage);
      
      case "processLevel":
        return this.handleProcessLevelStage();
      
      case "askFocus":
        return this.handleAskFocusStage(userMessage);
      
      case "processFocus":
        return this.handleProcessFocusStage();
      
      case "suggestSignup":
        return this.handleSuggestSignupStage();
      
      case "complete":
        return this.handleCompletedOnboarding(userMessage);
      
      default:
        return "すみません, I didn't understand. Could you try asking something else?";
    }
  }

  // Handle welcome stage
  private handleWelcomeStage(): string {
    this.setStage("askLevel");
    return "Great! To personalize your experience, I'll need to know a few things about you. What's your Japanese level? (Beginner/Intermediate/Advanced)";
  }

  // Handle ask level stage
  private handleAskLevelStage(userMessage: string): string {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("beginner") || lowerMsg.includes("n5") || lowerMsg.includes("n4")) {
      this.setPreferences({...this.preferences, level: "beginner"});
      this.setStage("processLevel");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processLevel");
      
      return "Beginner level is perfect! Everyone starts somewhere, and I'll make sure to explain things clearly. 初心者、大丈夫ですよ！(It's okay to be a beginner!)";
    } 
    else if (lowerMsg.includes("intermediate") || lowerMsg.includes("n3")) {
      this.setPreferences({...this.preferences, level: "intermediate"});
      this.setStage("processLevel");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processLevel");
      
      return "Intermediate level is great! You probably know some basics already. 中級レベルですね！頑張りましょう！(Let's do our best at the intermediate level!)";
    }
    else if (lowerMsg.includes("advanced") || lowerMsg.includes("n2") || lowerMsg.includes("n1")) {
      this.setPreferences({...this.preferences, level: "advanced"});
      this.setStage("processLevel");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processLevel");
      
      return "Advanced level! I'm impressed! 上級レベルですね！素晴らしい！(Advanced level! Wonderful!)";
    } 
    else {
      // If we couldn't determine the level, ask again
      return "すみません (Sorry), I didn't catch that. Are you a Beginner, Intermediate, or Advanced Japanese learner?";
    }
  }

  // Handle process level stage
  private handleProcessLevelStage(): string {
    this.setStage("askFocus");
    return "What would you like to focus on learning? (Daily Conversation/Anime & Manga/Travel/Business)";
  }

  // Handle ask focus stage
  private handleAskFocusStage(userMessage: string): string {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("daily") || lowerMsg.includes("conversation") || lowerMsg.includes("everyday")) {
      this.setPreferences({...this.preferences, focus: "daily"});
      this.setStage("processFocus");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processFocus");
      
      return "Daily conversation is a great choice! We'll practice useful phrases for everyday situations. 日常会話を練習しましょう！(Let's practice daily conversation!)";
    } 
    else if (lowerMsg.includes("anime") || lowerMsg.includes("manga")) {
      this.setPreferences({...this.preferences, focus: "anime"});
      this.setStage("processFocus");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processFocus");
      
      return "Anime & Manga vocabulary! Fun choice! アニメの日本語を勉強しましょう！(Let's study Japanese from anime!)";
    }
    else if (lowerMsg.includes("travel") || lowerMsg.includes("tourism")) {
      this.setPreferences({...this.preferences, focus: "travel"});
      this.setStage("processFocus");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processFocus");
      
      return "Travel Japanese is very practical! 旅行の日本語ですね！役に立ちますよ！(Travel Japanese! It will be useful!)";
    }
    else if (lowerMsg.includes("business") || lowerMsg.includes("work") || lowerMsg.includes("professional")) {
      this.setPreferences({...this.preferences, focus: "business"});
      this.setStage("processFocus");
      
      // Schedule next message directly instead of relying on stage change
      this.scheduleNextMessage("processFocus");
      
      return "Business Japanese! Very professional of you! ビジネス日本語を勉強しましょう！(Let's study business Japanese!)";
    }
    else {
      return "すみません (Sorry), I didn't understand your preference. Would you like to focus on Daily Conversation, Anime & Manga, Travel, or Business Japanese?";
    }
  }

  // Handle process focus stage
  private handleProcessFocusStage(): string {
    this.setStage("suggestSignup");
    return "Perfect! I've customized your learning experience based on your preferences. Would you like to save your progress by creating an account?";
  }

  // Handle suggest signup stage
  private handleSuggestSignupStage(): string {
    this.setStage("complete");
    return "Great! Let's start learning Japanese together! Try typing a greeting like 'こんにちは' (hello) or ask me how to say something in Japanese!";
  }

  // Handle completed onboarding
  private handleCompletedOnboarding(userMessage: string): string {
    // Basic language pattern recognition
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("こんにちは")) {
      return "こんにちは！(Hello!) Great job with the greeting! How are you today? In Japanese, you can ask 'お元気ですか？' (Ogenki desu ka?)";
    }
    
    if (lowerMsg.includes("how do you say") || lowerMsg.includes("how to say")) {
      return "To say that in Japanese, you would use... (I'd need the specific phrase to translate, but I'm simulating a response here)";
    }
    
    // Regular responses for after onboarding
    const responses = [
      "なるほど！それは面白いですね。(I see! That's interesting.)",
      "もう少し詳しく教えてください。(Please tell me more details.)",
      `そうですか！日本語で言えば「素晴らしい」です！(I see! In Japanese, you'd say "subarashii"!)`,
      "それについて、もっと話しましょう！(Let's talk more about that!)",
      "はい、分かりました。次に何をしますか？(Yes, I understand. What would you like to do next?)",
      "日本語の練習、頑張っていますね！(You're working hard on your Japanese practice!)",
    ];
    
    // Choose a random response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // New method to schedule the next message independent of stage changes
  private scheduleNextMessage(forStage: OnboardingStage): void {
    setTimeout(() => {
      let response = "";
      
      // This hardcoded logic is more reliable than relying on the current stage
      if (forStage === "processLevel") {
        response = this.handleProcessLevelStage();
      } else if (forStage === "processFocus") {
        response = this.handleProcessFocusStage();
      }
      
      if (response) {
        this.addMessage({
          text: response,
          sender: "ai",
          timestamp: new Date()
        });
      }
    }, this.autoResponseDelay);
  }

  // Get emotion based on stage
  getEmotion(): string | undefined {
    switch(this.stage) {
      case "welcome":
        return "happy";
      case "askLevel":
        return "neutral";
      case "processLevel":
        return "happy";
      case "askFocus":
        return "neutral";
      case "processFocus":
        return "happy";
      case "suggestSignup":
        return "happy";
      case "complete":
        return undefined; // Let animations take over in normal mode
      default:
        return undefined;
    }
  }
}

export default OnboardingService;