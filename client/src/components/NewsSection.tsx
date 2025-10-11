import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
}

interface NewsSectionProps {
  news?: NewsItem[];
}

export default function NewsSection({ news = [] }: NewsSectionProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pengumuman: "bg-chart-5/10 text-chart-5",
      kegiatan: "bg-chart-2/10 text-chart-2",
      "update-pembangunan": "bg-chart-1/10 text-chart-1",
      lainnya: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors.lainnya;
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Berita Terbaru
            </h2>
            <p className="text-lg text-muted-foreground">
              Update terkini tentang pembangunan dan kegiatan masjid
            </p>
          </div>

          {/* ✅ Gunakan react-router-dom Link */}
          <Link to="/berita">
            <Button variant="outline" data-testid="button-view-all-news">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* News list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover-elevate" data-testid={`card-news-${item.id}`}>
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    data-testid={`img-news-${item.id}`}
                  />
                </div>
              )}
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getCategoryColor(item.category)} data-testid={`badge-category-${item.id}`}>
                    {item.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(item.publishedAt), "dd MMMM yyyy", { locale: id })}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-2" data-testid={`title-news-${item.id}`}>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3" data-testid={`excerpt-news-${item.id}`}>
                  {item.excerpt}
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/berita/${item.id}`}>
                  <Button variant="ghost" className="w-full" data-testid={`button-read-${item.id}`}>
                    Baca Selengkapnya
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
