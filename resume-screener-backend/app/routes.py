import os
import time
from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .models import JobPosting, Candidate, User  # Import your models
from .scorer import process_resume

# Create the blueprint
api_bp = Blueprint('api', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Error handlers
@api_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400

@api_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401

@api_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': str(error)}), 404

@api_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'message': str(error)}), 500

# Authentication routes
@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    try:
        user = User(
            email=data['email'],
            name=data.get('name', ''),
            role=data.get('role', 'user')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 400

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = user.get_auth_token()
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    })

# Current user
@api_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'role': user.role
    })

# Job routes
@api_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    jobs = JobPosting.query.all()
    return jsonify([{
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'required_skills': job.required_skills,
        'preferred_skills': job.preferred_skills,
        'created_at': job.created_at.isoformat() if job.created_at else None
    } for job in jobs])

@api_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    data = request.get_json()
    
    try:
        job = JobPosting(
            title=data['title'],
            description=data['description'],
            required_skills=data.get('required_skills', []),
            preferred_skills=data.get('preferred_skills', []),
            min_experience=float(data.get('min_experience', 0)),
            created_by=get_jwt_identity()
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job_id': job.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create job', 'details': str(e)}), 400

@api_bp.route('/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    job = JobPosting.query.get_or_404(job_id)
    return jsonify({
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'required_skills': job.required_skills,
        'preferred_skills': job.preferred_skills,
        'min_experience': job.min_experience,
        'created_at': job.created_at.isoformat() if job.created_at else None,
        'created_by': job.created_by
    })

# Resume Upload and Processing
@api_bp.route('/jobs/<int:job_id>/upload', methods=['POST'])
@jwt_required()
def upload_resume(job_id):
    # Check if job exists
    job = JobPosting.query.get_or_404(job_id)
    
    # Debug: Log request details
    current_app.logger.info(f"Upload request for job {job_id}")
    current_app.logger.info(f"Request files: {list(request.files.keys())}")
    current_app.logger.info(f"Request form: {list(request.form.keys())}")
    
    # Check if file is included in the request
    if 'file' not in request.files:
        current_app.logger.error("No file part in request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        current_app.logger.error("No file selected")
        return jsonify({'error': 'No selected file'}), 400
    
    # Validate file type
    if not file or not allowed_file(file.filename):
        current_app.logger.error(f"Invalid file type: {file.filename}")
        return jsonify({
            'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

    try:
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Create secure and unique filename
        filename = secure_filename(file.filename)
        base, ext = os.path.splitext(filename)
        unique_filename = f"{base}_{int(time.time())}{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save the file
        file.save(filepath)
        
        # Process the resume to extract text and calculate match score
        current_app.logger.info(f"Processing resume: {filepath}")
        processing_result = process_resume(filepath, job)
        
        if 'error' in processing_result:
            current_app.logger.error(f"Resume processing failed: {processing_result['error']}")
            # Still create the candidate record but with error status
            candidate = Candidate(
                original_filename=filename,
                filename=unique_filename,
                file_path=filepath,
                job_id=job_id,
                user_id=get_jwt_identity(),
                status='error',
                resume_text=processing_result.get('resume_text', ''),
                match_score=0,
                name=processing_result.get('name', 'Unknown')
            )
        else:
            # Create candidate record with processed data
            candidate = Candidate(
                original_filename=filename,
                filename=unique_filename,
                file_path=filepath,
                job_id=job_id,
                user_id=get_jwt_identity(),
                status='processed',
                resume_text=processing_result.get('resume_text', ''),
                match_score=processing_result.get('match_score', 0),
                name=processing_result.get('name', 'Unknown')
            )
        
        db.session.add(candidate)
        db.session.commit()
        
        current_app.logger.info(f"Resume processed successfully. Match score: {candidate.match_score}")
        
        return jsonify({
            'message': 'Resume uploaded and processed successfully',
            'resume_id': candidate.id,
            'filename': unique_filename,
            'job_id': job_id,
            'match_score': candidate.match_score,
            'name': candidate.name
        })
        
    except Exception as e:
        current_app.logger.error(f'Error processing resume: {str(e)}')
        db.session.rollback()
        return jsonify({
            'error': 'Failed to process resume',
            'details': str(e)
        }), 500

@api_bp.route('/jobs/<int:job_id>/candidates', methods=['GET'])
@jwt_required()
def get_job_candidates(job_id):
    # Verify job exists
    JobPosting.query.get_or_404(job_id)
    
    candidates = Candidate.query.filter_by(job_id=job_id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'original_filename': c.original_filename,
        'status': c.status,
        'match_score': c.match_score,
        'score': c.score,
        'upload_date': c.upload_date.isoformat() if c.upload_date else None,
        'processed_data': c.processed_data  # Include any processed data
    } for c in candidates])

@api_bp.route('/jobs/<int:job_id>/resumes', methods=['GET'])
@jwt_required()
def get_job_resumes(job_id):
    # Verify job exists
    JobPosting.query.get_or_404(job_id)
    
    candidates = Candidate.query.filter_by(job_id=job_id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'original_filename': c.original_filename,
        'status': c.status,
        'match_score': c.match_score,
        'score': c.score,
        'upload_date': c.upload_date.isoformat() if c.upload_date else None,
        'processed_data': c.processed_data  # Include any processed data
    } for c in candidates])

@api_bp.route('/resumes/<int:resume_id>', methods=['GET'])
@jwt_required()
def get_resume(resume_id):
    candidate = Candidate.query.get_or_404(resume_id)
    return jsonify({
        'id': candidate.id,
        'name': candidate.name,
        'original_filename': candidate.original_filename,
        'status': candidate.status,
        'match_score': candidate.match_score,
        'score': candidate.score,
        'upload_date': candidate.upload_date.isoformat() if candidate.upload_date else None,
        'job_id': candidate.job_id,
        'user_id': candidate.user_id,
        'processed_data': candidate.processed_data
    })

# Health check endpoint
@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'timestamp': time.time()
    })