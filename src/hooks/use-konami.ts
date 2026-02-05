"use client";

import { useCallback, useEffect, useRef } from "react";

const KONAMI_SEQUENCE = [
	"Escape",
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"KeyB",
	"KeyA",
] as const;

interface UseKonamiOptions {
	onActivate: () => void;
	timeout?: number;
}

export function useKonami({ onActivate, timeout = 2000 }: UseKonamiOptions) {
	const inputRef = useRef<string[]>([]);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const reset = useCallback(() => {
		inputRef.current = [];
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			const nextIndex = inputRef.current.length;
			const expectedKey = KONAMI_SEQUENCE[nextIndex];

			if (e.code === expectedKey) {
				if (nextIndex >= 1 && e.code.startsWith("Arrow")) {
					e.preventDefault();
				}

				inputRef.current.push(e.code);

				if (inputRef.current.length === KONAMI_SEQUENCE.length) {
					console.groupCollapsed(
						"%c" +
							[
								"┌─────────────────────────┐",
								"│  ∧,,,∧                  │",
								"│ (  ̳• · • ̳)    mrrp?     │",
								"│ /    づ♡                │",
								"└─────────────────────────┘",
							].join("\n"),
						"color:#888;font-family:monospace",
					);
					console.log(
						"%cYou've summoned the ghost cat.",
						"color:#666;font-style:italic",
					);
					console.groupEnd();
					onActivate();
					reset();
				} else {
					timeoutRef.current = setTimeout(reset, timeout);
				}
			} else {
				reset();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [onActivate, reset, timeout]);

	return { reset };
}
