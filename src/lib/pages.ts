import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getContentRaw } from "./content";

export type PageFrontmatter = {
	title: string;
	description: string;
};

const PAGES_DIR = path.join(process.cwd(), "src/content/pages");

function getPageSlugs(): string[] {
	return fs
		.readdirSync(PAGES_DIR)
		.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
		.map((file) => file.replace(/\.mdx?$/, ""));
}

export function getPage(slug: string) {
	const raw = getPageRaw(slug);
	if (!raw) throw new Error(`Page not found: ${slug}`);

	const { data, content } = matter(raw);
	return {
		frontmatter: data as PageFrontmatter,
		content,
	};
}

export function getPageRaw(slug: string): string | null {
	return getContentRaw("pages", slug);
}

export function getPages() {
	return getPageSlugs().map((slug) => {
		const { frontmatter } = getPage(slug);
		return { slug, frontmatter };
	});
}

export type ChecklistItem = {
	id: string;
	label: string;
	category: string;
};

export function parseChecklistFromMdx(content: string): {
	items: ChecklistItem[];
	categories: string[];
} {
	const { content: body } = matter(content);
	const lines = body.split("\n");
	const items: ChecklistItem[] = [];
	const categories: string[] = [];
	let currentCategory = "";
	let itemIndex = 0;

	for (const line of lines) {
		const headingMatch = line.match(/^##\s+(.+)$/);
		if (headingMatch) {
			currentCategory = headingMatch[1].trim();
			if (!categories.includes(currentCategory)) {
				categories.push(currentCategory);
			}
			continue;
		}

		const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)$/);
		if (taskMatch && currentCategory) {
			items.push({
				id: `item-${itemIndex++}`,
				label: taskMatch[2].trim(),
				category: currentCategory,
			});
		}
	}

	return { items, categories };
}

export type KeyValueItem = {
	label: string;
	value: string;
};

export type KeyValueSection = {
	heading: string;
	items: KeyValueItem[];
};

export function parseKeyValueSections(content: string): KeyValueSection[] {
	const { content: body } = matter(content);
	const lines = body.split("\n");
	const sections: KeyValueSection[] = [];
	let currentSection: KeyValueSection | null = null;

	for (const line of lines) {
		const headingMatch = line.match(/^##\s+(.+)$/);
		if (headingMatch) {
			if (currentSection) sections.push(currentSection);
			currentSection = { heading: headingMatch[1].trim(), items: [] };
			continue;
		}

		const kvMatch = line.match(/^-\s+(.+?):\s+(.+)$/);
		if (kvMatch && currentSection) {
			currentSection.items.push({
				label: kvMatch[1].trim(),
				value: kvMatch[2].trim(),
			});
		}
	}

	if (currentSection) sections.push(currentSection);
	return sections;
}
