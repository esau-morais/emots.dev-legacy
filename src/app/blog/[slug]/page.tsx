import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NarrationPlayButton } from "@/components/narration";
import { getPost, getPosts } from "@/lib/blog";
import { BASE_URL } from "@/utils/consts";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	const posts = await getPosts();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	try {
		const { frontmatter } = await getPost(slug);
		const ogImage = `${BASE_URL}/api/og?title=${encodeURIComponent(frontmatter.title)}`;
		const url = `${BASE_URL}/blog/${slug}`;

		return {
			title: frontmatter.title,
			description: frontmatter.description,
			openGraph: {
				title: frontmatter.title,
				description: frontmatter.description,
				url,
				type: "article",
				publishedTime: frontmatter.date,
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

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;

	try {
		const { Content, frontmatter } = await getPost(slug);

		return (
			<div className="mx-auto max-w-2xl px-6">
				<Link
					href="/blog"
					className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white"
				>
					<ArrowLeftIcon size={14} className="shrink-0" />
					<span>back</span>
				</Link>

				<header className="mb-12">
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<time dateTime={frontmatter.date}>
							{format(new Date(frontmatter.date), "MMMM d, yyyy")}
						</time>
						<span>·</span>
						<span>{frontmatter.readingTime} min read</span>
					</div>
					<h1 className="mt-2 text-2xl font-bold text-white">
						{frontmatter.title}
					</h1>
					<p className="mt-2 text-gray-500">{frontmatter.description}</p>
					<div className="mt-4">
						<NarrationPlayButton slug={slug} />
					</div>
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
