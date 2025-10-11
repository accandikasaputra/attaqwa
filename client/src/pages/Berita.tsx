import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import api from "@/services/api";

export default function Berita() {
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const categories = [
    { value: "semua", label: "Semua" },
    { value: "update-pembangunan", label: "Update Pembangunan" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "pengumuman", label: "Pengumuman" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pengumuman: "bg-chart-5/10 text-chart-5",
      kegiatan: "bg-chart-2/10 text-chart-2",
      "update-pembangunan": "bg-chart-1/10 text-chart-1",
      lainnya: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors["lainnya"];
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/news/public/list";
      if (selectedCategory !== "semua") {
        url = `/news/public/list?category=${selectedCategory}`;
      }

      const res = await api.get(url);
      const data = res.data?.data || res.data; // standar API di backend

      if (Array.isArray(data)) {
        setNewsList(data);
      } else {
        setNewsList([]);
      }
    } catch (err: any) {
      console.error("Error fetching news:", err);
      setError("Gagal memuat berita. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

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
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Loading / Error / News Grid */}
          {loading ? (
            <p className="text-center text-muted-foreground">Memuat berita...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : newsList.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada berita.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsList.map((item) => (
                <Card key={item.id} className="overflow-hidden hover-elevate">
                  {item.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getCategoryColor(item.category)}>
                        {
                          categories.find((c) => c.value === item.category)?.label ||
                          item.category
                        }
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.publishedAt
                          ? format(new Date(item.publishedAt), "dd MMMM yyyy", { locale: id })
                          : "-"}
                      </div>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{item.excerpt}</p>
                  </CardContent>

                  <CardFooter>
                    <Button variant="ghost" className="w-full">
                      Baca Selengkapnya
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
