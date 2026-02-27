// E-tab Admin Dashboard
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';


export const AdminDashboard = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Mock data
  const stats = {
    totalUsers: 1245,
    totalSubjects: 48,
    totalMaterials: 3256,
    activeEnrollments: 3890
  };

  const userGrowth = [
    { month: 'Jan', users: 800 },
    { month: 'Feb', users: 950 },
    { month: 'Mar', users: 1100 },
    { month: 'Apr', users: 1245 },
  ];

  const userRoles = [
    { name: 'Learners', value: 1000, color: '#3B82F6' },
    { name: 'Teachers', value: 200, color: '#10B981' },
    { name: 'Admins', value: 45, color: '#8B5CF6' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@university.edu', role: 'learner', status: 'active', joined: '2024-01-20' },
    { id: 2, name: 'Jane Smith', email: 'jane@university.edu', role: 'teacher', status: 'active', joined: '2024-01-19' },
    { id: 3, name: 'Bob Johnson', email: 'bob@university.edu', role: 'learner', status: 'inactive', joined: '2024-01-18' },
  ];

  const userColumns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { 
      key: 'role', 
      title: 'Role',
      render: (v) => <Badge variant={v === 'admin' ? 'purple' : v === 'teacher' ? 'primary' : 'success'}>{v}</Badge>
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'}>{v}</Badge>
    },
    { key: 'joined', title: 'Joined Date' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your E-tab platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue', trend: '+12%' },
              { label: 'Subjects', value: stats.totalSubjects, icon: '📚', color: 'emerald', trend: '+3' },
              { label: 'Materials', value: stats.totalMaterials, icon: '📁', color: 'amber', trend: '+156' },
              { label: 'Enrollments', value: stats.activeEnrollments, icon: '🎓', color: 'purple', trend: '+8%' },
            ].map((stat, idx) => (
              <Card key={idx} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-20', `bg-${stat.color}-500`)} />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <Badge variant="success" className="bg-opacity-20">{stat.trend}</Badge>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by role</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userRoles}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {userRoles.map(role => (
                    <div key={role.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="text-sm text-slate-600">{role.name}: {role.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </div>
              <Button onClick={() => setIsUserModalOpen(true)}>+ Add User</Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={userColumns} 
              data={recentUsers}
              selectable
              onSelectionChange={(selected) => console.log(selected)}
            />
          </CardContent>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Add New User"
        size="md"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
              <option value="learner">Learner</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              addToast('User created successfully', 'success');
              setIsUserModalOpen(false);
            }}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};