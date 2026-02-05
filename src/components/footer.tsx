"use client";

import type { ReactNode } from "react";
import { useGhostAnimation } from "@/contexts/ghost-animation";
import { cn } from "@/utils/classNames";

export function Footer({ children }: { children: ReactNode }) {
	const { phase } = useGhostAnimation();
	const isAnimating = phase !== "idle";

	return (
		<footer
			className={cn(
				"font-mono fixed inset-x-0 bottom-0 shadow-[0_-20px_30px_-10px_rgba(0,0,0,0.9)] mx-auto flex h-10 max-w-3xl items-center justify-between border-t border-gray-800 bg-black/80 px-4 text-sm text-gray-500 backdrop-blur-sm md:px-8 before:absolute before:left-4 before:-top-6 before:hidden before:h-6 before:w-px before:bg-gray-800 after:absolute after:right-4 after:-top-6 after:hidden after:h-6 after:w-px after:bg-gray-800 md:before:left-8 md:before:-top-8 md:before:block md:before:h-8 md:after:right-8 md:after:-top-8 md:after:block md:after:h-8",
				isAnimating ? "z-[10000]" : "z-40",
			)}
			style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
		>
			{children}
		</footer>
	);
}
