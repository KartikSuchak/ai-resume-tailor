import React from 'react';
import { FileText, Sparkles, Clock, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Resumes Tailored', value: '12', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { label: 'AI Credits Used', value: '45', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
    { label: 'Time Saved', value: '6h', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  ];

  const recentActivity = [
    { title: 'Frontend Developer Resume', date: '2 hours ago', status: 'Tailored' },
    { title: 'Product Manager Resume', date: 'Yesterday', status: 'Draft' },
    { title: 'UX Designer Resume', date: '3 days ago', status: 'Tailored' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-800/50 bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-200">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                activity.status === 'Tailored' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
