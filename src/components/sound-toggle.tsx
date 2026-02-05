"use client";

import { useCallback, useEffect, useState } from "react";
import { useGhostAnimation } from "@/contexts/ghost-animation";
import { sounds } from "@/lib/sounds";
import { cn } from "@/utils/classNames";

const STORAGE_KEY = "emots@sounds-enabled";

export const SoundToggle = () => {
	const { phase, skip } = useGhostAnimation();
	const isAnimating = phase !== "idle";
	const [soundOn, setSoundOn] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "false") {
			setSoundOn(false);
		}
	}, []);

	const toggleSound = useCallback(() => {
		setSoundOn((prev) => {
			const next = !prev;
			localStorage.setItem(STORAGE_KEY, String(next));
			if (next) sounds.click();
			return next;
		});
	}, []);

	return (
		<div className="flex items-center gap-3">
			<button
				type="button"
				onClick={toggleSound}
				className={cn(
					"relative text-gray-600 transition-colors hover:text-gray-400 focus-visible:text-gray-400 focus:outline-none",
				)}
				aria-label={soundOn ? "mute sounds" : "unmute sounds"}
			>
				[sound]
				<span
					className={cn(
						"absolute left-0 top-1/2 h-px w-full origin-left bg-current transition-transform duration-200",
						soundOn ? "scale-x-0" : "scale-x-100",
					)}
					aria-hidden="true"
				/>
			</button>
			{isAnimating ? (
				<button
					type="button"
					onClick={skip}
					className="text-gray-600 transition-colors hover:text-gray-400 focus-visible:text-gray-400 focus:outline-none"
				>
					skip
				</button>
			) : (
				<span>{new Date().getFullYear()}</span>
			)}
		</div>
	);
};
