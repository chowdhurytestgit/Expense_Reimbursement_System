import { useEffect, useState } from 'react';
import API from '../services/api';
import { Card } from '../components/Card';
import { DollarSign, FileClock, CheckCircle, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    awaiting_approval: 0,
    total_due: 0.00,
    approved_this_week: 0,
    paid_this_week: 0
  });

  useEffect(() => {
    API.get('/dashboard/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.log("Dashboard metrics API not active yet, using defaults."));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600 mr-4">
            <FileClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Awaiting Approval</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.awaiting_approval}</h3>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-indigo-50 rounded-lg text-indigo-600 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Due</p>
            <h3 className="text-2xl font-bold text-slate-800">${Number(metrics.total_due).toFixed(2)}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-green-50 rounded-lg text-green-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved This Week</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.approved_this_week}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center shadow-sm border-slate-100">
          <div className="p-4 bg-purple-50 rounded-lg text-purple-600 mr-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Paid This Week</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.paid_this_week}</h3>
          </div>
        </Card>
      </div>
    </div>
  );
}