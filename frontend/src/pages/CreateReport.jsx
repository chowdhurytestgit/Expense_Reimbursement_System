import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function CreateReport() {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lines, setLines] = useState([
    { date: '', amount: '', category: 'Travel', description: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...lines];
    updatedLines[index][field] = value;
    setLines(updatedLines);
  };

  const addLine = () => {
    setLines([...lines, { date: '', amount: '', category: 'Travel', description: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const calculatedTotal = lines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the report
      const reportRes = await API.post('/reports/', {
        title,
        start_date: startDate,
        end_date: endDate
      });
      
      const reportId = reportRes.data.id || reportRes.data.report_id;

      // 2. Add each line item to the created report
      for (const line of lines) {
        await API.post(`/reports/${reportId}/lines`, {
          date: line.date,
          amount: parseFloat(line.amount),
          category: line.category,
          description: line.description
        });
      }

      navigate('/reports');
    } catch (err) {
      console.error('Failed to create report:', err);
      setError(err.response?.data?.detail || 'Failed to create expense report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Expense Report</h2>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Client Trip - March"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <hr className="my-4 border-slate-200" />

        <h3 className="text-lg font-medium text-slate-800">Expense Line Items</h3>
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-slate-50 p-4 rounded-md">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={line.date}
                onChange={(e) => handleLineChange(index, 'date', e.target.value)}
                required
                className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select
                value={line.category}
                onChange={(e) => handleLineChange(index, 'category', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
              >
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Supplies">Supplies</option>
                <option value="Lodging">Lodging</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={line.amount}
                onChange={(e) => handleLineChange(index, 'amount', e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <input
                type="text"
                value={line.description}
                onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                placeholder="Business lunch"
                required
                className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="flex justify-end pt-4 md:pt-0">
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLine}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium rounded-md transition"
        >
          + Add Line Item
        </button>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <span className="text-lg font-bold text-slate-700">Total: ${calculatedTotal.toFixed(2)}</span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft Report'}
          </button>
        </div>
      </form>
    </div>
  );
}