import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Search,
  Star,
  FileText,
  Mail,
  Phone,
  Calendar,
  Menu,
  Filter
} from 'lucide-react';
import apiClient from '../services/api';

function CandidatesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse] = await Promise.all([
          apiClient.get('/jobs'),
        ]);
        
        const jobsData = jobsResponse.data;
        setJobs(jobsData);
        
        // Fetch candidates for all jobs
        const allCandidates = [];
        for (const job of jobsData) {
          try {
            const candidatesResponse = await apiClient.get(`/jobs/${job.id}/candidates`);
            const jobCandidates = candidatesResponse.data.map(candidate => ({
              ...candidate,
              jobTitle: job.title,
              jobId: job.id
            }));
            allCandidates.push(...jobCandidates);
          } catch (error) {
            // Job might not have candidates yet
          }
        }
        
        setCandidates(allCandidates);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = scoreFilter === 'all' || 
                        (scoreFilter === 'high' && candidate.match_score >= 0.7) ||
                        (scoreFilter === 'medium' && candidate.match_score >= 0.5 && candidate.match_score < 0.7) ||
                        (scoreFilter === 'low' && candidate.match_score < 0.5);
    
    return matchesSearch && matchesScore;
  });

  const sortedCandidates = filteredCandidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.7) return 'High Match';
    if (score >= 0.5) return 'Medium Match';
    return 'Low Match';
  };

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
                <h1 className="text-xl font-bold text-primary">Resume Screener</h1>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="hidden sm:flex">
                  Welcome, {user?.name || user?.email || 'User'}
                </Badge>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                All Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View and manage all candidates across your job postings.
              </p>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates, jobs, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Scores</option>
                    <option value="high">High Match (70%+)</option>
                    <option value="medium">Medium Match (50-69%)</option>
                    <option value="low">Low Match (&lt;50%)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Candidates ({sortedCandidates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading candidates...</p>
              ) : sortedCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || scoreFilter !== 'all' 
                      ? 'Try adjusting your search criteria.' 
                      : 'No candidates have applied to your jobs yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCandidates.map((candidate, index) => (
                    <div key={`${candidate.jobId}-${candidate.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{candidate.name}</h3>
                            <Badge variant="outline">{candidate.jobTitle}</Badge>
                            <Badge className={getScoreColor(candidate.match_score || 0)}>
                              {Math.round((candidate.match_score || 0) * 100)}% - {getScoreLabel(candidate.match_score || 0)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.created_at && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  );
}

export default CandidatesPage;
