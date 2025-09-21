from . import db
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(50), default='user')
    password_hash = db.Column(db.String(128))
    job_postings = db.relationship('JobPosting', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def get_auth_token(self):
        return create_access_token(identity=self.id)

    def __repr__(self):
        return f'<User {self.email}>'

class JobPosting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.JSON, nullable=False, default=list)  # List of required skills
    preferred_skills = db.Column(db.JSON, nullable=False, default=list)  # List of preferred skills
    min_experience = db.Column(db.Float, default=0)  # Minimum years of experience
    score_weights = db.Column(db.JSON, nullable=False, default={
        'skills': 0.5,
        'experience': 0.3,
        'semantic': 0.2
    })
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    candidates = db.relationship('Candidate', backref='job', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<JobPosting {self.title}>'

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=True)  # Extracted from resume
    email = db.Column(db.String(120), nullable=True)  # Extracted from resume
    phone = db.Column(db.String(20), nullable=True)  # Extracted from resume
    skills = db.Column(db.JSON, nullable=False, default=list)  # List of extracted skills
    experience = db.Column(db.Float, default=0)  # Total years of experience
    education = db.Column(db.JSON, nullable=False, default=list)  # List of education entries
    work_history = db.Column(db.JSON, nullable=False, default=list)  # List of work experiences
    resume_text = db.Column(db.Text, nullable=True)
    match_score = db.Column(db.Float, nullable=True)  # Overall match score (0-1)
    score_breakdown = db.Column(db.JSON, nullable=True)  # Detailed score breakdown
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    job_id = db.Column(db.Integer, db.ForeignKey('job_posting.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Resume file fields
    original_filename = db.Column(db.String(255), nullable=True)
    filename = db.Column(db.String(255), nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), default='uploaded')
    score = db.Column(db.Float, nullable=True)
    processed_data = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f'<Candidate {self.id} for Job {self.job_id}>'
