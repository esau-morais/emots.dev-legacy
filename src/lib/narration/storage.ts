import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { server as env } from "@/lib/env/server";
import type { NarrationAlignment, NarrationMetadata } from "./types";

function getR2Client() {
	return new S3Client({
		region: "auto",
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		},
		maxAttempts: 5,
		retryMode: "adaptive",
	});
}

const bucket = () => env.R2_BUCKET_NAME;
const publicUrl = () => env.R2_PUBLIC_URL;

async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelay = 1000,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;

			if (attempt === maxRetries) break;

			const isRetriable =
				error instanceof Error &&
				(error.message.includes("502") ||
					error.message.includes("503") ||
					error.message.includes("Expected closing tag") ||
					error.message.includes("Deserialization error"));

			if (!isRetriable) throw error;

			const delay = baseDelay * 2 ** attempt;
			console.warn(
				`[R2] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

export async function uploadAudio(
	slug: string,
	audioBuffer: Buffer,
	alignment: NarrationAlignment,
	metadata: NarrationMetadata,
): Promise<string> {
	const client = getR2Client();
	const audioKey = `audio/narration/${slug}/audio.mp3`;
	const alignmentKey = `audio/narration/${slug}/metadata.json`;

	await retryWithBackoff(async () => {
		await Promise.all([
			client.send(
				new PutObjectCommand({
					Bucket: bucket(),
					Key: audioKey,
					Body: audioBuffer,
					ContentType: "audio/mpeg",
				}),
			),
			client.send(
				new PutObjectCommand({
					Bucket: bucket(),
					Key: alignmentKey,
					Body: JSON.stringify({ alignment, metadata }),
					ContentType: "application/json",
				}),
			),
		]);
	});

	return `${publicUrl()}/${audioKey}`;
}

export async function getNarrationData(slug: string): Promise<{
	audioUrl: string;
	alignment: NarrationAlignment;
	metadata: NarrationMetadata;
} | null> {
	const client = getR2Client();
	const alignmentKey = `audio/narration/${slug}/metadata.json`;

	try {
		const response = await client.send(
			new GetObjectCommand({ Bucket: bucket(), Key: alignmentKey }),
		);
		const body = await response.Body?.transformToString();
		if (!body) return null;

		const data = JSON.parse(body) as {
			alignment: NarrationAlignment;
			metadata: NarrationMetadata;
		};

		const hash = data.metadata.hash || "";
		return {
			audioUrl: `${publicUrl()}/audio/narration/${slug}/audio.mp3?v=${hash}`,
			alignment: data.alignment,
			metadata: data.metadata,
		};
	} catch {
		return null;
	}
}

export async function narrationExists(slug: string): Promise<boolean> {
	const client = getR2Client();
	try {
		await client.send(
			new HeadObjectCommand({
				Bucket: bucket(),
				Key: `audio/narration/${slug}/metadata.json`,
			}),
		);
		return true;
	} catch {
		return false;
	}
}
