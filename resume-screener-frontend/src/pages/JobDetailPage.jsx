import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

function JobDetailPage() {
  const { jobId } = useParams(); // Get the job ID from the URL
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div style={{ padding: '2rem' }}>
      <Link to="/">&larr; Back to Dashboard</Link>
      <hr style={{ margin: '1rem 0' }} />
      <h1>{job.title}</h1>
      <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
      {/* Resume upload and candidate list will go here later */}
    </div>
  );
}

export default JobDetailPage;
