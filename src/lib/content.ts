import fs from "node:fs";
import path from "node:path";

export type ContentType = "blog" | "pages" | "work";

const CONTENT_DIRS: Record<ContentType, string> = {
	blog: "src/content/posts",
	pages: "src/content/pages",
	work: "src/content/works",
};

export function getContentRaw(type: ContentType, slug: string): string | null {
	const dir = path.join(process.cwd(), CONTENT_DIRS[type]);
	const mdxPath = path.join(dir, `${slug}.mdx`);
	const mdPath = path.join(dir, `${slug}.md`);

	if (fs.existsSync(mdxPath)) {
		return fs.readFileSync(mdxPath, "utf-8");
	}
	if (fs.existsSync(mdPath)) {
		return fs.readFileSync(mdPath, "utf-8");
	}
	return null;
}
