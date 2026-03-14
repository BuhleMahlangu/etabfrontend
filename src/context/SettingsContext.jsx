import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      notifications: {
        email: true,
        push: true,
        assignments: true,
        grades: true,
        announcements: true,
        deadlines: true,
      },
      accessibility: {
        fontSize: 'medium', // small, medium, large
        highContrast: false,
        reducedMotion: false,
      },
      privacy: {
        showProfileToTeachers: true,
        showProfileToLearners: false,
        allowDataAnalytics: true,
      },
      language: 'en',
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply font size
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.accessibility.fontSize] || '16px';
  }, [settings.accessibility.fontSize]);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const resetSettings = () => {
    const defaults = {
      darkMode: false,
      notifications: {
        email: true,
        push: true,
        assignments: true,
        grades: true,
        announcements: true,
        deadlines: true,
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
      },
      privacy: {
        showProfileToTeachers: true,
        showProfileToLearners: false,
        allowDataAnalytics: true,
      },
      language: 'en',
    };
    setSettings(defaults);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      toggleDarkMode, 
      resetSettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
