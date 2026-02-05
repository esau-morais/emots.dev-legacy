"use client";

import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

type LinkEmbedProps = {
	url: string;
	title: string;
	description?: string;
};

function getDomain(url: string): string {
	try {
		return new URL(url).hostname.replace("www.", "");
	} catch {
		return url;
	}
}

function getFaviconUrl(url: string): string {
	const domain = getDomain(url);
	return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function LetterFallback({ domain }: { domain: string }) {
	const letter = domain.charAt(0).toUpperCase();
	return (
		<div className="flex size-8 shrink-0 items-center justify-center bg-gray-900 text-sm font-medium text-gray-400">
			{letter}
		</div>
	);
}

export function LinkEmbed({ url, title, description }: LinkEmbedProps) {
	const domain = getDomain(url);
	const [faviconStatus, setFaviconStatus] = useState<
		"loading" | "loaded" | "error"
	>("loading");

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="group my-6 flex items-center gap-4 border border-gray-800 bg-black p-4 transition-colors hover:border-gray-700 focus:outline-none focus-visible:border-gray-700"
			data-narration-skip
		>
			{faviconStatus === "loaded" ? (
				<img
					src={getFaviconUrl(url)}
					alt=""
					className="size-8 shrink-0 bg-gray-900"
				/>
			) : (
				<LetterFallback domain={domain} />
			)}
			{faviconStatus === "loading" && (
				<img
					src={getFaviconUrl(url)}
					alt=""
					className="hidden"
					onLoad={(e) => {
						const img = e.currentTarget;
						if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
							setFaviconStatus("error");
						} else {
							setFaviconStatus("loaded");
						}
					}}
					onError={() => setFaviconStatus("error")}
				/>
			)}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate font-medium text-white">{title}</span>
					<ArrowSquareOutIcon
						size={14}
						className="shrink-0 text-gray-600 transition-colors group-hover:text-gray-400 group-focus-visible:text-gray-400"
					/>
				</div>
				<p className="truncate text-sm text-gray-500">
					{description ?? domain}
				</p>
			</div>
		</a>
	);
}
