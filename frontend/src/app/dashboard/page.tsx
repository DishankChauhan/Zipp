'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { StarBorder } from '@/components/ui/star-border';
import { 
  Plus, 
  Rocket, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  ExternalLink,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  description: string;
  deployment_type: 'git' | 'zip';
  status: 'pending' | 'building' | 'running' | 'failed' | 'stopped';
  repo_url?: string;
  branch?: string;
  public_url?: string;
  created_at: string;
  updated_at: string;
}

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    failed: 0,
    thisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [previousDeployments, setPreviousDeployments] = useState<Deployment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Fetch deployments from backend
  useEffect(() => {
    const fetchDeployments = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:8000/api/deployments/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const newDeployments = data.deployments || [];
          
          // Check for status changes and show notifications
          if (previousDeployments.length > 0) {
            newDeployments.forEach((newDep: Deployment) => {
              const oldDep = previousDeployments.find(d => d.id === newDep.id);
              if (oldDep && oldDep.status !== newDep.status) {
                if (newDep.status === 'running') {
                  setNotification({
                    message: `🎉 ${newDep.name} deployed successfully!`,
                    type: 'success'
                  });
                  setTimeout(() => setNotification(null), 5000);
                } else if (newDep.status === 'failed') {
                  setNotification({
                    message: `❌ ${newDep.name} deployment failed`,
                    type: 'error'
                  });
                  setTimeout(() => setNotification(null), 5000);
                }
              }
            });
          }
          
          setDeployments(newDeployments);
          setPreviousDeployments(newDeployments);
          
          // Calculate stats
          const deploymentList = newDeployments;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          setStats({
            total: deploymentList.length,
            running: deploymentList.filter((d: Deployment) => d.status === 'running').length,
            failed: deploymentList.filter((d: Deployment) => d.status === 'failed').length,
            thisMonth: deploymentList.filter((d: Deployment) => {
              const deploymentDate = new Date(d.created_at);
              return deploymentDate.getMonth() === currentMonth && 
                     deploymentDate.getFullYear() === currentYear;
            }).length
          });
        } else {
          console.error('Failed to fetch deployments:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching deployments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeployments();
    
    // Set up intelligent polling for real-time updates
    const pollInterval = setInterval(() => {
      if (user) {
        // Check if there are any active deployments (pending, building)
        const hasActiveDeployments = deployments.some(d => 
          d.status === 'pending' || d.status === 'building'
        );
        
        // Only poll if there are active deployments or if we just started
        if (hasActiveDeployments || deployments.length === 0) {
          fetchDeployments();
        }
      }
    }, 3000); // Poll every 3 seconds for faster updates

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [user, deployments]); // Add deployments to dependency array

  const handleNewDeployment = () => {
    router.push('/deploy');
  };

  const handleViewAnalytics = () => {
    router.push('/analytics');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'building':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'stopped':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'building':
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}
        >
          {notification.message}
        </motion.div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-300">
            Manage your deployments and monitor your applications.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Deployments',
              value: stats.total,
              icon: Rocket,
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/20'
            },
            {
              title: 'Running',
              value: stats.running,
              icon: CheckCircle,
              color: 'text-green-400',
              bgColor: 'bg-green-500/20'
            },
            {
              title: 'This Month',
              value: stats.thisMonth,
              icon: TrendingUp,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/20'
            },
            {
              title: 'Failed',
              value: stats.failed,
              icon: AlertCircle,
              color: 'text-red-400',
              bgColor: 'bg-red-500/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlowingCard>
                <div className="bg-black/90 border-2 border-gray-800 p-6 rounded-xl hover:bg-black/95 hover:border-gray-700 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-200 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </GlowingCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <StarBorder as="div">
              <motion.button
                onClick={handleNewDeployment}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                <Plus className="h-5 w-5" />
                <span>New Deployment</span>
              </motion.button>
            </StarBorder>
            <StarBorder as="div">
              <motion.button
                onClick={handleViewAnalytics}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300"
              >
                <Activity className="h-5 w-5" />
                <span>View Analytics</span>
              </motion.button>
            </StarBorder>
          </div>
        </motion.div>

        {/* Deployments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Recent Deployments
            </h2>
            <div className="flex items-center space-x-4">
              {deployments.some(d => d.status === 'pending' || d.status === 'building') && (
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Monitoring active deployments...</span>
                </div>
              )}
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                View all
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {deployments.map((deployment, index) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <GlowingCard>
                  <div className="bg-black/90 border-2 border-gray-800 p-6 rounded-xl hover:bg-black/95 hover:border-gray-700 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Globe className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            {deployment.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(deployment.status)}
                              <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(deployment.status)}`}>
                                {deployment.status}
                              </span>
                            </div>
                            <span className="text-gray-300">
                              {formatDate(deployment.created_at)}
                            </span>
                            <span className="text-gray-300 capitalize">
                              {deployment.deployment_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {deployment.status === 'running' && deployment.public_url && (
                          <motion.a
                            href={deployment.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors duration-200"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Visit</span>
                          </motion.a>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </GlowingCard>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {deployments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center py-12"
            >
              <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No deployments yet
              </h3>
              <p className="text-gray-300 mb-6">
                Deploy your first website to get started with Zipp.
              </p>
              <motion.button
                onClick={handleNewDeployment}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Create Your First Deployment
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage; 