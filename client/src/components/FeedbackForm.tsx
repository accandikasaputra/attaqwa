import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
//import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createFeedback } from "@/services/feedbackApi";
import { Send, CheckCircle } from "lucide-react";

export default function FeedbackForm() {
  const { toast } = useToast();
  //const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  
  const createMutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Berhasil!",
        description: "Terima kasih atas masukan Anda. Kami akan segera meresponnya.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      
      
      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal mengirim feedback. Silakan coba lagi.",
        variant: "destructive",
      });
      
      
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Nama, subjek, dan pesan harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    
    
    // Submit
    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // If using environment variable is not available, use placeholder
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Kirim Saran & Masukan</CardTitle>
        <CardDescription>
          Sampaikan saran, kritik, atau pertanyaan Anda kepada kami
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Pesan Berhasil Dikirim!
              </h3>
              <p className="text-gray-600">
                Terima kasih atas masukan Anda. Kami akan segera meresponnya.
              </p>
            </div>
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
            >
              Kirim Pesan Lain
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Nama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                  disabled={createMutation.isPending}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  disabled={createMutation.isPending}
                />
              </div>
              
              <div>
                <Label htmlFor="subject">
                  Subjek <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Subjek pesan"
                  required
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">
                Pesan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Tulis saran, kritik, atau pertanyaan Anda di sini..."
                rows={6}
                required
                disabled={createMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimal 10 karakter
              </p>
            </div>
            
            
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full sm:flex-1"
              >
                {createMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Pesan
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Dengan mengirim pesan ini, Anda menyetujui bahwa data Anda akan digunakan 
              untuk merespon masukan Anda sesuai dengan kebijakan privasi kami.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}