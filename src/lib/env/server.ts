import { z } from "zod";

const schema = z.object({
	ELEVENLABS_API_KEY: z.string().min(1),
	ELEVENLABS_VOICE_ID: z.string().default("JBFqnCBsd6RMkjVDRZzb"),
	ELEVENLABS_PRONUNCIATION_DICT_ID: z.string().default("y9nBCQ3IBgA8Bi9Y6s1j"),
	ELEVENLABS_PRONUNCIATION_DICT_VERSION: z
		.string()
		.default("8Sbl9AHMpo8EYAfa91d7"),
	R2_ACCOUNT_ID: z.string().min(1),
	R2_ACCESS_KEY_ID: z.string().min(1),
	R2_SECRET_ACCESS_KEY: z.string().min(1),
	R2_BUCKET_NAME: z.string().default("emots"),
	R2_PUBLIC_URL: z.string().default(""),
	DISCORD_ERROR_WEBHOOK_URL: z.url().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

function validate(): ServerEnv {
	if (cached) return cached;

	const result = schema.safeParse(process.env);

	if (!result.success) {
		const errors = result.error.issues
			.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");

		throw new Error(`Invalid server environment variables:\n${errors}`);
	}

	cached = result.data;
	return cached;
}

export const server = new Proxy({} as ServerEnv, {
	get(_, prop: string) {
		const env = validate();
		return env[prop as keyof ServerEnv];
	},
});
