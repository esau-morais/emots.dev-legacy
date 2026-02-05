import {
	computeContentHash,
	extractTextFromMdx,
	generateSpeechWithTimestamps,
	getNarrationData,
	getPostSlugs,
	uploadAudio,
} from "../src/lib/narration";

async function generateAudioForPost(slug: string, force = false) {
	console.log(`\n[${slug}] Processing...`);

	const text = extractTextFromMdx(slug);
	const hash = computeContentHash(text);

	if (!force) {
		const existing = await getNarrationData(slug);
		if (existing && existing.metadata.hash === hash) {
			console.log(`[${slug}] Skipped (unchanged)`);
			return;
		}
	}

	console.log(`[${slug}] Generating audio (${text.length} chars)...`);
	const { audioBuffer, alignment } = await generateSpeechWithTimestamps(text);

	const duration = Math.max(
		...alignment.character_end_times_seconds.filter((t) => t > 0),
	);

	console.log(`[${slug}] Uploading to R2...`);
	const audioUrl = await uploadAudio(slug, audioBuffer, alignment, {
		slug,
		hash,
		duration,
		generatedAt: new Date().toISOString(),
	});

	console.log(`[${slug}] Done: ${audioUrl}`);
}

async function main() {
	const args = process.argv.slice(2);
	const force = args.includes("--force");
	const slugArg = args.find((a) => !a.startsWith("--"));

	const slugs = slugArg ? [slugArg] : getPostSlugs();

	console.log(`Generating audio for ${slugs.length} post(s)...`);

	for (const slug of slugs) {
		try {
			await generateAudioForPost(slug, force);
		} catch (error) {
			console.error(`[${slug}] Error:`, error);
		}
	}

	console.log("\nDone!");
}

main();
