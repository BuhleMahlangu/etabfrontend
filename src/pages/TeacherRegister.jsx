import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TeacherRegister = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    employeeNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/teachers/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('Teacher registration successful!', 'success');
        navigate('/teacher/dashboard');
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Error registering teacher:', error);
      addToast('Error registering as teacher', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Teacher Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Employee Number"
              placeholder="e.g., TCH001"
              value={formData.employeeNumber}
              onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
              required
            />
            
            <Input
              label="Qualification"
              placeholder="e.g., B.Ed, M.Sc Education"
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              required
            />
            
            <Input
              label="Specialization"
              placeholder="e.g., Mathematics, Science"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              required
            />
            
            <Input
              label="Years of Experience"
              type="number"
              placeholder="0"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about your teaching experience..."
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};