import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

const SHORT_BREAK = '<break time="0.5s" />';
const MEDIUM_BREAK = '<break time="1.0s" />';
const LONG_BREAK = '<break time="1.5s" />';

export function extractTextFromMdx(slug: string): string {
	const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
	const content = fs.readFileSync(filePath, "utf-8");

	const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "");

	const withoutImports = withoutFrontmatter.replace(
		/^import\s+.*?(?:from\s+['"].*?['"])?;?\s*$/gm,
		"",
	);

	const withoutJsx = withoutImports
		.replace(/<[A-Z][^>]*\/>/g, "")
		.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "");

	const withoutCodeBlocks = withoutJsx.replace(/```[\s\S]*?```/g, "");

	const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, "");

	const withoutImages = withoutInlineCode.replace(/!\[.*?\]\(.*?\)/g, "");

	const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

	const withHeadingBreaks = withoutLinks.replace(
		/^(#{1,6})\s+(.+)$/gm,
		(_, hashes, text) => {
			const level = hashes.length;
			const breakBefore = level <= 2 ? MEDIUM_BREAK : SHORT_BREAK;
			const breakAfter = SHORT_BREAK;
			return `${breakBefore}${text}${breakAfter}`;
		},
	);

	const withoutEmphasis = withHeadingBreaks
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/__([^_]+)__/g, "$1")
		.replace(/_([^_]+)_/g, "$1");

	const withoutHtmlComments = withoutEmphasis.replace(/<!--[\s\S]*?-->/g, "");

	const withoutHorizontalRules = withoutHtmlComments.replace(
		/^[-_*]{3,}\s*$/gm,
		"",
	);

	const withoutBlockquotes = withoutHorizontalRules.replace(/^>\s*/gm, "");

	const withoutUnorderedLists = withoutBlockquotes.replace(
		/^[\s]*[-*+]\s+/gm,
		"",
	);

	const withoutOrderedLists = withoutUnorderedLists.replace(
		/^[\s]*\d+\.\s+/gm,
		"",
	);

	const withoutStrikethrough = withoutOrderedLists.replace(
		/~~([^~]+)~~/g,
		"$1",
	);

	const withoutEmptyLinks = withoutStrikethrough.replace(/\[\]\([^)]*\)/g, "");

	const withCustomBreaks = withoutEmptyLinks
		.replace(/\[pause\]/gi, MEDIUM_BREAK)
		.replace(/\[pause:short\]/gi, SHORT_BREAK)
		.replace(/\[pause:long\]/gi, LONG_BREAK);

	const lines = withCustomBreaks
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.join("\n\n");

	return lines.trim();
}

export function computeContentHash(text: string): string {
	return crypto.createHash("md5").update(text).digest("hex").slice(0, 8);
}

export function getPostSlugs(): string[] {
	return fs
		.readdirSync(POSTS_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}
