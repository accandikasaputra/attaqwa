import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">At-Taqwa</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Masjid At-Taqwa berkomitmen untuk menjadi pusat ibadah dan kegiatan umat Islam dengan pengelolaan yang transparan dan akuntabel.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/berita" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Berita
                </a>
              </li>
              <li>
                <a href="/informasi-donasi" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Informasi Donasi
                </a>
              </li>
              <li>
                <a href="/saran" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Saran
                </a>
              </li>
              <li>
                <a href="/faqs" className="text-gray-300 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">
                  Perum. Ciomashills Blok H-J, Ciapus Kab. Bogor
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">
                  081212707907
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">
                  info@masjidattaqwa.org
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Tentang Sistem</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sistem transparansi keuangan ini dirancang untuk memberikan informasi real-time tentang pengelolaan dana pembangunan masjid.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Masjid At-Taqwa. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
