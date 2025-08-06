// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import PaymentsPage from './pages/PaymentsPage';
import CategoriesPage from './pages/CategoriesPage';
import TemplatesPage from './pages/TemplatesPage'; // ✅ Import TemplatesPage
import ChannelPage from './pages/ChannelPage'; // Assuming you have a ChannelPage component
import UsersPage from './pages/UsersPage'; // ✅ Import UsersPage
import Order from './pages/OrderPage';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <Router>
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/channels" element={<ChannelPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/templates" element={<TemplatesPage />} /> {/* ✅ Tambah route baru */}
            <Route path="/users" element={<UsersPage />} /> {/* ✅ Tambah route users */}
            <Route path="/orders" element={<Order />} /> {/* Placeholder for Orders Page */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
