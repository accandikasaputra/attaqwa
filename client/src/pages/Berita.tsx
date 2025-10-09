import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import communityImage1 from '@assets/stock_images/community_volunteeri_e559ab85.jpg';
import communityImage2 from '@assets/stock_images/community_volunteeri_f0aeb485.jpg';

export default function Berita() {
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');

  const mockNews = [
    {
      id: 1,
      title: 'Progres Pembangunan Mencapai 60%',
      excerpt: 'Alhamdulillah, pembangunan masjid At-Taqwa telah mencapai 60%. Tim pembangunan terus bekerja dengan baik untuk menyelesaikan tahap konstruksi utama.',
      category: 'update-pembangunan',
      publishedAt: '2025-01-05',
      image: communityImage1,
    },
    {
      id: 2,
      title: 'Pengajian Rutin Setiap Jumat Malam',
      excerpt: 'Mengundang seluruh jamaah untuk mengikuti pengajian rutin setiap Jumat malam bersama Ustadz Ahmad. Kajian dimulai pukul 20.00 WIB.',
      category: 'kegiatan',
      publishedAt: '2025-01-03',
      image: communityImage2,
    },
    {
      id: 3,
      title: 'Laporan Donasi Bulan Desember 2024',
      excerpt: 'Total donasi yang terkumpul di bulan Desember mencapai Rp 45.000.000. Terima kasih atas partisipasi jamaah yang luar biasa.',
      category: 'pengumuman',
      publishedAt: '2025-01-01',
    },
    {
      id: 4,
      title: 'Pemasangan Kubah Masjid Selesai',
      excerpt: 'Proses pemasangan kubah masjid telah selesai dilakukan. Kubah berwarna hijau emerald yang megah kini menghiasi bangunan masjid.',
      category: 'update-pembangunan',
      publishedAt: '2024-12-28',
      image: communityImage1,
    },
    {
      id: 5,
      title: 'Kegiatan Santunan Anak Yatim',
      excerpt: 'Masjid At-Taqwa mengadakan kegiatan santunan untuk 50 anak yatim di sekitar wilayah masjid. Acara berlangsung dengan penuh kehangatan.',
      category: 'kegiatan',
      publishedAt: '2024-12-25',
      image: communityImage2,
    },
    {
      id: 6,
      title: 'Jadwal Sholat Tarawih Ramadhan 1446 H',
      excerpt: 'Informasi lengkap mengenai jadwal sholat tarawih dan kegiatan Ramadhan di Masjid At-Taqwa tahun ini.',
      category: 'pengumuman',
      publishedAt: '2024-12-20',
    },
  ];

  const categories = [
    { value: 'semua', label: 'Semua' },
    { value: 'update-pembangunan', label: 'Update Pembangunan' },
    { value: 'kegiatan', label: 'Kegiatan' },
    { value: 'pengumuman', label: 'Pengumuman' },
  ];

  const filteredNews =
    selectedCategory === 'semua'
      ? mockNews
      : mockNews.filter((news) => news.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'pengumuman': 'bg-chart-5/10 text-chart-5',
      'kegiatan': 'bg-chart-2/10 text-chart-2',
      'update-pembangunan': 'bg-chart-1/10 text-chart-1',
      'lainnya': 'bg-muted text-muted-foreground',
    };
    return colors[category] || colors['lainnya'];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita & Informasi</h1>
            <p className="text-lg text-primary-foreground/90">
              Update terkini tentang pembangunan dan kegiatan Masjid At-Taqwa
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                data-testid={`button-category-${cat.value}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <Card key={item.id} className="overflow-hidden hover-elevate" data-testid={`card-news-${item.id}`}>
                {item.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getCategoryColor(item.category)}>
                      {categories.find((c) => c.value === item.category)?.label || item.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(item.publishedAt), 'dd MMMM yyyy', { locale: id })}
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{item.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" data-testid={`button-read-${item.id}`}>
                    Baca Selengkapnya
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
