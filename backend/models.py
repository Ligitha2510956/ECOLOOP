from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # stored as a hash
    department = db.Column(db.String(100))
    role = db.Column(db.String(20), default="student")  # student / faculty / admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("Item", backref="owner", lazy=True)
    requests = db.relationship("ItemRequest", backref="requester", lazy=True)


class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False)   # Chemicals / E-waste / General
    department = db.Column(db.String(100))
    condition = db.Column(db.String(50))                  # New / Good / Fair / Needs Repair
    description = db.Column(db.Text)
    quantity = db.Column(db.Integer, default=1)
    expiry_date = db.Column(db.Date, nullable=True)        # relevant mainly for Chemicals
    image_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default="available")  # available / requested / claimed
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ItemRequest(db.Model):
    __tablename__ = "requests"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    pickup_location = db.Column(db.String(200))
    pickup_date = db.Column(db.Date)
    status = db.Column(db.String(20), default="pending")  # pending/approved/rejected/completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    item = db.relationship("Item", backref="requests")