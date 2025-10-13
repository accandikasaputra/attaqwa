import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';
import { getToken } from '../../services/auth';


export default function RequireAdmin({ children }: { children: JSX.Element }) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);


    useEffect(() => {
        async function check() {
            const token = getToken();
            if (!token) {
                setAllowed(false);
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                const user = res.data?.data || res.data?.user;
                if (user?.role === 'ketua' || user?.role === 'admin' || user?.role === 'bendahara' || user?.role === 'tim_konstruksi' || user?.role === 'tim_procurement' ) {
                    setAllowed(true);
                } else {
                    setAllowed(false);
                }
            } catch (err) {
                setAllowed(false);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);


    if (loading) return <div className="p-6">Memeriksa hak akses…</div>;
    if (!allowed) return <Navigate to="/admin/login" replace />;
    return children;
}