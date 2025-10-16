import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import RequireAdmin from "../../components/admin/RequireAdmin";
import { clearToken } from "../../services/auth";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    window.location.href = "/admin/login";
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar overlay (mobile only) */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
            sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`fixed md:static z-50 bg-white border-r p-4 w-64 h-full transform transition-transform duration-300 ease-in-out 
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Admin CMS</h2>
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/admin" className="py-2 px-3 rounded hover:bg-gray-100">
              Dashboard
            </Link>
            <Link to="/admin/berita" className="py-2 px-3 rounded hover:bg-gray-100">
              Berita
            </Link>
            <Link to="/admin/po" className="py-2 px-3 rounded hover:bg-gray-100">
              Purchase Order
            </Link>
            <Link to="/admin/donations" className="py-2 px-3 rounded hover:bg-gray-100">
              Donasi
            </Link>
            <Link to="/admin/cashflow" className="py-2 px-3 rounded hover:bg-gray-100">
              Cash Flow
            </Link>
            <Link to="/admin/feedback" className="py-2 px-3 rounded hover:bg-gray-100">
              Kritik dan Saran
            </Link>
            <Link to="/admin/faqs" className="py-2 px-3 rounded hover:bg-gray-100">
              FAQ
            </Link>

            <button
              onClick={handleLogout}
              className="mt-4 py-2 px-3 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Topbar (mobile only) */}
        <header className="md:hidden flex items-center justify-between bg-white border-b p-4 sticky top-0 z-30">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Admin CMS</h1>
          <div className="w-6" /> {/* placeholder biar seimbang */}
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </RequireAdmin>
  );
}
