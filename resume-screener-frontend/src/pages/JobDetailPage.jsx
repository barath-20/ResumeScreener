import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import Sidebar from '../components/Sidebar';
import ResumeUploadForm from '../components/ResumeUploadForm';
import CandidateList from '../components/CandidateList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  Briefcase, 
  Upload, 
  Users, 
  Menu,
  Calendar,
  MapPin,
  Clock,
  Trash2
} from 'lucide-react';

function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteJob = async () => {
    try {
      setDeleting(true);
      await apiClient.delete(`/jobs/${jobId}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError('Failed to delete job. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Loading job details...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-destructive">{error}</h2>
                  <Button asChild className="mt-4">
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Job not found</h2>
                  <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
                  <Button asChild>
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:ml-64">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary">Resume Screener</h1>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Job Details Card */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Briefcase className="h-6 w-6 text-primary" />
                    {job.title || 'Untitled Job Posting'}
                  </CardTitle>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.employment_type && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {job.employment_type}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {job.candidates?.length || 0} Applications
                  </Badge>
                  <Button
                    variant="destructive"
                    size="default"
                    onClick={() => setDeleteConfirm(true)}
                    disabled={deleting}
                    className="flex items-center gap-2 hover:bg-destructive/90 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Delete Job'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description || 'No description provided.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <ResumeUploadForm 
            jobId={jobId} 
            onUploadSuccess={() => setRefreshKey(oldKey => oldKey + 1)} 
          />

          {/* Candidates List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ranked Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateList jobId={jobId} refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{job?.title}"? This action cannot be undone and will also delete all associated candidate applications.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteJob}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;