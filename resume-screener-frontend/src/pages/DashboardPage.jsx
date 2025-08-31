import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateJobForm from '../components/CreateJobForm';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main style={{ padding: '1rem' }}>
        <CreateJobForm />
        {/* Job postings list will go here later */}
      </main>
    </div>
  );
}

export default DashboardPage;
