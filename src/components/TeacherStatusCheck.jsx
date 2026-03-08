import React, { useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './common/Button';
import { useToast } from './common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function TeacherStatusCheck() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/auth/check-teacher-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        addToast(data.message || 'Failed to check status', 'error');
      }
    } catch (error) {
      addToast('Failed to check status. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-16 h-16 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Teacher Registration Status</h3>
        <p className="text-sm text-slate-500">
          Already applied? Check your application status
        </p>
      </div>

      <form onSubmit={checkStatus} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !email.trim()}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Check Status
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Result Display */}
      {result && (
        <div className={`mt-6 p-6 rounded-xl border ${getStatusColor(result.status || 'not-found')}`}>
          <div className="text-center">
            {result.found ? (
              <>
                <div className="flex justify-center mb-4">
                  {getStatusIcon(result.status)}
                </div>
                
                <h4 className="text-lg font-bold mb-2">
                  {result.data?.firstName} {result.data?.lastName}
                </h4>
                
                <p className="text-sm mb-4">{result.data?.email}</p>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  result.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  result.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.status === 'pending' && <Clock className="w-4 h-4" />}
                  {result.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                  {result.status === 'rejected' && <XCircle className="w-4 h-4" />}
                  <span className="capitalize">{result.status}</span>
                </div>

                <p className="text-sm mt-4">
                  {result.data?.message}
                </p>

                {result.status === 'pending' && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-slate-600">
                      Applied on: {new Date(result.data?.requestedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Please allow 1-2 business days for review.
                    </p>
                  </div>
                )}

                {result.status === 'rejected' && result.data?.reviewedAt && (
                  <p className="text-xs text-slate-500 mt-4">
                    Reviewed on: {new Date(result.data.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Not Found</h4>
                <p className="text-sm text-slate-600 mb-4">
                  {result.message}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                >
                  Register Now
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}