import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import AdminSetup from './pages/AdminSetup';
import Dashboard from './pages/Dashboard';
import PackageList from './pages/Packages/PackageList';
import PackageForm from './pages/Packages/PackageForm';
import PackageDetail from './pages/Packages/PackageDetail';
import Bookings from './pages/Bookings';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="packages" element={<PackageList />} />
              <Route path="packages/create" element={<PackageForm />} />
              <Route path="packages/:id" element={<PackageDetail />} />
              <Route path="packages/:id/edit" element={<PackageForm />} />
              <Route path="bookings" element={<Bookings />} />
            </Route>
            <Route path="/" element={<Navigate to="/admin\" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;