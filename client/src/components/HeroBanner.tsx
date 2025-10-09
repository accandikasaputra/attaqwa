import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import patternBg from '@assets/generated_images/Islamic_geometric_pattern_background_9d72a15e.png';

export default function HeroBanner() {
  const scrollToCashFlow = () => {
    const element = document.getElementById('cash-flow-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700">
      <div 
        className="absolute inset-0 opacity-10 bg-repeat bg-center"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: '400px' }}
      />
      
      <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center">
        <div className="text-white max-w-3xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transparansi Keuangan Pembangunan Masjid
          </h1>
          <p className="text-lg md:text-xl mb-8 text-emerald-50 leading-relaxed">
            Sistem pelaporan keuangan yang transparan dan akuntabel untuk pembangunan Masjid At-Taqwa
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={scrollToCashFlow}
              data-testid="button-view-cashflow"
              className="text-base"
            >
              Lihat Laporan Keuangan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
