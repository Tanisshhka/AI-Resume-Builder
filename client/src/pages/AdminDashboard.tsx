import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Shield, Users, FileText, Sparkles, Trash2, Key, ChevronLeft } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const dataMetrics = await api.get('/admin/metrics');
      setMetrics(dataMetrics);
      
      const userList = await api.get('/admin/users');
      setUsers(userList);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? All their resumes and tracked jobs will be permanently deleted.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-500 font-mono">Running Administrator Audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200/55 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="text-primary w-5 h-5" />
                <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Admin Analytics & Control
                </h1>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Monitor user statistics, inspect system-wide templates, and manage account authorization states.
              </p>
            </div>
          </div>
        </div>

        {/* METRICS CONTAINER */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Users</span>
                <Users className="text-primary w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-black">{metrics.counts?.users || 0}</div>
              <p className="text-[10px] text-slate-500 mt-1">Registered members active</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Resumes</span>
                <FileText className="text-secondary w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-black">{metrics.counts?.resumes || 0}</div>
              <p className="text-[10px] text-slate-500 mt-1">Rendered user files</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Operations Executed</span>
                <Sparkles className="text-amber-500 w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-black">{metrics.counts?.aiRequests || 0}</div>
              <p className="text-[10px] text-slate-500 mt-1">Gemini API triggers</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracked Jobs</span>
                <Users className="text-emerald-500 w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-black">{metrics.counts?.jobs || 0}</div>
              <p className="text-[10px] text-slate-500 mt-1">Openings bookmarked/applied</p>
            </div>
          </div>
        )}

        {/* TABLES SPLIT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* USER MANAGEMENT */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold">User Registrations</h2>
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/40 dark:border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 dark:bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-200/20 dark:border-slate-800/20">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">AI Credits Used</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/20 dark:divide-slate-800/40">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-100/10 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{u.name}</td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            u.role === 'admin' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center font-semibold text-amber-500">{u.aiTokensUsed || 0}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RECENT RESUMES SYSTEM FEED */}
          <div className="space-y-4">
            <h2 className="text-base font-bold">Recent System Resumes</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              {metrics?.recentResumes && metrics.recentResumes.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentResumes.map((res: any) => (
                    <div key={res._id} className="text-xs border-b border-slate-200/10 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{res.title}</span>
                        <span className="text-amber-500">{res.resumeScore || 0}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Template: {res.templateId}</p>
                      {res.userId && (
                        <p className="text-[10px] text-slate-500 mt-1">Creator: {res.userId.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No resumes processed in system yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
