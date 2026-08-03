import { Routes, Route } from 'react-router-dom';
import { JoinRoom } from './pages/JoinRoom';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { RoomScene } from './scene/RoomScene';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinRoom />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/room/:code" element={<RoomScene />} />
    </Routes>
  );
}
