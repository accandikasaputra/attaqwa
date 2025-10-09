import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', formData);
    alert('Terima kasih atas masukan Anda!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: '',
      subject: '',
      message: '',
    });
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Saran & Masukan
          </h2>
          <p className="text-lg text-muted-foreground">
            Kami sangat menghargai setiap masukan dari Anda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulir Saran</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    placeholder="Masukkan nama Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    No. Telepon
                  </label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Jenis <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger id="type" data-testid="select-type">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kritik">Kritik</SelectItem>
                      <SelectItem value="saran">Saran</SelectItem>
                      <SelectItem value="pertanyaan">Pertanyaan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subjek <span className="text-destructive">*</span>
                </label>
                <Input
                  id="subject"
                  data-testid="input-subject"
                  placeholder="Subjek masukan Anda"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Pesan <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  data-testid="textarea-message"
                  placeholder="Tuliskan masukan Anda di sini..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" data-testid="button-submit-feedback">
                <Send className="mr-2 h-5 w-5" />
                Kirim Masukan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
