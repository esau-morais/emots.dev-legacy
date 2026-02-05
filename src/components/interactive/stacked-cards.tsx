"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useDemoContext } from "@/components/mdx/demo";
import { cn } from "@/utils/classNames";

const cards = [
	{ id: 1, label: "First", color: "bg-gray-900" },
	{ id: 2, label: "Second", color: "bg-gray-800" },
	{ id: 3, label: "Third", color: "bg-gray-700" },
];

export const StackedCards = () => {
	const { slowMode, debugMode, autoScroll, restartKey } = useDemoContext();
	const scrollRef = useRef<HTMLDivElement>(null);
	const autoRef = useRef<number | null>(null);
	const [scrollProgress, setScrollProgress] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: restartKey triggers reset
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = 0;
			setScrollProgress(0);
		}
	}, [restartKey]);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		const maxScroll = el.scrollHeight - el.clientHeight;
		setScrollProgress(maxScroll > 0 ? el.scrollTop / maxScroll : 0);
	};

	useEffect(() => {
		if (!autoScroll) {
			if (autoRef.current) cancelAnimationFrame(autoRef.current);
			return;
		}

		let direction = 1;
		const speed = slowMode ? 0.25 : 3;

		const animate = () => {
			const el = scrollRef.current;
			if (!el) return;
			const maxScroll = el.scrollHeight - el.clientHeight;
			el.scrollTop += speed * direction;
			if (el.scrollTop >= maxScroll) direction = -1;
			else if (el.scrollTop <= 0) direction = 1;
			autoRef.current = requestAnimationFrame(animate);
		};

		autoRef.current = requestAnimationFrame(animate);
		return () => {
			if (autoRef.current) cancelAnimationFrame(autoRef.current);
		};
	}, [autoScroll, slowMode]);

	const percent = Math.round(scrollProgress * 100);

	return (
		<div className="flex w-full items-center justify-center gap-6">
			<div className="relative">
				{/* Scroll container - always present */}
				<div
					id="stacked-cards-viewport"
					ref={scrollRef}
					onScroll={handleScroll}
					className="relative h-48 w-48 sm:h-64 sm:w-64 overflow-y-auto border border-gray-800 bg-black"
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "#404040 #171717",
					}}
				>
					<div className="relative" style={{ height: "540px", padding: "8px" }}>
						{cards.map((card, index) => (
							<div
								key={card.id}
								className={cn("sticky border border-gray-700", card.color)}
								style={{
									top: `${8 + index * 4}px`,
									height: "100px",
									marginBottom: "40px",
									zIndex: index,
									opacity: debugMode ? 0 : 1,
									transition: "opacity 0.2s",
								}}
							>
								<div className="flex h-full items-center justify-center text-gray-400">
									{card.label}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Debug 3D overlay */}
				<AnimatePresence>
					{debugMode && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="pointer-events-none absolute inset-0 flex items-center justify-center"
							style={{ perspective: "600px" }}
						>
							<div
								style={{
									transform: "rotateX(-20deg) rotateY(25deg)",
									transformStyle: "preserve-3d",
								}}
							>
								{cards.map((card, index) => {
									const t = scrollProgress;
									const baseY = index * 70;
									const stackedY = index * 4;
									const y = baseY * (1 - t) + stackedY * t;
									const z = index * 20;
									return (
										<div
											key={card.id}
											className={cn(
												"absolute border border-gray-700",
												card.color,
											)}
											style={{
												width: "120px",
												height: "70px",
												left: "-60px",
												top: "-35px",
												transform: `translateY(${y}px) translateZ(${z}px)`,
												zIndex: index,
											}}
										>
											<div className="flex h-full items-center justify-center text-sm text-gray-400">
												{card.label}
											</div>
										</div>
									);
								})}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Scroll hint */}
				{percent === 0 && !debugMode && (
					<div
						className="absolute -right-16 top-1/2 -translate-y-1/2 text-gray-600"
						aria-hidden="true"
					>
						<svg
							width="48"
							height="48"
							viewBox="0 0 48 48"
							fill="none"
							className="rotate-180"
							aria-hidden="true"
						>
							<title>Scroll hint arrow</title>
							<path
								d="M8 24C8 24 16 8 32 12"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
							<path
								d="M28 6L32 12L26 16"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px]">
							scroll
						</span>
					</div>
				)}
			</div>

			{/* Info panel - animated width transition */}
			<motion.div
				animate={{ width: debugMode ? 160 : 32 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="shrink-0 overflow-hidden"
			>
				{debugMode ? (
					<div className="w-40 space-y-2 border border-gray-800 bg-gray-900/60 px-3 py-2 font-mono text-[11px]">
						<div className="text-gray-400">position: sticky</div>
						<div className="text-gray-400">top: 8px</div>
						<div className="border-t border-gray-800 pt-2 text-gray-400">
							scroll:{" "}
							<span
								role="scrollbar"
								tabIndex={-1}
								aria-controls="stacked-cards-viewport"
								aria-valuenow={percent}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-orientation="vertical"
								aria-label="Scroll progress"
								className="tabular-nums text-gray-600"
							>
								{percent}%
							</span>
						</div>
					</div>
				) : (
					<div
						role="scrollbar"
						tabIndex={-1}
						aria-controls="stacked-cards-viewport"
						aria-valuenow={percent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-orientation="vertical"
						aria-label="Scroll progress"
						className="font-mono text-[10px] tabular-nums text-gray-600"
					>
						{percent}%
					</div>
				)}
			</motion.div>
		</div>
	);
};
