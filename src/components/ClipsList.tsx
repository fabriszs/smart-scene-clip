import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Play, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Clip {
  id: string;
  start: number;
  end: number;
  score: number;
  reason: string;
}

interface ClipsListProps {
  clips: Clip[];
  isAnalyzing: boolean;
  onClipSelect: (clip: Clip) => void;
  onClipExport: (clip: Clip) => void;
  selectedClip: string | null;
}

const ClipsList = ({ 
  clips, 
  isAnalyzing, 
  onClipSelect, 
  onClipExport,
  selectedClip 
}: ClipsListProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 0.8) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return "Excelente";
    if (score >= 0.8) return "Muito Bom";
    return "Bom";
  };

  return (
    <Card className="h-full flex flex-col shadow-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Clipes Detectados
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAnalyzing 
            ? "Analisando vídeo..." 
            : `${clips.length} momentos encontrados`
          }
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Processando...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Identificando os melhores momentos
                </p>
              </div>
            </div>
          ) : clips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Nenhum clipe detectado
              </p>
            </div>
          ) : (
            clips.map((clip, index) => (
              <Card
                key={clip.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedClip === clip.id 
                    ? 'ring-2 ring-primary shadow-glow' 
                    : 'hover:ring-1 hover:ring-border'
                }`}
                onClick={() => onClipSelect(clip)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Clipe #{index + 1}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getScoreColor(clip.score)}`}
                        >
                          {getScoreLabel(clip.score)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {clip.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-foreground">
                        {formatTime(clip.start)} - {formatTime(clip.end)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(clip.end - clip.start)}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClipSelect(clip);
                        }}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClipExport(clip);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary transition-all"
                      style={{ width: `${clip.score * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ClipsList;
