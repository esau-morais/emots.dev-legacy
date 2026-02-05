"use client";

import {
	FastForwardIcon,
	PauseIcon,
	PlayIcon,
	RewindIcon,
	SpeakerHighIcon,
	SpeakerSlashIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGhostAnimation } from "@/contexts/ghost-animation";
import { cn } from "@/utils/classNames";

function DiamondIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M5 0L10 5L5 10L0 5L5 0Z"
				fill={filled ? "currentColor" : "none"}
				stroke="currentColor"
				strokeWidth="1"
			/>
		</svg>
	);
}

import { useNarrationStore } from "./store";
import { useNarrationKeyboard } from "./use-keyboard";

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function NarrationPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const playPromiseRef = useRef<Promise<void> | null>(null);
	const wasPlayingRef = useRef(false);
	const {
		isVisible,
		isPlaying,
		audioUrl,
		currentTime,
		duration,
		volume,
		playbackRate,
		isMuted,
		followAlong,
		setPlaying,
		setCurrentTime,
		setDuration,
		setVolume,
		setPlaybackRate,
		setMuted,
		setFollowAlong,
		close,
		metadata,
	} = useNarrationStore();
	const [isBuffering, setIsBuffering] = useState(false);

	const { phase } = useGhostAnimation();
	const isGhostAnimating = phase !== "idle";

	useNarrationKeyboard(audioRef);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !audioUrl) return;

		const onLoadedMetadata = () => setDuration(audio.duration);
		const onEnded = () => setPlaying(false);
		const onWaiting = () => setIsBuffering(true);
		const onCanPlay = () => setIsBuffering(false);

		audio.addEventListener("loadedmetadata", onLoadedMetadata);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("waiting", onWaiting);
		audio.addEventListener("canplay", onCanPlay);
		audio.load();

		return () => {
			audio.removeEventListener("loadedmetadata", onLoadedMetadata);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("waiting", onWaiting);
			audio.removeEventListener("canplay", onCanPlay);
		};
	}, [audioUrl, setDuration, setPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !audioUrl) return;

		const safePlay = async () => {
			if (playPromiseRef.current) {
				try {
					await playPromiseRef.current;
				} catch {}
			}
			playPromiseRef.current = audio.play();
			playPromiseRef.current.catch(() => setPlaying(false));
		};

		const safePause = async () => {
			if (playPromiseRef.current) {
				try {
					await playPromiseRef.current;
				} catch {}
			}
			audio.pause();
			playPromiseRef.current = null;
		};

		if (isPlaying) {
			safePlay();
		} else {
			safePause();
		}
	}, [isPlaying, audioUrl, setPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !isPlaying) return;

		let rafId: number;
		const tick = () => {
			setCurrentTime(audio.currentTime);
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [isPlaying, setCurrentTime]);

	const skip = useCallback(
		(seconds: number) => {
			const audio = audioRef.current;
			if (!audio) return;
			const newTime = Math.max(
				0,
				Math.min(audio.duration, audio.currentTime + seconds),
			);
			audio.currentTime = newTime;
			setCurrentTime(newTime);
		},
		[setCurrentTime],
	);

	useEffect(() => {
		if (!("mediaSession" in navigator) || !metadata) return;

		const title = metadata.slug
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		navigator.mediaSession.metadata = new MediaMetadata({
			title,
			artist: "Esau Morais",
			album: "emots.dev",
			artwork: [
				{
					src: `/blog/${metadata.slug}/opengraph-image`,
					sizes: "1200x630",
					type: "image/png",
				},
			],
		});

		navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
		navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
		navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
		navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
		navigator.mediaSession.setActionHandler("stop", close);
		navigator.mediaSession.setActionHandler("seekto", (details) => {
			const audio = audioRef.current;
			if (audio && details.seekTime != null) {
				audio.currentTime = details.seekTime;
			}
		});

		return () => {
			navigator.mediaSession.metadata = null;
			navigator.mediaSession.setActionHandler("play", null);
			navigator.mediaSession.setActionHandler("pause", null);
			navigator.mediaSession.setActionHandler("seekbackward", null);
			navigator.mediaSession.setActionHandler("seekforward", null);
			navigator.mediaSession.setActionHandler("stop", null);
			navigator.mediaSession.setActionHandler("seekto", null);
		};
	}, [metadata, setPlaying, skip, close]);

	useEffect(() => {
		if (!("mediaSession" in navigator) || !duration) return;
		navigator.mediaSession.setPositionState({
			duration,
			playbackRate,
			position: currentTime,
		});
	}, [currentTime, duration, playbackRate]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.volume = isMuted ? 0 : volume;
	}, [volume, isMuted]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.playbackRate = playbackRate;
	}, [playbackRate]);

	const progressRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const seekToPosition = useCallback(
		(clientX: number) => {
			const audio = audioRef.current;
			const progress = progressRef.current;
			if (!audio || !progress || !audio.duration) return;
			const rect = progress.getBoundingClientRect();
			const percent = Math.max(
				0,
				Math.min(1, (clientX - rect.left) / rect.width),
			);
			const newTime = percent * audio.duration;
			audio.currentTime = newTime;
			setCurrentTime(newTime);
		},
		[setCurrentTime],
	);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			wasPlayingRef.current = isPlaying;
			if (isPlaying) setPlaying(false);
			setIsDragging(true);
			seekToPosition(e.clientX);
		},
		[seekToPosition, isPlaying, setPlaying],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging) return;
			seekToPosition(e.clientX);
		},
		[isDragging, seekToPosition],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent) => {
			e.currentTarget.releasePointerCapture(e.pointerId);
			setIsDragging(false);
			if (wasPlayingRef.current) setPlaying(true);
		},
		[setPlaying],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case " ":
					e.preventDefault();
					setPlaying(!isPlaying);
					break;
				case "ArrowLeft":
					e.preventDefault();
					skip(-5);
					break;
				case "ArrowRight":
					e.preventDefault();
					skip(5);
					break;
			}
		},
		[skip, isPlaying, setPlaying],
	);

	return (
		<div
			className={cn(
				"fixed inset-x-0 bottom-0 z-50 border-t border-gray-800 bg-black/95 backdrop-blur-sm transition-transform duration-300 ease-out",
				isVisible && audioUrl && !isGhostAnimating
					? "translate-y-0"
					: "translate-y-full",
			)}
		>
			{/* biome-ignore lint/a11y/useMediaCaption: audio narration doesn't require captions */}
			{audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

			<div
				ref={progressRef}
				className={cn(
					"group relative h-1 bg-gray-800 touch-none select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50",
					isDragging ? "cursor-grabbing" : "cursor-grab",
				)}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onKeyDown={handleKeyDown}
				role="slider"
				aria-label="Seek"
				aria-valuenow={currentTime}
				aria-valuemin={0}
				aria-valuemax={duration}
				tabIndex={0}
			>
				<div
					className="pointer-events-none absolute inset-y-0 left-0 bg-gray-400 transition-colors group-hover:bg-white"
					style={{
						width: `${duration && Number.isFinite(duration) ? (currentTime / duration) * 100 : 0}%`,
					}}
				/>
			</div>

			<div
				className="flex h-12 sm:h-14 items-center justify-between px-4"
				style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
			>
				<div className="flex items-center gap-2 sm:gap-4">
					<button
						type="button"
						onClick={() => skip(-15)}
						className="flex size-8 items-center justify-center text-gray-500 transition-colors duration-150 hover:text-white focus-visible:text-white focus:outline-none"
						aria-label="Rewind 15 seconds"
					>
						<RewindIcon size={16} />
					</button>

					<button
						type="button"
						onClick={() => setPlaying(!isPlaying)}
						className="group relative flex size-8 items-center justify-center bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						<span
							className={cn(
								"transition-transform duration-150 group-hover:scale-105 group-active:scale-95",
								isBuffering && isPlaying && "opacity-0",
							)}
						>
							{isPlaying ? (
								<PauseIcon size={16} weight="fill" />
							) : (
								<PlayIcon size={16} weight="fill" />
							)}
						</span>
						{isBuffering && isPlaying && (
							<div className="absolute inset-0 flex items-center justify-center rounded-full">
								<div className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
							</div>
						)}
					</button>

					<button
						type="button"
						onClick={() => skip(15)}
						className="flex size-8 items-center justify-center text-gray-500 transition-colors duration-150 hover:text-white focus-visible:text-white focus:outline-none"
						aria-label="Forward 15 seconds"
					>
						<FastForwardIcon size={16} />
					</button>

					<span className="tabular-nums text-sm text-gray-500">
						{formatTime(currentTime)} /{" "}
						{formatTime(duration || metadata?.duration || 0)}
					</span>
				</div>

				<button
					type="button"
					onClick={() => setFollowAlong(!followAlong)}
					className={cn(
						"flex items-center gap-2 text-sm transition-colors duration-150 focus:outline-none",
						followAlong
							? "text-white"
							: "text-gray-500 hover:text-white focus-visible:text-white",
					)}
					aria-label={
						followAlong ? "Disable follow along" : "Enable follow along"
					}
					aria-pressed={followAlong}
				>
					<DiamondIcon filled={followAlong} />
					<span className="hidden sm:inline">follow along</span>
				</button>

				<div className="flex items-center gap-2 sm:gap-4">
					<button
						type="button"
						onClick={() => setMuted(!isMuted)}
						className="flex size-8 items-center justify-center text-gray-500 transition-colors duration-150 hover:text-white focus-visible:text-white focus:outline-none"
						aria-label={isMuted ? "Unmute" : "Mute"}
					>
						{isMuted ? (
							<SpeakerSlashIcon size={16} />
						) : (
							<SpeakerHighIcon size={16} />
						)}
					</button>

					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={isMuted ? 0 : volume}
						onChange={(e) => {
							setVolume(Number(e.target.value));
							if (isMuted) setMuted(false);
						}}
						className="hidden sm:block h-1 w-16 cursor-pointer appearance-none bg-gray-800 accent-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
						aria-label="Volume"
					/>

					<select
						value={playbackRate}
						onChange={(e) => setPlaybackRate(Number(e.target.value))}
						className="hidden sm:block appearance-none bg-transparent text-sm text-gray-500 hover:text-white focus-visible:text-white focus:outline-none cursor-pointer"
						aria-label="Playback speed"
					>
						{PLAYBACK_RATES.map((rate) => (
							<option key={rate} value={rate} className="bg-black">
								{rate}x
							</option>
						))}
					</select>

					<button
						type="button"
						onClick={close}
						className="flex size-8 items-center justify-center text-gray-500 transition-colors duration-150 hover:text-white focus-visible:text-white focus:outline-none"
						aria-label="Close player"
					>
						<XIcon size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}
