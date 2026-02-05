import { type NextRequest, NextResponse } from "next/server";
import { type ContentType, getContentRaw } from "@/lib/content";

const VALID_TYPES: ContentType[] = ["blog", "pages", "work"];

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ type: string; slug: string }> },
) {
	const { type, slug } = await params;

	if (!VALID_TYPES.includes(type as ContentType)) {
		return new NextResponse("Not found", { status: 404 });
	}

	const content = getContentRaw(type as ContentType, slug);

	if (!content) {
		return new NextResponse("Not found", { status: 404 });
	}

	return new NextResponse(content, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
		},
	});
}
