"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import type { Work } from "@/lib/work";

type WorkListProps = {
	works: Work[];
};

export const WorkList = ({ works }: WorkListProps) => {
	return (
		<ul className="-mx-4">
			{works.map((work) => (
				<li key={work.slug}>
					<Link
						href={`/work/${work.slug}`}
						className="group relative flex items-start justify-between gap-4 overflow-hidden px-4 py-4 transition-[background-color] duration-75 ease-out hover:bg-gray-900 hover:delay-0 hover:duration-0 focus-visible:bg-gray-900 focus-visible:outline-none motion-reduce:transition-none"
					>
						{work.frontmatter.cover && (
							<div
								className="pointer-events-none absolute inset-0"
								style={{
									maskImage:
										"linear-gradient(to right, transparent 2%, black 15%, black 85%, transparent 98%)",
									WebkitMaskImage:
										"linear-gradient(to right, transparent 2%, black 15%, black 85%, transparent 98%)",
								}}
							>
								<Image
									src={work.frontmatter.cover}
									alt=""
									fill
									className="object-cover object-right opacity-5 blur-[1px] grayscale brightness-75 contrast-90 transition-[opacity,filter,transform] duration-[300ms,400ms,500ms] ease-out group-hover:opacity-25 group-hover:blur-0 group-hover:grayscale-0 group-hover:brightness-110 group-hover:contrast-105 group-hover:scale-[1.02] group-focus-visible:opacity-25 group-focus-visible:blur-0 group-focus-visible:grayscale-0 group-focus-visible:brightness-110 group-focus-visible:contrast-105 group-focus-visible:scale-[1.02] motion-reduce:transition-none"
									sizes="672px"
									unoptimized
								/>
							</div>
						)}

						<div className="relative z-10 min-w-0 flex-1 space-y-1">
							<div className="flex items-center gap-2">
								<h2 className="font-medium text-white">
									{work.frontmatter.title}
								</h2>
								<span className="bg-gray-900 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gray-500 group-hover:bg-gray-800 group-focus-visible:bg-gray-800">
									{work.frontmatter.type}
								</span>
							</div>
							<p className="line-clamp-1 text-sm text-gray-500">
								{work.frontmatter.description}
							</p>
						</div>
						<div className="relative z-10 flex shrink-0 items-center gap-3">
							<time
								dateTime={work.frontmatter.date}
								className="text-sm text-gray-600"
							>
								{new Date(work.frontmatter.date).getFullYear()}
							</time>
							<ArrowUpRightIcon
								size={16}
								className="text-gray-600 opacity-0 transition-opacity duration-75 ease-out group-hover:opacity-100 group-hover:delay-0 group-hover:duration-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</div>
					</Link>
				</li>
			))}
		</ul>
	);
};
