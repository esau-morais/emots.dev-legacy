"use client";

import { useEffect } from "react";
import { sounds, unlockAudio } from "@/lib/sounds";

export function SoundProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const unlock = () => unlockAudio();
		const events = ["click", "mousedown", "touchstart", "keydown"] as const;
		for (const e of events) {
			document.addEventListener(e, unlock, { once: true });
		}

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.closest("a[href]") || target.closest("[data-sound='click']")) {
				sounds.click();
			}
		};

		document.addEventListener("click", handleClick);
		return () => {
			for (const e of events) {
				document.removeEventListener(e, unlock);
			}
			document.removeEventListener("click", handleClick);
		};
	}, []);

	return children;
}
