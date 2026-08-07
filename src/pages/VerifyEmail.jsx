import {useEffect,useState} from 'react'
import { useNavigate,useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/client'

export default function VerifyEmail(){
    const [status,setStatus]=useState('verifying')
    const [message,setMessage]=useState('')
    const [params] = useSearchParams()
    const navigate = useNavigate()

    useEffect(()=>{
        const token = params.get('token')
        const email = params.get('email')

        if(!token || !email){
            setStatus('error')
            setMessage('Invalid verification link.')
            return;
        }

        handleVerify(token,email)
    },[])

    const handleVerify=async(token,email)=>{
        try {
            const data = await verifyEmail(token,email)
            setStatus('success')
            setMessage(data.message)
        } catch (err) {
            setStatus('error')
            setMessage(
                err.response?.data?.message || 'Verification failed. Link may be expired'
            )
        }
    }

    return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">

        {status === 'verifying' && (
          <>
            <div className="text-5xl mb-4 animate-pulse">⚡</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Verifying your email...
            </h2>
            <p className="text-slate-500 text-sm">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Login to Dashboard →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-red-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}