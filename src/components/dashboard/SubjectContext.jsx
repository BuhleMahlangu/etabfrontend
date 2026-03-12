import React, { createContext, useContext, useState, useEffect } from 'react';

const SubjectContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SubjectProvider = ({ children }) => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Persist selected subject in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedSubject');
    if (saved) {
      try {
        setCurrentSubject(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved subject:', e);
      }
    }
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/teacher-learners/my-subjects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAvailableSubjects(data.data.subjects);
        
        // Auto-select first subject if none selected
        const saved = localStorage.getItem('selectedSubject');
        if (!saved && data.data.subjects.length > 0) {
          setCurrentSubject(data.data.subjects[0]);
          localStorage.setItem('selectedSubject', JSON.stringify(data.data.subjects[0]));
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = (subject) => {
    setCurrentSubject(subject);
    localStorage.setItem('selectedSubject', JSON.stringify(subject));
  };

  const refreshSubjects = () => {
    fetchSubjects();
  };

  return (
    <SubjectContext.Provider value={{
      availableSubjects,
      currentSubject,
      selectSubject,
      refreshSubjects,
      loading,
      isInSubjectContext: !!currentSubject
    }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubject must be used within a SubjectProvider');
  }
  return context;
};