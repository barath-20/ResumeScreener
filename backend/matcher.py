from sentence_transformers import SentenceTransformer, util

# Initialize the model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Sample job description
job_description_text = """
We are looking for a Python Developer with strong experience in web development.
Required Skills:
- 3+ years of experience with Python
- Experience with web frameworks like Django or Flask
- Strong understanding of RESTful APIs
- Familiarity with databases (SQL and NoSQL)
- Experience with version control systems (Git)
- Good problem-solving skills
- Excellent communication abilities
"""

# Sample resume text
resume_text = """
Experienced Software Developer with 4 years of hands-on experience in Python development.
Key Skills & Experience:
- Developed and maintained multiple web applications using Django and Flask
- Designed and implemented RESTful APIs for microservices architecture
- Worked extensively with PostgreSQL and MongoDB databases
- Active contributor to open-source projects using Git
- Led a team of 3 developers for an e-commerce project
- Strong communicator with excellent documentation skills
"""

# Convert texts to embeddings
print("Converting texts to embeddings...")
jd_embedding = model.encode(job_description_text)
resume_embedding = model.encode(resume_text)

# Calculate similarity score
cosine_score = util.cos_sim(jd_embedding, resume_embedding)

# Print the result
print(f"\nMatch Score: {cosine_score.item()*100:.2f}%")
