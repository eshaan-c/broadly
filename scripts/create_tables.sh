# scripts/create_decision_tables.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
from backend.models_decision import db

with app.app_context():
    # Create all decision-related tables
    print("Creating decision engine tables...")
    db.create_all()
    print("✅ Decision tables created successfully!")
    
    # List all tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    
    print("\n📊 Database tables:")
    for table in tables:
        if table.startswith('decision') or table in ['evaluation_criteria', 'questions', 'user_responses', 'evaluations']:
            print(f"   - {table}")
    
    print("\n✨ Decision Engine is ready to use!")