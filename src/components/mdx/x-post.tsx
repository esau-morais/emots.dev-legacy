import { unstable_cache } from "next/cache";
import { XIcon } from "@/components/icons";

type XPostProps = { url: string };

type OEmbedResponse = {
	author_name: string;
	author_url: string;
	html: string;
	url: string;
};

const fetchTweet = unstable_cache(
	async (url: string): Promise<OEmbedResponse | null> => {
		const endpoint = `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=1`;
		const res = await fetch(endpoint);
		if (!res.ok) return null;
		return res.json() as Promise<OEmbedResponse>;
	},
	["x-post-oembed"],
	{ revalidate: 86400 },
);

function extractText(html: string): string {
	const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
	if (!match) return "";
	return match[1]
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
		.replace(/<[^>]+>/g, "")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.trim();
}

function extractDate(html: string): string | null {
	const matches = [...html.matchAll(/<a[^>]*>([^<]+)<\/a>/gi)];
	const last = matches[matches.length - 1];
	return last ? last[1].trim() : null;
}

function getAvatarUrl(handle: string): string {
	return `https://unavatar.io/x/${handle}`;
}

export async function XPost({ url }: XPostProps) {
	const data = await fetchTweet(url);
	const handle = url.match(/x\.com\/([^/]+)/)?.[1] ?? "";

	if (!data) {
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="my-6 flex items-center gap-2 text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
				data-narration-skip
			>
				View post on <XIcon size={14} aria-label="X" />
			</a>
		);
	}

	const text = extractText(data.html);
	const date = extractDate(data.html);
	const authorHandle = data.author_url.split("/").pop() ?? handle;

	return (
		<a
			href={data.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group my-6 block border border-gray-800 bg-black p-4 transition-colors hover:border-gray-700 focus:outline-none focus-visible:border-gray-700"
			data-narration-skip
		>
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<img
						src={getAvatarUrl(authorHandle)}
						alt=""
						className="size-10 bg-gray-800"
						loading="lazy"
					/>
					{/* Author info */}
					<div className="flex flex-col">
						<span className="font-semibold leading-tight text-white">
							{data.author_name}
						</span>
						<span className="text-sm leading-tight text-gray-500">
							@{authorHandle}
						</span>
					</div>
				</div>
				{/* X logo */}
				<XIcon size={20} className="text-white" />
			</div>

			{/* Tweet text */}
			<p className="mt-3 whitespace-pre-line text-[15px] leading-normal text-white">
				{text}
			</p>

			{/* Date */}
			{date && <p className="mt-3 text-sm text-gray-500">{date}</p>}
		</a>
	);
}
