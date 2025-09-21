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
  Plus
} from 'lucide-react';

function JobList({ refreshKey }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

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
            <Link to={`/jobs/${job.id}`} key={job.id} className="block">
              <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
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
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.candidates?.length || 0} Candidates
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-primary">
                        View Details →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobList;