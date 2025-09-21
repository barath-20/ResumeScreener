import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  Briefcase, 
  Calendar, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Users,
  FileText,
  Plus,
  Trash2,
  MoreVertical
} from 'lucide-react';

function JobList({ refreshKey }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

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
  }, [refreshKey]);

  const handleDeleteJob = async (jobId) => {
    try {
      setDeleting(true);
      await apiClient.delete(`/jobs/${jobId}`);
      
      // Remove the job from the local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError('Failed to delete job. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (job) => {
    setDeleteConfirm(job);
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      const deletePromises = Array.from(selectedJobs).map(jobId => 
        apiClient.delete(`/jobs/${jobId}`)
      );
      await Promise.all(deletePromises);
      
      // Remove deleted jobs from local state
      setJobs(prevJobs => prevJobs.filter(job => !selectedJobs.has(job.id)));
      setSelectedJobs(new Set());
      setBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete jobs:', err);
      setError('Failed to delete some jobs. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const selectAllJobs = () => {
    if (selectedJobs.size === filteredAndSortedJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredAndSortedJobs.map(job => job.id)));
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'title') {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [jobs, searchTerm, sortBy, sortOrder]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Your Job Postings</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="created_at">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {jobs.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedJobs.size === filteredAndSortedJobs.length && filteredAndSortedJobs.length > 0}
                onChange={selectAllJobs}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">
                Select All ({selectedJobs.size} selected)
              </span>
            </label>
          </div>
          {selectedJobs.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="default"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={deleting}
                className="flex items-center gap-2 hover:bg-destructive/90 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedJobs.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
            <p className="text-muted-foreground">Create your first job posting above to get started.</p>
          </CardContent>
        </Card>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">Try adjusting your search term.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedJobs.map((job) => (
            <Card key={job.id} className={`hover:shadow-lg transition-all duration-200 hover:border-primary/50 ${selectedJobs.has(job.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="mt-1 rounded border-input"
                    />
                    <Link to={`/jobs/${job.id}`} className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h4 className="text-xl font-semibold text-foreground">{job.title}</h4>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {job.description.substring(0, 200)}
                        {job.description.length > 200 && '...'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.candidates?.length || 0} Applications
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.candidates?.length || 0} Candidates
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          confirmDelete(job);
                        }}
                        className="hover:bg-destructive/90 shadow-sm"
                        disabled={deleting}
                        title="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                      <Link to={`/jobs/${job.id}`}>
                        View Details →
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone and will also delete all associated candidate applications.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteJob(deleteConfirm.id)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Multiple Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete {selectedJobs.size} job posting{selectedJobs.size > 1 ? 's' : ''}? This action cannot be undone and will also delete all associated candidate applications.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setBulkDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedJobs.size} Job${selectedJobs.size > 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default JobList;