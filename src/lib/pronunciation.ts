import { client as env } from "@/lib/env/client";

let audio: HTMLAudioElement | null = null;

export function pronounceName(onStart?: () => void, onEnd?: () => void): void {
	if (typeof window === "undefined") return;

	if (audio) {
		audio.pause();
		audio.currentTime = 0;
	}

	audio = new Audio(`${env.NEXT_PUBLIC_R2_URL}/audio/pronunciation.mp3`);
	audio.onplay = () => onStart?.();
	audio.onended = () => onEnd?.();
	audio.play();
}
