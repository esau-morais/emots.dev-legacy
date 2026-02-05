export interface CharacterAlignment {
	char: string;
	start: number;
	end: number;
}

export interface WordAlignment {
	word: string;
	start: number;
	end: number;
	chars: CharacterAlignment[];
}

export interface NarrationAlignment {
	characters: string[];
	character_start_times_seconds: number[];
	character_end_times_seconds: number[];
}

export interface NarrationMetadata {
	slug: string;
	hash: string;
	duration: number;
	generatedAt: string;
}

export interface NarrationData {
	audioUrl: string;
	alignment: NarrationAlignment;
	metadata: NarrationMetadata;
}

export interface ElevenLabsTimestampResponse {
	audio_base64: string;
	alignment: NarrationAlignment;
}
