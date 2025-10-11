import { Card } from "@/components/ui/card";

interface Clip {
  id: string;
  start: number;
  end: number;
  score: number;
  reason: string;
}

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  clips: Clip[];
  selectedClip: string | null;
  onClipClick: (clip: Clip) => void;
}

const VideoTimeline = ({ 
  duration, 
  currentTime, 
  clips, 
  selectedClip,
  onClipClick 
}: VideoTimelineProps) => {
  const getClipPosition = (time: number) => {
    return (time / duration) * 100;
  };

  const getClipWidth = (start: number, end: number) => {
    return ((end - start) / duration) * 100;
  };

  return (
    <Card className="p-6 bg-timeline-bg shadow-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Timeline
          </h3>
          <span className="text-xs text-muted-foreground">
            {clips.length} clipes identificados
          </span>
        </div>

        {/* Timeline Track */}
        <div className="relative h-20 bg-timeline-track rounded-lg overflow-hidden">
          {/* Clips */}
          {clips.map((clip) => (
            <button
              key={clip.id}
              className={`absolute top-2 h-16 rounded transition-all cursor-pointer group ${
                selectedClip === clip.id
                  ? 'bg-timeline-clip shadow-glow z-10'
                  : 'bg-timeline-clip/60 hover:bg-timeline-clip/80'
              }`}
              style={{
                left: `${getClipPosition(clip.start)}%`,
                width: `${getClipWidth(clip.start, clip.end)}%`,
              }}
              onClick={() => onClipClick(clip)}
            >
              <div className="h-full flex items-center justify-center px-2">
                <div className="text-center">
                  <p className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.floor(clip.end - clip.start)}s
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {Array(Math.min(5, Math.floor(clip.score * 5))).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-white/80 rounded-full"
                        style={{ height: `${20 + Math.random() * 20}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Playhead */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-20 transition-all duration-100"
              style={{ left: `${getClipPosition(currentTime)}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-glow" />
            </div>
          )}
        </div>

        {/* Time Markers */}
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          {[0, 0.25, 0.5, 0.75, 1].map((percent) => {
            const time = duration * percent;
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60);
            return (
              <span key={percent}>
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default VideoTimeline;
