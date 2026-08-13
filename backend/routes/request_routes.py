from datetime import datetime

from flask import Blueprint, request, jsonify

from models import db, ItemRequest, Item

request_bp = Blueprint("request_bp", __name__)


def serialize_request(r):
    return {
        "id": r.id,
        "item_id": r.item_id,
        "item_name": r.item.name if r.item else None,
        "requester_id": r.requester_id,
        "pickup_location": r.pickup_location,
        "pickup_date": r.pickup_date.isoformat() if r.pickup_date else None,
        "status": r.status,
        "created_at": r.created_at.isoformat(),
    }


@request_bp.route("/", methods=["POST"])
def create_request():
    """Matches 'Request confirmation' card - step 5 (Request/Claim) in the flow diagram."""
    data = request.get_json()
    item = Item.query.get_or_404(data["item_id"])

    if item.status != "available":
        return jsonify({"error": "Item is not available"}), 400

    req = ItemRequest(
        item_id=item.id,
        requester_id=data["requester_id"],
        pickup_location=data.get("pickup_location"),
        pickup_date=(
            datetime.strptime(data["pickup_date"], "%Y-%m-%d").date()
            if data.get("pickup_date")
            else None
        ),
    )
    item.status = "requested"

    db.session.add(req)
    db.session.commit()

    return jsonify(serialize_request(req)), 201


@request_bp.route("/", methods=["GET"])
def get_requests():
    owner_id = request.args.get("owner_id")        # requests ON an owner's items (step 6: Review & Approval)
    requester_id = request.args.get("requester_id")  # requests MADE by a user

    query = ItemRequest.query
    if requester_id:
        query = query.filter_by(requester_id=requester_id)
    if owner_id:
        query = query.join(Item).filter(Item.owner_id == owner_id)

    reqs = query.order_by(ItemRequest.created_at.desc()).all()
    return jsonify([serialize_request(r) for r in reqs])


@request_bp.route("/<int:request_id>", methods=["PUT"])
def update_request(request_id):
    """Step 6-8: owner approves/rejects, or marks handover complete."""
    req = ItemRequest.query.get_or_404(request_id)
    data = request.get_json()
    new_status = data.get("status")
    req.status = new_status

    if new_status == "approved":
        req.item.status = "claimed"
    elif new_status == "rejected":
        req.item.status = "available"
    elif new_status == "completed":
        req.item.status = "claimed"

    db.session.commit()
    return jsonify(serialize_request(req))