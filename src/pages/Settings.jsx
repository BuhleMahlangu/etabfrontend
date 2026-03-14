import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/common/Toast';
import { 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  User, 
  Eye, 
  Globe, 
  Accessibility,
  Palette,
  Save,
  RefreshCw,
  ChevronRight,
  Lock,
  Mail,
  Smartphone,
  Check
} from 'lucide-react';

export const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { settings, updateSetting, toggleDarkMode, resetSettings } = useSettings();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ];

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // API call to change password would go here
      addToast('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast('Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings();
      addToast('Settings reset to default', 'success');
    }
  };

  // Toggle Switch Component
  const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences and customize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Quick Actions</h3>
            <button
              onClick={handleResetSettings}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme & Appearance
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Customize how E-tab looks for you
                  </p>
                </div>
                
                <div className="p-6">
                  {/* Dark Mode */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
                        {settings.darkMode ? (
                          <Moon className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <Sun className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {settings.darkMode ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {settings.darkMode 
                            ? 'Easier on the eyes in low light' 
                            : 'Classic light theme'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        settings.darkMode ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

                  {/* Preview */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Preview</p>
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      settings.darkMode 
                        ? 'bg-slate-800 border-slate-700' 
                        : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${settings.darkMode ? 'bg-blue-600' : 'bg-blue-500'}`} />
                        <div>
                          <div className={`h-3 w-24 rounded ${settings.darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
                          <div className={`h-2 w-16 rounded mt-2 ${settings.darkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language & Region
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Language</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Select your preferred language
                      </p>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', null, e.target.value)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="en">English</option>
                      <option value="af">Afrikaans</option>
                      <option value="zu">isiZulu</option>
                      <option value="xh">isiXhosa</option>
                      <option value="st">Sesotho</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Choose what notifications you want to receive
                </p>
              </div>
              
              <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
                <Toggle
                  label="Email Notifications"
                  description="Receive updates via email"
                  checked={settings.notifications.email}
                  onChange={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                />
                <Toggle
                  label="Push Notifications"
                  description="Receive browser push notifications"
                  checked={settings.notifications.push}
                  onChange={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                />
                <Toggle
                  label="Assignment Updates"
                  description="New assignments and grade updates"
                  checked={settings.notifications.assignments}
                  onChange={() => updateSetting('notifications', 'assignments', !settings.notifications.assignments)}
                />
                <Toggle
                  label="Grade Notifications"
                  description="When your work is graded"
                  checked={settings.notifications.grades}
                  onChange={() => updateSetting('notifications', 'grades', !settings.notifications.grades)}
                />
                <Toggle
                  label="Announcements"
                  description="Important announcements from teachers"
                  checked={settings.notifications.announcements}
                  onChange={() => updateSetting('notifications', 'announcements', !settings.notifications.announcements)}
                />
                <Toggle
                  label="Deadline Reminders"
                  description="Reminders before assignment deadlines"
                  checked={settings.notifications.deadlines}
                  onChange={() => updateSetting('notifications', 'deadlines', !settings.notifications.deadlines)}
                />
              </div>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder="+27 ..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Privacy Settings
                  </h2>
                </div>
                <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
                  <Toggle
                    label="Show Profile to Teachers"
                    description="Allow teachers to view your full profile"
                    checked={settings.privacy.showProfileToTeachers}
                    onChange={() => updateSetting('privacy', 'showProfileToTeachers', !settings.privacy.showProfileToTeachers)}
                  />
                  <Toggle
                    label="Show Profile to Other Learners"
                    description="Allow other students to see your name and grade"
                    checked={settings.privacy.showProfileToLearners}
                    onChange={() => updateSetting('privacy', 'showProfileToLearners', !settings.privacy.showProfileToLearners)}
                  />
                  <Toggle
                    label="Allow Data Analytics"
                    description="Help us improve by sharing anonymous usage data"
                    checked={settings.privacy.allowDataAnalytics}
                    onChange={() => updateSetting('privacy', 'allowDataAnalytics', !settings.privacy.allowDataAnalytics)}
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    These actions cannot be undone
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => alert('Download data feature coming soon!')}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Download My Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This cannot be undone!')) {
                          alert('Account deletion request sent to admin.');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCESSIBILITY TAB */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Accessibility className="w-5 h-5" />
                    Accessibility Options
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Make E-tab work better for you
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Font Size
                    </label>
                    <div className="flex gap-3">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSetting('accessibility', 'fontSize', size)}
                          className={`px-4 py-2 rounded-lg border capitalize transition-all ${
                            settings.accessibility.fontSize === size
                              ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700" />

                  <Toggle
                    label="High Contrast Mode"
                    description="Increase contrast for better visibility"
                    checked={settings.accessibility.highContrast}
                    onChange={() => updateSetting('accessibility', 'highContrast', !settings.accessibility.highContrast)}
                  />
                  <Toggle
                    label="Reduced Motion"
                    description="Minimize animations throughout the app"
                    checked={settings.accessibility.reducedMotion}
                    onChange={() => updateSetting('accessibility', 'reducedMotion', !settings.accessibility.reducedMotion)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
