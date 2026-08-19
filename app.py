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
ITEMS_FILE = BASE_DIR / "items.json"


def load_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return default


def save_json(path, value):
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def load_users():
    return load_json(USERS_FILE, {})


def save_users(users):
    save_json(USERS_FILE, users)


def load_requests():
    return load_json(REQUESTS_FILE, [])


def save_requests(items):
    save_json(REQUESTS_FILE, items)


def load_items():
    return load_json(ITEMS_FILE, [])


def save_items(items):
    save_json(ITEMS_FILE, items)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


# ---------------- HOME / AUTH ----------------

@app.route("/")
def index():
    return redirect(url_for("dashboard" if "user" in session else "login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        users = load_users()
        user = users.get(email)

        if user and check_password_hash(user["password"], password):
            session["user"] = {
                "email": email,
                "name": user["name"]
            }
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
    return render_template("dashboard.html", user=session["user"])


# ---------------- REQUESTS ----------------

@app.route("/api/requests", methods=["GET", "POST"])
@login_required
def requests_api():
    requests = load_requests()
    email = session["user"]["email"]

    if request.method == "GET":
        mine = [
            r for r in requests
            if r.get("requester_email") == email
        ]
        mine.sort(
            key=lambda r: r.get("created_at", ""),
            reverse=True
        )
        return {"requests": mine}

    data = request.get_json(silent=True) or {}

    required = [
        "item_id",
        "item_name",
        "department",
        "pickup_date"
    ]

    if any(not str(data.get(k, "")).strip() for k in required):
        return {
            "error": "Please choose a pickup date and try again."
        }, 400

    now = datetime.now()

    request_id = (
        "REQ-" +
        now.strftime("%Y%m%d%H%M%S") +
        f"-{len(requests) + 1:03d}"
    )

    entry = {
        "request_id": request_id,
        "item_id": str(data["item_id"]),
        "item_name": str(data["item_name"]),
        "department": str(data["department"]),
        "pickup_date": str(data["pickup_date"]),
        "requester_name": session["user"]["name"],
        "requester_email": email,
        "owner_name": str(
            data.get("owner_name", data["department"])
        ),
        "status": "Requested",
        "stage_index": 0,
        "created_at": now.isoformat(timespec="seconds"),
        "updated_at": now.isoformat(timespec="seconds")
    }

    requests.append(entry)
    save_requests(requests)

    return {
        "ok": True,
        "request": entry
    }, 201


# ---------------- ITEMS ----------------

@app.route("/api/items", methods=["GET", "POST"])
@login_required
def items_api():
    items = load_items()

    if request.method == "GET":
        return {"items": items}

    data = request.get_json(silent=True) or {}

    if not str(data.get("name", "")).strip():
        return {"error": "Item name is required."}, 400

    now = datetime.now()

    item = {
        "item_id": (
            "EC-" +
            now.strftime("%m%d%H%M%S") +
            f"-{len(items) + 1:03d}"
        ),
        "name": str(data.get("name", "")).strip(),
        "category": str(data.get("category", "Other")),
        "department": str(
            data.get("department", "General / Hostel")
        ),
        "condition": str(data.get("condition", "Good")),
        "description": str(data.get("description", "")),
        "mode": str(data.get("mode", "Lend")),
        "owner_name": session["user"]["name"],
        "owner_email": session["user"]["email"],
        "created_at": now.isoformat(timespec="seconds")
    }

    items.insert(0, item)
    save_items(items)

    return {
        "ok": True,
        "item": item
    }, 201


# ---------------- MY TRACK ----------------

@app.route("/api/track")
@login_required
def track_api():
    email = session["user"]["email"]

    requests = [
        r for r in load_requests()
        if r.get("requester_email") == email
    ]

    requests.sort(
        key=lambda r: r.get("created_at", ""),
        reverse=True
    )

    items = [
        i for i in load_items()
        if i.get("owner_email") == email
    ]

    items.sort(
        key=lambda i: i.get("created_at", ""),
        reverse=True
    )

    return {
        "requests": requests,
        "items": items,
        "summary": {
            "requested": len(requests),
            "lended": sum(
                1 for i in items
                if i.get("mode") == "Lend"
            ),
            "donated": sum(
                1 for i in items
                if i.get("mode") == "Donate"
            )
        }
    }


# ---------------- POINT SYSTEM ----------------
# Donate = 50 XP
# Lend   = 30 XP
# Borrow = 20 XP

POINTS = {
    "Donate": 50,
    "Lend": 30,
    "Borrow": 20
}


def get_user_stats(email, users, items, requests):
    user = users.get(email, {})

    user_items = [
        i for i in items
        if i.get("owner_email") == email
    ]

    user_requests = [
        r for r in requests
        if r.get("requester_email") == email
    ]

    donated = sum(
        1 for i in user_items
        if i.get("mode") == "Donate"
    )

    lended = sum(
        1 for i in user_items
        if i.get("mode") == "Lend"
    )

    borrowed = len(user_requests)

    points = (
        donated * POINTS["Donate"] +
        lended * POINTS["Lend"] +
        borrowed * POINTS["Borrow"]
    )

    return {
        "name": user.get("name", "Unknown"),
        "email": email,
        "points": points,
        "donated": donated,
        "lended": lended,
        "borrowed": borrowed,
        "actions": donated + lended + borrowed
    }


def get_level(points):
    if points >= 2000:
        return {
            "level": "Campus Legend",
            "description": "Top impact maker",
            "next_threshold": None
        }

    if points >= 1000:
        return {
            "level": "EcoLoop Hero",
            "description": "Leading the reuse movement",
            "next_threshold": 2000
        }

    if points >= 500:
        return {
            "level": "Loop Champion",
            "description": "Strong campus contributor",
            "next_threshold": 1000
        }

    if points >= 250:
        return {
            "level": "Resource Saver",
            "description": "Reducing campus waste",
            "next_threshold": 500
        }

    if points >= 100:
        return {
            "level": "Eco Starter",
            "description": "Keep the loop moving",
            "next_threshold": 250
        }

    return {
        "level": "Newcomer",
        "description": "Start making an impact",
        "next_threshold": 100
    }


def build_leaderboard():
    users = load_users()
    items = load_items()
    requests = load_requests()

    leaderboard = []

    for email in users:
        stats = get_user_stats(
            email,
            users,
            items,
            requests
        )

        stats.update(get_level(stats["points"]))
        leaderboard.append(stats)

    leaderboard.sort(
        key=lambda x: (-x["points"], x["name"].lower())
    )

    for index, entry in enumerate(leaderboard, start=1):
        entry["rank"] = index

    return leaderboard


# ---------------- IMPACT API ----------------

@app.route("/api/impact")
@login_required
def impact_api():
    leaderboard = build_leaderboard()

    total_donated = sum(
        x["donated"] for x in leaderboard
    )
    total_lended = sum(
        x["lended"] for x in leaderboard
    )
    total_borrowed = sum(
        x["borrowed"] for x in leaderboard
    )

    total_actions = (
        total_donated +
        total_lended +
        total_borrowed
    )

    current_email = session["user"]["email"]

    current = next(
        (
            x for x in leaderboard
            if x["email"] == current_email
        ),
        {
            "name": session["user"]["name"],
            "email": current_email,
            "points": 0,
            "donated": 0,
            "lended": 0,
            "borrowed": 0,
            "actions": 0,
            "level": "Newcomer",
            "description": "Start making an impact",
            "next_threshold": 100
        }
    )

    recent = []

    for item in load_items():
        mode = item.get("mode")

        if mode in ("Donate", "Lend"):
            recent.append({
                "user_name": item.get(
                    "owner_name",
                    "Unknown"
                ),
                "action": mode,
                "item_name": item.get(
                    "name",
                    "Item"
                ),
                "category": item.get(
                    "category",
                    "Campus resource"
                ),
                "created_at": item.get(
                    "created_at",
                    ""
                ),
                "points": POINTS[mode]
            })

    for req in load_requests():
        recent.append({
            "user_name": req.get(
                "requester_name",
                "Unknown"
            ),
            "action": "Borrow",
            "item_name": req.get(
                "item_name",
                "Item"
            ),
            "category": req.get(
                "department",
                "Campus resource"
            ),
            "created_at": req.get(
                "created_at",
                ""
            ),
            "points": POINTS["Borrow"]
        })

    recent.sort(
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )

    return {
        "overview": {
            "total_actions": total_actions,
            "donated": total_donated,
            "lended": total_lended,
            "borrowed": total_borrowed
        },
        "user": current,
        "leaderboard": leaderboard,
        "recent": recent[:20]
    }


# ---------------- REWARDS API ----------------

@app.route("/api/rewards")
@login_required
def rewards_api():
    leaderboard = build_leaderboard()

    current_email = session["user"]["email"]

    current = next(
        (
            x for x in leaderboard
            if x["email"] == current_email
        ),
        {
            "name": session["user"]["name"],
            "email": current_email,
            "points": 0,
            "donated": 0,
            "lended": 0,
            "borrowed": 0,
            "actions": 0,
            "rank": len(leaderboard) + 1
        }
    )

    return {
        "user": current,
        "leaderboard": leaderboard
    }


# ---------------- PAGES ----------------

@app.route("/impact")
@login_required
def impact():
    return render_template(
        "impact.html",
        user=session["user"]
    )


@app.route("/rewards")
@login_required
def rewards():
    return render_template(
        "rewards.html",
        user=session["user"]
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)

