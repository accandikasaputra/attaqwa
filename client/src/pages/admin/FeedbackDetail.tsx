import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFeedbackDetail, markFeedbackAsRead, replyFeedback } from "@/services/feedbackApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  new: { label: "New", variant: "default" },
  read: { label: "Read", variant: "secondary" },
  replied: { label: "Replied", variant: "default" },
};

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reply, setReply] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["feedback", id],
    queryFn: () => getFeedbackDetail(Number(id)),
  });
  
  const markReadMutation = useMutation({
    mutationFn: markFeedbackAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      toast({
        title: "Berhasil",
        description: "Feedback ditandai sudah dibaca",
      });
    },
  });
  
  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => 
      replyFeedback(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      toast({
        title: "Berhasil",
        description: "Reply berhasil dikirim",
      });
      setReply("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal mengirim reply",
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return <div className="p-4 md:p-6">Loading...</div>;
  }
  
  const feedback = data?.data;
  
  if (!feedback) {
    return <div className="p-4 md:p-6">Feedback tidak ditemukan</div>;
  }
  
  const handleMarkAsRead = () => {
    if (feedback.status === "new") {
      markReadMutation.mutate(Number(id));
    }
  };
  
  const handleReply = () => {
    if (!reply.trim()) {
      toast({
        title: "Error",
        description: "Reply tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }
    
    replyMutation.mutate({ id: Number(id), reply: reply.trim() });
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/feedback")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Detail Feedback</h1>
          <p className="text-sm md:text-base text-gray-500">Informasi lengkap feedback</p>
        </div>
        {feedback.status === "new" && (
          <Button
            size="sm"
            onClick={handleMarkAsRead}
            disabled={markReadMutation.isPending}
            className="hidden sm:flex"
          >
            Tandai Dibaca
          </Button>
        )}
      </div>
      
      {/* Mobile Mark as Read */}
      {feedback.status === "new" && (
        <Button
          className="w-full sm:hidden"
          onClick={handleMarkAsRead}
          disabled={markReadMutation.isPending}
        >
          Tandai Dibaca
        </Button>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Feedback Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle>Informasi Feedback</CardTitle>
                <Badge variant={statusMap[feedback.status]?.variant}>
                  {statusMap[feedback.status]?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Subjek</p>
                <p className="font-medium text-base md:text-lg">{feedback.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Pesan</p>
                <p className="whitespace-pre-wrap break-words">{feedback.message}</p>
              </div>
              
              {feedback.reply && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Reply dari Admin:
                  </p>
                  <p className="text-blue-800 whitespace-pre-wrap break-words">{feedback.reply}</p>
                  {feedback.repliedAt && (
                    <p className="text-xs text-blue-600 mt-2">
                      {new Date(feedback.repliedAt).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Reply Form */}
          {feedback.status !== "replied" && (
            <Card>
              <CardHeader>
                <CardTitle>Balas Feedback</CardTitle>
                <CardDescription>
                  Kirim balasan ke pengirim feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reply">Pesan Balasan</Label>
                  <Textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Tulis balasan Anda di sini..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleReply}
                  disabled={replyMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {replyMutation.isPending ? "Mengirim..." : "Kirim Balasan"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Contact Info */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengirim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{feedback.name}</p>
              </div>
              
              {feedback.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium break-words">{feedback.email}</p>
                  </div>
                </div>
              )}
              
              {feedback.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-medium">{feedback.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">
                    {new Date(feedback.createdAt).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}