import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Shield, User, Mail, Calendar, Edit2, Trash2, X, Search, Plus, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  // Add member modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/auth/users');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (user?.role !== 'Admin') {
      toast.error('Only Admins can add members');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/users', addForm);
      toast.success(`${addForm.name} added to the team!`);
      setAddModalOpen(false);
      setAddForm({ name: '', email: '', password: '', role: 'Member' });
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRole = (member) => {
    if (user?.role !== 'Admin') {
      toast.error('Only Admins can change roles');
      return;
    }
    setEditingMember(member);
    setSelectedRole(member.role);
    setEditModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      await api.put(`/auth/users/${editingMember._id}/role`, { role: selectedRole });
      toast.success(`${editingMember.name}'s role updated to ${selectedRole}`);
      setEditModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (member) => {
    if (user?.role !== 'Admin') {
      toast.error('Only Admins can remove members');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      try {
        await api.delete(`/auth/users/${member._id}`);
        toast.success(`${member.name} removed from the team`);
        fetchMembers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
      'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredMembers = members
    .filter(m => roleFilter === 'All' || m.role === roleFilter)
    .filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const adminCount = members.filter(m => m.role === 'Admin').length;
  const memberCount = members.filter(m => m.role === 'Member').length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500 mt-1">{members.length} members in your organization</p>
        </div>
        <button
          onClick={() => {
            if (user?.role !== 'Admin') {
              toast.error('Only Admins can add members');
              return;
            }
            setAddModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md"
        >
          <UserPlus size={18} />
          <span className="text-sm font-medium">Add Member</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Members</p>
            <p className="text-2xl font-bold text-slate-800">{members.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Admins</p>
            <p className="text-2xl font-bold text-slate-800">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Members</p>
            <p className="text-2xl font-bold text-slate-800">{memberCount}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex space-x-2">
          {['All', 'Admin', 'Member'].map(f => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${roleFilter === f ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Users size={48} className="mx-auto mb-3 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No members found</h3>
            <p className="text-slate-500">Try changing the search or filter.</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group relative"
            >
              {/* Admin actions */}
              {user?.role === 'Admin' && member._id !== user._id && (
                <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditRole(member)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit role"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}

              {/* Avatar + Name */}
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-14 h-14 rounded-full ${getAvatarColor(member.name)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-800 truncate">
                    {member.name}
                    {member._id === user?._id && (
                      <span className="ml-2 text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">You</span>
                    )}
                  </h3>
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    member.role === 'Admin'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {member.role === 'Admin' ? <Shield size={12} /> : <User size={12} />}
                    <span>{member.role}</span>
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2.5 text-sm text-slate-500">
                  <Mail size={15} className="text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${member.email}`} className="hover:text-indigo-600 transition-colors truncate">{member.email}</a>
                </div>
                <div className="flex items-center space-x-2.5 text-sm text-slate-500">
                  <Calendar size={15} className="text-slate-400 flex-shrink-0" />
                  <span>Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <UserPlus size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Add Team Member</h2>
                  <p className="text-xs text-slate-500">Create a new account for your team</p>
                </div>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@company.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={addForm.password}
                    onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, role: 'Admin'})}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      addForm.role === 'Admin'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Shield size={20} className={addForm.role === 'Admin' ? 'text-amber-600' : 'text-slate-400'} />
                    <span className={`mt-1 text-sm font-semibold ${addForm.role === 'Admin' ? 'text-amber-700' : 'text-slate-600'}`}>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, role: 'Member'})}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      addForm.role === 'Member'
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <User size={20} className={addForm.role === 'Member' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className={`mt-1 text-sm font-semibold ${addForm.role === 'Member' ? 'text-emerald-700' : 'text-slate-600'}`}>Member</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Edit Role</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Member preview */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-slate-50 rounded-xl">
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(editingMember.name)} flex items-center justify-center text-white font-bold text-sm`}>
                {getInitials(editingMember.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{editingMember.name}</p>
                <p className="text-xs text-slate-500">{editingMember.email}</p>
              </div>
            </div>

            {/* Role selector */}
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedRole('Admin')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'Admin'
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Shield size={24} className={selectedRole === 'Admin' ? 'text-amber-600' : 'text-slate-400'} />
                <span className={`mt-2 text-sm font-semibold ${selectedRole === 'Admin' ? 'text-amber-700' : 'text-slate-600'}`}>Admin</span>
                <span className="text-xs text-slate-400 mt-0.5">Full access</span>
              </button>
              <button
                onClick={() => setSelectedRole('Member')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'Member'
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User size={24} className={selectedRole === 'Member' ? 'text-emerald-600' : 'text-slate-400'} />
                <span className={`mt-2 text-sm font-semibold ${selectedRole === 'Member' ? 'text-emerald-700' : 'text-slate-600'}`}>Member</span>
                <span className="text-xs text-slate-400 mt-0.5">Limited access</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
