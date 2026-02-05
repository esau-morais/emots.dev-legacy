import type { Metadata } from "next";
import { getPage, getPageRaw, parseKeyValueSections } from "@/lib/pages";

export function generateMetadata(): Metadata {
	const { frontmatter } = getPage("craft");
	return {
		title: frontmatter.title,
		description: frontmatter.description,
	};
}

export default function CraftPage() {
	const raw = getPageRaw("craft");
	const sections = parseKeyValueSections(raw || "");

	return (
		<div className="mx-auto max-w-2xl px-6">
			<h1 className="mb-12 text-lg font-medium text-white">craft</h1>

			{sections.map((section) => (
				<section key={section.heading} className="mb-12">
					<h2 className="text-xs mb-6 font-medium uppercase tracking-[0.2em] text-gray-600">
						{section.heading}
					</h2>
					<ul className="space-y-3">
						{section.items.map((item) => (
							<li
								key={item.label}
								className="flex items-baseline justify-between border-b border-gray-900 pb-3"
							>
								<span className="text-sm text-gray-600">{item.label}</span>
								<span className="text-gray-400">{item.value}</span>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
