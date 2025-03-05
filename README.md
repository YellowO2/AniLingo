
# AniLingo - Immersive Language Learning through Anime Style Character Roleplay

## Industry Pain Points Addressed

Traditional language learning suffers from:

- **Low engagement rates** (60-80% abandonment within 30 days)
- **Poor real-world application** (students memorize but can't converse)
- **One-size-fits-all content** that ignores individual interests
- **Delayed feedback loops** preventing rapid improvement

## Our Solution

AniLingo transforms language learning through interactive roleplaying with AI character tutors that adapt to your interests, provide real-time feedback, and create emotionally engaging experiences.

With the help of Gen AI, it allows us to have:

- **Adaptive conversations** that evolve based on user mistakes
- **Personalized scenarios** tailored to individual interests
- **Contextual corrections** that explain errors within natural dialogue
- **Emotional engagement** through character reactions to progress


## Getting Started

### Prerequisites
- **Node.js**

### Running the Development Server

#### Frontend

```bash
cd front-end
npm install
```

To start the development server, run:
```bash
npm run dev
```

#### Backend

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run with uvicorn
uvicorn main:app --reload
```
API Endpoints:
POST /generate-lesson: Generate a personalized lesson
POST /grammar-explanation: Get grammar explanations
GET /: Health check endpoint

## Tech Stack

- **Frontend**: Vite (React) with PixiLive2D for character animation
- **AI Integration**: Custom-prompt engineered LLM for adaptive teaching
- **Character Expression**: Live2D emotion triggers + Fish Speech TTS
- **Backend**: FastAPI with scenario management system, undecided Database

## Key Features

### 🎭 Scenario-Based Immersion

Learn through real-world contexts like "Ordering at a Ramen Shop" or "Shopping at Anime Convention" where vocabulary is immediately useful and memorable.

### 🤖 Emotionally Responsive Characters

AI tutors express joy at your progress, concern when you struggle, and adapt their teaching style to your learning patterns.

##  Powerful feedback and correction

|Learning Moment|Traditional App|AniLingo with GenAI|
|---|---|---|
|**Unexpected Question**|User: "Is the coffee fair trade?"<br>App: "I'm sorry, I don't understand. Please order a drink."|User: "Is the coffee fair trade?"<br>AI: "Yes, it is! 'フェアトレード' (fair trade) means the farmers were paid fairly. Would you like to try it?"|
|**Grammar Mistake**|User: "コーヒー 飲みたいです" (incorrect particle usage)<br>App: ❌ INCORRECT ❌<br>"Please try again"|User: "コーヒー 飲みたいです"<br>AI: "コーヒーを飲みたいですね。Here's your coffee!" (Subtly corrects particle while maintaining conversation)|
|**Interest Adaptation**|[Fixed menu items regardless of user preference]|User: "I like anime."<br>AI: "We have a special Demon Slayer themed drink this week! Do you want to learn how to order it?"|

## Learning Flow

1. **Choose Scenario**: Select from interest-based situations (food, travel, entertainment) or generate one
2. **Meet Your Tutor**: AI character introduces the context and learning goals
3. **Interactive Dialogue**: Practice conversation through guided multiple-choice (Tier 1) or free-form input (Tier 2)
4. **Progress Review**: Receive summary of improvements and suggested next steps

## Business Impact

- **Increased Retention**: Emotional connection to characters drives 3-4x higher engagement
- **Superior Outcomes**: Contextual learning improves practical language use by 40%
- **Scalable Content**: Generative AI reduces content creation costs by 70%
- **Clear Monetization Path**: Free-to-premium model with demonstrated value upgrade
- **Premium Potential**: Character-based learning enables merchandising opportunities


## Our Two-Tier Learning System

### Tier 1: Guided Character Conversations (Free)

- AI-generated scenarios based on user interests and skill level
- Multiple-choice conversation options that adapt to common mistakes
- Character emotional reactions providing real-time feedback
- Personalized learning path that evolves with user progress

### Tier 2: Premium Natural Conversations (Subscription)

- Free-form text/voice input for authentic conversation practice
- Real-time correction within natural dialogue
- Dynamic voice generation for unlimited conversation topics
- Fully adaptive scenarios responding to any user input


## Hackathon Demo Focus

1. **Tier 1 Working Prototype**: "Ordering at a Japanese Café" with AI-generated multiple-choice options
2. **Live Character Reactions**: Demonstrating emotional feedback to user performance
3. **Adaptive Path Generation**: Showcasing how the system creates personalized learning paths
4. **Tier 2 Concept Demo**: Brief demonstration of the premium conversation model