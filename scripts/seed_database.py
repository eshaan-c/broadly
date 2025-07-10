import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app, db
from backend.models import Program, AcademicField, Tag


def seed_database(json_file="seed_programs.json"):
    """Seed the database with programs from JSON file."""
    with app.app_context():
        # Load data
        with open(json_file, "r") as f:
            data = json.load(f)

        print(f"Seeding {len(data['programs'])} programs...")

        # Create academic fields
        field_objects = {}
        for field_name in data.get("academic_fields", []):
            field = AcademicField(name=field_name)
            db.session.add(field)
            field_objects[field_name] = field

        # Create tags
        tag_objects = {}
        for tag_name in data.get("tags", []):
            tag = Tag(name=tag_name, category="general")
            db.session.add(tag)
            tag_objects[tag_name] = tag

        db.session.commit()

        # Create programs
        for prog_data in data["programs"]:
            field_names = prog_data.pop("academic_fields", [])
            tag_names = prog_data.pop("tags", [])

            program = Program(**prog_data)

            for field_name in field_names:
                if field_name in field_objects:
                    program.academic_fields.append(field_objects[field_name])

            for tag_name in tag_names:
                if tag_name in tag_objects:
                    program.tags.append(tag_objects[tag_name])

            db.session.add(program)

        db.session.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    seed_database()
