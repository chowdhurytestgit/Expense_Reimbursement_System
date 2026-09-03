import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE'); // Default set to uppercase to match backend Enum
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/auth/register', { 
        email, 
        password, 
        role, 
        name: fullName // Passes the user-entered full name
      });
      
      console.log("Registration success:", response.data);
      alert('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      console.error("Registration error details:", err);
      setError(err.response?.data?.detail || err.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">Create an account</h2>
          <p className="mt-2 text-center text-sm text-slate-600">BUSY Expense Reimbursement System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="user@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Select Account Role</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="role"
                    value="EMPLOYEE"
                    checked={role === 'EMPLOYEE'}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Employee
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="role"
                    value="APPROVER"
                    checked={role === 'APPROVER'}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Approver
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition duration-200 shadow-sm"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}