import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { newsApi, type News } from '../../services/newsApi';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function NewsList() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadNews();
  }, [page, search, category, status]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAll({
        page,
        limit,
        search,
        category,
        status,
      });

      setNewsList(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading news:', error);
      alert('Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus berita "${title}"?`)) return;

    try {
      await newsApi.delete(id);
      alert('Berita berhasil dihapus');
      loadNews();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus berita');
    }
  };

  const handleQuickPublish = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'publish' : 'unpublish';

    if (!confirm(`${action === 'publish' ? 'Publish' : 'Unpublish'} berita ini?`)) return;

    try {
      await newsApi.updateStatus(id, newStatus);
      alert(`Berita berhasil di-${action}`);
      loadNews();
    } catch (error: any) {
      alert(error.response?.data?.message || `Gagal ${action} berita`);
    }
  };

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="font-semibold text-gray-900 line-clamp-1">
            {row.original.title}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
            {row.original.excerpt}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const categoryLabels: Record<string, string> = {
          'update-pembangunan': 'Update Pembangunan',
          'kegiatan': 'Kegiatan',
          'pengumuman': 'Pengumuman',
        };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {categoryLabels[row.original.category]}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => handleQuickPublish(row.original.id, row.original.status)}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            row.original.status === 'published'
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {row.original.status === 'published' ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Published
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Draft
            </>
          )}
        </button>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.publishedAt
            ? format(new Date(row.original.publishedAt), 'dd MMM yyyy', {
                locale: localeId,
              })
            : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/berita/${row.original.id}/edit`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id, row.original.title)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Berita</h1>
            <p className="text-gray-600 mt-1">Kelola berita dan artikel</p>
          </div>
          <Link
            to="/admin/berita/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Buat Berita
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul atau excerpt..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filter
              {(category || status) && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  <option value="update-pembangunan">Update Pembangunan</option>
                  <option value="kegiatan">Kegiatan</option>
                  <option value="pengumuman">Pengumuman</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable columns={columns} data={newsList} loading={loading} />
        
        {!loading && newsList.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            limit={limit}
          />
        )}
      </div>
    </div>
  );
}