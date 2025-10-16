import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedbackForm from '@/components/FeedbackForm';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

export default function Saran() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <h1 className="text-3xl md:text-5xl font-bold">Saran & Masukan</h1>
                <p className="text-base md:text-lg text-primary-foreground/90 mt-2">
                  Kami menghargai setiap saran dan masukan dari Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <FeedbackForm />
            </div>

            {/* Contact Info Section */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Informasi Kontak</h3>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Alamat</p>
                      <p className="text-sm text-muted-foreground break-words">
                        Perum. Ciomashills Blok H-J, Ciapus Kab. Bogor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Telepon</p>
                      <a 
                        href="tel:081212707907"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        081212707907
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Email</p>
                      <a 
                        href="mailto:info@masjidattaqwa.org"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        info@masjidattaqwa.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Jam Operasional</p>
                      <p className="text-sm text-muted-foreground">
                        Senin - Jumat: 08.00 - 17.00 WIB<br />
                        Sabtu - Minggu: 08.00 - 12.00 WIB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Masukan Anda sangat berharga bagi kami untuk terus meningkatkan 
                    pelayanan dan transparansi pengelolaan masjid.
                  </p>
                </CardContent>
              </Card>

              {/* Additional Info Card - Mobile only */}
              <Card className="lg:hidden border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600">ℹ️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Waktu Respon
                      </p>
                      <p className="text-xs text-blue-800">
                        Kami akan merespon masukan Anda dalam waktu maksimal 2x24 jam kerja.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}