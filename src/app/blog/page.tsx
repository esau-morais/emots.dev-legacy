import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
	title: "blog",
	description: "thoughts on software, design, and building things",
};

export default async function BlogPage() {
	const posts = await getPosts();

	return (
		<div className="mx-auto max-w-2xl px-6">
			<h1 className="mb-12 text-lg font-medium text-white">writing</h1>

			{posts.length === 0 ? (
				<p className="text-gray-500">no posts yet.</p>
			) : (
				<ul className="-mx-4 space-y-1">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								href={`/blog/${post.slug}`}
								className="group flex items-start justify-between gap-4 px-4 py-4 transition-[background-color] duration-75 ease-out hover:bg-gray-900 hover:delay-0 hover:duration-0 focus-visible:bg-gray-900 focus-visible:outline-none"
							>
								<div className="min-w-0 space-y-1">
									<h2 className="font-medium text-white">
										{post.frontmatter.title}
									</h2>
									<p className="text-sm text-gray-500 line-clamp-2">
										{post.frontmatter.description}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-3">
									<div className="flex flex-col items-end gap-2">
										<time
											dateTime={post.frontmatter.date}
											className="text-sm text-gray-600"
										>
											{format(new Date(post.frontmatter.date), "yyyy-MM-dd")}
										</time>
										<span className="text-sm text-gray-600">
											{post.frontmatter.readingTime} min read
										</span>
									</div>
									<ArrowUpRightIcon
										size={16}
										className="text-gray-600 opacity-0 transition-opacity duration-75 ease-out group-hover:opacity-100 group-hover:delay-0 group-hover:duration-0 group-focus-visible:opacity-100"
										aria-hidden="true"
									/>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
