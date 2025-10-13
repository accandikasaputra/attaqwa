import { Link, Outlet } from 'react-router-dom';
import RequireAdmin from '../../components/admin/RequireAdmin';
import { clearToken } from '../../services/auth';


export default function AdminLayout() {
    const handleLogout = () => {
        clearToken();
        window.location.href = '/admin/login';
    };


return (
    <RequireAdmin>
        <div className="min-h-screen flex">
            <aside className="w-64 bg-white border-r p-4">
                <h2 className="text-xl font-bold mb-4">Admin CMS</h2>
                <nav className="flex flex-col gap-2">
                    <Link to="/admin" className="py-2 px-3 rounded hover:bg-gray-100">Dashboard</Link>
                    <Link to="/admin/berita" className="py-2 px-3 rounded hover:bg-gray-100">Berita</Link>
                    <Link to="/admin/po" className="py-2 px-3 rounded hover:bg-gray-100">Purchase Order 2</Link>
                    <Link to="/admin/donasi" className="py-2 px-3 rounded hover:bg-gray-100">Donasi</Link>
                    <button onClick={handleLogout} className="mt-4 py-2 px-3 bg-red-500 text-white rounded">Logout</button>
                </nav>
            </aside>
            <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        </div>
    </RequireAdmin>
);
}