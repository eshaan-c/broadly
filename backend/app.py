from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

try:
    from .models import db
except ImportError:
    from models import db

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql://localhost/abroadly_db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    @app.route("/")
    def health_check():
        return {"status": "healthy", "message": "Abroadly API is running"}

    @app.route("/api/test")
    def test_db():
        from models import Program

        programs = Program.query.limit(5).all()
        return {
            "total_programs": Program.query.count(),
            "sample_programs": [p.to_dict() for p in programs],
        }

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
