import React, { useState } from 'react';
import apiClient from '../services/api';
import './CreateJobForm.css';

function CreateJobForm({ onJobCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/jobs', { title, description });
      alert(`Job posting created successfully! Job ID: ${response.data.job_id}`);
      // Clear the form
      setTitle('');
      setDescription('');
      if (onJobCreated) {
        onJobCreated(); // Call the refresh function
      }
    } catch (error) {
      alert('Failed to create job posting: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h3>Create New Job Posting</h3>
      <div className="form-group">
        <label>Job Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Job Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          required
        ></textarea>
      </div>
      <button type="submit">Create Job</button>
    </form>
  );
}

export default CreateJobForm;
