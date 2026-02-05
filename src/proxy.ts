import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PAGE_SLUGS = ["checklist", "craft"] as const;

export function proxy(request: NextRequest) {
	const accept = request.headers.get("accept") || "";
	const wantsMarkdown =
		accept.includes("text/markdown") || accept.includes("text/plain");

	if (!wantsMarkdown) {
		return NextResponse.next();
	}

	const { pathname } = request.nextUrl;

	const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
	if (blogMatch) {
		return NextResponse.rewrite(
			new URL(`/api/markdown/blog/${blogMatch[1]}`, request.url),
		);
	}

	const workMatch = pathname.match(/^\/work\/([^/]+)$/);
	if (workMatch) {
		return NextResponse.rewrite(
			new URL(`/api/markdown/work/${workMatch[1]}`, request.url),
		);
	}

	const pageSlug = pathname.slice(1);
	if (PAGE_SLUGS.includes(pageSlug as (typeof PAGE_SLUGS)[number])) {
		return NextResponse.rewrite(
			new URL(`/api/markdown/pages/${pageSlug}`, request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/blog/:slug*", "/work/:slug*", "/checklist", "/craft"],
};
