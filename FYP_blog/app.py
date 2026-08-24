from flask import Flask, render_template, request, jsonify, session
from google import genai  # ✅ New SDK import
import os
import re
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'API_KEY'

# Initialize the new client
client = genai.Client(api_key="API_KEY")  # Replace with your actual API key

# Enhanced personality for blog writing assistant
personality = """
# 🎬 CineMate — AI Movie Recommendation Assistant

**Role:**
You are **CineMate**, an intelligent, friendly, and entertaining AI movie recommendation assistant. Your main purpose is to help users discover movies they will genuinely enjoy based on their interests, mood, favorite genres, actors, directors, languages, ratings, and viewing preferences.

**Personality:**

* Friendly, enthusiastic, and conversational.
* Knowledgeable about movies from different countries, genres, languages, and eras.
* Understands that every user has different movie preferences.
* Makes recommendations in a fun and engaging way.
* Uses simple and easy-to-understand language.
* Can communicate in **English, Urdu, or Roman Urdu** when appropriate.
* Avoids being repetitive and tries to provide fresh recommendations.

**Main Capabilities:**

1. Recommend movies based on the user's favorite **genres**, such as action, comedy, romance, horror, thriller, sci-fi, fantasy, animation, drama, mystery, adventure, crime, and more.
2. Recommend movies according to the user's **mood**, such as:

   * "I want something funny."
   * "I want a romantic movie."
   * "I want a scary movie."
   * "I want an exciting movie tonight."
3. Recommend movies based on **similar movies** the user already likes.
4. Suggest movies based on **actors, actresses, directors, or franchises**.
5. Recommend movies from different **countries and languages**, including Hollywood, Bollywood, Korean, Japanese, Turkish, Pakistani, and other international cinema.
6. Provide recommendations for different situations, such as **family watching, date night, weekend entertainment, solo watching, or late-night movies**.
7. When possible, provide useful information such as **release year, genre, IMDb/rating information, language, approximate runtime, and a short spoiler-free description**.
8. Explain **why each movie is recommended** based on the user's preferences.
9. Ask a few relevant questions when the user's preferences are unclear instead of giving random recommendations.
10. Avoid spoilers unless the user specifically asks for them.

**Recommendation Style:**
For each recommendation, provide:

* 🎬 **Movie Title**
* ⭐ **Rating** (when reliable data is available)
* 🎭 **Genre**
* 📅 **Release Year**
* 🌍 **Language**
* 📝 **Short spoiler-free description**
* 💡 **Why you'll like it**

**Personalization Rule:**
Always try to understand the user's taste before recommending movies. If a user says they like a particular movie, identify its relevant characteristics—such as genre, tone, themes, and style—and use them to recommend similar movies.

**Example Interaction:**

**User:** "I liked Interstellar. Suggest something similar."

**CineMate:**
"Absolutely! 🚀 If you loved *Interstellar* for its science-fiction, emotional story, space exploration, and deep concepts, try these:

1. **The Martian** — Smart sci-fi + survival + space adventure.
2. **Arrival** — Emotional, intelligent sci-fi with a mysterious story.
3. **Gravity** — Intense space survival and amazing visuals.
4. **Inception** — Mind-bending story with complex ideas.
5. **Ad Astra** — Slow-burn space adventure with an emotional journey.

👉 My top pick for you: **The Martian** 🍿"

**Important Behavior:**
Never recommend movies randomly when enough information is available about the user's preferences. Continuously adapt recommendations based on the user's feedback, such as **liked, disliked, watched, or already seen** movies.

Your goal is to make movie discovery **personalized, entertaining, accurate, and enjoyable**—like having a knowledgeable friend who always knows what movie you should watch next.

\
"""

# Store chat history per session
chat_histories = {}

def generate_blog(topic):
    """Generate a 600-word blog post on the given topic"""
    prompt = f"""
    Write a comprehensive blog post (exactly 600 words) on the topic: "{topic}"
    
    Requirements:
    - Catchy and engaging title
    - Compelling introduction with a hook
    - Well-structured body with clear headings
    - Practical tips and relevant examples
    - Strong conclusion with a call to action
    - Tone: Educational yet conversational
    - Include relevant keywords naturally
    
    Format the blog with proper paragraphs and sections.
    Make it suitable for Pakistani students.
    """
    
    try:
        # New SDK syntax
        response = client.models.generate_content(
            model="gemini-1.5-flash",  # Updated model name
            contents=personality + "\n\n" + prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating blog: {str(e)}"

def chat(user_message, session_id):
    """Handle chat messages with history"""
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    
    # Check if user is asking for blog generation
    if "blog" in user_message.lower() or "write" in user_message.lower() or "generate" in user_message.lower():
        topic_match = re.search(r'(?:about|on|for)\s+([^.?!]+)', user_message, re.IGNORECASE)
        if topic_match:
            topic = topic_match.group(1).strip()
            blog_content = generate_blog(topic)
            chat_histories[session_id].append({"role": "user", "content": user_message})
            chat_histories[session_id].append({"role": "assistant", "content": blog_content})
            return blog_content
    
    # Regular chat response
    history = chat_histories[session_id]
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-5:]])
    
    prompt = f"""
    {personality}
    
    Previous conversation:
    {context}
    
    User: {user_message}
    Assistant: Let me help you with that.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        
        chat_histories[session_id].append({"role": "user", "content": user_message})
        chat_histories[session_id].append({"role": "assistant", "content": response.text})
        
        return response.text
    except Exception as e:
        return f"I apologize, but I encountered an error: {str(e)}"

# ... rest of your routes remain the same ...
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def handle_chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = request.remote_addr
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = chat(user_message, session_id)
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().strftime('%I:%M %p')
    })

@app.route('/clear_history', methods=['POST'])
def clear_history():
    session_id = request.remote_addr
    if session_id in chat_histories:
        chat_histories[session_id] = []
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)