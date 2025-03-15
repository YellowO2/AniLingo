import { useState, useEffect, useRef } from "react";
import Live2DViewer from "../Live2DViewer";
import LessonQuiz from "./LessonQuiz";
import "./LessonView.css";
import { Question } from "./LessonQuizProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faSmile, faTrophy } from "@fortawesome/free-solid-svg-icons";

interface Live2DLessonViewProps {
  lessonData: any | null;
  isLoading: boolean;
  coins: number;
  happiness: number;
  level: number;
  onLessonComplete: (score: number, total: number) => void;
  onQuestionChange: (currentQuestion: Question) => void;
}

const Live2DLessonView = ({
  lessonData,
  isLoading,
  coins,
  happiness,
  level,
  onLessonComplete,
  onQuestionChange,
}: Live2DLessonViewProps) => {
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [subtitle, setSubtitle] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add subtle animation when stats update
  useEffect(() => {
    setBounceAnimation(true);
    const timer = setTimeout(() => setBounceAnimation(false), 500);
    return () => clearTimeout(timer);
  }, [coins, happiness, level]);

  // Play audio when current question changes
  useEffect(() => {
    if (currentQuestion && lessonData?.audio_files) {
      const questionIndex = currentQuestion.question_number - 1;

      if (questionIndex >= 0 && questionIndex < lessonData.audio_files.length) {
        const audioPath = lessonData.audio_files[questionIndex];

        // Create URL for the audio file
        // Assuming the backend returns file paths that need to be converted to URLs
        const audioUrl = `http://localhost:8000/get-tts-audio/${audioPath
          .split("/")
          .pop()}`;

        // Create and play audio
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
        });
      }
    }
  }, [currentQuestion, lessonData]);

  const handleEmotionChange = (emotion: string) => {
    setCurrentEmotion(emotion);

    // Set appropriate subtitles based on emotion
    let message = "";
    if (emotion === "happy") {
      const phrases = [
        "すごい！ That's correct!",
        "よくできました！ Well done!",
        "完璧！ Perfect!",
        "その通り！ That's right!",
      ];
      message = phrases[Math.floor(Math.random() * phrases.length)];
    } else if (emotion === "sad") {
      const phrases = [
        "惜しい！ Almost there!",
        "もう一度！ Try again!",
        "次は頑張ろう！ Let's do better next time!",
        "大丈夫！ It's okay!",
      ];
      message = phrases[Math.floor(Math.random() * phrases.length)];
    }

    // Show subtitle with animation
    if (message) {
      setSubtitle(message);
      setShowSubtitle(true);

      // Hide subtitle after 3 seconds
      setTimeout(() => {
        setShowSubtitle(false);
      }, 3000);
    }
  };

  // Custom handler for question changes
  const handleQuestionChange = (question: Question) => {
    setCurrentQuestion(question);
    onQuestionChange(question);
  };

  return (
    <div className="live2d-lesson-container">
      {/* Game-style Status Bar */}
      <div className="game-status-bar">
        <div className={`status-item ${bounceAnimation ? "bounce" : ""}`}>
          <span className="status-icon">
            <FontAwesomeIcon icon={faCoins} />
          </span>
          <span className="status-value">{coins}</span>
          <div className="status-glow"></div>
        </div>

        <div className={`status-item ${bounceAnimation ? "bounce" : ""}`}>
          <span className="status-icon">
            <FontAwesomeIcon icon={faSmile} />
          </span>
          <div className="happiness-meter">
            <div className="happiness-fill" style={{ width: `${happiness}%` }}>
              <div className="happiness-glow"></div>
            </div>
          </div>
          <span className="status-value">{happiness}%</span>
        </div>

        <div
          className={`status-item level-display ${
            bounceAnimation ? "bounce" : ""
          }`}
        >
          <span className="status-icon">
            <FontAwesomeIcon icon={faTrophy} />
          </span>
          <span className="status-value">Lv.{level}</span>
          <div className="level-glow"></div>
        </div>
      </div>

      <div className="live2d-character">
        <Live2DViewer />
        {/* Character Speech Bubble */}
        {showSubtitle && (
          <div className="speech-bubble">
            <div className="speech-content">{subtitle}</div>
            <div className="speech-tail"></div>
          </div>
        )}
      </div>

      {/* Lesson Content */}
      <div className="lesson-ui-floating">
        {isLoading ? (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading Lesson...</p>
          </div>
        ) : (
          lessonData && (
            <LessonQuiz
              lessonData={lessonData}
              onComplete={onLessonComplete}
              onEmotionChange={handleEmotionChange}
              onQuestionChange={handleQuestionChange}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Live2DLessonView;
