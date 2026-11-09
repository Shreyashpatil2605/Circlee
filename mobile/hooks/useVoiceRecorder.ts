import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioRecorder, useAudioRecorderState, AudioModule, setAudioModeAsync, RecordingPresets } from "expo-audio";
import { AppState, AppStateStatus } from "react-native";

export const useVoiceRecorder = (maxDurationSeconds: number = 300) => {
  const [status, setStatus] = useState<"idle" | "recording" | "preview" | "uploading" | "failed">("idle");
  const [isLocked, setIsLocked] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [durationMillis, setDurationMillis] = useState(0);
  const recordingStartTimestampRef = useRef<number>(0);

  // Setup global audio mode and request microphone permissions on mount so focus is not stolen during gesture
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        
        const permission = await AudioModule.getRecordingPermissionsAsync();
        if (!permission.granted) {
          await AudioModule.requestRecordingPermissionsAsync();
        }
      } catch (e) {
        console.error("Failed to setup audio or pre-fetch microphone permissions:", e);
      }
    };
    setupAudio();
  }, []);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(recorder, 100);

  // Synchronize duration and metering updates to React state
  useEffect(() => {
    if (!recorderState) return;

    if (recorderState.durationMillis !== undefined) {
      setDurationMillis(recorderState.durationMillis);
    }

    if (recorderState.isRecording && recorderState.metering !== undefined) {
      // Normalize dB (-60 to 0) to a value between 4 and 35
      const db = recorderState.metering;
      const amplitude = Math.max(0, (db + 60) / 60);
      const height = Math.max(4, Math.floor(amplitude * 28) + 4);
      setWaveform((prev) => {
        const nextWave = [...prev, height];
        // limit the array size so it doesn't grow infinitely (e.g. max 100 bars)
        if (nextWave.length > 60) {
          nextWave.shift();
        }
        return nextWave;
      });
    }
  }, [recorderState]);

  const stopAndSave = useCallback(async () => {
    console.log("[HOOK] stopAndSave called");
    try {
      const elapsed = Date.now() - recordingStartTimestampRef.current;
      if (elapsed < 1000) {
        const delay = 1000 - elapsed;
        console.log(`[HOOK] Recording too short (${elapsed}ms). Delaying stop by ${delay}ms to avoid native crash...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      await recorder.stop();
      console.log("[HOOK] recorder stopped successfully. URI:", recorder.uri);
      setRecordedUri(recorder.uri);
      setStatus("preview");
    } catch (e) {
      console.error("[HOOK] Failed to stop recording:", e);
      setStatus("idle");
    }
  }, [recorder]);

  // Monitor max duration limit
  const durationSeconds = durationMillis / 1000;
  useEffect(() => {
    if (status === "recording" && durationSeconds >= maxDurationSeconds) {
      stopAndSave();
    }
  }, [durationSeconds, status, maxDurationSeconds, stopAndSave]);

  // Monitor AppState to handle background / incoming call interruptions
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== "active" && status === "recording") {
        stopAndSave();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [status, stopAndSave]);

  const start = async () => {
    console.log("[HOOK] start called");
    try {
      const permission = await AudioModule.getRecordingPermissionsAsync();
      console.log("[HOOK] start - Microphone permission status:", permission);
      if (!permission.granted) {
        console.log("[HOOK] Permission not pre-fetched, requesting now...");
        const request = await AudioModule.requestRecordingPermissionsAsync();
        if (!request.granted) {
          console.log("[HOOK] Microphone permission still not granted");
          alert("Microphone permission is required to record voice messages.");
          return;
        }
      }

      setWaveform([]);
      setRecordedUri(null);
      setDurationMillis(0);
      setIsLocked(false);

      console.log("[HOOK] Preparing to record...");
      await recorder.prepareToRecordAsync();
      console.log("[HOOK] Starting recording (awaiting record())...");
      await recorder.record();
      recordingStartTimestampRef.current = Date.now();
      setStatus("recording");
      console.log("[HOOK] Recording started successfully!");
    } catch (e) {
      console.error("[HOOK] Failed to start recording error:", e);
      setStatus("idle");
    }
  };

  const cancel = async () => {
    console.log("[HOOK] cancel called");
    try {
      const elapsed = Date.now() - recordingStartTimestampRef.current;
      if (status === "recording" && elapsed < 1000) {
        const delay = 1000 - elapsed;
        console.log(`[HOOK] Cancel recording too short (${elapsed}ms). Delaying stop by ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      await recorder.stop();
      console.log("[HOOK] recorder stopped for cancel");
      setWaveform([]);
      setRecordedUri(null);
      setDurationMillis(0);
      setIsLocked(false);
      setStatus("idle");
    } catch (e) {
      console.error("[HOOK] Failed to cancel recording:", e);
      setStatus("idle");
    }
  };

  return {
    isRecording: status === "recording",
    isLocked,
    setIsLocked,
    status,
    setStatus,
    waveform,
    setWaveform,
    durationSeconds,
    recordedUri,
    setRecordedUri,
    start,
    stopAndSave,
    cancel,
  };
};
