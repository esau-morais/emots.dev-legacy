const EN_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB"; // Adam

async function searchVoice(
	apiKey: string,
	query: string,
): Promise<string | null> {
	const url = new URL("https://api.elevenlabs.io/v2/voices");
	url.searchParams.set("search", query);
	url.searchParams.set("page_size", "1");

	const res = await fetch(url, {
		headers: { "xi-api-key": apiKey },
	});

	if (!res.ok) return null;
	const data = await res.json();
	return data.voices?.[0]?.voice_id ?? null;
}

async function generateSpeech(
	apiKey: string,
	voiceId: string,
	text: string,
	languageCode?: string,
): Promise<ArrayBuffer> {
	const res = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
		{
			method: "POST",
			headers: {
				"xi-api-key": apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				text,
				model_id: "eleven_multilingual_v2",
				language_code: languageCode,
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.75,
					speed: 0.75,
				},
			}),
		},
	);

	if (!res.ok) {
		throw new Error(`API error: ${await res.text()}`);
	}

	return res.arrayBuffer();
}

async function generatePronunciation() {
	const apiKey = process.env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		console.error("ELEVENLABS_API_KEY is required");
		process.exit(1);
	}

	console.log("Searching for Portuguese voice...");
	const ptVoiceId = await searchVoice(apiKey, "Portuguese Brazilian");
	console.log("Portuguese voice:", ptVoiceId ?? "not found, using default");

	console.log("Generating English part...");
	const enAudio = await generateSpeech(
		apiKey,
		EN_VOICE_ID,
		"In English, you can say: ee-saw.",
		"en",
	);

	console.log("Generating Portuguese part...");
	const ptAudio = await generateSpeech(
		apiKey,
		ptVoiceId ?? EN_VOICE_ID,
		"Em português: Esaú.",
		"pt",
	);

	const combined = new Uint8Array(enAudio.byteLength + ptAudio.byteLength);
	combined.set(new Uint8Array(enAudio), 0);
	combined.set(new Uint8Array(ptAudio), enAudio.byteLength);

	const outputPath = "./public/audio/pronunciation.mp3";
	await Bun.write(outputPath, combined);
	console.log(`Saved to ${outputPath}`);
}

generatePronunciation();
