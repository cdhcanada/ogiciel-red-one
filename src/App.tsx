import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import ProductManagement from './components/ProductManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { database } from './utils/database';

function App() {
  const [isDatabaseReady, setIsDatabaseReady] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    setIsInitializing(true);
    try {
      await database.init();
      setIsDatabaseReady(true);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">جار تحضير النظام...</p>
        </div>
      </div>
    );
  }

  if (!isDatabaseReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">خطأ في تحضير قاعدة البيانات</p>
          <button 
            onClick={initializeDatabase}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;