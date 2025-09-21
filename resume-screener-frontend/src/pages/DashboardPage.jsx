import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import CreateJobForm from '../components/CreateJobForm';
import JobList from '../components/JobList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Star, 
  TrendingUp, 
  Plus,
  Menu,
  BarChart3,
  Target
} from 'lucide-react';
import apiClient from '../services/api';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    highMatches: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsResponse] = await Promise.all([
          apiClient.get('/jobs'),
        ]);
        
        const jobs = jobsResponse.data;
        let totalCandidates = 0;
        let highMatches = 0;
        let totalScore = 0;
        let scoreCount = 0;

        for (const job of jobs) {
          try {
            const candidatesResponse = await apiClient.get(`/jobs/${job.id}/candidates`);
            const candidates = candidatesResponse.data;
            totalCandidates += candidates.length;
            
            candidates.forEach(candidate => {
              const score = Math.round((candidate.match_score || 0) * 100);
              if (score >= 70) highMatches++;
              totalScore += score;
              scoreCount++;
            });
          } catch (error) {
            // Job might not have candidates yet
          }
        }

        setStats({
          totalJobs: jobs.length,
          totalCandidates,
          highMatches,
          avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const handleJobCreated = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${
            color === 'blue' ? 'bg-blue-100' :
            color === 'green' ? 'bg-green-100' :
            color === 'yellow' ? 'bg-yellow-100' :
            color === 'purple' ? 'bg-purple-100' :
            'bg-gray-100'
          }`}>
            <Icon className={`h-6 w-6 ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'yellow' ? 'text-yellow-600' :
              color === 'purple' ? 'text-purple-600' :
              'text-gray-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
        <div className="space-y-8">
          {/* Welcome Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{user?.name || user?.email || 'User'}</span>! 
                Create job postings and manage your resume screening process.
              </p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Jobs" 
                value={stats.totalJobs} 
                icon={Briefcase} 
                color="blue"
                trend="+12% this month"
              />
              <StatCard 
                title="Applications" 
                value={stats.totalCandidates} 
                icon={Users} 
                color="green"
                trend="+23% this week"
              />
              <StatCard 
                title="High Matches" 
                value={stats.highMatches} 
                icon={Star} 
                color="yellow"
                trend="+8% this week"
              />
              <StatCard 
                title="Avg Score" 
                value={`${stats.avgScore}%`} 
                icon={BarChart3} 
                color="purple"
                trend="+5% improvement"
              />
            </div>
          )}
          
          {/* Create Job Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Job Posting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateJobForm onJobCreated={handleJobCreated} />
            </CardContent>
          </Card>
          
          {/* Job List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Your Job Postings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobList refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;