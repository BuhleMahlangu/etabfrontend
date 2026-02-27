import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Welcome, {user?.firstName}! 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">My Subjects</h3>
          <p className="text-3xl font-bold text-blue-600">5</p>
          <p className="text-sm text-slate-500">Enrolled this semester</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Materials</h3>
          <p className="text-3xl font-bold text-emerald-600">24</p>
          <p className="text-sm text-slate-500">Available for download</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Assignments</h3>
          <p className="text-3xl font-bold text-amber-600">3</p>
          <p className="text-sm text-slate-500">Due this week</p>
        </Card>
      </div>

      <div className="mt-8">
        <Button>View All Materials</Button>
      </div>
    </div>
  );
}