import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ProjectReports = () => {
  const { getToken } = useAuth();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch('/api/admin/projects/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tasks = await response.json();

        // Aggregate data for reports
        const statusCounts = {};
        const priorityCounts = {};
        const tasksByDate = {};
        const completionTrend = [];

        tasks.tasks.forEach(task => {
          // Status distribution
          statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;

          // Priority distribution
          priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;

          // Tasks created over time (simplified to day)
          const date = new Date(task.created_at).toISOString().split('T')[0];
          tasksByDate[date] = (tasksByDate[date] || 0) + 1;

          // Completion trend (mock - in real app, track completion dates)
          if (task.status === 'done') {
            completionTrend.push({
              date: new Date(task.created_at).toISOString().split('T')[0],
              completed: 1
            });
          }
        });

        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.replace('_', ' ').toUpperCase(),
          value: count,
          count
        }));

        const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
          name: priority.toUpperCase(),
          value: count
        }));

        const creationTrend = Object.entries(tasksByDate).map(([date, count]) => ({
          date,
          created: count
        })).sort((a, b) => a.date.localeCompare(b.date));

        setReportsData({
          totalTasks: tasks.pagination.totalTasks,
          statusData,
          priorityData,
          creationTrend,
          completionTrend,
          avgTasksPerDay: (tasks.pagination.totalTasks / 7).toFixed(1) // Mock weekly avg
        });
        setError(null);
      } else {
        setError('Failed to fetch reports data');
      }
    } catch (err) {
      console.error('Reports fetch error:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
        <h1 className="text-[18px] leading-6 font-semibold text-text-primary mb-2">Project Reports & Analytics</h1>
        <p className="text-text-secondary">Track progress, identify bottlenecks, and optimize your workflow</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-elev1 rounded-12 shadow-elev1 p-6 border border-line-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-text-tertiary">Total Tasks</p>
              <p className="text-[22px] leading-[30px] font-semibold text-text-primary">{reportsData.totalTasks}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-elev1 rounded-12 shadow-elev1 p-6 border border-line-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-text-tertiary">Avg Tasks/Day</p>
              <p className="text-[22px] leading-[30px] font-semibold text-text-primary">{reportsData.avgTasksPerDay}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-elev1 rounded-12 shadow-elev1 p-6 border border-line-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-text-tertiary">Completion Rate</p>
              <p className="text-[22px] leading-[30px] font-semibold text-text-primary">
                {reportsData.totalTasks > 0 ?
                  ((reportsData.statusData.find(s => s.name === 'DONE')?.count || 0) / reportsData.totalTasks * 100).toFixed(1) : 0}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-elev1 rounded-12 shadow-elev1 p-6 border border-line-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-text-tertiary">Active Tasks</p>
              <p className="text-[22px] leading-[30px] font-semibold text-text-primary">
                {(reportsData.statusData.find(s => s.name === 'IN PROGRESS')?.count || 0)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportsData.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportsData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportsData.priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Creation Trend */}
        <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">Task Creation Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportsData.creationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="created" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Trend */}
        <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportsData.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#00C49F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectReports;
