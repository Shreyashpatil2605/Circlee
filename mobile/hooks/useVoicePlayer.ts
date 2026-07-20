import { useState, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

export const useVoicePlayer = (remoteUrl: string) => {
  const [sourceUri, setSourceUri] = useState<string>(remoteUrl);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Streaming + Background caching check
  useEffect(() => {
    let active = true;

    if (!remoteUrl) return;

    // If it is already a local URI or not a remote http URL, skip caching
    if (
      remoteUrl.startsWith("file://") ||
      remoteUrl.startsWith("content://") ||
      !remoteUrl.startsWith("http")
    ) {
      setSourceUri(remoteUrl);
      setIsCached(true);
      return;
    }

    const checkAndCache = async () => {
      try {
        const filename = remoteUrl.split("/").pop() || `voice_${Date.now()}.m4a`;
        const cacheUri = `${FileSystem.cacheDirectory}${filename}`;
        
        const fileInfo = await FileSystem.getInfoAsync(cacheUri);
        if (fileInfo.exists) {
          if (active) {
            setSourceUri(cacheUri);
            setIsCached(true);
          }
        } else {
          // Play remote URL immediately (streaming), while downloading in background
          setIsDownloading(true);
          FileSystem.downloadAsync(remoteUrl, cacheUri)
            .then((result) => {
              if (active) {
                setSourceUri(result.uri);
                setIsCached(true);
                setIsDownloading(false);
              }
            })
            .catch((err) => {
              console.error("Background caching failed:", err);
              if (active) setIsDownloading(false);
            });
        }
      } catch (err) {
        console.error("Cache check failed:", err);
      }
    };

    checkAndCache();
    return () => {
      active = false;
    };
  }, [remoteUrl]);

  const player = useAudioPlayer(sourceUri);
  const status = useAudioPlayerStatus(player);

  // Sync playback rate/speed changes
  useEffect(() => {
    if (player && typeof player.setPlaybackRate === "function") {
      player.setPlaybackRate(speed);
    }
  }, [speed, player]);

  // Sync seek to beginning when audio finishes playing
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("playbackStatusUpdate", (state: any) => {
      if (state?.didJustFinish) {
        player.pause();
        player.seekTo(0);
      }
    });

    return () => subscription.remove();
  }, [player]);

  const play = () => {
    player?.play();
  };

  const pause = () => {
    player?.pause();
  };

  const togglePlay = () => {
    if (status?.playing) {
      pause();
    } else {
      play();
    }
  };

  const cycleSpeed = () => {
    setSpeed((prev) => {
      if (prev === 1.0) return 1.5;
      if (prev === 1.5) return 2.0;
      return 1.0;
    });
  };

  const progress = status?.duration > 0 ? status.currentTime / status.duration : 0;

  return {
    isPlaying: status?.playing || false,
    duration: status?.duration || 0,
    currentTime: status?.currentTime || 0,
    progress,
    speed,
    isDownloading,
    isCached,
    play,
    pause,
    togglePlay,
    cycleSpeed,
    player,
  };
};
