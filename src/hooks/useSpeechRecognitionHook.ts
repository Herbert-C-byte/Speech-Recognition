import { useCallback, useEffect, useRef, useState } from 'react';

// Lightweight Web Speech API type shims for environments that lack built-in types.
declare global {
	interface Window {
		webkitSpeechRecognition?: any;
		SpeechRecognition?: any;
	}

	interface SpeechRecognitionAlternative {
		transcript: string;
		confidence: number;
	}

	interface SpeechRecognitionResult {
		isFinal: boolean;
		[index: number]: SpeechRecognitionAlternative;
	}

	interface SpeechRecognitionEvent extends Event {
		resultIndex: number;
		results: SpeechRecognitionResult[];
	}

	interface SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		start: () => void;
		stop: () => void;
		onresult: ((ev: SpeechRecognitionEvent) => void) | null;
		onerror: ((ev: any) => void) | null;
		onend: (() => void) | null;
	}
}

type UseSpeechRecognitionReturn = {
	transcript: string;
	listening: boolean;
	isSupported: boolean;
	error: string | null;
	start: () => void;
	stop: () => void;
	reset: () => void;
};

const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
	const [transcript, setTranscript] = useState('');
	const [listening, setListening] = useState(false);
	const [isSupported, setIsSupported] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		// Access vendor-prefixed API if necessary
		const _SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (!_SpeechRecognition) {
			setIsSupported(false);
			return;
		}

		const rec: SpeechRecognition = new _SpeechRecognition();
		rec.continuous = true;
		rec.interimResults = true;
		rec.lang = 'en-US';

		rec.onresult = (event: SpeechRecognitionEvent) => {
			let interim = '';
			let final = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const res = event.results[i];
				const chunk = res[0]?.transcript || '';
				if (res.isFinal) final += chunk;
				else interim += chunk;
			}
			setTranscript((prev) => (final ? prev + final : prev + interim));
		};

		rec.onerror = (e: any) => {
			setError(e?.error || e?.message || 'Speech recognition error');
		};

		rec.onend = () => {
			setListening(false);
		};

		recognitionRef.current = rec;

		return () => {
			try {
				recognitionRef.current?.stop();
			} catch (e) {
				// ignore
			}
			recognitionRef.current = null;
		};
	}, []);

	const start = useCallback(() => {
		setError(null);
		if (!recognitionRef.current) {
			setError('SpeechRecognition is not supported in this browser');
			return;
		}
		try {
			recognitionRef.current.start();
			setListening(true);
		} catch (e: any) {
			setError(e?.message || 'Failed to start speech recognition');
		}
	}, []);

	const stop = useCallback(() => {
		try {
			recognitionRef.current?.stop();
		} catch (e) {
			// ignore
		}
		setListening(false);
	}, []);

	const reset = useCallback(() => {
		setTranscript('');
		setError(null);
	}, []);

	return { transcript, listening, isSupported, error, start, stop, reset };
};

export default useSpeechRecognition;