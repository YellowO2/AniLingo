import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

# Load API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API Client
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

class LessonRequest(BaseModel):
    language_level: str
    interests: str
    preferred_scenario: str

def generate_gemini_response(prompt: str):
    """
    Generate a response using Gemini API (via official SDK)
    """
    try:
        response = model.generate_content(prompt)
        return response.text  # Extract text from response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-lesson")
async def generate_lesson(request: LessonRequest):
    """
    Generate a personalized Japanese lesson
    """
    lesson_prompt = f"""
    Create a Japanese language lesson for a {request.language_level} 
    learner interested in {request.interests}, 
    focusing on the scenario of {request.preferred_scenario}.
    Provide the lesson content, key phrases, and learning objectives, in the style of duolingo.
    """
    #this above prompt needs tweaking for consistent results obviously.
    
    lesson_content = generate_gemini_response(lesson_prompt)
    
    return {
        "lesson_title": f"Lesson: {request.preferred_scenario}",
        "lesson_content": lesson_content,
        "key_phrases": ["こんにちは", "ありがとう"],
        "difficulty_level": request.language_level
    }

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
    
    return {
        "explanation": explanation,
        "confidence_level": "high"
    }

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "AniLingo Backend is running"}
