import React, { useState } from 'react';
import apiClient from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Plus, Briefcase, FileText, AlertCircle, CheckCircle } from 'lucide-react';

function CreateJobForm({ onJobCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      const response = await apiClient.post('/jobs', formData);
      // Clear the form
      setFormData({ title: '', description: '' });
      setSuccess(true);
      if (onJobCreated) {
        onJobCreated(); // Call the refresh function
      }
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Job Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter job title (e.g., Senior Software Engineer)"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Job Description
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
              disabled={loading}
              placeholder="Describe the job requirements, responsibilities, qualifications, and any other relevant details..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Job...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Posting
              </>
            )}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800 font-medium">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Job posting created successfully!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CreateJobForm;