"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoContext } from "@/components/mdx/demo";

const GlowingCardDebug = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mousePos, setMousePos] = useState({ x: 90, y: 110 });

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			setMousePos({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		};

		container.addEventListener("mousemove", handleMouseMove);
		return () => container.removeEventListener("mousemove", handleMouseMove);
	}, []);

	const layers = [
		{ name: "::before", z: 100 },
		{ name: "content", z: 50 },
		{ name: "::after", z: 0 },
	];

	return (
		<div className="flex items-start gap-12">
			<div
				ref={containerRef}
				className="relative cursor-crosshair"
				style={{ perspective: "600px", width: "260px", height: "320px" }}
			>
				<div
					className="absolute left-1/2 top-1/2"
					style={{
						transform: "translate(-50%, -50%) rotateX(-20deg) rotateY(25deg)",
						transformStyle: "preserve-3d",
					}}
				>
					{layers.map((layer) => (
						<div
							key={layer.name}
							className="absolute border bg-gray-950"
							style={{
								width: "160px",
								height: "200px",
								left: "-80px",
								top: "-100px",
								transform: `translateZ(${layer.z}px)`,
								borderColor:
									layer.name === "content"
										? "var(--color-gray-800)"
										: "var(--color-gray-700)",
								borderStyle: layer.name === "content" ? "solid" : "dashed",
								background:
									layer.name === "::before"
										? `radial-gradient(150px circle at ${mousePos.x - 60}px ${mousePos.y - 60}px, rgba(255,255,255,0.1), transparent 60%)`
										: layer.name === "::after"
											? `radial-gradient(120px circle at ${mousePos.x - 60}px ${mousePos.y - 60}px, rgba(255,255,255,0.3), transparent 60%)`
											: "var(--color-gray-950)",
							}}
						>
							{layer.name === "content" && (
								<div className="flex h-full items-center justify-center">
									<span className="text-sm text-gray-400">Card</span>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
			<div className="shrink-0 space-y-2 border border-gray-800 bg-gray-900/60 px-3 py-2 font-mono text-[11px]">
				<div className="text-gray-400">::before</div>
				<div className="text-gray-400">content</div>
				<div className="text-gray-400">::after</div>
				<div className="border-t border-gray-800 pt-2 text-gray-600">
					move cursor
				</div>
			</div>
		</div>
	);
};

const GlowingCard = ({ label }: { label: string }) => (
	<div className="glowing-card relative h-[200px] w-full cursor-pointer">
		<div className="glowing-card-content text-gray-400">
			<span className="text-sm">{label}</span>
		</div>
	</div>
);

export const GlowingCards = () => {
	const cleanupRef = useRef<(() => void) | null>(null);
	const { debugMode } = useDemoContext();

	const containerRef = useCallback((container: HTMLDivElement | null) => {
		cleanupRef.current?.();
		cleanupRef.current = null;

		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const cards = container.querySelectorAll<HTMLElement>(".glowing-card");
			cards.forEach((card) => {
				const rect = card.getBoundingClientRect();
				card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
				card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
			});
		};

		container.addEventListener("mousemove", handleMouseMove);
		cleanupRef.current = () =>
			container.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<AnimatePresence mode="wait">
			{debugMode ? (
				<motion.div
					key="debug"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="hidden sm:flex w-full items-center justify-center"
				>
					<GlowingCardDebug />
				</motion.div>
			) : (
				<motion.div
					key="normal"
					ref={containerRef}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="glowing-cards-container grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
				>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<GlowingCard key={`card-${i}`} label={`Card ${i}`} />
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
};
