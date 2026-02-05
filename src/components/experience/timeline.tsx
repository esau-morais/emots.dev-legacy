"use client";

import { useState } from "react";
import { experiences } from "@/lib/experience";
import { TimelineEntry } from "./timeline-entry";

const YEAR_RANGE = "2022 — 2025";

export const Timeline = () => {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleToggle = (id: string) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	return (
		<section aria-labelledby="timeline-heading">
			<header className="mb-12">
				<p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
					Career Path
				</p>
				<h2
					id="timeline-heading"
					className="mixed-type text-3xl md:text-4xl text-balance"
				>
					<span className="font-serif italic text-white">Experience</span>
					<span className="text-gray-400">&nbsp;& Roles</span>
				</h2>
				<p className="mt-4 text-sm text-gray-600">{YEAR_RANGE}</p>
			</header>

			<ol className="group/timeline">
				{experiences.map((experience) => (
					<TimelineEntry
						key={experience.id}
						experience={experience}
						isExpanded={expandedId === experience.id}
						onToggle={handleToggle}
					/>
				))}
			</ol>
		</section>
	);
};
