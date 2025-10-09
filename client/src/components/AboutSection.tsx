import mosqueImage from '@assets/generated_images/At-Taqwa_mosque_building_photo_4424d66c.png';

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Tentang Pembangunan Masjid At-Taqwa
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Masjid At-Taqwa adalah masjid yang sedang dalam proses pembangunan dengan tujuan menjadi pusat ibadah dan kegiatan umat Islam di wilayah ini. Kami berkomitmen untuk mengelola dana pembangunan dengan transparan dan akuntabel.
          </p>
          <div className="mt-12">
            <img
              src={mosqueImage}
              alt="Masjid At-Taqwa"
              className="rounded-2xl shadow-lg w-full max-w-2xl mx-auto"
              data-testid="img-mosque"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
