from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from pathlib import Path
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = "change-this-secret-key-for-your-project"

BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"
REQUESTS_FILE = BASE_DIR / "requests.json"

def load_users():
    if not USERS_FILE.exists():
        return {}
    try:
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}

def save_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")


def load_requests():
    if not REQUESTS_FILE.exists():
        return []
    try:
        return json.loads(REQUESTS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []

def save_requests(requests):
    REQUESTS_FILE.write_text(json.dumps(requests, indent=2), encoding="utf-8")

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        users = load_users()
        user = users.get(email)

        if user and check_password_hash(user["password"], password):
            session["user"] = {"email": email, "name": user["name"]}
            return redirect(url_for("dashboard"))

        flash("Invalid email or password.", "error")
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if not name or not email or not password:
            flash("Please fill in all fields.", "error")
            return render_template("register.html")
        if password != confirm:
            flash("Passwords do not match.", "error")
            return render_template("register.html")
        if len(password) < 6:
            flash("Password must contain at least 6 characters.", "error")
            return render_template("register.html")

        users = load_users()
        if email in users:
            flash("An account with this email already exists. Please sign in.", "error")
            return render_template("register.html")

        users[email] = {
            "name": name,
            "password": generate_password_hash(password)
        }
        save_users(users)

        flash("Account created successfully. Please sign in.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")

@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/requests", methods=["GET", "POST"])
@login_required
def requests_api():
    requests = load_requests()

    if request.method == "GET":
        email = session["user"]["email"]
        mine = [r for r in requests if r.get("requester_email") == email]
        mine.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return {"requests": mine}

    data = request.get_json(silent=True) or {}
    required = ["item_id", "item_name", "department", "pickup_date"]
    if any(not str(data.get(k, "")).strip() for k in required):
        return {"error": "Please choose a pickup date and try again."}, 400

    request_id = "REQ-" + datetime.now().strftime("%Y%m%d%H%M%S")
    request_id += f"-{len(requests)+1:03d}"

    entry = {
        "request_id": request_id,
        "item_id": str(data["item_id"]),
        "item_name": str(data["item_name"]),
        "department": str(data["department"]),
        "pickup_date": str(data["pickup_date"]),
        "requester_name": session["user"]["name"],
        "requester_email": session["user"]["email"],
        "status": "Pending approval",
        "created_at": datetime.now().isoformat(timespec="seconds")
    }

    requests.append(entry)
    save_requests(requests)
    return {"ok": True, "request_id": request_id, "status": entry["status"]}, 201

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)

