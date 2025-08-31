import spacy
import pdfplumber
import re

# Load the spaCy model once when the module is loaded
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(filepath):
    """Extracts text from a PDF file."""
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_name(text):
    """Extracts a potential name from the resume text."""
    # This is a simple heuristic, can be improved
    lines = text.split('\n')
    if lines:
        # Assume the name is in the first few lines and is short
        for line in lines[:5]:
            if len(line.strip()) > 1 and len(line.strip().split()) <= 3:
                return line.strip()
    return "Unknown"

def calculate_similarity(resume_text, job_description):
    """Calculates the semantic similarity between two texts."""
    resume_doc = nlp(resume_text)
    job_doc = nlp(job_description)
    return resume_doc.similarity(job_doc)

def process_resume(filepath, job):
    """
    Processes a resume file to extract text, calculate a match score,
    and extract basic information.
    """
    try:
        resume_text = extract_text_from_pdf(filepath)
        if not resume_text:
            return {'error': 'Could not extract text from PDF.'}

        # For now, our score is based on semantic similarity.
        # This can be expanded to include keyword matching, etc.
        score = calculate_similarity(resume_text, job.description)

        # Simple extraction for name
        name = extract_name(resume_text)

        return {
            'resume_text': resume_text,
            'match_score': round(score * 100, 2), # as a percentage
            'name': name,
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
        return {'error': str(e)}
