"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import {
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useGhostAnimation } from "@/contexts/ghost-animation";
import { useWindowResize } from "@/lib/hooks/window-resize";
import { pronounceName } from "@/lib/pronunciation";
import { sounds } from "@/lib/sounds";
import { cn } from "@/utils/classNames";

type EyeState = "open" | "half" | "closed" | "wide" | "squint";
type CatMood = "idle" | "happy" | "surprised" | "brave";

const eyeChars: Record<EyeState, string> = {
	open: "•",
	half: "-",
	closed: "–",
	wide: "o",
	squint: "^",
};

const mouthChars: Record<CatMood, string> = {
	idle: ".",
	happy: ".",
	surprised: ".",
	brave: "ω",
};

const WINK_SEQUENCE: EyeState[] = ["open", "half", "closed", "half", "open"];
const BASE_FONT_SIZE = 14;

const SpeakerHighPaths = {
	speaker:
		"M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Z",
	wave1:
		"m198,101.56a40,40,0,0,1,0,52.88a8,8,0,0,1-12-10.58a24,24,0,0,0,0-31.72a8,8,0,0,1,12-10.58Z",
	wave2:
		"M248,128a79.9,79.9,0,0,1-20.37,53.34a8,8,0,0,1-11.92-10.67a64,64,0,0,0,0-85.33a8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z",
} as const;

interface InitialPosition {
	x: number;
	y: number;
	width: number;
	height: number;
}

function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number): number {
	return t ** 3;
}

interface AnimatedCatOverlayProps {
	initialPosition: InitialPosition;
	phase: "zoomIn" | "action" | "zoomOut";
	progress: number;
	rightEye: EyeState;
	mood: CatMood;
}

function AnimatedCatOverlay({
	initialPosition,
	phase,
	progress,
	rightEye,
	mood,
}: AnimatedCatOverlayProps) {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

	useWindowResize(
		useCallback(
			() =>
				setWindowSize({ width: window.innerWidth, height: window.innerHeight }),
			[],
		),
	);

	const targetFontSize = Math.min(windowSize.width * 0.08, 100);
	const viewportCenter = useMemo(
		() => ({ x: windowSize.width / 2, y: windowSize.height / 2 }),
		[windowSize],
	);
	const initialCenter = useMemo(
		() => ({
			x: initialPosition.x + initialPosition.width / 2,
			y: initialPosition.y + initialPosition.height / 2,
		}),
		[initialPosition],
	);

	const { currentX, currentY, fontSize, rotation, wiggle } = useMemo(() => {
		if (phase === "zoomIn") {
			const p = easeOutCubic(progress);
			return {
				currentX: initialCenter.x + (viewportCenter.x - initialCenter.x) * p,
				currentY: initialCenter.y + (viewportCenter.y - initialCenter.y) * p,
				fontSize: BASE_FONT_SIZE + (targetFontSize - BASE_FONT_SIZE) * p,
				rotation: 360 * p,
				wiggle: 0,
			};
		}

		if (phase === "action") {
			const w = Math.sin(progress * Math.PI * 4) * 3;
			return {
				currentX: viewportCenter.x,
				currentY: viewportCenter.y,
				fontSize: targetFontSize,
				rotation: 360,
				wiggle: w,
			};
		}

		if (phase === "zoomOut") {
			const p = easeInCubic(progress);
			return {
				currentX: viewportCenter.x + (initialCenter.x - viewportCenter.x) * p,
				currentY: viewportCenter.y + (initialCenter.y - viewportCenter.y) * p,
				fontSize: targetFontSize - (targetFontSize - BASE_FONT_SIZE) * p,
				rotation: 360,
				wiggle: 0,
			};
		}

		return {
			currentX: initialCenter.x,
			currentY: initialCenter.y,
			fontSize: BASE_FONT_SIZE,
			rotation: 0,
			wiggle: 0,
		};
	}, [phase, progress, initialCenter, viewportCenter, targetFontSize]);

	const getEyeChar = (eye: EyeState) => {
		if (mood === "surprised") return eyeChars.wide;
		if (mood === "happy") return eyeChars.squint;
		return eyeChars[eye];
	};

	const mouth = mouthChars[mood];
	const isBrave = mood === "brave";
	const leftEyeChar = getEyeChar("open");
	const rightEyeChar = getEyeChar(rightEye);
	const face = isBrave
		? `\`${mouth}´`
		: `${leftEyeChar}${mouth}${rightEyeChar}`;

	const catBody = `  /\\_/\\
 ( ${face} )
 /     \\`;

	const tailChars = "~~~~~~".split("");

	return (
		<div
			style={{
				position: "fixed",
				left: currentX,
				top: currentY,
				transform: `translate(-50%, -50%) perspective(800px) rotateY(${rotation + wiggle}deg)`,
				transformOrigin: "center center",
				zIndex: 9999,
				pointerEvents: "none",
			}}
		>
			<pre
				className="font-mono leading-tight text-gray-300"
				style={{
					fontSize: `${fontSize}px`,
					lineHeight: 1.2,
					whiteSpace: "pre",
				}}
			>
				<code>{catBody}</code>
				{"\n"}
				<code style={{ letterSpacing: "-0.15em" }}>
					{"   "}
					{tailChars.map((char, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: static array, never reorder
							key={i}
							className="inline-block animate-tail-wave"
							style={{ animationDelay: `${0.6 + i * 0.15}s` }}
						>
							{char}
						</span>
					))}
				</code>
			</pre>
		</div>
	);
}

export function GhostCat() {
	const { phase, progress } = useGhostAnimation();
	const [rightEye, setRightEye] = useState<EyeState>("open");
	const [mood, setMood] = useState<CatMood>("idle");
	const [isSquishing, setIsSquishing] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);

	const catRef = useRef<HTMLButtonElement>(null);
	const initialPositionRef = useRef<InitialPosition | null>(null);

	const moodTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const keyPressRef = useRef({
		count: 0,
		timeout: null as NodeJS.Timeout | null,
	});

	if (phase === "zoomIn" && !initialPositionRef.current && catRef.current) {
		const rect = catRef.current.getBoundingClientRect();
		initialPositionRef.current = {
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
		};
		sounds.ghostApproach();
	}

	if (phase === "idle") {
		initialPositionRef.current = null;
	}

	const triggerSquish = useCallback(() => {
		setIsSquishing(true);
		setTimeout(() => setIsSquishing(false), 150);
	}, []);

	const handleMouseDown = () => setIsSquishing(true);
	const handleMouseUp = () => setIsSquishing(false);

	const setTemporaryMood = useCallback(
		(newMood: CatMood, duration: number = 1000) => {
			if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
			setMood(newMood);
			moodTimeoutRef.current = setTimeout(() => setMood("idle"), duration);
		},
		[],
	);

	const triggerBraveMode = useCallback(() => {
		setTemporaryMood("brave", 1500);
		sounds.meow();
	}, [setTemporaryMood]);

	const handleClick = (e: MouseEvent) => {
		triggerSquish();
		setTemporaryMood("surprised", 400);

		if (e.detail >= 3) {
			triggerBraveMode();
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();

		triggerSquish();
		setTemporaryMood("surprised", 400);

		const kp = keyPressRef.current;
		if (kp.timeout) clearTimeout(kp.timeout);

		kp.count++;
		if (kp.count >= 3) {
			triggerBraveMode();
			kp.count = 0;
		} else {
			kp.timeout = setTimeout(() => {
				kp.count = 0;
			}, 400);
		}
	};

	const handleMouseEnter = () => {
		if (mood === "idle") setMood("happy");
	};

	const handleMouseLeave = () => {
		if (mood === "happy") setMood("idle");
	};

	useEffect(() => {
		if (phase !== "action") return;

		sounds.ghostWink();

		const winkDuration = 400;
		const stepDuration = winkDuration / WINK_SEQUENCE.length;

		const timeouts: NodeJS.Timeout[] = [];
		WINK_SEQUENCE.forEach((eyeState, i) => {
			const timeout = setTimeout(() => setRightEye(eyeState), i * stepDuration);
			timeouts.push(timeout);
		});

		return () => {
			timeouts.forEach(clearTimeout);
			setRightEye("open");
		};
	}, [phase]);

	const isAnimating = phase !== "idle";

	const backdropOpacity = useMemo(() => {
		if (phase === "zoomIn") return progress;
		if (phase === "action") return 1;
		if (phase === "zoomOut") return 1 - progress;
		return 0;
	}, [phase, progress]);

	const getEyeChar = (eye: EyeState) => {
		if (mood === "surprised") return eyeChars.wide;
		if (mood === "happy") return eyeChars.squint;
		return eyeChars[eye];
	};

	const mouth = mouthChars[mood];
	const isBrave = mood === "brave";
	const face = isBrave
		? `\`${mouth}´`
		: `${getEyeChar("open")}${mouth}${getEyeChar("open")}`;

	const catBody = `  /\\_/\\
 ( ${face} )
 /     \\`;
	const tailChars = "~~~~~~".split("");

	return (
		<>
			{isAnimating && (
				<div
					className="fixed inset-0 z-9998 bg-black/85 backdrop-blur-sm transition-opacity"
					style={{ opacity: backdropOpacity }}
					aria-hidden="true"
				/>
			)}

			<div
				className={cn("group mb-6 flex select-none items-center gap-3")}
				style={{ perspective: "800px" }}
			>
				<span className="sr-only">hi, i&apos;m esaú </span>

				<button
					ref={catRef}
					type="button"
					onClick={handleClick}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onKeyDown={handleKeyDown}
					className={cn(
						"relative cursor-pointer text-left font-mono text-sm leading-tight text-gray-500 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-gray-300",
					)}
					style={{
						visibility: isAnimating ? "hidden" : "visible",
						perspective: "800px",
					}}
					aria-label="hi, i'm esaú - click to interact"
				>
					<pre
						className={cn(
							"will-change-transform transition-transform duration-150 animate-ghostty-entry",
							isSquishing && "scale-y-90 scale-x-110",
						)}
					>
						<code>{catBody}</code>
						{"\n"}
						<code style={{ letterSpacing: "-0.15em" }}>
							{"   "}
							{tailChars.map((char, i) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: static array, never reorder
									key={i}
									className="inline-block animate-tail-wave"
									style={{ animationDelay: `${0.6 + i * 0.15}s` }}
								>
									{char}
								</span>
							))}
						</code>
					</pre>
				</button>

				<span
					className={cn(
						"ml-auto flex items-center gap-1 whitespace-nowrap text-sm text-gray-600 transition-opacity",
						isAnimating && "opacity-0",
					)}
				>
					<ArrowLeftIcon size={14} />
					hi, i&apos;m esaú [ee-saw]
					<button
						type="button"
						onClick={() =>
							pronounceName(
								() => setIsSpeaking(true),
								() => setIsSpeaking(false),
							)
						}
						className={cn(
							"ml-1 cursor-pointer text-gray-600 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-gray-300",
						)}
						aria-label="Pronounce my name"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
							aria-hidden="true"
						>
							<path d={SpeakerHighPaths.speaker} />
							<path
								d={SpeakerHighPaths.wave1}
								className={cn(
									"origin-center transition-opacity",
									isSpeaking && "animate-[fadeInOut_1.2s_ease-in-out_infinite]",
								)}
								style={{ animationDelay: "0.2s" }}
							/>
							<path
								d={SpeakerHighPaths.wave2}
								className={cn(
									"origin-center transition-opacity",
									isSpeaking && "animate-[fadeInOut_1.2s_ease-in-out_infinite]",
								)}
								style={{ animationDelay: "0.4s" }}
							/>
						</svg>
					</button>
				</span>
			</div>

			{typeof window !== "undefined" &&
				isAnimating &&
				initialPositionRef.current &&
				createPortal(
					<AnimatedCatOverlay
						initialPosition={initialPositionRef.current}
						phase={phase as "zoomIn" | "action" | "zoomOut"}
						progress={progress}
						rightEye={rightEye}
						mood={mood}
					/>,
					document.body,
				)}
		</>
	);
}
