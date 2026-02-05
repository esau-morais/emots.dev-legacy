"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useDemoContext } from "@/components/mdx/demo";

type HistoryItem = {
	name: string;
	url: string;
};

const initialHistory: HistoryItem[] = [
	{ name: "google.com", url: "https://google.com" },
	{ name: "github.com", url: "https://github.com" },
	{ name: "twitter.com", url: "https://twitter.com" },
	{ name: "linkedin.com", url: "https://linkedin.com" },
	{ name: "vercel.com", url: "https://vercel.com" },
];

export const StackedHistory = () => {
	const { slowMode, debugMode, restartKey } = useDemoContext();
	const [isOpen, setIsOpen] = useState(debugMode);
	const [items, setItems] = useState(initialHistory);

	const duration = slowMode ? 1.2 : 0.2;
	const springConfig = {
		type: "spring" as const,
		stiffness: slowMode ? 120 : 500,
		damping: slowMode ? 12 : 20,
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: restartKey triggers reset
	useEffect(() => {
		setIsOpen(debugMode);
		setItems(initialHistory);
	}, [restartKey, debugMode]);

	const handleClick = (index: number) => {
		setItems((prev) => {
			const next = [...prev];
			const [clicked] = next.splice(index, 1);
			return [...next, clicked];
		});
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "h" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				setIsOpen(true);
			} else if (e.key === "Escape") {
				setIsOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
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
					className="hidden sm:flex w-full items-center justify-center gap-16"
				>
					<div
						className="relative shrink-0"
						style={{ perspective: "600px", width: "200px", height: "320px" }}
					>
						<div
							className="absolute left-1/2 top-1/2"
							style={{
								transform:
									"translate(-50%, -50%) rotateX(-20deg) rotateY(25deg)",
								transformStyle: "preserve-3d",
							}}
						>
							{items.map((item, index) => {
								const zIndex = items.length - index;
								const zTranslate = (items.length - 1 - index) * 40;

								return (
									<motion.button
										type="button"
										key={item.name}
										onClick={() => handleClick(index)}
										initial={false}
										animate={{ zIndex, z: zTranslate }}
										transition={springConfig}
										className="absolute border border-gray-800 bg-gray-950 px-3 py-2 text-left text-gray-400 transition-colors hover:border-gray-700 hover:text-white focus-visible:border-gray-700 focus-visible:text-white focus:outline-none"
										style={{
											width: "110px",
											left: "-55px",
											top: "-20px",
											transformStyle: "preserve-3d",
											zIndex,
										}}
									>
										<span className="text-xs">{item.name}</span>
									</motion.button>
								);
							})}
						</div>
					</div>
					<div className="shrink-0 space-y-1 border border-gray-800 bg-gray-900/60 px-3 py-2 font-mono text-[11px]">
						{items.map((item, index) => (
							<div key={item.name} className="text-gray-400">
								{item.name}{" "}
								<span className="text-gray-600">z:{items.length - index}</span>
							</div>
						))}
						<div className="mt-2 border-t border-gray-800 pt-2 text-gray-600">
							click to reorder
						</div>
					</div>
				</motion.div>
			) : (
				<motion.div
					key="normal"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="relative flex h-[400px] w-full flex-col items-center justify-center gap-4"
				>
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-700 hover:text-white focus-visible:border-gray-700 focus-visible:text-white focus:outline-none"
					>
						{isOpen ? "Close" : "Open"} History
					</button>

					<AnimatePresence>
						{isOpen && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration }}
								className="absolute inset-0 flex items-center justify-center"
								style={{ perspective: "1000px" }}
							>
								{items.map((item, index) => (
									<motion.button
										type="button"
										key={item.name}
										onClick={() => handleClick(index)}
										initial={{ opacity: 0, scale: 0.9, rotateX: 60 }}
										animate={{
											opacity: 1,
											scale: 1,
											rotateX: 0,
											y: (items.length - 1 - index) * 20,
										}}
										exit={{ opacity: 0, scale: 0.9, rotateX: 60 }}
										transition={{
											...springConfig,
											delay: index * (slowMode ? 0.35 : 0.05),
										}}
										className="absolute w-48 sm:w-64 border border-gray-800 bg-gray-950 px-6 py-4 text-left text-gray-400 transition-colors hover:border-gray-700 hover:text-white focus-visible:border-gray-700 focus-visible:text-white focus:outline-none"
										style={{
											transformStyle: "preserve-3d",
											zIndex: items.length - index,
										}}
									>
										<span className="text-sm">{item.name}</span>
									</motion.button>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
