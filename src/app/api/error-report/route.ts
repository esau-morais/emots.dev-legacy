import { NextResponse } from "next/server";
import { server as env } from "@/lib/env/server";

type ErrorReportPayload = {
	message: string;
	url: string;
	userAgent: string;
	timestamp: string;
};

const recentReports = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

async function hashMessage(message: string): Promise<string> {
	const data = new TextEncoder().encode(message);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Buffer.from(hash).toString("hex").slice(0, 16);
}

export async function POST(request: Request) {
	const webhookUrl = env.DISCORD_ERROR_WEBHOOK_URL;

	if (!webhookUrl) {
		return NextResponse.json(
			{ success: false, error: "Webhook not configured" },
			{ status: 500 },
		);
	}

	try {
		const body = (await request.json()) as ErrorReportPayload;
		const { message, url, userAgent, timestamp } = body;

		const hash = await hashMessage(message);
		const now = Date.now();
		const lastSeen = recentReports.get(hash);

		if (lastSeen && lastSeen > now - DEDUPE_WINDOW_MS) {
			return NextResponse.json({ success: true });
		}
		recentReports.set(hash, now);

		const discordPayload = {
			embeds: [
				{
					title: "🚨 Error Report",
					color: 0xff4444,
					fields: [
						{ name: "Error", value: `\`\`\`${message}\`\`\``, inline: false },
						{ name: "URL", value: url, inline: true },
						{ name: "Timestamp", value: timestamp, inline: true },
						{
							name: "User Agent",
							value: `\`\`\`${userAgent}\`\`\``,
							inline: false,
						},
					],
					timestamp: new Date().toISOString(),
				},
			],
		};

		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(discordPayload),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ success: false, error: "Discord webhook failed" },
				{ status: 502 },
			);
		}

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ success: false, error: "Invalid request" },
			{ status: 400 },
		);
	}
}
