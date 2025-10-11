import { useState } from "react";
import { Upload as UploadIcon, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleVideoUpload(videoFile);
    } else {
      toast.error("Por favor, envie um arquivo de vídeo válido");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const handleVideoUpload = (file: File) => {
    // Validação básica
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast.error("Arquivo muito grande. Limite de 500MB");
      return;
    }

    toast.success("Vídeo carregado! Iniciando análise...");
    
    // Simula upload e redireciona para o editor
    setTimeout(() => {
      navigate("/editor", { state: { videoFile: file } });
    }, 1500);
  };

  const handleUrlSubmit = () => {
    if (!videoUrl) {
      toast.error("Por favor, insira uma URL válida");
      return;
    }

    toast.success("URL validada! Iniciando análise...");
    
    setTimeout(() => {
      navigate("/editor", { state: { videoUrl } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Video Clipper
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-foreground">
              Transforme seus vídeos em clipes incríveis
            </h2>
            <p className="text-lg text-muted-foreground">
              Nossa IA identifica automaticamente os melhores momentos do seu vídeo
            </p>
          </div>

          {/* Upload Area */}
          <Card 
            className={`p-12 border-2 border-dashed transition-all duration-300 shadow-card ${
              isDragging 
                ? 'border-primary bg-primary/5 shadow-glow' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <UploadIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  Arraste seu vídeo aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporta MP4, WebM, MOV até 500MB
                </p>
              </div>

              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OU</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="w-full max-w-md">
                <label htmlFor="file-upload">
                  <Button variant="secondary" className="w-full" asChild>
                    <span className="cursor-pointer">
                      Selecionar arquivo
                      <input
                        id="file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          {/* URL Input */}
          <div className="relative">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">OU COLE UM LINK</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>

          <Card className="p-6 shadow-card">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
              <Button onClick={handleUrlSubmit} className="bg-gradient-primary hover:opacity-90">
                Analisar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Suporta links do YouTube, Vimeo, Google Drive e outros
            </p>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            {[
              { icon: "🎬", title: "Detecção Inteligente", desc: "IA identifica os melhores momentos" },
              { icon: "⚡", title: "Processamento Rápido", desc: "Análise em minutos" },
              { icon: "✂️", title: "Edição Fácil", desc: "Ajuste e exporte seus clipes" },
            ].map((feature, i) => (
              <Card key={i} className="p-4 text-center space-y-2 bg-card/50 hover:bg-card transition-colors">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
