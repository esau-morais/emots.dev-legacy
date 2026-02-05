import type { Metadata } from "next";
import { InteractiveChecklist } from "@/components/interactive-checklist";
import { getPage, getPageRaw, parseChecklistFromMdx } from "@/lib/pages";

export function generateMetadata(): Metadata {
	const { frontmatter } = getPage("checklist");
	return {
		title: frontmatter.title,
		description: frontmatter.description,
	};
}

export default function ChecklistPage() {
	const { frontmatter } = getPage("checklist");
	const raw = getPageRaw("checklist");
	const { items, categories } = parseChecklistFromMdx(raw || "");

	return (
		<article className="mx-auto max-w-2xl px-6">
			<header className="mb-12">
				<h1 className="mb-4 font-mono text-4xl font-bold text-white">
					{frontmatter.title}
				</h1>
				<p className="mb-6 text-gray-400">{frontmatter.description}</p>

				<InteractiveChecklist items={items} categories={categories} />
			</header>

			<footer className="mt-16 border-t border-gray-800 pt-8">
				<h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-gray-400">
					Credits
				</h3>
				<div className="space-y-2 text-sm text-gray-400">
					<p>
						Guidelines adapted from{" "}
						<a
							href="https://vercel.com/design/guidelines"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white underline hover:text-gray-200"
						>
							Vercel Web Interface Guidelines
						</a>{" "}
						and{" "}
						<a
							href="https://roadmap.sh/frontend-performance-best-practices"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white underline hover:text-gray-200"
						>
							Frontend Performance Best Practices (roadmap.sh)
						</a>
						.
					</p>
					<p className="text-xs text-gray-500">
						Checklist state stored in browser memory only.
					</p>
				</div>
			</footer>
		</article>
	);
}
