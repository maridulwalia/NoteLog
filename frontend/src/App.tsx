import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X as XIcon } from 'lucide-react';
import { CheckSquare, Users, StickyNote, Menu, X } from 'lucide-react';
import { User, RegisterData, LoginData } from './types';
import { authAPI } from './utils/api';

import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import NotesList from './components/NotesList';
import TodoList from './components/TodoList';
import ContactList from './components/ContactList';
import CustomNotesGallery from './components/CustomNotesGallery';

type AuthView = 'login' | 'register';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md flex items-center space-x-3 ${
        type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <span
        className={`text-sm font-medium ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}
      >
        {message}
      </span>
      <button
      title="On close"
        type="button"
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
          type === 'success' ? 'text-green-500 hover:bg-green-500' : 'text-red-500 hover:bg-red-500'
        }`}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // For tab navigation after login
  const [activeTab, setActiveTab] = useState<'notes' | 'todos' | 'contacts' | 'custom-notes'>('notes');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'notes', label: 'Notes', icon: StickyNote, component: NotesList },
    { id: 'todos', label: 'Todo List', icon: CheckSquare, component: TodoList },
    { id: 'contacts', label: 'Contacts', icon: Users, component: ContactList },
    { id: 'custom-notes', label: 'Custom Notes', icon: StickyNote, component: CustomNotesGallery }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (token && savedUser) {
        try {
          await authAPI.getProfile(); // check token validity
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Token invalid or user deleted:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(null);
        }
      }
    };

    checkAuth();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleLogin = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.login(data);

      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      showNotification('success', `Welcome back, ${response.user.username}!`);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.register(data);

      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      showNotification('success', `Welcome to NoteLog, ${response.user.username}!`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setError(null);
    showNotification('success', 'You have been logged out successfully.');
  };

  const handleError = (errorMessage: string) => {
    showNotification('error', errorMessage);
  };

  const toggleAuthView = () => {
    setAuthView((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  // Find the active tab's component
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header with user + logout */}
      <Header user={user} onLogout={handleLogout} />

      {/* If user not logged in show login/register forms */}
      {!user ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
          {authView === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onToggleForm={toggleAuthView}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onToggleForm={toggleAuthView}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <nav className="hidden md:flex space-x-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-t">
                <nav className="px-4 py-2 space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {ActiveComponent && <ActiveComponent onError={handleError} />}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
