import { server as env } from "@/lib/env/server";
import type { ElevenLabsTimestampResponse, NarrationAlignment } from "./types";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

function normalizeAlignment(alignment: NarrationAlignment): NarrationAlignment {
	const chars: string[] = [];
	const starts: number[] = [];
	const ends: number[] = [];

	let inBreakTag = false;
	let prevWasWhitespace = false;

	for (let i = 0; i < alignment.characters.length; i++) {
		const char = alignment.characters[i];
		const start = alignment.character_start_times_seconds[i];
		const end = alignment.character_end_times_seconds[i];

		if (char === "<") inBreakTag = true;
		if (inBreakTag) {
			if (char === ">") inBreakTag = false;
			continue;
		}

		const isWhitespace = /\s/.test(char);
		if (isWhitespace && prevWasWhitespace) continue;
		prevWasWhitespace = isWhitespace;

		chars.push(char);
		starts.push(start);
		ends.push(end);
	}

	return {
		characters: chars,
		character_start_times_seconds: starts,
		character_end_times_seconds: ends,
	};
}

export async function generateSpeechWithTimestamps(
	text: string,
	voiceId: string = env.ELEVENLABS_VOICE_ID,
): Promise<{ audioBuffer: Buffer; alignment: NarrationAlignment }> {
	const apiKey = env.ELEVENLABS_API_KEY;

	const response = await fetch(
		`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/with-timestamps`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"xi-api-key": apiKey,
			},
			body: JSON.stringify({
				text,
				model_id: "eleven_turbo_v2_5",
				voice_settings: {
					stability: 0.6,
					similarity_boost: 0.8,
				},
				pronunciation_dictionary_locators: [
					{
						pronunciation_dictionary_id: env.ELEVENLABS_PRONUNCIATION_DICT_ID,
						version_id: env.ELEVENLABS_PRONUNCIATION_DICT_VERSION,
					},
				],
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
	}

	const data = (await response.json()) as ElevenLabsTimestampResponse;
	const audioBuffer = Buffer.from(data.audio_base64, "base64");
	const alignment = normalizeAlignment(data.alignment);

	return { audioBuffer, alignment };
}
