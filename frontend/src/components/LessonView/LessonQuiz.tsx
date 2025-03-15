import { useState, useEffect } from "react";
import "./LessonQuiz.css";
import { LessonQuizProps } from "./LessonQuizProps";

interface Choice {
  value: string;
  label: string;
}

const LessonQuiz = ({
  lessonData,
  onComplete,
  onEmotionChange,
  onQuestionChange,
}: LessonQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Reset states when moving to a new question
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (
      lessonData &&
      lessonData.lesson_content &&
      lessonData.lesson_content[currentQuestionIndex]
    ) {
      onQuestionChange(lessonData.lesson_content[currentQuestionIndex]);
      console.log(
        "question change called",
        lessonData.lesson_content[currentQuestionIndex]
      );
    }
  }, [currentQuestionIndex, lessonData, onQuestionChange]);

  useEffect(() => {
    // Update character emotion based on quiz state
    if (onEmotionChange) {
      // if (isCorrect === true) {
      //   onEmotionChange("happy");
      // } else if (isCorrect === false) {
      //   onEmotionChange("sad");
      // } else {
      //   onEmotionChange("neutral");
      // }
    }
  }, [isCorrect, onEmotionChange]);

  if (!lessonData)
    return <div className="lesson-loading">Loading lesson...</div>;

  const currentQuestion = lessonData.lesson_content[currentQuestionIndex];
  const totalQuestions = lessonData.lesson_content.length;

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after submission

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Show explanation after selection
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(score + (isCorrect ? 1 : 0), totalQuestions);
    }
  };

  // Format choices from array to object with label and value
  const formatChoices = (choices: string[]): Choice[] => {
    return choices.map((choice, index) => ({
      value: String.fromCharCode(65 + index), // A, B, C, D
      label: choice,
    }));
  };

  return (
    <>
      <div className="lesson-header">
        <h2>{lessonData.lesson_title}</h2>
        <div className="lesson-progress">
          <div className="progress-text">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="lesson-quiz">
        <div className="question-container">
          <div className="question-text">{currentQuestion.question_text}</div>

          <div className="choices-container">
            {formatChoices(currentQuestion.choices).map((choice, index) => (
              <button
                key={index}
                className={`choice-button ${
                  selectedAnswer === index
                    ? index === currentQuestion.answer
                      ? "correct"
                      : "incorrect"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="choice-label">{choice.value}</span>
                <span className="choice-text">{choice.label}</span>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div
              className={`explanation ${
                isCorrect ? "correct-explanation" : "incorrect-explanation"
              }`}
            >
              <div className="explanation-header">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </div>
              <div className="explanation-text">
                {currentQuestion.explanation}
              </div>
            </div>
          )}

          {selectedAnswer !== null && (
            <button className="next-button" onClick={handleNextQuestion}>
              {currentQuestionIndex < totalQuestions - 1
                ? "Next Question"
                : "Finish Lesson"}
            </button>
          )}
        </div>

        {/* <div className="floating-score">
          Score: {score}/
          {currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)}
        </div> */}
      </div>
    </>
  );
};

export default LessonQuiz;
