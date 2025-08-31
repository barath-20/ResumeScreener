import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function JobList({ refreshKey }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/jobs');
        setJobs(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch job postings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [refreshKey]); // This effect re-runs whenever refreshKey changes

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="job-list-container">
      <h3>Your Job Postings</h3>
      {jobs.length === 0 ? (
        <p>You haven't created any job postings yet.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h4>{job.title}</h4>
            <p>{job.description.substring(0, 150)}...</p>
          </div>
        ))
      )}
    </div>
  );
}

export default JobList;
