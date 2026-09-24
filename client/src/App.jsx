import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import BottomTabBar from './components/BottomTabBar';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Evidence from './pages/Evidence';
import GraphExplorer from './pages/GraphExplorer';
import Analytics from './pages/Analytics';
import Entities from './pages/Entities';

function AppShell() {
  return (
    <>
      <Sidebar />
      <BottomTabBar />
      <main className="main-content" style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/cases"       element={<Cases />} />
          <Route path="/evidence"    element={<Evidence />} />
          <Route path="/graph"       element={<GraphExplorer />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/entities"    element={<Entities />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}
