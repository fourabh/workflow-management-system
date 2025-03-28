import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For demo purposes, we're using a simple validation
      // In a real app, this would be an API call
      if (email === 'demo@example.com' && password === 'password') {
        login({
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin'
        });
        navigate('/workflows');
      } else {
        setError('Invalid credentials. Try demo@example.com / password');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background and branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#2C4A3B]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/leafImage.png')",
            opacity: 0.7
          }}
        />
        <div className="relative z-10 flex flex-col justify-center items-start p-12">
          <img 
            src="/logo_highbridge.png"
            alt="HighBridge Logo" 
            className="w-64 mb-12"
          />
          <img 
            src="/Slide.png"
            alt="Building the Future" 
            className="w-full max-w-md"
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              WELCOME BACK!
            </h2>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Log In to your Account
            </h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type here.."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type here.."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaGoogle className="text-[#4285F4]" />
                <span className="sr-only">Google</span>
              </button>
              <button
                type="button"
                className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaFacebook className="text-[#3b5998]" />
                <span className="sr-only">Facebook</span>
              </button>
              <button
                type="button"
                className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaApple className="text-black" />
                <span className="sr-only">Apple</span>
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">New User? </span>
              <Link to="/signup" className="text-sm font-medium text-gray-900 hover:underline">
                SIGN UP HERE
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 
