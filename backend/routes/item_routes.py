import os
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from models import db, Item

item_bp = Blueprint("item_bp", __name__)


def serialize_item(item):
    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "department": item.department,
        "condition": item.condition,
        "description": item.description,
        "quantity": item.quantity,
        "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
        "image_path": item.image_path,
        "status": item.status,
        "owner_id": item.owner_id,
        "created_at": item.created_at.isoformat(),
    }


@item_bp.route("/", methods=["GET"])
def get_items():
    """Browse / filter items. Matches the Browse + Categories screens."""
    category = request.args.get("category")
    department = request.args.get("department")
    status = request.args.get("status", "available")

    query = Item.query
    if category:
        query = query.filter_by(category=category)
    if department:
        query = query.filter_by(department=department)
    if status:
        query = query.filter_by(status=status)

    items = query.order_by(Item.created_at.desc()).all()
    return jsonify([serialize_item(i) for i in items])


@item_bp.route("/<int:item_id>", methods=["GET"])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(serialize_item(item))


@item_bp.route("/", methods=["POST"])
def create_item():
    """Matches the 'Upload an item' form (multipart/form-data, since it includes an image)."""
    name = request.form.get("name")
    category = request.form.get("category")
    department = request.form.get("department")
    condition = request.form.get("condition")
    description = request.form.get("description")
    quantity = request.form.get("quantity", 1)
    expiry_date = request.form.get("expiry_date")
    owner_id = request.form.get("owner_id")

    if not name or not category or not owner_id:
        return jsonify({"error": "name, category and owner_id are required"}), 400

    image_path = None
    file = request.files.get("image")
    if file and file.filename:
        filename = secure_filename(file.filename)
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)
        file.save(os.path.join(upload_folder, filename))
        image_path = f"/static/uploads/{filename}"

    item = Item(
        name=name,
        category=category,
        department=department,
        condition=condition,
        description=description,
        quantity=int(quantity) if quantity else 1,
        expiry_date=datetime.strptime(expiry_date, "%Y-%m-%d").date() if expiry_date else None,
        image_path=image_path,
        owner_id=owner_id,
    )
    db.session.add(item)
    db.session.commit()

    return jsonify(serialize_item(item)), 201


@item_bp.route("/<int:item_id>", methods=["PUT"])
def update_item_status(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()

    if "status" in data:
        item.status = data["status"]

    db.session.commit()
    return jsonify(serialize_item(item))


@item_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"})