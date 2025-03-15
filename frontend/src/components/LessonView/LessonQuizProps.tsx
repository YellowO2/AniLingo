export interface Question {
    question_number: number;
    question_text: string;
    choices: string[];
    answer: number;
    explanation: string;
}
export interface LessonData {
    lesson_title: string;
    lesson_content: Question[];
    difficulty_level: string;
}
export interface LessonQuizProps {
    lessonData: LessonData | null;
    onComplete: (score: number, total: number) => void;
    onEmotionChange?: (emotion: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onQuestionChange: (currentQuestion: any) => void;
}

