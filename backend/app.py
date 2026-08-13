from flask import Flask, send_from_directory
from flask_cors import CORS

from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # allows the frontend (opened as a separate file/port) to call this API
    db.init_app(app)

    from routes.user_routes import user_bp
    from routes.item_routes import item_bp
    from routes.request_routes import request_bp

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(item_bp, url_prefix="/api/items")
    app.register_blueprint(request_bp, url_prefix="/api/requests")

    # serves uploaded item images at /static/uploads/<filename>
    @app.route("/static/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)