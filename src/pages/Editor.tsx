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
import { supabase } from "@/integrations/supabase/client";

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
  const [videoId, setVideoId] = useState<string | null>(null);

  const videoFile = location.state?.videoFile;
  const videoUrl = location.state?.videoUrl;

  useEffect(() => {
    if (!videoFile && !videoUrl) {
      navigate("/");
      return;
    }

    // Analyze video with AI
    analyzeVideo();
  }, [videoFile, videoUrl, navigate]);

  const loadClips = async (vId: string) => {
    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .eq("video_id", vId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error loading clips:", error);
      return;
    }

    if (data) {
      const formattedClips = data.map(clip => ({
        id: clip.id,
        start: clip.start_time,
        end: clip.end_time,
        score: clip.score,
        reason: clip.reason
      }));
      setClips(formattedClips);
    }
  };

  const analyzeVideo = async () => {
    const videoSource = videoFile || videoUrl;
    if (!videoSource) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data: video, error: videoError } = await supabase
        .from("videos")
        .insert({
          title: videoFile ? videoFile.name : "Video from URL",
          external_url: videoUrl,
          file_url: videoFile ? URL.createObjectURL(videoFile) : null,
          status: "analyzing"
        })
        .select()
        .single();

      if (videoError) throw videoError;
      
      setVideoId(video.id);

      // Simulate AI analysis with mock clips
      const mockClips = [
        { start_time: 5, end_time: 15, score: 0.95, reason: "Pico de intensidade de áudio e movimento" },
        { start_time: 32, end_time: 45, score: 0.88, reason: "Mudança de cena dramática" },
        { start_time: 67, end_time: 78, score: 0.92, reason: "Momento de alta energia" },
        { start_time: 95, end_time: 110, score: 0.85, reason: "Pico emocional detectado" },
      ];

      const { error: clipsError } = await supabase
        .from("clips")
        .insert(
          mockClips.map(clip => ({
            video_id: video.id,
            ...clip
          }))
        );

      if (clipsError) throw clipsError;

      await supabase
        .from("videos")
        .update({ status: "completed" })
        .eq("id", video.id);

      await loadClips(video.id);
      
      toast.success(`${mockClips.length} momentos incríveis identificados!`);
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast.error("Erro ao analisar o vídeo. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  };

  const videoSource = videoFile 
    ? URL.createObjectURL(videoFile)
    : videoUrl || "";
  
  const isYouTubeUrl = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const youtubeEmbedUrl = isYouTubeUrl && videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

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
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoSource}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              )}
              
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
