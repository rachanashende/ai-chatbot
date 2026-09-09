import React from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

/**
 * Circular voice-input button. Pulses (via CSS class toggle) while
 * listening. Calls onTranscript with the recognized text once done.
 */
export default function VoiceButton({ onTranscript }) {
  const { isListening, isSupported, startListening } = useSpeechRecognition({
    onResult: onTranscript,
  });

  if (!isSupported) return null;

  return (
    <div
      className={`voice-btn ${isListening ? "listening" : ""}`}
      onClick={startListening}
      role="button"
      aria-label="Speak your question"
    >
      <div className="voice-icon" />
    </div>
  );
}
