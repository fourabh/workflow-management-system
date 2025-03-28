import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Workflow Management System</h1>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name || 'User'}</span>
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout; 