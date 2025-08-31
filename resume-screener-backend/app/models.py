from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    job_postings = db.relationship('JobPosting', backref='author', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

class JobPosting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    candidates = db.relationship('Candidate', backref='job', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<JobPosting {self.title}>'

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=True) # Will be extracted from resume
    email = db.Column(db.String(120), nullable=True) # Will be extracted from resume
    resume_text = db.Column(db.Text, nullable=True)
    match_score = db.Column(db.Float, nullable=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job_posting.id'), nullable=False)

    def __repr__(self):
        return f'<Candidate {self.id} for Job {self.job_id}>'
