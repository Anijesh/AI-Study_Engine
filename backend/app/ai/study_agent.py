import os
import json
from openai import OpenAI
from pydantic import ValidationError
from app.ai.prompts import PLAN_PROMPT, QUIZ_PROMPT,DOUBT_PROMPT
from app.ai.schemas import PlanResponse, QuizResponse,DoubtResponse
from dotenv import load_dotenv
load_dotenv()

class StudyAgent:
    def __init__(self):
        # Using Gemini via OpenAI SDK for free tier access
        self.client = OpenAI(
            api_key=os.getenv("GEMINI_API_KEY"),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        self.model = "gemini-2.5-flash" # High speed, generous free tier

    def _get_structured_completion(self, system_prompt, user_content, schema):
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"}
            )
            
            raw_output = response.choices[0].message.content
            # The Magic: Validate the AI string against our Pydantic model
            return schema.model_validate_json(raw_output)
            
        except ValidationError as e:
            print(f"AI Schema Validation Error: {e}")
            raise ValueError("AI returned data in an incorrect format.")
        except Exception as e:
            print(f"AI Service Error: {e}")
            raise Exception("Failed to communicate with the Study Engine.")

    def generate_plan(self, topics_list, exam_date):
        user_input = f"Topics: {topics_list}, Exam Date: {exam_date}"
        return self._get_structured_completion(PLAN_PROMPT, user_input, PlanResponse)

    def generate_quiz(self, topic_name):
        user_input = f"Generate a quiz for topic: {topic_name}"
        return self._get_structured_completion(QUIZ_PROMPT, user_input, QuizResponse)
    
    def answer_doubt(self, topic_name, question):
        system_prompt = DOUBT_PROMPT.format(topic_name=topic_name)
        return self._get_structured_completion(system_prompt, question, DoubtResponse)