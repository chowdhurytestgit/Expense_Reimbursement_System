import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes wrapped in DashboardLayout */}
        <Route path="/" element={<DashboardLayout />}>
          {/* index ensures Dashboard loads immediately at http://localhost:5173/ */}
          <Route index element={<Dashboard />} />
        </Route>

        {/* Catch-all redirect back to login or home if route doesn't exist */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}