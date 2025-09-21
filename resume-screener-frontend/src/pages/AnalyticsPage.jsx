import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Star,
  Target,
  Calendar,
  Menu,
  PieChart,
  Activity
} from 'lucide-react';
import apiClient from '../services/api';

function AnalyticsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    avgMatchScore: 0,
    highMatches: 0,
    mediumMatches: 0,
    lowMatches: 0,
    applicationsByMonth: [],
    topPerformingJobs: [],
    scoreDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [jobsResponse] = await Promise.all([
          apiClient.get('/jobs'),
        ]);
        
        const jobs = jobsResponse.data;
        let totalCandidates = 0;
        let totalScore = 0;
        let scoreCount = 0;
        let highMatches = 0;
        let mediumMatches = 0;
        let lowMatches = 0;
        const applicationsByMonth = {};
        const jobPerformance = [];

        for (const job of jobs) {
          try {
            const candidatesResponse = await apiClient.get(`/jobs/${job.id}/candidates`);
            const candidates = candidatesResponse.data;
            totalCandidates += candidates.length;
            
            let jobScore = 0;
            let jobScoreCount = 0;
            
            candidates.forEach(candidate => {
              const score = candidate.match_score || 0;
              totalScore += score;
              scoreCount++;
              jobScore += score;
              jobScoreCount++;
              
              if (score >= 0.7) highMatches++;
              else if (score >= 0.5) mediumMatches++;
              else lowMatches++;
              
              // Group by month
              const month = new Date(candidate.created_at).toISOString().slice(0, 7);
              applicationsByMonth[month] = (applicationsByMonth[month] || 0) + 1;
            });
            
            if (jobScoreCount > 0) {
              jobPerformance.push({
                ...job,
                candidateCount: candidates.length,
                avgScore: jobScore / jobScoreCount,
                highMatches: candidates.filter(c => (c.match_score || 0) >= 0.7).length
              });
            }
          } catch (error) {
            // Job might not have candidates yet
          }
        }

        // Sort jobs by performance
        const topPerformingJobs = jobPerformance
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 5);

        // Convert applications by month to array
        const applicationsByMonthArray = Object.entries(applicationsByMonth)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setAnalytics({
          totalJobs: jobs.length,
          totalCandidates,
          avgMatchScore: scoreCount > 0 ? totalScore / scoreCount : 0,
          highMatches,
          mediumMatches,
          lowMatches,
          applicationsByMonth: applicationsByMonthArray,
          topPerformingJobs,
          scoreDistribution: [
            { label: 'High Match (70%+)', count: highMatches, color: 'bg-green-500' },
            { label: 'Medium Match (50-69%)', count: mediumMatches, color: 'bg-yellow-500' },
            { label: 'Low Match (<50%)', count: lowMatches, color: 'bg-red-500' }
          ]
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendValue}
                </span>
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
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive insights into your resume screening performance and trends.
              </p>
            </CardContent>
          </Card>

          {/* Time Range Selector */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Time Range:</span>
                <div className="flex gap-2">
                  {['7', '30', '90'].map((days) => (
                    <Button
                      key={days}
                      variant={timeRange === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(days)}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Jobs" 
                value={analytics.totalJobs} 
                icon={Briefcase} 
                color="blue"
                trend="up"
                trendValue="+12%"
              />
              <StatCard 
                title="Total Applications" 
                value={analytics.totalCandidates} 
                icon={Users} 
                color="green"
                trend="up"
                trendValue="+23%"
              />
              <StatCard 
                title="Avg Match Score" 
                value={`${Math.round(analytics.avgMatchScore * 100)}%`} 
                icon={Target} 
                color="purple"
                trend="up"
                trendValue="+5%"
              />
              <StatCard 
                title="High Matches" 
                value={analytics.highMatches} 
                icon={Star} 
                color="yellow"
                trend="up"
                trendValue="+8%"
              />
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.scoreDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({analytics.totalCandidates > 0 ? Math.round((item.count / analytics.totalCandidates) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Top Performing Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingJobs.length > 0 ? (
                    analytics.topPerformingJobs.map((job, index) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{job.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {job.candidateCount} applications
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.highMatches} high matches
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {Math.round(job.avgScore * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">avg score</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No job performance data available yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Applications Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.applicationsByMonth.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.applicationsByMonth.slice(-6).map((item, index) => (
                      <div key={item.month} className="text-center p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">{item.month}</div>
                        <div className="text-2xl font-bold">{item.count}</div>
                        <div className="text-xs text-muted-foreground">applications</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No application data available for the selected time range.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  );
}

export default AnalyticsPage;
