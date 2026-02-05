"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoContext } from "@/components/mdx/demo";
import { cn } from "@/utils/classNames";

type PlaybackStatus = "idle" | "playing" | "complete";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 160;
const BAR_COUNT = 64;
const FREQUENCY_LABELS = ["0", "2kHz", "4kHz", "6kHz", "8kHz", "10kHz"];
const LERP_FACTOR_NORMAL = 0.15;
const LERP_FACTOR_SLOW = 0.04;
const MAX_FREQ = 10000;

const createNoiseBuffer = (
	ctx: AudioContext,
	duration: number,
): AudioBuffer => {
	const sampleRate = ctx.sampleRate;
	const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) {
		data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 40);
	}
	return buffer;
};

const lerp = (current: number, target: number, factor: number): number => {
	return current + (target - current) * factor;
};

export const Spectrogram = () => {
	const { slowMode, debugMode, restartKey } = useDemoContext();

	const [status, setStatus] = useState<PlaybackStatus>("idle");
	const [peakFrequency, setPeakFrequency] = useState<number | null>(null);
	const [frequencyData, setFrequencyData] = useState<number[] | null>(null);

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<AudioBufferSourceNode | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafIdRef = useRef<number | null>(null);
	const displayedBarsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
	const peakBarIndexRef = useRef<number | null>(null);
	const isPlayingRef = useRef(false);

	const drawBars = useCallback(
		(ctx: CanvasRenderingContext2D, peakBarIndex: number | null) => {
			ctx.fillStyle = "rgb(9, 9, 11)";
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			const barWidth = CANVAS_WIDTH / BAR_COUNT - 1;
			const bars = displayedBarsRef.current;

			for (let i = 0; i < BAR_COUNT; i++) {
				const value = bars[i];
				const barHeight = (value / 255) * CANVAS_HEIGHT;

				const isPeakBar = peakBarIndex !== null && i === peakBarIndex;
				const intensity = Math.floor(40 + (value / 255) * 120);

				if (isPeakBar) {
					ctx.fillStyle = `rgb(${Math.floor(200 + (value / 255) * 55)}, ${Math.floor(120 + (value / 255) * 60)}, 50)`;
				} else {
					ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
				}

				const x = i * (barWidth + 1);
				ctx.fillRect(x, CANVAS_HEIGHT - barHeight, barWidth, barHeight);
			}
		},
		[],
	);

	const stopVisualization = useCallback(() => {
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
		isPlayingRef.current = false;
	}, []);

	const startVisualization = useCallback(() => {
		const analyser = analyserRef.current;
		const canvas = canvasRef.current;
		const audioCtx = audioContextRef.current;
		if (!analyser || !canvas || !audioCtx) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dataArray = new Uint8Array(analyser.frequencyBinCount);
		const sampleRate = audioCtx.sampleRate;
		const lerpFactor = slowMode ? LERP_FACTOR_SLOW : LERP_FACTOR_NORMAL;
		isPlayingRef.current = true;

		const draw = () => {
			if (!isPlayingRef.current) {
				drawBars(ctx, peakBarIndexRef.current);
				return;
			}

			analyser.getByteFrequencyData(dataArray);

			const nyquist = sampleRate / 2;
			const rawBars: number[] = [];

			for (let i = 0; i < BAR_COUNT; i++) {
				const freq = (i / BAR_COUNT) * MAX_FREQ;
				const binIndex = Math.floor((freq / nyquist) * dataArray.length);
				const value = dataArray[Math.min(binIndex, dataArray.length - 1)] || 0;
				rawBars.push(value);
			}

			const maxRawValue = Math.max(...rawBars, 1);
			const targetBars = rawBars.map((v) =>
				Math.min(255, (v / maxRawValue) * 255 * 1.1),
			);

			let peakBarIdx = 0;
			let peakBarValue = 0;
			for (let i = 0; i < BAR_COUNT; i++) {
				displayedBarsRef.current[i] = lerp(
					displayedBarsRef.current[i],
					targetBars[i],
					lerpFactor,
				);
				if (displayedBarsRef.current[i] > peakBarValue) {
					peakBarValue = displayedBarsRef.current[i];
					peakBarIdx = i;
				}
			}

			if (peakBarValue > 10) {
				peakBarIndexRef.current = peakBarIdx;
				const peakHz = Math.round((peakBarIdx / BAR_COUNT) * MAX_FREQ);
				if (peakHz > 100) {
					setPeakFrequency(peakHz);
				}
			}

			drawBars(ctx, peakBarIndexRef.current);
			setFrequencyData([...displayedBarsRef.current]);

			rafIdRef.current = requestAnimationFrame(draw);
		};

		rafIdRef.current = requestAnimationFrame(draw);
	}, [drawBars, slowMode]);

	const handlePlay = useCallback(() => {
		if (status === "playing") return;

		const ctx = audioContextRef.current || new AudioContext();
		audioContextRef.current = ctx;

		if (ctx.state === "suspended") {
			ctx.resume();
		}

		const analyser = ctx.createAnalyser();
		analyser.fftSize = 512;
		analyser.smoothingTimeConstant = 0.5;

		const master = ctx.createGain();
		master.gain.value = 1.0;
		master.connect(analyser);
		analyser.connect(ctx.destination);

		analyserRef.current = analyser;

		const playTick = (startTime: number, freq: number, gain: number) => {
			const noise = ctx.createBufferSource();
			noise.buffer = createNoiseBuffer(ctx, 0.012);
			noise.playbackRate.value = slowMode ? 0.25 : 1.0;

			const bp = ctx.createBiquadFilter();
			bp.type = "bandpass";
			bp.frequency.value = freq;
			bp.Q.value = 2.5;

			const g = ctx.createGain();
			g.gain.setValueAtTime(gain, startTime);
			g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.012);

			noise.connect(bp).connect(g).connect(master);
			noise.start(startTime);

			return noise;
		};

		const t = ctx.currentTime;
		const upDelay = slowMode ? 0.6 : 0.08;

		playTick(t, 4500, 0.35);
		const secondTick = playTick(t + upDelay, 5500, 0.25);

		sourceRef.current = secondTick;

		setStatus("playing");
		startVisualization();

		secondTick.onended = () => {
			setStatus("complete");
			stopVisualization();
		};
	}, [status, slowMode, startVisualization, stopVisualization]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: restartKey triggers reset
	useEffect(() => {
		try {
			sourceRef.current?.stop();
		} catch {}
		stopVisualization();
		setStatus("idle");
		setPeakFrequency(null);
		setFrequencyData(null);
		displayedBarsRef.current = new Array(BAR_COUNT).fill(0);
		peakBarIndexRef.current = null;

		const canvas = canvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				drawBars(ctx, null);
			}
		}
	}, [restartKey, stopVisualization, drawBars]);

	// Note: slowMode changes require restart since we use real-time bandpass filters

	useEffect(() => {
		return () => {
			stopVisualization();
			audioContextRef.current?.close();
		};
	}, [stopVisualization]);

	return (
		<div className="relative w-full max-w-md overflow-x-auto sm:overflow-visible">
			<div className="border border-gray-800 bg-gray-950 min-w-[400px]">
				{peakFrequency !== null && (
					<div className="absolute right-3 top-3 bg-gray-950/80 px-2 py-1 font-mono text-xs tabular-nums text-gray-500 backdrop-blur-sm">
						peak: {peakFrequency} Hz
					</div>
				)}

				<div className="flex items-center justify-center">
					<canvas
						ref={canvasRef}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						aria-label={`Frequency spectrogram. Peak: ${peakFrequency ?? "none"} Hz`}
					/>
				</div>

				<div
					className="mx-auto flex justify-between py-1.5 font-mono text-[10px] text-gray-600"
					style={{ width: CANVAS_WIDTH }}
				>
					{FREQUENCY_LABELS.map((label) => (
						<span key={label}>{label}</span>
					))}
				</div>

				<div className="flex items-center justify-center border-t border-gray-800 py-2">
					<button
						type="button"
						onClick={handlePlay}
						disabled={status === "playing"}
						className={cn(
							"text-xs transition-colors focus:outline-none",
							status === "playing"
								? "cursor-not-allowed text-gray-700"
								: "text-gray-600 hover:text-white focus-visible:text-white",
						)}
						aria-label={
							status === "playing" ? "Audio playing" : "Play click sound"
						}
					>
						[play click]
					</button>
				</div>
			</div>

			<AnimatePresence>
				{debugMode && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 border border-gray-800 bg-gray-900/90 p-4 font-mono text-[11px]"
					>
						<div className="space-y-1">
							<div className="text-gray-400">
								status: <span className="text-gray-500">{status}</span>
							</div>
							<div className="text-gray-400">
								playbackRate:{" "}
								<span className="text-gray-500">
									{slowMode ? "0.25x" : "1.0x"}
								</span>
							</div>
							<div className="text-gray-400">
								fftSize: <span className="text-gray-500">512</span>
							</div>
							<div className="text-gray-400">
								peakFreq:{" "}
								<span className="text-gray-500">
									{peakFrequency ?? "--"} Hz
								</span>
							</div>
							<div className="text-gray-400">
								binCount:{" "}
								<span className="text-gray-500">
									{analyserRef.current?.frequencyBinCount ?? "--"}
								</span>
							</div>
							<div className="mt-3 border-t border-gray-800 pt-2">
								<div className="text-gray-600">frequency bins (first 32)</div>
								<div className="mt-1 flex gap-px">
									{frequencyData?.slice(0, 32).map((v, i) => {
										const intensity = 40 + (v / 255) * 100;
										return (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: static array, never reorder
												key={i}
												className="w-1.5"
												style={{
													height: `${Math.max(2, (v / 255) * 40)}px`,
													backgroundColor: `rgb(${intensity}, ${intensity}, ${intensity})`,
												}}
											/>
										);
									})}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
