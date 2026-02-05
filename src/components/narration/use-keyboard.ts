"use client";

import { useCallback, useEffect } from "react";
import { useNarrationStore } from "./store";

export function useNarrationKeyboard(
	audioRef: React.RefObject<HTMLAudioElement | null>,
) {
	const {
		isVisible,
		isPlaying,
		setPlaying,
		setMuted,
		isMuted,
		close,
		volume,
		setVolume,
	} = useNarrationStore();

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isVisible || !audioRef.current) return;

			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			const audio = audioRef.current;

			switch (e.code) {
				case "Space":
					e.preventDefault();
					setPlaying(!isPlaying);
					break;
				case "ArrowLeft":
					e.preventDefault();
					audio.currentTime = Math.max(0, audio.currentTime - 15);
					break;
				case "ArrowRight":
					e.preventDefault();
					audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
					break;
				case "ArrowUp":
					e.preventDefault();
					setVolume(Math.min(1, volume + 0.1));
					break;
				case "ArrowDown":
					e.preventDefault();
					setVolume(Math.max(0, volume - 0.1));
					break;
				case "KeyM":
					e.preventDefault();
					setMuted(!isMuted);
					break;
				case "Escape":
					e.preventDefault();
					close();
					break;
				default:
					if (e.code >= "Digit0" && e.code <= "Digit9") {
						e.preventDefault();
						const percent =
							e.code === "Digit0"
								? 100
								: Number.parseInt(e.code.slice(-1), 10) * 10;
						audio.currentTime = (audio.duration * percent) / 100;
					}
			}
		},
		[
			isVisible,
			isPlaying,
			isMuted,
			volume,
			setPlaying,
			setMuted,
			setVolume,
			close,
			audioRef,
		],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}
