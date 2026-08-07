import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import { getAnalytics } from '../api/client.js'

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const clientName = localStorage.getItem('client_name') || 'Client'
  const apiKey = localStorage.getItem('api_key') || ''

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getAnalytics()
      setAnalytics(data)
    } catch (error) {
      setError('Failed to Load Analytics')
    }finally{
      setLoading(false)
    }
  }

  const buildChartData = (recentRequests)=>{
    if(!recentRequests || recentRequests.length===0)return []

    const grouped={}
    recentRequests.forEach((req)=>{
      const minute = new Date(req.timestamp)
          .toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
      
      if(!grouped[minute]){
        grouped[minute] = {time:minute,allowed:0,blocked:0}
      }

      if(req.status==='allowed'){
        grouped[minute].allowed++
      }
      else grouped[minute].blocked++;
    });

    return Object.values(grouped)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⚡</div>
            <p className="text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {}
  const recentRequests = analytics?.recent_requests || []
  const byRoute = analytics?.by_route || []
  const chartData = buildChartData(recentRequests)

  const cards = [
    {
      label: 'Total Requests',
      value: summary.total_requests   || 0,
      icon:  '📊',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Allowed',
      value: summary.allowed_requests || 0,
      icon:  '✅',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Blocked',
      value: summary.blocked_requests || 0,
      icon:  '❌',
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Block Rate',
      value: summary.block_rate       || '0%',
      icon:  '📈',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome back, {clientName} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's your rate limiter activity overview
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="bg-white border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* API Key Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-indigo-700 text-sm font-medium">Your API Key</p>
            <p className="font-mono text-xs text-indigo-500 mt-1">{apiKey}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(apiKey);
            }}
            className="bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Copy
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-slate-500 text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Request Activity
          </h2>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="allowed"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  name="Allowed"
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Blocked"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm">No request data yet</p>
              <p className="text-xs mt-1">Start making API calls to see activity</p>
            </div>
          )}
        </div>

        {/* Bottom Row — By Route + Recent Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* By Route */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Requests by Route
            </h2>

            {byRoute.length > 0 ? (
              <div className="flex flex-col gap-3">
                {byRoute.map((r) => (
                  <div key={r.route} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                      {r.route}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500 text-sm font-medium">
                        {r.total - r.blocked} ✅
                      </span>
                      <span className="text-red-400 text-sm font-medium">
                        {r.blocked} ❌
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No route data yet</p>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recent Requests
            </h2>

            {recentRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentRequests.slice(0, 6).map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="font-mono text-xs text-slate-600">{req.route}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      req.status === 'allowed'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {req.status === 'allowed' ? '✅ allowed' : '❌ blocked'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No recent requests yet</p>
            )}
          </div>

        </div>

        {/* Quick Action */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Configure Rate Limit Rules</p>
            <p className="text-slate-400 text-sm mt-1">
              Set limits per route and choose your algorithm
            </p>
          </div>
          <button
            onClick={() => navigate('/rules')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
          >
            Manage Rules →
          </button>
        </div>

      </div>
    </div>
  );
}