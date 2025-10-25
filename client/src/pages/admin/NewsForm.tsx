import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { newsApi, type News } from '../../services/newsApi';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import './NewsForm.css'; 

import {
  ArrowLeft,
  Save,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

// Helper: Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function NewsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY RETURN
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [autoSlug, setAutoSlug] = useState(true);
  const [isHTMLMode, setIsHTMLMode] = useState(false); // ✅ Moved here
  const [htmlContent, setHTMLContent] = useState(''); // ✅ Moved here

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'pengumuman' as 'update-pembangunan' | 'kegiatan' | 'pengumuman',
    status: 'draft' as 'draft' | 'published',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ReactQuill modules configuration - ✅ useMemo must be before any return
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'align',
  ];

  // Load data for edit
  useEffect(() => {
    if (isEdit && id) {
      loadNews();
    }
  }, [id]);

  const loadNews = async () => {
    try {
      setLoadingData(true);
      const response = await newsApi.getById(parseInt(id!));
      const news = response.data;

      setFormData({
        title: news.title,
        slug: news.slug,
        excerpt: news.excerpt,
        content: news.content,
        imageUrl: news.imageUrl || '',
        category: news.category,
        status: news.status,
      });
      setAutoSlug(false);
      
      // ✅ Set HTML content if exists
      if (news.content) {
        setHTMLContent(news.content);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memuat data');
      navigate('/admin/berita');
    } finally {
      setLoadingData(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
  }, [formData.title, autoSlug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleRegenerateSlug = () => {
    if (formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
      setAutoSlug(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul wajib diisi';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug wajib diisi';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt wajib diisi';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Konten wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle HTML mode
  const toggleHTMLMode = () => {
    if (isHTMLMode) {
      // Switch back to WYSIWYG
      setFormData(prev => ({ ...prev, content: htmlContent }));
      setIsHTMLMode(false);
    } else {
      // Switch to HTML
      setHTMLContent(formData.content);
      setIsHTMLMode(true);
    }
  };
  
  // Update content based on mode
  const handleContentChange = (value: string) => {
    if (isHTMLMode) {
      setHTMLContent(value);
    } else {
      setFormData(prev => ({ ...prev, content: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();

    // ✅ Sync HTML content back to formData before validation
    if (isHTMLMode) {
      setFormData(prev => ({ ...prev, content: htmlContent }));
    }

    if (!validate()) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      setLoading(true);

      const submitData: Omit<News, "id" | "createdAt" | "updatedAt" | "authorId"> = {
        ...formData,
        content: isHTMLMode ? htmlContent : formData.content, // ✅ Use correct content
        status: (isDraft ? 'draft' : 'published') as 'draft' | 'published',
        publishedAt: isDraft ? null : new Date().toISOString(),
      };

      if (isEdit) {
        await newsApi.update(parseInt(id!), submitData);
        alert('Berita berhasil diupdate');
      } else {
        await newsApi.create(submitData);
        alert('Berita berhasil dibuat');
      }

      navigate('/admin/berita');
    } catch (error: any) {
      console.error('Error saving news:', error);
      alert(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Gagal menyimpan berita'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOW SAFE TO RETURN EARLY (all hooks are called)
  if (loadingData) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/berita')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Berita' : 'Buat Berita Baru'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update informasi berita' : 'Tambahkan berita atau artikel baru'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Masukkan judul berita"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Slug with auto-generate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Slug <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleRegenerateSlug}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Generate dari Judul
              </button>
            </div>
            <input
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="slug-berita"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors font-mono text-sm ${
                errors.slug ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL: <span className="font-mono">/berita/{formData.slug || 'slug-berita'}</span>
            </p>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="pengumuman">Pengumuman</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="update-pembangunan">Update Pembangunan</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Excerpt/Ringkasan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Ringkasan singkat berita (maks 200 karakter)"
              maxLength={200}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none ${
                errors.excerpt ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.excerpt.length}/200 karakter
            </p>
          </div>

          {/* Content Section with HTML Toggle */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Konten <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={toggleHTMLMode}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isHTMLMode ? (
                  <>
                    <span>📝</span> Mode WYSIWYG
                  </>
                ) : (
                  <>
                    <span>&lt;/&gt;</span> Mode HTML
                  </>
                )}
              </button>
            </div>
            
            {isHTMLMode ? (
              // HTML Code Editor
              <textarea
                value={htmlContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                placeholder="Masukkan HTML code di sini..."
              />
            ) : (
              // Rich Text Editor
              <ReactQuill
                value={formData.content}
                onChange={handleContentChange}
                theme="snow"
                modules={modules}
                formats={formats}
                className={`border-2 rounded-lg ${
                  errors.content ? "border-red-300" : "border-gray-200"
                }`}
              />
            )}
            
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content}</p>
            )}
            
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-gray-500">
                {isHTMLMode 
                  ? 'Mode HTML: Masukkan kode HTML langsung (iframe YouTube, dll)'
                  : 'Mode WYSIWYG: Editor visual dengan toolbar'}
              </p>
              {isHTMLMode && (
                <p className="text-xs text-blue-600">
                  💡 Tips: Paste iframe YouTube atau HTML lainnya di sini
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-1" />
              URL Gambar
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste URL gambar (Google Drive, ImgBB, dll)
            </p>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mt-4">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-gray-50 p-4 sm:p-6 -mx-6 -mb-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/berita')}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan sebagai Draft
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update & Publish' : 'Simpan & Publish'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}