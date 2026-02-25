from pydantic import BaseModel, Field
from typing import List
from datetime import date

class SessionItem(BaseModel):
    topic_name: str
    scheduled_date: date
    duration_minutes: int
    subtopics: List[str]

class PlanResponse(BaseModel):
    sessions: List[SessionItem]

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    correct_index: int

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

class DoubtResponse(BaseModel):
    explanation: str
    key_points: List[str]
    suggested_resource: str