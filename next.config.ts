import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	reactCompiler: true,
	cacheComponents: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
			},
			{
				protocol: "https",
				hostname: "**.s3.us-west-2.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "cdn.emots.dev",
			},
		],
	},
	redirects: async () => {
		return [
			{
				source: "/links",
				destination: "https://links.emots.dev",
				permanent: true,
			},
			{
				source: "/meet",
				destination: "https://cal.com/emorais/appointment",
				permanent: true,
			},
		];
	},
};

const withMDX = createMDX({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [
			"remark-gfm",
			"remark-frontmatter",
			"remark-mdx-frontmatter",
		],
		rehypePlugins: [
			"rehype-slug",
			[
				"rehype-pretty-code",
				{
					theme: "vesper",
					keepBackground: false,
				},
			],
		],
	},
});

export default withBundleAnalyzer(withMDX(nextConfig));
