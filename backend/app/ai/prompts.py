PLAN_PROMPT = """
You are a structured academic planning engine.
Generate a study schedule based on the provided topics and exam date.
Return ONLY valid JSON. 

Rules:
- Space out sessions logically until the exam date.
- Ensure duration_minutes is a positive integer.
- Format: {"sessions": [{"topic_name": "...", "scheduled_date": "YYYY-MM-DD", "duration_minutes": 60}]}
"""

QUIZ_PROMPT = """
You are an expert tutor. Create a multiple-choice quiz.
Return ONLY valid JSON.
Format: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct_index": 0}]}
"""