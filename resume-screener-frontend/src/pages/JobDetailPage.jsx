import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import ResumeUploadForm from '../components/ResumeUploadForm';
import CandidateList from '../components/CandidateList';

function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger refresh

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/jobs/${jobId}`);
        setJob(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch job details. You may not have permission to view this job.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <Link to="/">&larr; Back to Dashboard</Link>
      <div style={{ background: 'white', padding: '2rem', marginTop: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1>{job.title}</h1>
        <p style={{ whiteSpace: 'pre-wrap', borderTop: '1px solid #eee', paddingTop: '1rem' }}>{job.description}</p>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <ResumeUploadForm 
        jobId={jobId} 
        onUploadSuccess={() => setRefreshKey(oldKey => oldKey + 1)} 
      />

      <hr style={{ margin: '2rem 0' }} />

      <CandidateList jobId={jobId} refreshKey={refreshKey} />
    </div>
  );
}

export default JobDetailPage;
