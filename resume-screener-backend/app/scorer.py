import pdfplumber
import re
from difflib import SequenceMatcher

# Try to load spaCy, but fall back to basic text processing if not available
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except Exception as e:
    print(f"spaCy not available: {e}")
    SPACY_AVAILABLE = False
    nlp = None

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
    if SPACY_AVAILABLE and nlp:
        try:
            resume_doc = nlp(resume_text)
            job_doc = nlp(job_description)
            return resume_doc.similarity(job_doc)
        except Exception as e:
            print(f"spaCy similarity failed: {e}")
            # Fall back to basic text similarity
            return calculate_basic_similarity(resume_text, job_description)
    else:
        return calculate_basic_similarity(resume_text, job_description)

def calculate_basic_similarity(resume_text, job_description):
    """Basic text similarity using sequence matching and keyword overlap."""
    # Convert to lowercase for comparison
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()
    
    # Calculate sequence similarity
    sequence_similarity = SequenceMatcher(None, resume_lower, job_lower).ratio()
    
    # Calculate keyword overlap
    resume_words = set(re.findall(r'\b\w+\b', resume_lower))
    job_words = set(re.findall(r'\b\w+\b', job_lower))
    
    if len(job_words) == 0:
        return 0.0
    
    # Calculate overlap percentage
    overlap = len(resume_words.intersection(job_words))
    keyword_similarity = overlap / len(job_words)
    
    # Combine both metrics (weighted average)
    combined_score = (sequence_similarity * 0.3) + (keyword_similarity * 0.7)
    
    return min(combined_score, 1.0)  # Cap at 1.0

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
            'match_score': round(score, 4), # as decimal (0-1 range)
            'name': name,
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
        return {'error': str(e)}
