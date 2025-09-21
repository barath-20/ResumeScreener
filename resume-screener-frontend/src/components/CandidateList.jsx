import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, User, Calendar, FileText, Trophy, Star } from 'lucide-react';
import apiClient from '../services/api';

function CandidateList({ jobId, refreshKey }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const response = await apiClient.get(`/jobs/${jobId}/candidates`);
        console.log('Candidates response:', response.data);
        setCandidates(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch candidates.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [jobId, refreshKey]);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = candidates.filter(candidate => {
        const name = candidate.name || candidate.original_filename || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (scoreFilter !== 'all') {
      filtered = filtered.filter(candidate => {
        const score = (candidate.match_score || 0) * 100;
        switch (scoreFilter) {
          case 'high':
            return score >= 70;
          case 'medium':
            return score >= 40 && score < 70;
          case 'low':
            return score < 40;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  }, [candidates, searchTerm, scoreFilter]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading candidates...</p>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidates ({candidates.length})
          </CardTitle>
          {candidates.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Scores</option>
                <option value="high">High (≥70%)</option>
                <option value="medium">Medium (40-69%)</option>
                <option value="low">Low (&lt;40%)</option>
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
            <p className="text-muted-foreground">Upload resumes above to see candidate rankings.</p>
          </div>
        ) : filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">Try adjusting your search term or score filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedCandidates.map((candidate, index) => {
              const score = Math.round((candidate.match_score || 0) * 100);
              const getScoreVariant = (score) => {
                if (score >= 70) return 'success';
                if (score >= 40) return 'warning';
                return 'destructive';
              };
              const getMatchLevel = (score) => {
                if (score >= 70) return 'High Match';
                if (score >= 40) return 'Medium Match';
                return 'Low Match';
              };
              
              return (
                <div key={candidate.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
                      {(candidate.name || candidate.original_filename || 'U')[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">
                        {candidate.name || candidate.original_filename || 'Unknown Candidate'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(candidate.upload_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          PDF Resume
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{score}%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Match Score</div>
                    </div>
                    <Badge variant={getScoreVariant(score)} className="px-3 py-1">
                      {getMatchLevel(score)}
                    </Badge>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CandidateList;