import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download,
  Scissors,
  Sparkles,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import VideoTimeline from "@/components/VideoTimeline";
import ClipsList from "@/components/ClipsList";

interface Clip {
  id: string;
  start: number;
  end: number;
  score: number;
  reason: string;
}

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const videoFile = location.state?.videoFile;
  const videoUrl = location.state?.videoUrl;

  useEffect(() => {
    if (!videoFile && !videoUrl) {
      navigate("/");
      return;
    }

    // Simula análise de IA
    simulateAIAnalysis();
  }, [videoFile, videoUrl, navigate]);

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simula processamento de IA por 3 segundos
    setTimeout(() => {
      const mockClips: Clip[] = [
        {
          id: "1",
          start: 5,
          end: 15,
          score: 0.95,
          reason: "Pico de intensidade de áudio e movimento"
        },
        {
          id: "2",
          start: 32,
          end: 45,
          score: 0.88,
          reason: "Mudança de cena dramática"
        },
        {
          id: "3",
          start: 67,
          end: 78,
          score: 0.92,
          reason: "Momento de alta energia"
        },
        {
          id: "4",
          start: 95,
          end: 110,
          score: 0.85,
          reason: "Pico emocional detectado"
        }
      ];
      
      setClips(mockClips);
      setIsAnalyzing(false);
      toast.success(`${mockClips.length} momentos incríveis identificados!`);
    }, 3000);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const jumpToClip = (clip: Clip) => {
    if (videoRef.current) {
      videoRef.current.currentTime = clip.start;
      setSelectedClip(clip.id);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const exportClip = (clip: Clip) => {
    toast.success(`Exportando clipe de ${clip.end - clip.start}s...`);
    // Aqui seria implementada a lógica real de exportação
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoSource = videoFile 
    ? URL.createObjectURL(videoFile)
    : videoUrl || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold">AI Video Clipper</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isAnalyzing && (
              <Button 
                variant="secondary"
                onClick={() => clips.forEach(exportClip)}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main className="flex-1 container mx-auto px-6 py-6 flex gap-6">
        {/* Left: Video Player & Timeline */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Video Player */}
          <Card className="overflow-hidden shadow-card">
            <div className="aspect-video bg-player-bg relative">
              <video
                ref={videoRef}
                src={videoSource}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <div>
                      <p className="text-lg font-semibold">Analisando vídeo...</p>
                      <p className="text-sm text-muted-foreground">
                        Identificando os melhores momentos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="p-4 bg-card space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(-10)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={togglePlayPause}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(10)}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 w-32">
                  <span className="text-xs text-muted-foreground">Vol</span>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <VideoTimeline
            duration={duration}
            currentTime={currentTime}
            clips={clips}
            selectedClip={selectedClip}
            onClipClick={jumpToClip}
          />
        </div>

        {/* Right: Clips List */}
        <div className="w-96">
          <ClipsList
            clips={clips}
            isAnalyzing={isAnalyzing}
            onClipSelect={jumpToClip}
            onClipExport={exportClip}
            selectedClip={selectedClip}
          />
        </div>
      </main>
    </div>
  );
};

export default Editor;
