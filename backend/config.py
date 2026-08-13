import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # SQLite db file will be created automatically inside backend/
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'ecoloop.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "ecoloop-secret-key"  # fine for coursework, don't reuse in real prod

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB, matches "PNG, JPG up to 5MB" in your mockup