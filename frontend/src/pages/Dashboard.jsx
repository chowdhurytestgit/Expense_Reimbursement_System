import { useEffect, useState } from 'react';
import API from '../services/api';
import { Card } from '../components/Card';
import { DollarSign, FileClock, CheckCircle, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    awaitingApproval: 0,
    totalDue: 0.00,
    approvedThisWeek: 0,
    paidThisWeek: 0
  });
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Fetch metrics
    API.get('/dashboard/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.log("Dashboard metrics API error:", err));

    // Fetch user details or fallback gracefully
    API.get('/auth/me')
      .then(res => {
        if (res.data?.name) {
          setUserName(res.data.name);
        }
      })
      .catch(() => {
        // Fallback name if profile endpoint isn't wired yet
        setUserName('Member');
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-indigo-600">{userName}</span>!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600 mr-4">
            <FileClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Awaiting Approval</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.awaitingApproval}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-indigo-50 rounded-lg text-indigo-600 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Due</p>
            <h3 className="text-2xl font-bold text-slate-800">${Number(metrics.totalDue || 0).toFixed(2)}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-green-50 rounded-lg text-green-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved This Week</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.approvedThisWeek}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-purple-50 rounded-lg text-purple-600 mr-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Paid This Week</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.paidThisWeek}</h3>
          </div>
        </Card>
      </div>
    </div>
  );
}