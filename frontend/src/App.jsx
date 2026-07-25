import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReportMap from './components/ReportMap';
import HospitalDashboard from './components/HospitalDashboard';
import DriverDashboard from './components/DriverDashboard';
import PoliceDashboard from './components/PoliceDashboard';
import Analytics from './components/Analytics';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import CinematicDemo from './components/CinematicDemo';
import Preloader from './components/Preloader';
import DemoSeeder from './components/DemoSeeder';

import Home from './components/Home';
import { ToastProvider } from './context/ToastContext';
import { SimulationProvider } from './context/SimulationContext';

function App() {
  return (
    <ToastProvider>
      <Preloader />
      <DemoSeeder />
      <SimulationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/citizen" element={<ReportMap />} />
              <Route path="/hospital" element={<HospitalDashboard />} />
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/police" element={<PoliceDashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <CommandPalette />
            <CinematicDemo />
          </Layout>
        </Router>
      </SimulationProvider>
    </ToastProvider>
  );
}

export default App;
