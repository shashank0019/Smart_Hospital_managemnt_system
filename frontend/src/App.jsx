import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import PatientDashboard from './components/dashboard/PatientDashboard';
import ManagementDashboard from './components/dashboard/ManagementDashboard';
import Navbar from './components/layout/Navbar';
import Home from './components/Home';
import EmergencyDashboard from './components/dashboard/EmergencyDashboard';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Debug component to log route changes
const DebugRoute = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setUserRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <ToastProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Navbar isAuthenticated={isAuthenticated} userRole={userRole} setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          <DebugRoute>
            <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                ) : userRole === 'doctor' ? (
                  <Navigate to="/doctor/dashboard" replace />
                ) : userRole === 'patient' ? (
                  <Navigate to="/patient/dashboard" replace />
                ) : userRole === 'management' ? (
                  <Navigate to="/management/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                ) : userRole === 'doctor' ? (
                  <Navigate to="/doctor/dashboard" replace />
                ) : userRole === 'patient' ? (
                  <Navigate to="/patient/dashboard" replace />
                ) : userRole === 'management' ? (
                  <Navigate to="/management/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/doctor/dashboard" 
              element={
                isAuthenticated && userRole === 'doctor' ? 
                <DoctorDashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/patient/dashboard" 
              element={
                isAuthenticated && userRole === 'patient' ? 
                <PatientDashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/management/dashboard" 
              element={
                isAuthenticated && userRole === 'management' ? 
                <ManagementDashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/emergency" 
              element={<EmergencyDashboard />} 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  userRole === 'doctor' ? (
                    <Navigate to="/doctor/dashboard" replace />
                  ) : userRole === 'patient' ? (
                    <Navigate to="/patient/dashboard" replace />
                  ) : userRole === 'management' ? (
                    <Navigate to="/management/dashboard" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : (
                  <Home />
                )
              }
            />
          </Routes>
        </DebugRoute>
      </div>
    </Router>
  </ToastProvider>
  );
}

export default App; 