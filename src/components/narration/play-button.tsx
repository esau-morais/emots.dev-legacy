"use client";

import {
	CircleNotchIcon,
	HeadphonesIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import type { NarrationData } from "@/lib/narration";
import { useNarrationStore } from "./store";

interface PlayButtonProps {
	slug: string;
}

export function NarrationPlayButton({ slug }: PlayButtonProps) {
	const forceError =
		process.env.NODE_ENV === "development" &&
		typeof window !== "undefined" &&
		new URLSearchParams(window.location.search).get("narration-error") === "1";

	const {
		loadNarration,
		slug: currentSlug,
		setPlaying,
		isVisible,
	} = useNarrationStore();
	const isActive = currentSlug === slug && isVisible;

	const { mutate, isPending, isError, reset } = useMutation({
		mutationFn: async () => {
			if (forceError) throw new Error("Forced error for testing");
			const res = await fetch(`/api/narration/${slug}`);
			if (!res.ok) throw new Error("Failed to load");
			return res.json() as Promise<NarrationData>;
		},
		onSuccess: (data) => {
			loadNarration(slug, data.audioUrl, data.alignment, data.metadata);
			setPlaying(true);
		},
	});

	function handleClick() {
		if (isError) {
			reset();
			return;
		}
		if (isActive) {
			setPlaying(true);
			return;
		}
		mutate();
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.repeat || e.key.toLowerCase() !== "l") return;
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;
			if (isInput) return;
			if (!document.querySelector("article")) return;
			if (isPending) return;

			e.preventDefault();
			if (isError) {
				reset();
			} else if (isActive) {
				setPlaying(true);
			} else {
				mutate();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isPending, isError, isActive, reset, setPlaying, mutate]);

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isPending}
			className="group flex items-center gap-2 text-sm text-gray-500 transition-all duration-150 ease-out hover:text-white focus:outline-none focus-visible:text-gray-300 active:scale-[0.98] disabled:opacity-50"
		>
			<span className="relative size-4 shrink-0">
				{isPending ? (
					<CircleNotchIcon size={16} className="animate-spin" />
				) : isError ? (
					<WarningCircleIcon size={16} className="text-red-500" />
				) : (
					<HeadphonesIcon
						size={16}
						className="text-gray-600 transition-colors duration-150 group-hover:text-white group-focus-visible:text-white"
					/>
				)}
			</span>
			<span>
				{isError
					? "Failed to load. Retry?"
					: isActive
						? "Resume listening [L]"
						: "Listen to article [L]"}
			</span>
		</button>
	);
}
