import useSpeechRecognition from "../hooks/useSpeechRecognitionHook";

export default function Main() {
  const { transcript, listening, isSupported, error, start, stop, reset } =
    useSpeechRecognition();

  return (
    <main>
      <h1>Speech Recognition Playground</h1>

      {!isSupported && (
        <p role="alert">Speech Recognition is not supported in this browser.</p>
      )}

      <div>
        <button
          onClick={start}
          disabled={!isSupported || listening}
          aria-pressed={listening}
        >
          Start
        </button>
        <button onClick={stop} disabled={!isSupported || !listening}>
          Stop
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      {error && <p role="alert">{error}</p>}

      <section aria-live="polite">
        <h2>Transcript</h2>
        <div
          style={{
            whiteSpace: "pre-wrap",
            border: "1px solid #ddd",
            padding: 8,
            minHeight: 80,
          }}
        >
          {transcript || <em>No transcript yet</em>}
        </div>
      </section>
    </main>
  );
}
