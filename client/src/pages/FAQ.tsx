import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getActiveFAQs } from "@/services/faqApi";

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["faqs-public"],
    queryFn: getActiveFAQs,
  });
  
  const faqs = data?.data || [];
  
  // Filter FAQs
  const filteredFAQs = faqs.filter((faq: any) => {
    const matchSearch = search === "" || 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = selectedCategory === "" || faq.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });
  
  // Group by category - FIX: Convert Set to Array properly
  const categories = Array.from(new Set(faqs.map((faq: any) => faq.category)));
  const groupedFAQs = categories.map(category => ({
    category,
    faqs: filteredFAQs.filter((faq: any) => faq.category === category),
  }));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan yang sering ditanyakan seputar pembangunan masjid
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari pertanyaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 md:h-14 text-base md:text-lg"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedCategory === "" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("")}
            >
              Semua
            </Badge>
            {categories.map((cat: string) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                Tidak ada FAQ yang sesuai dengan pencarian
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {groupedFAQs.map(
                (group) =>
                  group.faqs.length > 0 && (
                    <div key={group.category} className="space-y-4">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="h-1 w-8 bg-primary rounded"></span>
                        {group.category}
                      </h2>
                      
                      <Accordion type="single" collapsible className="space-y-3">
                        {group.faqs.map((faq: any) => (
                          <AccordionItem
                            key={faq.id}
                            value={`faq-${faq.id}`}
                            className="bg-white border rounded-lg px-4 md:px-6 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <AccordionTrigger className="text-left text-base md:text-lg font-medium py-4 md:py-5 hover:no-underline">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm md:text-base text-gray-700 pb-4 md:pb-5 whitespace-pre-wrap">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
        
        {/* Contact Section */}
        <div className="max-w-3xl mx-auto mt-12 md:mt-16">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl p-6 md:p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Masih Ada Pertanyaan?
            </h3>
            <p className="text-sm md:text-base mb-6 opacity-90">
              Jika pertanyaan Anda belum terjawab, silakan hubungi kami atau kirim kritik dan saran
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/saran"
                className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Kirim Pertanyaan
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
