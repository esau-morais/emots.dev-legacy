import { z } from "zod";

const schema = z.object({
	NEXT_PUBLIC_BASE_URL: z.url().optional(),
	NEXT_PUBLIC_R2_URL: z.string().default("https://cdn.emots.dev"),
});

export type ClientEnv = z.infer<typeof schema>;

function validate(): ClientEnv {
	const result = schema.safeParse({
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_R2_URL: process.env.NEXT_PUBLIC_R2_URL,
	});

	if (!result.success) {
		const errors = result.error.issues
			.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");

		throw new Error(`Invalid client environment variables:\n${errors}`);
	}

	return result.data;
}

export const client: ClientEnv = validate();
