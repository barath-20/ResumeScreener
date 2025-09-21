import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import apiClient from '../services/api';

function AllJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  }, []);

  const columns = [
    {
      header: 'Job Title',
      accessor: 'title',
      render: (job) => (
        <Link to={`/jobs/${job.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          {job.title}
        </Link>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (job) => (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {job.description.substring(0, 100)}...
        </div>
      )
    },
    {
      header: 'Created Date',
      accessor: 'created_at',
      render: (job) => new Date(job.created_at).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (job) => (
        <span style={{ 
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--success-color)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          Active
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (job) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Link 
            to={`/jobs/${job.id}`} 
            className="btn btn-primary btn-sm"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <nav className="navbar">
        <div className="navbar-content">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setSidebarOpen(true)}
            style={{ marginRight: 'var(--spacing-md)' }}
          >
            ☰ Menu
          </button>
          <Link to="/" className="navbar-brand">Resume Screener</Link>
          <div className="navbar-user">
            <span>Welcome, {user?.name || user?.email || 'User'}</span>
          </div>
        </div>
      </nav>
      
      <main className="container main-with-sidebar">
        <div style={{ paddingTop: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <h1>All Job Postings</h1>
              <p>Manage and view all your job postings</p>
            </div>
            <Link to="/" className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
          
          <DataTable
            data={jobs}
            columns={columns}
            itemsPerPage={10}
            searchable={true}
            searchPlaceholder="Search jobs by title or description..."
            emptyMessage="No job postings found. Create your first job posting to get started."
          />
        </div>
      </main>
    </div>
  );
}

export default AllJobsPage;

