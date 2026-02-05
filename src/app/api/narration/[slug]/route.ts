import { NextResponse } from "next/server";
import { getNarrationData } from "@/lib/narration";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	const data = await getNarrationData(slug);

	if (!data) {
		return NextResponse.json({ error: "Narration not found" }, { status: 404 });
	}

	return NextResponse.json(data);
}
