import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './component/ui/navbar'
import Home from './component/pages/Home';
import About from './component/pages/About';
import Register from './component/pages/Register';
import Login from './component/pages/Login';
import OAuthSuccess from './component/pages/OAuthSuccess';
import ProtectedRoute from './component/ProtectedRoute';
import AdminOverview from './component/pages/AdminOverview';
import Waroeng from './component/pages/admin/Waroeng';
import BusinessForm from './component/pages/BusinessForm';
import ProductForm from './component/pages/ProductForm';


function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}


function App() {
  // const [count, setCount] = useState(0)
  const isRegister = location.pathname === '/register'
  const bgClass = isRegister ? 'regist-bg' : 'bg-light-grey'


  return (
    <BrowserRouter>
      <Navbar />
      <main className='flex ${bgClass}  min-h-screen pt-20'> {/* beri padding-top supaya konten tidak tertutup header fixed */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin={true}><AdminOverview /></ProtectedRoute>}/>
          <Route path="/auth/success" element={<OAuthSuccess />} />
          
          <Route path="/waroeng/business/new" element={<ProtectedRoute adminOnly={true}><BusinessForm /></ProtectedRoute>}/>
          <Route path="/waroeng/business/:id/edit" element={<ProtectedRoute adminOnly={true}><BusinessForm /></ProtectedRoute>}/>
          <Route path="/waroeng/product/new" element={<ProtectedRoute adminOnly={true}><ProductForm /></ProtectedRoute>}/>
          <Route path="/waroeng/product/:id/edit" element={<ProtectedRoute adminOnly={true}><ProductForm /></ProtectedRoute>}/>
              


          {/* tambahkan route lain sesuai kebutuhan */}
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
