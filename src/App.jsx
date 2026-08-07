import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";
import {Toaster} from 'react-hot-toast'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Rules from './pages/Rules.jsx'
import Analytics from './pages/Analytics.jsx'
import VerifyEmail from "./pages/VerifyEmail.jsx";

const ProtectedRoute=({children})=>{
  const api_key = localStorage?.getItem('api_key')
  return api_key?children:<Navigate to="/" />
}

export default function App(){
  return (
    <BrowserRouter>
      <Toaster position="top-right"/>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/verify-email"  element={<VerifyEmail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
        <Route path="/rules" element={<ProtectedRoute><Rules/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  )
}