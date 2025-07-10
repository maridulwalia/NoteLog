import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { User, RegisterData, LoginData } from './types';
import { authAPI } from './utils/api';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import NotesList from './components/NotesList';


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
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md flex items-center space-x-3 ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <span className={`text-sm font-medium ${
        type === 'success' ? 'text-green-700' : 'text-red-700'
      }`}>
        {message}
      </span>
      <button
      type="button"
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
          type === 'success' ? 'text-green-500 hover:bg-green-500' : 'text-red-500 hover:bg-red-500'
        }`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      
      // Store token and user data
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
      
      // Store token and user data
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
    setAuthView(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      {user ? (
        <NotesList onError={handleError} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;