import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function CandidateList({ jobId, refreshKey }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const response = await apiClient.get(`/jobs/${jobId}/candidates`);
        setCandidates(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch candidates.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [jobId, refreshKey]); // Re-fetches when jobId or refreshKey changes

  if (loading) return <p>Loading candidates...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="candidate-list-container">
      <h3>Ranked Candidates</h3>
      {candidates.length === 0 ? (
        <p>No resumes have been uploaded for this job yet.</p>
      ) : (
        <ol className="candidate-list">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="candidate-card">
              <span className="candidate-name">{candidate.name}</span>
              <span className="candidate-score">Match Score: {candidate.match_score}%</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default CandidateList;
