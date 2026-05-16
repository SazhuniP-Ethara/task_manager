import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle2, Clock, Briefcase, ListTodo, AlertCircle, Plus, ArrowRight, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
        setRecentProjects(projectsRes.data.slice(0, 4));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'On Hold': return 'bg-amber-100 text-amber-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getPriorityDot = (priority) => {
    switch(priority) {
      case 'High': return 'bg-rose-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4 transform transition-all hover:-translate-y-1 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`p-4 rounded-xl ${bgColorClass}`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span></p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Project</span>
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Task</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Briefcase}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-50"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={ListTodo}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-50"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-50"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Pending"
          value={stats.pendingTasks}
          icon={Clock}
          colorClass="text-amber-600"
          bgColorClass="bg-amber-50"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={AlertCircle}
          colorClass="text-rose-600"
          bgColorClass="bg-rose-50"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* Completion progress bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Overall Completion Rate</h2>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {stats.completedTasks} of {stats.totalTasks} tasks completed
        </p>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">Recent Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={16} />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ListTodo size={40} className="mx-auto mb-3 opacity-50" />
              <p>No tasks yet. Create your first one!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/tasks')}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`}></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.project?.title}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">Active Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={16} />
            </button>
          </div>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Briefcase size={40} className="mx-auto mb-3 opacity-50" />
              <p>No projects yet. Create your first one!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((project) => (
                <li
                  key={project._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  onClick={() => navigate('/projects')}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{project.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{project.description}</p>
                  </div>
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <Users size={14} />
                      <span>{project.members?.length || 0}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
