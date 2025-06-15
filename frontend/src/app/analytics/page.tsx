'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { StarBorder } from '@/components/ui/star-border';
import { 
  ArrowLeft,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  GitBranch,
  FileArchive,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Zap,
  Rocket
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  description: string;
  deployment_type: 'git' | 'zip';
  status: 'pending' | 'building' | 'running' | 'failed' | 'stopped';
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeployTime: number;
  deploymentsByType: { git: number; zip: number };
  deploymentsByMonth: { month: string; count: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
}

const AnalyticsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          const deploymentList = data.deployments || [];
          setDeployments(deploymentList);
          
          // Calculate analytics
          const analytics = calculateAnalytics(deploymentList);
          setAnalytics(analytics);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const calculateAnalytics = (deployments: Deployment[]): AnalyticsData => {
    const total = deployments.length;
    const successful = deployments.filter(d => d.status === 'running').length;
    const failed = deployments.filter(d => d.status === 'failed').length;
    
    // Deployment types
    const git = deployments.filter(d => d.deployment_type === 'git').length;
    const zip = deployments.filter(d => d.deployment_type === 'zip').length;
    
    // Status distribution
    const statusCounts = deployments.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Deployments by month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const deploymentsByMonth = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      const count = deployments.filter(d => {
        const deployDate = new Date(d.created_at);
        return deployDate.getMonth() === date.getMonth() && 
               deployDate.getFullYear() === date.getFullYear();
      }).length;
      
      deploymentsByMonth.push({ month: `${month} ${year}`, count });
    }
    
    return {
      totalDeployments: total,
      successfulDeployments: successful,
      failedDeployments: failed,
      averageDeployTime: 45, // Mock data - would calculate from actual deployment times
      deploymentsByType: { git, zip },
      deploymentsByMonth,
      statusDistribution
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'building': return 'text-blue-400';
      default: return 'text-gray-400';
    }
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

  if (!user || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <StarBorder as="div">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </StarBorder>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-300">
            Insights and statistics about your deployments.
          </p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Deployments',
              value: analytics.totalDeployments,
              icon: Rocket,
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/20'
            },
            {
              title: 'Success Rate',
              value: `${analytics.totalDeployments > 0 ? Math.round((analytics.successfulDeployments / analytics.totalDeployments) * 100) : 0}%`,
              icon: TrendingUp,
              color: 'text-green-400',
              bgColor: 'bg-green-500/20'
            },
            {
              title: 'Avg Deploy Time',
              value: `${analytics.averageDeployTime}s`,
              icon: Clock,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/20'
            },
            {
              title: 'Active Sites',
              value: analytics.successfulDeployments,
              icon: Globe,
              color: 'text-cyan-400',
              bgColor: 'bg-cyan-500/20'
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Deployment Types */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlowingCard>
              <div className="bg-black/90 border-2 border-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                  Deployment Types
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Git Repositories</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{analytics.deploymentsByType.git}</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics.totalDeployments > 0 ? (analytics.deploymentsByType.git / analytics.totalDeployments) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileArchive className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">ZIP Files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{analytics.deploymentsByType.zip}</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-400 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics.totalDeployments > 0 ? (analytics.deploymentsByType.zip / analytics.totalDeployments) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GlowingCard>
              <div className="bg-black/90 border-2 border-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                  Status Distribution
                </h3>
                <div className="space-y-3">
                  {analytics.statusDistribution.map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status).replace('text-', 'bg-')}`}></div>
                        <span className="text-gray-300 capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{item.count}</span>
                        <span className="text-gray-400 text-sm">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlowingCard>
          </motion.div>
        </div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlowingCard>
            <div className="bg-black/90 border-2 border-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                Deployment Trend (Last 6 Months)
              </h3>
              <div className="flex items-end space-x-4 h-40">
                {analytics.deploymentsByMonth.map((month, index) => {
                  const maxCount = Math.max(...analytics.deploymentsByMonth.map(m => m.count));
                  const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-center mb-2">
                        <div 
                          className="w-8 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t transition-all duration-500 hover:from-blue-500 hover:to-cyan-300"
                          style={{ height: `${height}%`, minHeight: month.count > 0 ? '8px' : '2px' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 text-center">{month.month.split(' ')[0]}</span>
                      <span className="text-xs text-white font-semibold">{month.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <StarBorder as="div">
              <button
                onClick={() => router.push('/deploy')}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                <Zap className="h-5 w-5" />
                <span>New Deployment</span>
              </button>
            </StarBorder>
            <StarBorder as="div">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300"
              >
                <Activity className="h-5 w-5" />
                <span>View Dashboard</span>
              </button>
            </StarBorder>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsPage; 