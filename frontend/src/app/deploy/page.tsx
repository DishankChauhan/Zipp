'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { 
  GitBranch, 
  Upload, 
  Rocket, 
  ArrowLeft,
  Github,
  FileArchive,
  Globe,
  Settings
} from 'lucide-react';

const DeployPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [deploymentType, setDeploymentType] = useState<'git' | 'zip' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Git deployment form state
  const [gitForm, setGitForm] = useState({
    name: '',
    description: '',
    repo_url: '',
    branch: 'main'
  });
  
  // ZIP deployment form state
  const [zipForm, setZipForm] = useState({
    name: '',
    description: '',
    file: null as File | null
  });

  const handleGitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8000/api/deployments/git', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gitForm),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Git deployment started:', data);
        router.push('/dashboard');
      } else {
        const error = await response.json();
        console.error('Git deployment failed:', error);
        
        // Provide more specific error messages
        let errorMessage = error.detail || 'Unknown error';
        if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
          errorMessage = 'Repository or branch not found. Please check the URL and branch name.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
          errorMessage = 'Access denied. Please ensure the repository is public or you have access.';
        } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        alert('Deployment failed: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error starting git deployment:', error);
      alert('Error starting deployment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !zipForm.file) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', zipForm.file);
      formData.append('name', zipForm.name);
      formData.append('description', zipForm.description);

      const response = await fetch('http://localhost:8000/api/deployments/zip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('ZIP deployment started:', data);
        router.push('/dashboard');
      } else {
        const error = await response.json();
        console.error('ZIP deployment failed:', error);
        alert('Deployment failed: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting zip deployment:', error);
      alert('Error starting deployment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setZipForm(prev => ({ ...prev, file }));
    } else {
      alert('Please select a valid ZIP file');
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Deploy Your Website
          </h1>
          <p className="text-gray-300">
            Choose how you want to deploy your website to Zipp.
          </p>
        </motion.div>

        {!deploymentType ? (
          /* Deployment Type Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlowingCard>
                <button
                  onClick={() => setDeploymentType('git')}
                  className="w-full bg-black/90 border-2 border-gray-800 p-8 rounded-xl hover:bg-black/95 hover:border-gray-700 transition-all duration-300 text-left"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Github className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Deploy from Git
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Connect your GitHub repository
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Deploy directly from your Git repository with automatic builds and continuous deployment.
                  </p>
                </button>
              </GlowingCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GlowingCard>
                <button
                  onClick={() => setDeploymentType('zip')}
                  className="w-full bg-black/90 border-2 border-gray-800 p-8 rounded-xl hover:bg-black/95 hover:border-gray-700 transition-all duration-300 text-left"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <FileArchive className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Upload ZIP File
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Upload your built website
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Upload a ZIP file containing your built website files for instant deployment.
                  </p>
                </button>
              </GlowingCard>
            </motion.div>
          </div>
        ) : (
          /* Deployment Forms */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlowingCard>
              <div className="bg-black/90 border-2 border-gray-800 p-8 rounded-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <button
                    onClick={() => setDeploymentType(null)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-3">
                    {deploymentType === 'git' ? (
                      <Github className="h-6 w-6 text-blue-400" />
                    ) : (
                      <FileArchive className="h-6 w-6 text-purple-400" />
                    )}
                    <h2 className="text-xl font-semibold text-white">
                      {deploymentType === 'git' ? 'Deploy from Git Repository' : 'Upload ZIP File'}
                    </h2>
                  </div>
                </div>

                {deploymentType === 'git' ? (
                  <form onSubmit={handleGitSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Repository URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={gitForm.repo_url}
                        onChange={(e) => setGitForm(prev => ({ ...prev, repo_url: e.target.value }))}
                        placeholder="https://github.com/username/repository"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={gitForm.branch}
                        onChange={(e) => setGitForm(prev => ({ ...prev, branch: e.target.value }))}
                        placeholder="main"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Leave empty or use "main" for default. Common branches: main, master, develop
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Deployment Name
                      </label>
                      <input
                        type="text"
                        value={gitForm.name}
                        onChange={(e) => setGitForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-awesome-website"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Description
                      </label>
                      <textarea
                        value={gitForm.description}
                        onChange={(e) => setGitForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your website"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          <span>Deploy from Git</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleZipSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        ZIP File *
                      </label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".zip"
                          required
                          onChange={handleFileChange}
                          className="hidden"
                          id="zip-upload"
                        />
                        <label
                          htmlFor="zip-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-gray-300">
                            {zipForm.file ? zipForm.file.name : 'Click to upload ZIP file'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Maximum file size: 100MB
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Deployment Name
                      </label>
                      <input
                        type="text"
                        value={zipForm.name}
                        onChange={(e) => setZipForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my-awesome-website"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Description
                      </label>
                      <textarea
                        value={zipForm.description}
                        onChange={(e) => setZipForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your website"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading || !zipForm.file}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          <span>Deploy ZIP File</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DeployPage; 