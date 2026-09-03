import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await API.get('/reports', {
        params: { 
          search: search || undefined, 
          status: statusFilter || undefined 
        }
      });
      setReports(response.data.reports || response.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, statusFilter]);

  const submitReport = async (id) => {
    try {
      await API.post(`/reports/${id}/submit`);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit report.");
    }
  };

  const approveReport = async (id) => {
    try {
      await API.post(`/reports/${id}/approve`, { comment: "Approved via dashboard" });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve report. Note: Approvers cannot approve their own reports.");
    }
  };

  const rejectReport = async (id) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return;

    try {
      await API.post(`/reports/bulk-action`, {
        report_ids: [id],
        action: 'reject',
        reason: reason
      });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject report.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Expense Reports</h1>
        <Link
          to="/create-report"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow transition"
        >
          + Create Report
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">Loading reports...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">No expense reports found.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{report.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      report.status === 'PAID' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">${Number(report.total_amount || 0).toFixed(2)}</td>
                  <td className="p-4 text-slate-500">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="p-4 space-x-3">
                    {report.status === 'DRAFT' && (
                      <button 
                        onClick={() => submitReport(report.id)} 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Submit
                      </button>
                    )}
                    {report.status === 'SUBMITTED' && (
                      <>
                        <button 
                          onClick={() => approveReport(report.id)} 
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => rejectReport(report.id)} 
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}