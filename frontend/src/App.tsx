import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { TabBar } from './components/TabBar'
import { Landing } from './routes/Landing'
import { Register } from './routes/Auth/Register'
import { Login } from './routes/Auth/Login'
import { ResetPassword } from './routes/Auth/ResetPassword'
import { Home } from './routes/Home'
import { Profile } from './routes/Profile'
import { Store } from './routes/Store'
import { Cart } from './routes/Cart'

function App() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/coming-soon" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname !== '/' && !location.pathname.startsWith('/auth') && (
        <TabBar currentPath={location.pathname} />
      )}
    </div>
  )
}

export default App
