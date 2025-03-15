import { useRef, useState, useEffect } from "react";
import { useOnboarding } from "./hooks/useOnboarding";
import { ChatProvider, useChat } from "./context/ChatContext";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import SignupModal from "./components/SignupModal";
import Live2DLessonView from "./components/LessonView/LessonView";
import { LessonData, Question } from "./components/LessonView/LessonQuizProps";
import "./App.css";

// Main App component with ChatProvider
function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

// App content with chat context
function AppContent() {
  const { messages, addUserMessage, addAIMessage, isLoading, setIsLoading } =
    useChat();
  const [inputValue, setInputValue] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [lessonData, setLessonData] = useState<LessonData>();
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonMode, setLessonMode] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [lessonScore, setLessonScore] = useState({ score: 0, total: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<Question>();
  const [suggestedScenarios, setSuggestedScenarios] = useState<string[]>([]);
  const getSuggestedScenarios = (interest: string) => {
    const scenarioLibrary: { [key: string]: string[] } = {
      Anime: [
        "Anime Convention Chat",
        "Voice Actor Interview",
        "Manga Store Shopping",
        "Cosplay Planning",
      ],
      Travel: [
        "Airport Check-in",
        "Local Transportation",
        "Cultural Experience",
        "Souvenir Shopping",
      ],
      General: [
        "Restaurant Reservation",
        "Job Interview",
        "Making Friends",
        "Emergency Situations",
      ],
    };
    return scenarioLibrary[interest] || scenarioLibrary.General;
  };

  const [coins, setCoins] = useState(0);
  const [happiness, setHappiness] = useState(50); // Happiness state
  const [level, setLevel] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle onboarding complete callback
  const handleOnboardingComplete = () => {
    console.log("Onboarding complete!");
    fetchCustomizedLesson();
  };

  // Call useOnboarding with the callback
  const {
    onboardingStage,
    userPreferences,
    showSignupModal,
    handleUserMessage,
    handleSignupComplete,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCurrentEmotion,
  } = useOnboarding(handleOnboardingComplete);

  const fetchCustomizedLesson = async (scenario = "Ordering Food") => {
    console.log("Fetching lesson called", scenario);
    try {
      console.log("Fetching lesson data...");
      setLessonLoading(true);
      const response = await fetch(
        "http://localhost:8000/generate-lesson-new",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language_level: userPreferences.level || "Beginner",
            interests: userPreferences.focus || "Anime",
            preferred_scenario: scenario,
          }),
        }
      );

      const data = await response.json();
      console.log("Lesson Data:", data);
      setLessonData(data);
      setLessonLoading(false);
      setLessonMode(true);
      setLessonCompleted(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      setLessonLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/ask-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          context: JSON.stringify(currentQuestion),
        }),
      });

      const data = await response.json();
      setIsLoading(false);
      return data.answer;
    } catch (error) {
      console.error("Error asking question:", error);
      setIsLoading(false);
      return "Sorry, I couldn't process your question at this time.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addUserMessage(inputValue.trim());

      if (lessonMode) {
        console.log("Asking question in lesson mode:", inputValue.trim());

        // Get answer from backend
        const answer = await askQuestion(inputValue.trim());
        console.log("Answer from backend:", answer);

        // Add AI response to chat
        addAIMessage(answer);
      } else {
        if (onboardingStage === "complete") {
          const userInput = inputValue.trim().toLowerCase();

          // Handle scenario selection
          const selectedScenario = parseScenarioInput(
            userInput,
            suggestedScenarios
          );
          if (selectedScenario) {
            fetchCustomizedLesson(selectedScenario);
          }
          // Add engagement features
          else if (userInput === "surprise me") {
            const randomScenario =
              suggestedScenarios[
                Math.floor(Math.random() * suggestedScenarios.length)
              ];
            fetchCustomizedLesson(randomScenario);
          } else if (userInput === "repeat") {
            // lessonData && fetchCustomizedLesson(lessonData.lesson_title);
          } else {
            // Add default response with engagement prompts
            addAIMessage(
              `Let's practice! You can:\n` +
                `- Choose a scenario from the list\n` +
                `- Type "surprise me" for a random challenge\n` +
                `- Type "repeat" to practice this lesson again\n` +
                `- Suggest your own scenario idea!`
            );
          }
        } else {
          handleUserMessage(inputValue.trim());
        }
      }

      setInputValue("");
    }
  };

  // Helper function to parse scenario input
  const parseScenarioInput = (input: string, scenarios: string[]) => {
    const index = parseInt(input) - 1;
    if (!isNaN(index) && index >= 0 && index < scenarios.length) {
      return scenarios[index];
    }
    return scenarios.find((scenario) =>
      scenario.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleLessonComplete = (score: number, total: number) => {
    setLessonScore({ score, total });
    setLessonCompleted(true);
    setLessonMode(false);

    // Calculate coins and happiness based on score
    const earnedCoins = Math.round((score / total) * 100);
    setCoins((prevCoins) => prevCoins + earnedCoins);

    // Calculate happiness level (example logic, can adjust based on performance)
    const newHappiness = Math.min(
      100,
      happiness + Math.round((score / total) * 20)
    ); // Increase happiness by 20% of score
    setHappiness(newHappiness);

    // Level up the user based on coins
    const newLevel = Math.floor(coins / 100) + 1;
    setLevel(newLevel);

    // Add a system message about the lesson completion
    addUserMessage(
      `I completed the lesson "${lessonData?.lesson_title}" with a score of ${score}/${total}!`
    );
  };

  const handleChangeScenario = () => {
    fetchCustomizedLesson("Shopping");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {/* Splash Screen */}
      <div className={`splash-screen ${showSplash ? "" : "hidden"}`}>
        <img src="/logo.png" alt="AniLingo Logo" className="splash-logo" />
      </div>

      {/* Main App Content */}
      {!showSplash && (
        <div className="main-content">
          <div className="live2d-section">
            {lessonMode ? (
              <Live2DLessonView
                lessonData={lessonData}
                isLoading={lessonLoading}
                coins={coins}
                happiness={happiness}
                level={level}
                onLessonComplete={handleLessonComplete}
                onQuestionChange={setCurrentQuestion}
              />
            ) : (
              <div className="live2d-wrapper">
                <Live2DLessonView
                  lessonData={null}
                  isLoading={lessonLoading}
                  onLessonComplete={() => {}}
                  onQuestionChange={() => {}}
                  coins={coins}
                  happiness={happiness}
                  level={level}
                />
                {lessonCompleted && (
                  <div className="lesson-complete-overlay">
                    <div className="lesson-results">
                      <h2>Lesson Complete!</h2>
                      <p className="score-result">
                        Score: {lessonScore.score}/{lessonScore.total}
                      </p>
                      {/* <p className="percentage">
                        {Math.round(
                          (lessonScore.score / lessonScore.total) * 100
                        )}
                        % correct
                      </p> */}
                      <div className="level-and-gains">
                        <div className="happiness-level">
                          <span className="happiness-icon">😊</span>
                          Happiness: {happiness}/100
                        </div>
                        <div className="level">
                          <span className="level-icon">🪙</span>
                          Level: {level}
                        </div>
                        <div className="coins">
                          <span className="coins-icon">💰</span>
                          Coins: {coins}
                        </div>
                      </div>
                      <button
                        className="continue-button"
                        onClick={() => {
                          setLessonCompleted(false);
                          // Generate personalized suggestions
                          const scenarios = getSuggestedScenarios(
                            userPreferences.focus || "General"
                          );
                          setSuggestedScenarios(scenarios);
                          // Add AI message with suggestions
                          addAIMessage(
                            `Great job completing the lesson! 🎉 Let's keep learning!\n\n` +
                              `Try these ${userPreferences.focus}-themed scenarios:\n` +
                              `${scenarios
                                .map((s, i) => `${i + 1}. ${s}`)
                                .join("\n")}\n\n` +
                              `Or suggest your own scenario! Type "surprise me" for a random challenge!`
                          );
                        }}
                      >
                        Continue
                      </button>
                      {/* <button
                        className="new-lesson-button"
                        onClick={handleChangeScenario}
                      >
                        Try New Scenario
                      </button> */}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="chat-section">
            <div className="chat-header">
              <h1>AniLingo</h1>
              <div className="chat-controls">
                {onboardingStage === "complete" && (
                  <>
                    <button onClick={handleChangeScenario}>
                      Change Scenario
                    </button>
                    <button>
                      日本語 {userPreferences.level?.toUpperCase()}
                    </button>
                    {!lessonMode && lessonData && (
                      <button
                        onClick={() => setLessonMode(true)}
                        className="start-lesson-button"
                      >
                        Start Lesson
                      </button>
                    )}
                  </>
                )}
                {onboardingStage !== "complete" && (
                  <div>Setting up your experience...</div>
                )}
              </div>
            </div>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onboardingStage={onboardingStage}
            />
          </div>
        </div>
      )}
      {showSignupModal && (
        <SignupModal
          onComplete={handleSignupComplete}
          onClose={() => handleSignupComplete("guest")}
        />
      )}
    </div>
  );
}

export default App;
