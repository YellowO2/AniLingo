import os
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai
import fish_audio_sdk as fish
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

TTS_OUTPUT_DIR = "tts_outputs"

app = FastAPI()
load_dotenv()

# Allow CORS for localhost:5173
origins = [
    "http://localhost:5173",  # React app URL
]

# Add CORSMiddleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow only requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Load API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FISH_API_KEY = os.getenv("FISH_API_KEY")

# Initialise API Clients
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")
tts_session = fish.Session(FISH_API_KEY)  # text-to-speech API session

TTS_MODEL_ID = "0a664b6b12d3405cbf58d1e9d4057c40"  # Fubuki-san, placeholder voice


class LessonRequest(BaseModel):
    language_level: str
    interests: str
    preferred_scenario: str
    
class AskQuestionRequest(BaseModel):
    question: str
    context: str = None  # Optional context (could be previous Q/A or scenario)



class TTSInput:
    question_number: int
    question_text: str

    def __init__(self, sus):
        self.question_number = sus["question_number"]
        self.question_text = sus["question_text"]


def generate_gemini_response(prompt: str):
    """
    Generate a response using Gemini API (via official SDK)
    """
    try:
        response = model.generate_content(prompt)
        return response.text  # Extract text from response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question")
async def ask_question(request: AskQuestionRequest):
    """
    Handle dynamic question asking during quizzes or chat.
    """
    # Formulate the prompt with context if provided
    if request.context:
        question_prompt = f"""
        Given the following context: "{request.context}"

        Answer the following learner's Japanese language question in a simple and friendly way:
        "{request.question}"

        Keep the answer concise, clear, and relevant to language learning. Avoid long unrelated explanations.
        """
    else:
        question_prompt = f"""
        Answer the following learner's Japanese language question in a simple and friendly way:
        "{request.question}"

        Keep the answer concise, clear, and relevant to language learning. Avoid long unrelated explanations.
        """

    # Call Gemini to generate the answer
    answer = generate_gemini_response(question_prompt)

    return {"answer": answer, "source": "Gemini AI"}


@app.post("/generate-lesson-new")
async def generate_lesson_new(request: LessonRequest):
    """
    Generate a personalized Japanese lesson
    """
    lesson_prompt = f"""
    Create 5 Japanese language learning multiple-choice question for a {request.language_level} 
    learner interested in {request.interests}, 
    focusing on the scenario of {request.preferred_scenario}. 
    
    Please respond ONLY in the following format:
    [{{"question_number" : <number>, "question_text" : "<string>", "choices": ["<string>"], "answer": <number>, "explanation": "<string>"}}]

    Where question_number is a 1-based serial number of the questions.
    Where answer is the 0-based index of the correct choice in choices.
    Where explanation is a brief explanation of why choices[answer] is correct.

    For example:
    [{{"question_number" : 1, "question_text" : "`コーヒー_____ください。", "choices": ["A. を", "B. に", "C. は", "D. が"], "answer": 0, "explanation": "を is used to mark object こーひー"}}]

    Please do not insert newline characters, do not modify any of the attribute names, or add or remove any of the attributes.

    Thank you.
    """
    # this above prompt needs tweaking for consistent results obviously.

    raw_response = generate_gemini_response(lesson_prompt)

    lesson_content = json.loads(raw_response)
    print(lesson_content)

    audio_files = question_text_tts(list(map(lambda c: TTSInput(c), lesson_content)))

    return {
        "lesson_title": f"Lesson: {request.preferred_scenario}",
        "lesson_content": lesson_content,
        "audio_files": audio_files,
        "difficulty_level": request.language_level,
    }


def question_text_tts(questions: list[TTSInput]) -> list[str]:
    """
    Returns a list of file names associated with the mp3 files generated
    """
    return list(
        map(
            lambda q: text_to_speech(
                replace_underscore(q.question_text, "…"), q.question_number
            ),
            questions,
        )
    )


def text_to_speech(text: str, id: int) -> str:
    filepath = os.path.join(TTS_OUTPUT_DIR, str(id) + ".mp3")
    with open(filepath, "wb") as f:
        for chunk in tts_session.tts(
            fish.TTSRequest(
                reference_id=TTS_MODEL_ID,
                text=text,
            )
        ):
            f.write(chunk)

    return filepath


@app.post("/generate-lesson")
async def generate_lesson(request: LessonRequest):
    """
    Generate a personalized Japanese lesson
    """
    lesson_prompt = f"""
    Create a series of Japanese language learning multiple-choice question for a {request.language_level} 
    learner interested in {request.interests}, 
    focusing on the scenario of {request.preferred_scenario}.
    
    Please respond ONLY in the following format:
    [{{"question_number" : <number>, "question_text" : "<string>", "choices": ["<string>"], "answer": <number>, "explanation": "<string>"}}]

    Where question_number is a 1-based serial number of the questions.
    Where answer is the 0-based index of the correct choice in choices.
    Where explanation is a brief explanation of why choices[answer] is correct.

    For example:
    [{{"question_number" : 1, "question_text" : "`コーヒー_____ください。", "choices": ["A. を", "B. に", "C. は", "D. が"], "answer": 0, "explanation": "を is used to mark object こーひー"}}]

    Please do not insert newline characters, do not modify any of the attribute names, or add or remove any of the attributes.

    Thank you.
    """
    # this above prompt needs tweaking for consistent results obviously.

    raw_response = generate_gemini_response(lesson_prompt)

    lesson_content = json.loads(raw_response)

    return {
        "lesson_title": f"Lesson: {request.preferred_scenario}",
        "lesson_content": lesson_content,
        #        "key_phrases": ["こんにちは", "ありがとう"],
        "difficulty_level": request.language_level,
    }


@app.get("/get-tts-audio/{filename}")
async def get_tts_audio(filename: str):
    """
    Endpoint for retrieving the generated audio, pointed to by `audio_files`.
    """

    file_path = os.path.join(TTS_OUTPUT_DIR, filename)

    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg")

    return {"error": "File not found"}


def replace_underscore(text: str, replacement: str):
    return re.sub(r"_+", replacement, text)


@app.post("/grammar-explanation")
async def explain_grammar(question: str):
    """
    Provide a grammar explanation
    """
    explanation_prompt = f"""
    Explain this Japanese grammar point in a simple, 
    beginner-friendly way: {question}
    """

    explanation = generate_gemini_response(explanation_prompt)

    return {"explanation": explanation, "confidence_level": "high"}


# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "AniLingo Backend is running"}
