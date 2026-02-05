import fs from "node:fs";
import path from "node:path";
import { getContentRaw } from "./content";

export type PostFrontmatter = {
	title: string;
	description: string;
	date: string;
	draft?: boolean;
	readingTime: number;
};

export type Post = {
	slug: string;
	frontmatter: PostFrontmatter;
};

type RawPostFrontmatter = Omit<PostFrontmatter, "readingTime">;

type PostModule = {
	default: React.ComponentType;
	frontmatter: RawPostFrontmatter;
};

function calculateReadingTime(content: string): number {
	const text = content
		.replace(/^---[\s\S]*?---/, "")
		.replace(/^import\s+.*$/gm, "");

	const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
	const codeLines = codeBlocks.reduce(
		(sum, block) => sum + block.split("\n").length - 2,
		0,
	);

	const prose = text
		.replace(/```[\s\S]*?```/g, "")
		.replace(/<(Demo|Video)[\s\S]*?\/>/g, "");

	const images = (prose.match(/!\[.*?\]\(.*?\)/g) || []).length;
	const xposts = (prose.match(/<XPost\s/g) || []).length;
	const embeds = (prose.match(/<LinkEmbed\s/g) || []).length;

	const words = prose
		.replace(/<[^>]+>/g, "")
		.split(/\s+/)
		.filter(Boolean).length;

	let imageSeconds = 0;
	for (let i = 0; i < images; i++) {
		imageSeconds += Math.max(3, 12 - i);
	}

	const seconds =
		(words / 250) * 60 +
		codeLines * 5 +
		imageSeconds +
		xposts * 10 +
		embeds * 8;

	return Math.max(1, Math.ceil(seconds / 60));
}

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

function getPostSlugs(): string[] {
	return fs
		.readdirSync(POSTS_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}

export async function getPosts(): Promise<Post[]> {
	const slugs = getPostSlugs();

	const allPosts = await Promise.all(
		slugs.map(async (slug) => {
			const { frontmatter: rawFrontmatter } = (await import(
				`@/content/posts/${slug}.mdx`
			)) as PostModule;
			const rawContent = getPostRaw(slug);
			const readingTime = rawContent ? calculateReadingTime(rawContent) : 1;
			const frontmatter: PostFrontmatter = { ...rawFrontmatter, readingTime };
			return { slug, frontmatter };
		}),
	);

	return allPosts
		.filter((w) => !w.frontmatter.draft)
		.sort(
			(a, b) =>
				new Date(b.frontmatter.date).getTime() -
				new Date(a.frontmatter.date).getTime(),
		);
}

export async function getPost(slug: string) {
	const { default: Content, frontmatter: rawFrontmatter } = (await import(
		`@/content/posts/${slug}.mdx`
	)) as PostModule;
	const rawContent = getPostRaw(slug);
	const readingTime = rawContent ? calculateReadingTime(rawContent) : 1;
	const frontmatter: PostFrontmatter = { ...rawFrontmatter, readingTime };
	return { Content, frontmatter };
}

export function getPostRaw(slug: string): string | null {
	return getContentRaw("blog", slug);
}
