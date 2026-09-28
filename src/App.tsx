import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Help } from './pages/Help';

const RoomPage = lazy(() => import('./pages/RoomPage').then((m) => ({ default: m.RoomPage })));

function Loading() {
  return (
    <div className="page">
      <div className="spinner" style={{ marginTop: 160 }} />
    </div>
  );
}

function LegacyRoomRedirect() {
  const { code } = useParams();
  return <Navigate to={`/r/${code ?? ''}`} replace />;
}

function NotFound() {
  return (
    <div className="page">
      <div className="hero" style={{ marginTop: 80 }}>
        <h1>Nothing on this table</h1>
        <p>That page doesn’t exist.</p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/help" element={<Help />} />
      <Route
        path="/r/:code"
        element={
          <Suspense fallback={<Loading />}>
            <RoomPage />
          </Suspense>
        }
      />
      <Route path="/room/:code" element={<LegacyRoomRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
