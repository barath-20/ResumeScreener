import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main style={{ padding: '1rem' }}>
        <p>Welcome to your dashboard. The resume screening features will be built here!</p>
      </main>
    </div>
  );
}

export default DashboardPage;
