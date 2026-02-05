import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ReactNode } from "react";

import { Spectrogram } from "@/components/interactive";
import { BlurImage } from "@/components/mdx/blur-image";
import { Demo } from "@/components/mdx/demo";
import { LinkEmbed } from "@/components/mdx/link-embed";
import { Video } from "@/components/mdx/video";
import { XPost } from "@/components/mdx/x-post";

function HeadingLink({
	id,
	children,
	className,
}: {
	id?: string;
	children: ReactNode;
	className: string;
}) {
	if (!id) return <span className={className}>{children}</span>;
	return (
		<a
			href={`#${id}`}
			className={`${className} group no-underline hover:no-underline focus:outline-none`}
		>
			{children}
			<span className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 text-gray-600">
				#
			</span>
		</a>
	);
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: ({ children, id }) => (
			<h1
				id={id}
				className="mb-6 mt-10 text-2xl font-medium text-white first:mt-0 text-balance scroll-mt-16"
			>
				<HeadingLink id={id} className="text-white">
					{children}
				</HeadingLink>
			</h1>
		),
		h2: ({ children, id }) => (
			<h2
				id={id}
				className="mb-4 mt-8 text-xl font-medium text-white text-balance scroll-mt-16"
			>
				<HeadingLink id={id} className="text-white">
					{children}
				</HeadingLink>
			</h2>
		),
		h3: ({ children, id }) => (
			<h3
				id={id}
				className="mb-3 mt-6 text-lg font-medium text-white text-balance scroll-mt-16"
			>
				<HeadingLink id={id} className="text-white">
					{children}
				</HeadingLink>
			</h3>
		),
		p: ({ children }) => (
			<p className="mb-4 leading-relaxed text-gray-400 text-pretty">
				{children}
			</p>
		),
		a: ({ href, children }) => {
			const isExternal = href?.startsWith("http");
			if (isExternal) {
				return (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-white underline underline-offset-4 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-gray-400"
					>
						{children}
					</a>
				);
			}
			return (
				<Link
					href={href ?? "#"}
					className="text-white underline underline-offset-4 transition-colors hover:text-gray-400 focus:outline-none focus-visible:text-gray-400"
				>
					{children}
				</Link>
			);
		},
		ul: ({ children }) => (
			<ul className="mb-4 list-none space-y-1 text-gray-400">{children}</ul>
		),
		ol: ({ children }) => (
			<ol className="mb-4 ml-6 list-decimal space-y-1 text-gray-400">
				{children}
			</ol>
		),
		li: ({ children }) => (
			<li className="flex leading-relaxed before:content-['◆'] before:mr-3 before:shrink-0 before:text-gray-600">
				<span className="text-pretty">{children}</span>
			</li>
		),
		blockquote: ({ children }) => (
			<blockquote className="mb-4 border-l-2 border-gray-700 pl-4 italic text-gray-500 text-balance">
				{children}
			</blockquote>
		),

		hr: () => <hr className="my-8 border-gray-800" />,
		table: ({ children }) => (
			<div className="mb-4 overflow-x-auto">
				<table className="w-full text-sm border border-gray-800 bg-gray-950">
					{children}
				</table>
			</div>
		),
		thead: ({ children }) => (
			<thead className="border-b border-gray-800">{children}</thead>
		),
		tbody: ({ children }) => (
			<tbody className="divide-y divide-gray-800/50">{children}</tbody>
		),
		tr: ({ children }) => (
			<tr className="transition-colors hover:bg-white/[0.02]">{children}</tr>
		),
		th: ({ children }) => (
			<th className="py-2.5 pr-4 first:pl-3 last:pr-3 text-left text-sm font-bold text-gray-500">
				{children}
			</th>
		),
		td: ({ children }) => (
			<td className="py-2.5 pr-4 first:pl-3 last:pr-3 text-gray-400">
				{children}
			</td>
		),
		strong: ({ children }) => (
			<strong className="font-medium text-white">{children}</strong>
		),
		em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
		img: ({ src, alt }) => <BlurImage src={src ?? ""} alt={alt ?? ""} />,
		Demo,
		LinkEmbed,
		Spectrogram,
		Video,
		XPost,
		...components,
	};
}
