import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Building2, Search } from 'lucide-react';
import { schoolAPI } from '../services/api';

export const SchoolCodeInput = ({ onSchoolFound, onError }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);

  const validateCode = async (schoolCode) => {
    if (!schoolCode || schoolCode.length < 3) {
      setError('School code must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if school exists via public endpoint
      const response = await fetch(`http://localhost:5000/api/schools/verify/${schoolCode.toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setSchool(data.data);
        onSchoolFound?.(data.data);
      } else {
        setError('School not found. Please check the code.');
        setSchool(null);
        onError?.();
      }
    } catch (err) {
      setError('Failed to verify school code');
      setSchool(null);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  // Debounce the validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.length >= 3) {
        validateCode(code);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        School Code *
      </label>
      <div className="relative">
        <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter school code (e.g., JHS)"
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          maxLength={10}
        />
        {loading && (
          <Search className="absolute right-3 top-3 w-5 h-5 text-blue-500 animate-pulse" />
        )}
        {!loading && school && (
          <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
        )}
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {school && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">{school.name}</p>
              <p className="text-sm text-green-700">{school.province}</p>
              <p className="text-xs text-green-600 mt-1">
                Code: {school.code}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Ask your school administrator for the school code
      </p>
    </div>
  );
};
