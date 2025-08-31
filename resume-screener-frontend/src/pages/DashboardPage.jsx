import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateJobForm from '../components/CreateJobForm';
import JobList from '../components/JobList';

function DashboardPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleJobCreated = () => {
    // Increment the key to trigger a refresh in JobList
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main style={{ padding: '1rem' }}>
        <CreateJobForm onJobCreated={handleJobCreated} />
        <hr style={{ margin: '2rem 0' }} />
        <JobList refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default DashboardPage;
