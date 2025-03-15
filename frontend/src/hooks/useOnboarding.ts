import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext.tsx";
import OnboardingService, { OnboardingStage, UserPreferences } from "../components/OnboardingService.ts";

export const useOnboarding = (onboardingCompleteCallback: () => void) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addAIMessage, isLoading, setIsLoading } = useChat();
  const [onboardingStage, setOnboardingStage] = useState<OnboardingStage>("welcome");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ level: null, focus: null });
  const [showSignupModal, setShowSignupModal] = useState(false);

  const onboardingServiceRef = useRef<OnboardingService | null>(null);

  useEffect(() => {
    onboardingServiceRef.current = new OnboardingService(
      onboardingStage, setOnboardingStage, userPreferences, setUserPreferences, addAIMessage, 1500
    );

    addAIMessage("こんにちは! Welcome to AniLingo! I'm Hiyori, your personal Japanese tutor. I can help you practice Japanese through conversation. Let's start learning!");
    // setOnboardingStage("welcome");
  }, []);

  useEffect(() => {
    onboardingServiceRef.current?.updateStage(onboardingStage);
    onboardingServiceRef.current?.updatePreferences(userPreferences);
  }, [onboardingStage, userPreferences]);

  useEffect(() => {
    if (onboardingStage === "welcome") {
      const timer = setTimeout(() => {
        addAIMessage("First, to personalize your experience, I'll need to know a few things about you. What's your Japanese level? (Beginner/Intermediate/Advanced)");
        setOnboardingStage("askLevel");
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [onboardingStage]);

  useEffect(() => {
    if (onboardingStage === "suggestSignup") {
      const timer = setTimeout(() => setShowSignupModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [onboardingStage]);

  const handleUserMessage = async (userMessage: string) => {
    try {
      setIsLoading(true);
      const aiResponse = await onboardingServiceRef.current?.processUserMessage(userMessage);
      if (aiResponse) {
        addAIMessage(aiResponse);
      }
    } catch (error) {
      console.error("AI response error:", error);
      addAIMessage("すみません、エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupComplete = (method: "email" | "guest") => {
    setShowSignupModal(false);
    addAIMessage(
      method === "email"
        ? "Thank you for creating an account! Your progress will be saved."
        : "You're continuing as a guest. Let's start learning with your first generated lesson!"
    );
    onboardingCompleteCallback();
  };

  const getCurrentEmotion = () => onboardingServiceRef.current?.getEmotion();

  return {
    onboardingStage,
    userPreferences,
    showSignupModal,
    handleUserMessage,
    handleSignupComplete,
    getCurrentEmotion,
  };
};