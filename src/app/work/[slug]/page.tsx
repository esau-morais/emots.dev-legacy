import {
	ArrowLeftIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GitHubIcon } from "@/components/icons";
import { getWork, getWorks } from "@/lib/work";
import { BASE_URL } from "@/utils/consts";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	const works = await getWorks();
	return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	try {
		const { frontmatter } = await getWork(slug);
		const ogImage = `${BASE_URL}/api/og?title=${encodeURIComponent(frontmatter.title)}`;
		const url = `${BASE_URL}/work/${slug}`;

		return {
			title: frontmatter.title,
			description: frontmatter.description,
			openGraph: {
				title: frontmatter.title,
				description: frontmatter.description,
				url,
				type: "website",
				images: [
					{
						url: ogImage,
						width: 1920,
						height: 1080,
						alt: frontmatter.title,
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title: frontmatter.title,
				description: frontmatter.description,
				images: [ogImage],
			},
		};
	} catch {
		return { title: "not found" };
	}
}

export default async function SingleWorkPage({ params }: Props) {
	const { slug } = await params;

	try {
		const { Content, frontmatter } = await getWork(slug);

		return (
			<div className="mx-auto max-w-2xl px-6">
				<Link
					href="/work"
					className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
				>
					<ArrowLeftIcon size={14} />
					<span>back to work</span>
				</Link>

				<header className="mb-8">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-white">
							{frontmatter.title}
						</h1>
						<span className="bg-gray-900 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500">
							{frontmatter.type}
						</span>
					</div>
					<p className="mt-2 text-gray-500">{frontmatter.description}</p>
					<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
						<time dateTime={frontmatter.date} className="text-sm text-gray-600">
							{new Date(frontmatter.date).getFullYear()}
						</time>
						{frontmatter.links?.live && (
							<a
								href={frontmatter.links.live}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
							>
								<ArrowSquareOutIcon size={14} />
								<span>live</span>
							</a>
						)}
						{frontmatter.links?.github && (
							<a
								href={frontmatter.links.github}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
							>
								<GitHubIcon size={14} />
								<span>source</span>
							</a>
						)}
					</div>
					{frontmatter.stack && frontmatter.stack.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-1.5">
							{frontmatter.stack.map((item) => (
								<span
									key={item}
									className="bg-gray-900 px-2 py-1 text-xs text-gray-500"
								>
									{item}
								</span>
							))}
						</div>
					)}
				</header>

				<article className="prose-custom">
					<Content />
				</article>
			</div>
		);
	} catch {
		notFound();
	}
}
