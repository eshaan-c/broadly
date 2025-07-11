#!/bin/bash
# ./reset_db.sh to run
# This script resets the PostgreSQL database for the Abroadly application.

# Set the database name
DB_NAME="abroadly_db"

# Activate virtual environment
source ../venv/bin/activate

echo "🔍 Terminating active connections to $DB_NAME..."
psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';"

echo "🗑️ Dropping database $DB_NAME..."
dropdb $DB_NAME

echo "✅ Creating database $DB_NAME..."
createdb $DB_NAME

echo "🔧 Reinitializing schema from Flask app..."
python <<EOF
from app import app, db
with app.app_context():
    db.create_all()
EOF

echo "✅ Database reset complete!"