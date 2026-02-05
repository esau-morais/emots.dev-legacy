"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/classNames";

const LIQUID_EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.6, ease: LIQUID_EASE } as const;

export function BlurImage({ src, alt }: { src: string; alt: string }) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const layoutId = useId();
	const triggerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const open = () => !prefersReducedMotion && setIsOpen(true);

	const close = () => {
		setIsOpen(false);
		triggerRef.current?.focus();
	};

	return (
		<>
			<motion.span
				ref={triggerRef}
				layoutId={layoutId}
				transition={TRANSITION}
				data-narration-skip
				className={cn(
					"relative my-6 block cursor-zoom-in overflow-hidden border border-gray-800",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
					isOpen && "invisible",
				)}
				onClick={open}
				role="button"
				tabIndex={0}
				onKeyDown={(e) =>
					(e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())
				}
				aria-label={`View ${alt} in fullscreen`}
			>
				<span
					className={cn(
						"absolute inset-0 block bg-gray-800 transition-opacity duration-300",
						isLoaded ? "opacity-0" : "opacity-100",
					)}
					aria-hidden="true"
				/>
				<Image
					src={src}
					alt={alt}
					width={1200}
					height={630}
					className={cn(
						"transition-opacity duration-300",
						isLoaded ? "opacity-100" : "opacity-0",
					)}
					onLoad={() => setIsLoaded(true)}
					loading="lazy"
					unoptimized
				/>
			</motion.span>

			{typeof document !== "undefined" &&
				createPortal(
					<AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
						{isOpen && (
							<motion.div
								initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
								animate={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
								exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
								transition={TRANSITION}
								className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center p-4 sm:p-8 overscroll-contain"
								onClick={close}
								role="dialog"
								aria-modal="true"
								aria-label={`Fullscreen view of ${alt}`}
							>
								<motion.span
									layoutId={layoutId}
									transition={TRANSITION}
									className="relative block max-h-full max-w-full overflow-hidden border border-gray-800"
								>
									<Image
										src={src}
										alt={alt}
										width={1200}
										height={630}
										className="max-h-[90vh] w-auto object-contain"
										unoptimized
									/>
								</motion.span>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
