import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';

function ResumeUploadForm({ jobId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Please select a valid PDF file.');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/jobs/${jobId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { match_score, name } = response.data;
      const scorePercentage = Math.round(match_score * 100);
      
      setMessage(`Successfully uploaded ${name || file.name}! Match score: ${scorePercentage}%`);
      setMessageType('success');
      setFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.error || 'Failed to upload resume.');
      setMessageType('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Resume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume-file" className="text-sm font-medium">
              Select PDF Resume
            </Label>
            <div className="relative">
              <Input
                id="resume-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Selected: {file.name}
                </span>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isUploading || !file} 
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Resume...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Score Resume
              </>
            )}
          </Button>
        </form>
        
        {message && (
          <div className={`mt-4 p-4 rounded-md flex items-center gap-2 ${
            messageType === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            {messageType === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ResumeUploadForm;