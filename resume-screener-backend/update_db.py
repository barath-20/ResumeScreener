from app import create_app, db
from app.models import JobPosting, Candidate

def update_database():
    app = create_app()
    with app.app_context():
        # Update existing JobPosting records with default values
        JobPosting.query.update({
            'required_skills': [],
            'preferred_skills': [],
            'min_experience': 0,
            'score_weights': {
                'skills': 0.5,
                'experience': 0.3,
                'semantic': 0.2
            }
        }, synchronize_session=False)
        
        # Update existing Candidate records with default values
        Candidate.query.update({
            'skills': [],
            'experience': 0,
            'education': [],
            'work_history': [],
            'phone': '',
            'score_breakdown': {}
        }, synchronize_session=False)
        
        db.session.commit()
        print("Database updated successfully!")

if __name__ == '__main__':
    update_database()
