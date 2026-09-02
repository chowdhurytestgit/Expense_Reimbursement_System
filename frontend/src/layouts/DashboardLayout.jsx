import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bell, FileText, PieChart, CheckSquare, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../services/api';

export default function DashboardLayout() {
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/dashboard/alerts').then(res => {
      setAlertCount(res.data.alerts_count || 0);
    }).catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    // Clear token or authentication storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-6 text-2xl font-bold tracking-tight text-indigo-400">BUSY Expense</div>
          <nav className="flex-1 px-4 space-y-2">
            <Link to="/" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition">
              <PieChart className="w-5 h-5 mr-3" /> Dashboard
            </Link>
          </nav>
        </div>

        {/* Logout Section at the bottom of the sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell className="w-6 h-6" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {/* Outlet is required to render nested routes like Dashboard */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}