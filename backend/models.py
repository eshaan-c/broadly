# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

# Association tables
program_fields = db.Table(
    "program_fields",
    db.Column("program_id", db.Integer, db.ForeignKey("programs.id"), primary_key=True),
    db.Column(
        "field_id", db.Integer, db.ForeignKey("academic_fields.id"), primary_key=True
    ),
    db.Column("is_primary", db.Boolean, default=False),
)

program_tags = db.Table(
    "program_tags",
    db.Column("program_id", db.Integer, db.ForeignKey("programs.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)


class Program(db.Model):
    __tablename__ = "programs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    provider = db.Column(db.String(100))  # Optional metadata
    country = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100))  # Europe, Asia, Americas, etc.
    description = db.Column(db.Text)
    duration_weeks = db.Column(db.Integer)
    duration_type = db.Column(db.String(50))

    # Academic info
    credits_min = db.Column(db.Integer)
    credits_max = db.Column(db.Integer)
    gpa_requirement = db.Column(db.Float)
    language_requirement = db.Column(db.String(255))

    # Costs
    program_fee = db.Column(db.Integer)
    housing_included = db.Column(db.Boolean, default=False)
    estimated_total_cost = db.Column(db.Integer)

    # Features
    internship_available = db.Column(db.Boolean, default=False)
    research_opportunities = db.Column(db.Boolean, default=False)
    excursions_included = db.Column(db.Boolean, default=False)

    # URLs
    program_url = db.Column(db.String(500))
    application_url = db.Column(db.String(500))

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    academic_fields = db.relationship(
        "AcademicField",
        secondary=program_fields,
        backref=db.backref("programs", lazy="dynamic"),
    )
    tags = db.relationship(
        "Tag", secondary=program_tags, backref=db.backref("programs", lazy="dynamic")
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "provider": self.provider,
            "country": self.country,
            "city": self.city,
            "description": self.description,
            "duration_weeks": self.duration_weeks,
            "duration_type": self.duration_type,
            "credits_min": self.credits_min,
            "credits_max": self.credits_max,
            "gpa_requirement": self.gpa_requirement,
            "language_requirement": self.language_requirement,
            "program_fee": self.program_fee,
            "housing_included": self.housing_included,
            "estimated_total_cost": self.estimated_total_cost,
            "internship_available": self.internship_available,
            "research_opportunities": self.research_opportunities,
            "excursions_included": self.excursions_included,
            "program_url": self.program_url,
            "application_url": self.application_url,
            "academic_fields": [field.name for field in self.academic_fields],
            "tags": [tag.name for tag in self.tags],
        }


class AcademicField(db.Model):
    __tablename__ = "academic_fields"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    category = db.Column(db.String(50))


class UserPreference(db.Model):
    __tablename__ = "user_preferences"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), nullable=False)
    major = db.Column(db.String(100))
    interests = db.Column(ARRAY(db.Text))
    countries = db.Column(ARRAY(db.Text))
    budget_max = db.Column(db.Integer)
    duration_preference = db.Column(db.String(50))
    gpa = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Comparison(db.Model):
    __tablename__ = "comparisons"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), nullable=False)
    program_ids = db.Column(ARRAY(db.Integer))
    ai_analysis = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
