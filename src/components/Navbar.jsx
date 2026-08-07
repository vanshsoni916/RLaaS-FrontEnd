import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const clientName = localStorage.getItem('client_name') || 'Client';

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    };

    const isActive = (path) => location.pathname === path

    return (
        <nav className='bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg'>
            <div className="text-2xl font-bold text-indigo-400">
                ⚡ RLaaS
            </div>
            <div className="flex items-center gap-8">
                {[
                    { path: '/dashboard', label: 'Dashboard' },
                    { path: '/rules', label: 'Rules' },
                    { path: '/analytics', label: 'Analytics' },
                ].map(({ path, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`text-sm font-medium transition pb-1 ${isActive(path)
                            ? 'text-indigo-400 border-b-2 border-indigo-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                        {clientName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-400 text-sm">{clientName}</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}