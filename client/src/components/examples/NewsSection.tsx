import NewsSection from '../NewsSection';
import communityImage1 from '@assets/stock_images/community_volunteeri_e559ab85.jpg';
import communityImage2 from '@assets/stock_images/community_volunteeri_f0aeb485.jpg';

export default function NewsSectionExample() {
  const mockNews = [
    {
      id: 1,
      title: 'Progres Pembangunan Mencapai 60%',
      excerpt: 'Alhamdulillah, pembangunan masjid At-Taqwa telah mencapai 60%. Tim pembangunan terus bekerja dengan baik.',
      category: 'update-pembangunan',
      publishedAt: '2025-01-05',
      image: communityImage1,
    },
    {
      id: 2,
      title: 'Pengajian Rutin Setiap Jumat Malam',
      excerpt: 'Mengundang seluruh jamaah untuk mengikuti pengajian rutin setiap Jumat malam bersama Ustadz Ahmad.',
      category: 'kegiatan',
      publishedAt: '2025-01-03',
      image: communityImage2,
    },
    {
      id: 3,
      title: 'Laporan Donasi Bulan Desember 2024',
      excerpt: 'Total donasi yang terkumpul di bulan Desember mencapai Rp 45.000.000. Terima kasih atas partisipasi jamaah.',
      category: 'pengumuman',
      publishedAt: '2025-01-01',
    },
  ];

  return <NewsSection news={mockNews} />;
}
