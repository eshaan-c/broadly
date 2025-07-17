# backend/app.py
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import models
# from models_decision import db  # New decision models
from decisions import decisions_bp  # New decision endpoints

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Configuration
    # app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    #     "DATABASE_URL", "postgresql://localhost/abroadly_db"
    # )
    # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SESSION_TYPE"] = "filesystem"  # For session management

    # Initialize extensions
    # db.init_app(app)

    # CORS configuration
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:3000", "http://127.0.0.1:5000"],
                "supports_credentials": True,  # Important for sessions
            }
        },
    )

    @app.route("/")
    def health_check():
        return {"status": "healthy", "message": "Decision Engine API is running"}

    app.register_blueprint(decisions_bp, url_prefix="/api")  # New decision endpoints

    @app.route("/api/echo", methods=["POST"])
    def echo_decision():
        data = request.get_json()
        return data, 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
