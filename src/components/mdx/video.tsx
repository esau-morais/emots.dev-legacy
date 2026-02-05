"use client";

import {
	CornersOutIcon,
	PauseIcon,
	PlayIcon,
	SpeakerHighIcon,
	SpeakerLowIcon,
	SpeakerSlashIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/classNames";

interface VideoProps {
	src: string;
	poster: string;
	alt?: string;
}

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function Video({ src, poster, alt }: VideoProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [showOverlay, setShowOverlay] = useState(true);
	const [isDragging, setIsDragging] = useState(false);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [playbackRate, setPlaybackRate] = useState(1);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const updateDuration = () => {
			if (video.duration && Number.isFinite(video.duration)) {
				setDuration(video.duration);
			}
		};
		const onEnded = () => {
			setIsPlaying(false);
			setShowOverlay(true);
		};
		const onPlay = () => {
			setIsPlaying(true);
			setShowOverlay(false);
		};
		const onPause = () => {
			setIsPlaying(false);
			setShowOverlay(true);
		};

		video.addEventListener("loadedmetadata", updateDuration);
		video.addEventListener("durationchange", updateDuration);
		video.addEventListener("ended", onEnded);
		video.addEventListener("play", onPlay);
		video.addEventListener("pause", onPause);

		if (video.readyState >= 1) updateDuration();

		return () => {
			video.removeEventListener("loadedmetadata", updateDuration);
			video.removeEventListener("durationchange", updateDuration);
			video.removeEventListener("ended", onEnded);
			video.removeEventListener("play", onPlay);
			video.removeEventListener("pause", onPause);
			video.pause();
		};
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video || !isPlaying) return;

		let rafId: number;
		const tick = () => {
			setCurrentTime(video.currentTime);
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [isPlaying]);

	useEffect(() => {
		const video = videoRef.current;
		if (video) video.volume = isMuted ? 0 : volume;
	}, [volume, isMuted]);

	useEffect(() => {
		const video = videoRef.current;
		if (video) video.playbackRate = playbackRate;
	}, [playbackRate]);

	const togglePlay = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		if (video.paused) {
			video.play().catch(() => setIsPlaying(false));
		} else {
			video.pause();
		}
	}, []);

	const toggleFullscreen = useCallback(() => {
		const container = containerRef.current;
		const video = videoRef.current;
		if (!container) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else if (container.requestFullscreen) {
			container.requestFullscreen();
		} else if (video && "webkitEnterFullscreen" in video) {
			(
				video as HTMLVideoElement & { webkitEnterFullscreen: () => void }
			).webkitEnterFullscreen();
		}
	}, []);

	const seekToPosition = useCallback((clientX: number) => {
		const video = videoRef.current;
		const progress = progressRef.current;
		if (!video || !progress || !video.duration) return;

		const rect = progress.getBoundingClientRect();
		const percent = Math.max(
			0,
			Math.min(1, (clientX - rect.left) / rect.width),
		);
		video.currentTime = percent * video.duration;
		setCurrentTime(video.currentTime);
	}, []);

	const seekRelative = useCallback((delta: number) => {
		const video = videoRef.current;
		if (!video || !video.duration) return;
		video.currentTime = Math.max(
			0,
			Math.min(video.duration, video.currentTime + delta),
		);
		setCurrentTime(video.currentTime);
	}, []);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			setIsDragging(true);
			seekToPosition(e.clientX);
		},
		[seekToPosition],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging) return;
			seekToPosition(e.clientX);
		},
		[isDragging, seekToPosition],
	);

	const handlePointerUp = useCallback((e: React.PointerEvent) => {
		e.currentTarget.releasePointerCapture(e.pointerId);
		setIsDragging(false);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case " ":
				case "Enter":
					e.preventDefault();
					togglePlay();
					break;
				case "f":
					e.preventDefault();
					toggleFullscreen();
					break;
				case "m":
					e.preventDefault();
					setIsMuted((m) => !m);
					break;
				case "ArrowLeft":
					e.preventDefault();
					seekRelative(-5);
					break;
				case "ArrowRight":
					e.preventDefault();
					seekRelative(5);
					break;
				case "ArrowUp":
					e.preventDefault();
					seekRelative(10);
					break;
				case "ArrowDown":
					e.preventDefault();
					seekRelative(-10);
					break;
			}
		},
		[togglePlay, toggleFullscreen, seekRelative],
	);

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	const VolumeIcon =
		isMuted || volume === 0
			? SpeakerSlashIcon
			: volume < 0.5
				? SpeakerLowIcon
				: SpeakerHighIcon;

	return (
		<figure className="my-6" data-narration-skip>
			<section
				ref={containerRef}
				className="group relative border border-gray-800 bg-black aspect-video overflow-hidden focus:outline-none"
				onKeyDown={handleKeyDown}
				tabIndex={0}
				aria-label={alt ?? "Video player"}
			>
				{/* biome-ignore lint/a11y/useMediaCaption: narration doesn't require captions */}
				<video
					ref={videoRef}
					src={src}
					poster={poster}
					preload="metadata"
					playsInline
					onClick={togglePlay}
					className="absolute inset-0 size-full object-contain cursor-pointer"
				/>

				{showOverlay && (
					<button
						type="button"
						onClick={togglePlay}
						className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm"
						aria-label="Play video"
					>
						<span className="flex size-16 items-center justify-center bg-white/10 backdrop-blur-md transition-transform hover:scale-105 active:scale-95">
							<PlayIcon size={32} weight="fill" className="text-white" />
						</span>
					</button>
				)}

				<div
					className={cn(
						"absolute inset-x-0 bottom-0 z-20 bg-black/95 backdrop-blur-sm transition-opacity",
						isPlaying && !showOverlay
							? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
							: "opacity-100",
					)}
				>
					<div
						ref={progressRef}
						className={cn(
							"group/progress relative h-1 bg-gray-800 touch-none select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50",
							isDragging ? "cursor-grabbing" : "cursor-pointer",
						)}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						onKeyDown={handleKeyDown}
						role="slider"
						tabIndex={0}
						aria-label="Video progress"
						aria-valuenow={currentTime}
						aria-valuemin={0}
						aria-valuemax={duration}
					>
						<div
							className="pointer-events-none absolute inset-y-0 left-0 bg-gray-400 transition-colors group-hover/progress:bg-white"
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="flex h-10 items-center justify-between px-3">
						<div className="flex items-center gap-2 sm:gap-4">
							<button
								type="button"
								onClick={togglePlay}
								className="flex size-8 items-center justify-center text-gray-500 transition-colors hover:text-white focus-visible:text-white focus:outline-none"
								aria-label={isPlaying ? "Pause" : "Play"}
							>
								{isPlaying ? (
									<PauseIcon size={16} weight="fill" />
								) : (
									<PlayIcon size={16} weight="fill" />
								)}
							</button>

							<button
								type="button"
								onClick={() => setIsMuted((m) => !m)}
								className="flex size-8 items-center justify-center text-gray-500 transition-colors hover:text-white focus-visible:text-white focus:outline-none"
								aria-label={isMuted ? "Unmute" : "Mute"}
							>
								<VolumeIcon size={16} />
							</button>

							<input
								type="range"
								min={0}
								max={1}
								step={0.01}
								value={isMuted ? 0 : volume}
								onChange={(e) => {
									setVolume(Number(e.target.value));
									if (isMuted) setIsMuted(false);
								}}
								className="hidden sm:block h-1 w-16 cursor-pointer appearance-none bg-gray-800 accent-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
								aria-label="Volume"
							/>

							<span className="tabular-nums text-sm text-gray-500">
								{formatTime(currentTime)} / {formatTime(duration)}
							</span>
						</div>

						<div className="flex items-center gap-2 sm:gap-4">
							<select
								value={playbackRate}
								onChange={(e) => setPlaybackRate(Number(e.target.value))}
								className="hidden sm:block w-10 appearance-none bg-transparent text-center text-sm text-gray-500 hover:text-white focus-visible:text-white focus:outline-none cursor-pointer"
								aria-label="Playback speed"
							>
								{PLAYBACK_RATES.map((rate) => (
									<option
										key={rate}
										value={rate}
										className="bg-black text-white"
									>
										{rate}x
									</option>
								))}
							</select>

							<button
								type="button"
								onClick={toggleFullscreen}
								className="flex size-8 items-center justify-center text-gray-500 transition-colors hover:text-white focus-visible:text-white focus:outline-none"
								aria-label="Toggle fullscreen"
							>
								<CornersOutIcon size={16} />
							</button>
						</div>
					</div>
				</div>
			</section>

			{alt && (
				<figcaption className="mt-2 text-center text-sm text-gray-500">
					{alt}
				</figcaption>
			)}
		</figure>
	);
}
