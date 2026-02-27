import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'My Subjects', value: '5', color: 'text-blue-600', icon: '📚' },
    { label: 'Materials', value: '24', color: 'text-emerald-600', icon: '📄' },
    { label: 'Assignments', value: '3', color: 'text-amber-600', icon: '✏️' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header with Logo */}
      <div className="flex items-center gap-4 mb-8">
        <img 
          src="/E-tab logo.png" 
          alt="E-tab" 
          className="h-12 w-auto"
        />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-500">Here's what's happening with your studies today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Materials</h3>
          <div className="space-y-3">
            {['Introduction to Algorithms', 'Week 3 Lecture Notes', 'Assignment Brief'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item}</p>
                  <p className="text-sm text-slate-500">CS101 • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4" as={Link} to="/materials">
            View All Materials
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {[
              { title: 'CS101 Quiz 2', date: 'Tomorrow', urgent: true },
              { title: 'Essay Submission', date: 'Friday', urgent: false },
              { title: 'Lab Report', date: 'Next Monday', urgent: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className={`w-2 h-2 rounded-full ${item.urgent ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
                {item.urgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}