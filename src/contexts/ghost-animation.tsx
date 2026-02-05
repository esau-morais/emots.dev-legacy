"use client";

import { useReducedMotion } from "motion/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useKonami } from "@/hooks/use-konami";

type Phase = "idle" | "zoomIn" | "action" | "zoomOut";

interface GhostAnimationContextValue {
	phase: Phase;
	progress: number;
	skip: () => void;
	trigger: () => void;
}

const GhostAnimationContext = createContext<GhostAnimationContextValue | null>(
	null,
);

const TIMING = {
	zoomIn: 2800,
	action: 500,
	zoomOut: 800,
} as const;

export function GhostAnimationProvider({ children }: { children: ReactNode }) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [progress, setProgress] = useState(0);
	const prefersReducedMotion = useReducedMotion();

	const skip = useCallback(() => {
		setPhase("idle");
		setProgress(0);
	}, []);

	const trigger = useCallback(() => {
		if (phase !== "idle") return;

		if (prefersReducedMotion) {
			console.log(
				"%c👻 Ghost Cat says hi! (reduced motion)",
				"color:#888;font-style:italic",
			);
			return;
		}

		setPhase("zoomIn");
		setProgress(0);
	}, [phase, prefersReducedMotion]);

	useKonami({ onActivate: trigger });

	useEffect(() => {
		if (phase === "idle") {
			document.documentElement.style.overflow = "";
			return;
		}
		document.documentElement.style.overflow = "hidden";

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") skip();
		};
		window.addEventListener("keydown", handleEscape);

		return () => {
			document.documentElement.style.overflow = "";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [phase, skip]);

	useEffect(() => {
		if (phase === "idle") return;

		let start: number;
		let animationFrame: number;

		const phaseDuration = TIMING[phase as keyof typeof TIMING];
		if (!phaseDuration) return;

		const animate = (timestamp: number) => {
			if (!start) start = timestamp;
			const elapsed = timestamp - start;
			const phaseProgress = Math.min(elapsed / phaseDuration, 1);

			setProgress(phaseProgress);

			if (phaseProgress < 1) {
				animationFrame = requestAnimationFrame(animate);
			} else {
				if (phase === "zoomIn") {
					setPhase("action");
					setProgress(0);
				} else if (phase === "action") {
					setPhase("zoomOut");
					setProgress(0);
				} else if (phase === "zoomOut") {
					setPhase("idle");
					setProgress(0);
				}
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	}, [phase]);

	return (
		<GhostAnimationContext.Provider value={{ phase, progress, skip, trigger }}>
			{children}
		</GhostAnimationContext.Provider>
	);
}

export function useGhostAnimation(): GhostAnimationContextValue {
	const context = useContext(GhostAnimationContext);
	if (!context) {
		return {
			phase: "idle",
			progress: 0,
			skip: () => {},
			trigger: () => {},
		};
	}
	return context;
}
