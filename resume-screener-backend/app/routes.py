from flask import Blueprint, request, jsonify
from .models import User, JobPosting
from . import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api_bp = Blueprint('api', __name__)

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if user already exists
    user_by_email = User.query.filter_by(email=data['email']).first()
    user_by_username = User.query.filter_by(username=data['username']).first()
    if user_by_email or user_by_username:
        return jsonify({'message': 'User already exists'}), 409

    # Hash the password and create new user
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', None)
    password = data.get('password', None)

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@api_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({'message': 'Title and description are required'}), 400

    new_job = JobPosting(
        title=title,
        description=description,
        user_id=current_user_id
    )

    db.session.add(new_job)
    db.session.commit()

    return jsonify({'message': 'Job posting created successfully', 'job_id': new_job.id}), 201

@api_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    current_user_id = get_jwt_identity()

    jobs = JobPosting.query.filter_by(user_id=current_user_id).order_by(JobPosting.id.desc()).all()

    job_list = []
    for job in jobs:
        job_list.append({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'user_id': job.user_id
        })

    return jsonify(job_list), 200

@api_bp.route('/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    current_user_id = get_jwt_identity()

    job = JobPosting.query.get(job_id)

    if not job:
        return jsonify({'message': 'Job posting not found'}), 404

    # Security check: Ensure the job belongs to the current user
    if job.user_id != current_user_id:
        return jsonify({'message': 'Access forbidden'}), 403

    job_data = {
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'user_id': job.user_id
    }

    return jsonify(job_data), 200