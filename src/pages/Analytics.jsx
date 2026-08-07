import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import Navbar from '../components/Navbar';
import { getAnalytics } from '../api/client';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all'); // all | allowed | blocked

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⚡</div>
            <p className="text-slate-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const summary        = analytics?.summary || {};
  const byRoute         = analytics?.by_route || [];
  const recentRequests  = analytics?.recent_requests || [];

  // Filtered request list based on toggle
  const filteredRequests = recentRequests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  // Pie chart data — allowed vs blocked
  const pieData = [
    { name: 'Allowed', value: summary.allowed_requests || 0 },
    { name: 'Blocked', value: summary.blocked_requests || 0 },
  ];

  // Bar chart data — requests by route
  const barData = byRoute.map((r) => ({
    route:   r.route.length > 20 ? r.route.slice(0, 20) + '…' : r.route,
    allowed: r.total - r.blocked,
    blocked: r.blocked,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">
              Deep dive into your API traffic patterns
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="bg-white border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-2xl font-bold text-slate-800">{summary.total_requests || 0}</p>
            <p className="text-slate-500 text-sm mt-1">Total requests</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-2xl font-bold text-green-600">{summary.allowed_requests || 0}</p>
            <p className="text-slate-500 text-sm mt-1">Allowed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-2xl font-bold text-red-500">{summary.blocked_requests || 0}</p>
            <p className="text-slate-500 text-sm mt-1">Blocked</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-2xl font-bold text-amber-500">{summary.block_rate || '0%'}</p>
            <p className="text-slate-500 text-sm mt-1">Block rate</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Pie Chart — Allowed vs Blocked */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Traffic breakdown
            </h2>

            {summary.total_requests > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <div className="text-4xl mb-3">🥧</div>
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>

          {/* Bar Chart — By Route */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Traffic by route
            </h2>

            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="route"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allowed" stackId="a" fill="#6366f1" name="Allowed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="blocked" stackId="a" fill="#ef4444" name="Blocked" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm">No route data yet</p>
              </div>
            )}
          </div>

        </div>

        {/* Route Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Route performance
          </h2>

          {byRoute.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase border-b border-slate-100">
                    <th className="pb-3 font-medium">Route</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-right">Allowed</th>
                    <th className="pb-3 font-medium text-right">Blocked</th>
                    <th className="pb-3 font-medium text-right">Block rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byRoute.map((r) => {
                    const blockRate = r.total > 0
                      ? ((r.blocked / r.total) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr key={r.route} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 font-mono text-xs text-slate-700">{r.route}</td>
                        <td className="py-3 text-right text-slate-600">{r.total}</td>
                        <td className="py-3 text-right text-green-600">{r.total - r.blocked}</td>
                        <td className="py-3 text-right text-red-500">{r.blocked}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            blockRate > 20
                              ? 'bg-red-50 text-red-600'
                              : blockRate > 5
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {blockRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No routes tracked yet</p>
          )}
        </div>

        {/* Request Log with Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Request log</h2>

            {/* Filter Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              {['all', 'allowed', 'blocked'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                    filter === f
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {filteredRequests.map((req, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      req.status === 'allowed' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="font-mono text-xs text-slate-700">{req.route}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {req.algorithm} · {new Date(req.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    req.status === 'allowed'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">
              No {filter !== 'all' ? filter : ''} requests found
            </p>
          )}
        </div>

      </div>
    </div>
  );
}