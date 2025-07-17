# backend/models_decision.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()


class Decision(db.Model):
    __tablename__ = "decisions"

    id = db.Column(db.Integer, primary_key=True)
    user_session_id = db.Column(db.String(255))
    scenario_text = db.Column(db.Text, nullable=False)
    decision_type = db.Column(db.String(100))  # comparison, yes_no, open_ended, etc.
    analysis_depth = db.Column(db.String(20))  # quick, balanced, thorough
    title = db.Column(db.String(255))
    status = db.Column(db.String(50), default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    options = db.relationship(
        "DecisionOption",
        backref="decision",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    criteria = db.relationship(
        "EvaluationCriteria",
        backref="decision",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    questions = db.relationship(
        "Question", backref="decision", lazy="dynamic", cascade="all, delete-orphan"
    )
    evaluations = db.relationship(
        "Evaluation", backref="decision", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "scenario_text": self.scenario_text,
            "decision_type": self.decision_type,
            "analysis_depth": self.analysis_depth,
            "title": self.title,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "options": [opt.to_dict() for opt in self.options],
            "criteria": [crit.to_dict() for crit in self.criteria],
            "questions": [q.to_dict() for q in self.questions],
        }


class DecisionOption(db.Model):
    __tablename__ = "decision_options"

    id = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey("decisions.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    # metadata = db.Column(JSONB)  # Flexible storage for any option attributes
    ai_inferred = db.Column(db.Boolean, default=False)
    position = db.Column(db.Integer)

    # Relationships
    responses = db.relationship("UserResponse", backref="option", lazy="dynamic")
    evaluations = db.relationship("Evaluation", backref="option", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            # "metadata": self.metadata,
            "ai_inferred": self.ai_inferred,
            "position": self.position,
        }


class EvaluationCriteria(db.Model):
    __tablename__ = "evaluation_criteria"

    id = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey("decisions.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    weight = db.Column(db.Float)  # 0.0 to 1.0
    category = db.Column(db.String(100))  # financial, practical, emotional, strategic
    parent_criteria_id = db.Column(db.Integer, db.ForeignKey("evaluation_criteria.id"))

    # Self-referential relationship for sub-criteria
    sub_criteria = db.relationship(
        "EvaluationCriteria", backref=db.backref("parent", remote_side=[id])
    )
    evaluations = db.relationship("Evaluation", backref="criteria", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "weight": self.weight,
            "category": self.category,
            "parent_criteria_id": self.parent_criteria_id,
            "sub_criteria": [sub.to_dict() for sub in self.sub_criteria],
        }


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey("decisions.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(
        db.String(50)
    )  # scale, boolean, text, ranking, multiple_choice
    # metadata = db.Column(JSONB)  # Store options, scale ranges, etc.
    position = db.Column(db.Integer)
    criteria_link = db.Column(db.String(255))  # Which criteria this helps evaluate

    # Relationships
    responses = db.relationship(
        "UserResponse", backref="question", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "question_text": self.question_text,
            "question_type": self.question_type,
            # "metadata": self.metadata,
            "position": self.position,
            "criteria_link": self.criteria_link,
        }


class UserResponse(db.Model):
    __tablename__ = "user_responses"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey("decision_options.id"))
    response_value = db.Column(db.Text)  # Flexible to store any response type
    # response_metadata = db.Column(JSONB)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "option_id": self.option_id,
            "response_value": self.response_value,
            # "response_metadata": self.response_metadata,
        }


class Evaluation(db.Model):
    __tablename__ = "evaluations"

    id = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey("decisions.id"), nullable=False)
    option_id = db.Column(
        db.Integer, db.ForeignKey("decision_options.id"), nullable=False
    )
    criteria_id = db.Column(db.Integer, db.ForeignKey("evaluation_criteria.id"))
    score = db.Column(db.Float)  # 0-100
    reasoning = db.Column(db.Text)
    strengths = db.Column(JSONB)  # List of strengths
    weaknesses = db.Column(JSONB)  # List of weaknesses
    confidence = db.Column(db.String(20))  # high, medium, low
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "option_id": self.option_id,
            "criteria_id": self.criteria_id,
            "score": self.score,
            "reasoning": self.reasoning,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "confidence": self.confidence,
        }
