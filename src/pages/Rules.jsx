import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getRateLimitConfigs, createRateLimitConfig } from '../api/client'
import Navbar from '../components/Navbar'

export default function Rules() {
  const [Loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [configs, setConfigs] = useState([])
  const [showForm, setShowForm] = useState(false)

  //now here form fields:
  const [route, setRoute] = useState('')
  const [algorithm, setAlgorithm] = useState('')
  const [windowSize, setWindowSize] = useState('')
  const [maxRequests, setMaxRequests] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const data = await getRateLimitConfigs()
      setConfigs(data.Configs || [])
    } catch (err) {
      toast.error("Failed to load rules")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRateLimitConfig({
        route,
        max_requests: parseInt(maxRequests),
        window_size: parseInt(windowSize),
        algorithm
      })

      toast.success("Rule created successfully!")
      setRoute('')
      setAlgorithm('')
      setWindowSize('')
      setMaxRequests('')
      setShowForm(false)

      fetchConfigs()
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : err.response?.data?.message || 'Failed to create rule';
      toast.error(msg);
    } finally {
      setSubmitting(false)
    }
  }

  const algorithmInfo = {
    token_bucket: { label: 'Token Bucket', desc: 'Allows bursts, refills steadily over time', icon: '🪣' },
    sliding_window: { label: 'Sliding Window', desc: 'Strict rolling window, most accurate', icon: '📊' },
    fixed_window: { label: 'Fixed Window', desc: 'Simple time-boxed quota', icon: '⏱️' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rate limit rules</h1>
            <p className="text-slate-500 text-sm mt-1">
              Configure limits per route and choose your algorithm
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            {showForm ? '✕ Cancel' : '+ Add Rule'}
          </button>
        </div>

        {/* Add Rule Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New rule</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Route */}
              <div>
                <label className="text-slate-600 text-sm font-medium block mb-1">
                  Route
                </label>
                <input
                  type="text"
                  placeholder="/api/search/"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition font-mono"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Must start with / — e.g. /api/search/
                </p>
              </div>

              {/* Max Requests + Window Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-sm font-medium block mb-1">
                    Max requests
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(e.target.value)}
                    required
                    min="1"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium block mb-1">
                    Window (seconds)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={windowSize}
                    onChange={(e) => setWindowSize(e.target.value)}
                    required
                    min="1"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Algorithm Picker */}
              <div>
                <label className="text-slate-600 text-sm font-medium block mb-2">
                  Algorithm
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(algorithmInfo).map(([key, info]) => (
                    <div
                      key={key}
                      onClick={() => setAlgorithm(key)}
                      className={`cursor-pointer rounded-lg border p-3 transition ${algorithm === key
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="text-lg mb-1">{info.icon}</div>
                      <p className={`text-sm font-medium ${algorithm === key ? 'text-indigo-700' : 'text-slate-700'
                        }`}>
                        {info.label}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{info.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {maxRequests && windowSize && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                  This rule allows <span className="font-semibold text-indigo-600">{maxRequests} requests</span> every{' '}
                  <span className="font-semibold text-indigo-600">{windowSize} seconds</span> on{' '}
                  <span className="font-mono text-slate-800">{route || '...'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Rule'}
              </button>
            </form>
          </div>
        )}

        {/* Rules List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Active rules {configs.length > 0 && `(${configs.length})`}
          </h2>

          {Loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-3xl mb-2 animate-pulse">⚡</div>
              <p className="text-sm">Loading rules...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-slate-500 text-sm mb-1">No rules configured yet</p>
              <p className="text-slate-400 text-xs">
                Click "Add Rule" to protect your first route
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xl">
                      {algorithmInfo[config.algorithm]?.icon || '⚙️'}
                    </div>
                    <div>
                      <p className="font-mono text-sm text-slate-800">{config.route}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {algorithmInfo[config.algorithm]?.label || config.algorithm}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">
                        {config.max_requests} / {config.window_size}s
                      </p>
                      <p className="text-slate-400 text-xs">requests / window</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${config.is_active
                        ? 'bg-green-50 text-green-600'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                      {config.is_active ? '● active' : '○ inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}