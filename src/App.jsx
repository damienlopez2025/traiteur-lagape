import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InvoiceCreate from './pages/InvoiceCreate';
import MonthDashboard from './pages/MonthDashboard';
import YearDashboard from './pages/YearDashboard';
import Products from './pages/Products';
import Providers from './pages/Providers';
import ProviderDetails from './pages/ProviderDetails';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { storage } from './utils/storage';

function App() {
  useEffect(() => {
    storage.init();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/nouveau" element={<InvoiceCreate />} />
                  <Route path="/mois" element={<MonthDashboard />} />
                  <Route path="/annee" element={<YearDashboard />} />
                  <Route path="/produits" element={<Products />} />
                  <Route path="/prestataires" element={<Providers />} />
                  <Route path="/factures" element={<Invoices />} />
                  <Route path="/providers/:id" element={<ProviderDetails />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
