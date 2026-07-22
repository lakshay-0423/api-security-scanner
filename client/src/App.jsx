import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanHistory from './pages/ScanHistory';
import ScanDetails from './pages/ScanDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/scans/new"
        element={
          <ProtectedRoute>
            <Layout>
              <NewScan />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/scans/history"
        element={
          <ProtectedRoute>
            <Layout>
              <ScanHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/scans/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ScanDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
