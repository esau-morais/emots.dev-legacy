import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
	const { slug } = await params;

	let title = "Blog";
	let description = "";

	try {
		const { frontmatter } = await getPost(slug);
		title = frontmatter.title;
		description = frontmatter.description;
	} catch {
		// fallback
	}

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#000",
				padding: "60px 80px",
				fontFamily: "monospace",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "24px",
				}}
			>
				<div
					style={{
						fontSize: 56,
						fontWeight: 500,
						color: "#fff",
						lineHeight: 1.2,
						maxWidth: "90%",
					}}
				>
					{title}
				</div>
				{description && (
					<div
						style={{
							fontSize: 28,
							color: "#737373",
							lineHeight: 1.4,
							maxWidth: "80%",
						}}
					>
						{description}
					</div>
				)}
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div style={{ fontSize: 24, color: "#737373" }}>emots.dev/blog</div>
			</div>
		</div>,
		{ ...size },
	);
}
