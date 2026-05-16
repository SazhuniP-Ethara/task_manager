import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Edit2, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '', project: '', assignedMember: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);

      if (user?.role === 'Admin') {
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (user?.role !== 'Admin' && !task) {
      toast.error('Only Admins can create new tasks!');
      return;
    }
    if (user?.role !== 'Admin' && task) {
      toast.error('Only Admins can edit tasks!');
      return;
    }

    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: new Date(task.dueDate).toISOString().split('T')[0],
        project: task.project._id,
        assignedMember: task.assignedMember?._id || ''
      });
      setEditingId(task._id);
    } else {
      setFormData({
        title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '', project: projects[0]?._id || '', assignedMember: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, formData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-rose-600 bg-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'In Progress': return <Clock className="text-blue-500" size={20} />;
      default: return <AlertCircle className="text-amber-500" size={20} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
            <p className="text-slate-500">Try changing the filter or create a new task.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filteredTasks.map((task) => (
              <li key={task._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center space-x-3 mb-1">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        Project: {task.project?.title || 'Unknown'}
                      </span>
                      <span className={`px-2 py-1 rounded ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {task.assignedMember && (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                          Assignee: {task.assignedMember.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      className="text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {user?.role === 'Admin' && (
                      <div className="flex space-x-2">
                        <button onClick={() => handleOpenModal(task)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(task._id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Task' : 'New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                  >
                    <option value="" disabled>Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {user?.role === 'Admin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.assignedMember}
                      onChange={(e) => setFormData({...formData, assignedMember: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition-colors"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
