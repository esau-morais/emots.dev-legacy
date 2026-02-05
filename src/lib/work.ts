import fs from "node:fs";
import path from "node:path";
import { getContentRaw } from "./content";

export type WorkFrontmatter = {
	title: string;
	description: string;
	date: string;
	type: "project" | "design" | "experiment";
	cover?: string;
	stack?: string[];
	links?: {
		live?: string;
		github?: string;
	};
	draft?: boolean;
	featured?: boolean;
};

export type Work = {
	slug: string;
	frontmatter: WorkFrontmatter;
};

type WorkModule = {
	default: React.ComponentType;
	frontmatter: WorkFrontmatter;
};

const WORKS_DIR = path.join(process.cwd(), "src/content/works");

function getWorkSlugs(): string[] {
	return fs
		.readdirSync(WORKS_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}

export async function getWorks(): Promise<Work[]> {
	const slugs = getWorkSlugs();

	const allWorks = await Promise.all(
		slugs.map(async (slug) => {
			const { frontmatter } = (await import(
				`@/content/works/${slug}.mdx`
			)) as WorkModule;
			return { slug, frontmatter };
		}),
	);

	return allWorks
		.filter((w) => !w.frontmatter.draft)
		.sort(
			(a, b) =>
				new Date(b.frontmatter.date).getTime() -
				new Date(a.frontmatter.date).getTime(),
		);
}

export async function getWork(slug: string) {
	const { default: Content, frontmatter } = (await import(
		`@/content/works/${slug}.mdx`
	)) as WorkModule;
	return { Content, frontmatter };
}

export function getWorkRaw(slug: string): string | null {
	return getContentRaw("work", slug);
}

export async function getFeaturedWorks(limit = 3): Promise<Work[]> {
	const works = await getWorks();
	return works.filter((w) => w.frontmatter.featured).slice(0, limit);
}
