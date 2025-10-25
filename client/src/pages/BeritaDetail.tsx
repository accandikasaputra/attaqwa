import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Clock,
  Share2,
  Facebook,
  Twitter,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Category mapping
const categoryMap: Record<string, string> = {
  "update-pembangunan": "Update Pembangunan",
  "kegiatan": "Kegiatan",
  "pengumuman": "Pengumuman",
};

// Configure DOMPurify
const createSafeHTML = (html: string) => {
  // Allow iframe for YouTube embeds
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

export default function BeritaDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch news detail by slug
  const { data, isLoading, error } = useQuery({
    queryKey: ["news-detail", slug],
    queryFn: async () => {
      const { data } = await api.get(`/news/slug/${slug}`);
      return data;
    },
  });
  
  const news = data?.data;
  
  // Share handlers
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = news?.title || "";
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Berhasil!",
      description: "Link berhasil disalin ke clipboard",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-6" />
            <Skeleton className="h-96 w-full mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Berita Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">
                Maaf, berita yang Anda cari tidak ditemukan atau sudah dihapus.
              </p>
              <Button onClick={() => navigate("/berita")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Berita
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Parse and sanitize HTML content
  const safeContent = createSafeHTML(news.content);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/berita")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Berita
            </Button>
          </div>
        </div>
        
        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
            {/* Category Badge */}
            <Badge className="mb-4">
              {categoryMap[news.category] || news.category}
            </Badge>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {news.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-600 pb-6 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(news.publishedAt || news.createdAt), "dd MMMM yyyy", { locale: id })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(news.publishedAt || news.createdAt), "HH:mm", { locale: id })} WIB
                </span>
              </div>
              
              {news.authorId && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              )}
            </div>
            
            {/* Share Buttons */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Bagikan:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("facebook")}
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                  className="bg-sky-500 text-white hover:bg-sky-600 border-sky-500"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("whatsapp")}
                  className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Salin Link
                </Button>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          {news.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Excerpt */}
          {news.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 mb-6 rounded-r-lg">
              <p className="text-base md:text-lg text-gray-700 italic leading-relaxed">
                {news.excerpt}
              </p>
            </div>
          )}
          
          {/* Main Content */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6
                  prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-gray-700 prose-li:my-1
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-video:rounded-lg prose-video:shadow-md
                  prose-iframe:rounded-lg prose-iframe:shadow-md prose-iframe:w-full
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-900 prose-pre:text-gray-100"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </CardContent>
          </Card>
          
          {/* Related/Back to News */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/berita")}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Lihat Berita Lainnya
            </Button>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
