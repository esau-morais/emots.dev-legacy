"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import type { Experience } from "@/lib/experience";
import { cn } from "@/utils/classNames";

interface TimelineEntryProps {
	experience: Experience;
	isExpanded: boolean;
	onToggle: (id: string) => void;
}

export const TimelineEntry = ({
	experience,
	isExpanded,
	onToggle,
}: TimelineEntryProps) => {
	const prefersReducedMotion = useReducedMotion();
	const contentId = useId();

	return (
		<li className="group/entry list-none">
			<article
				data-state={isExpanded ? "expanded" : "collapsed"}
				className={cn(
					"relative pl-6 transition-[opacity,filter] duration-300 hover:duration-0",
					"group-has-data-[state=expanded]/timeline:opacity-50 group-has-data-[state=expanded]/timeline:blur-[0.5px]",
					"data-[state=expanded]:opacity-100 data-[state=expanded]:blur-none",
					"hover:opacity-100 hover:blur-none",
					"group-has-hover/timeline:not-hover:opacity-50 group-has-hover/timeline:not-hover:blur-[0.5px]",
					"group-has-focus-visible/timeline:not-focus-within:opacity-50 group-has-focus-visible/timeline:not-focus-within:blur-[0.5px]",
					"focus-within:opacity-100 focus-within:blur-none",
				)}
			>
				<button
					type="button"
					onClick={() => onToggle(experience.id)}
					aria-expanded={isExpanded}
					aria-controls={contentId}
					className="group relative flex w-full items-center justify-between gap-4 py-3 text-left transition-colors focus:outline-none"
				>
					<div
						className={cn(
							"absolute -left-6 top-1/2 size-2 -translate-y-1/2 transition-colors duration-300 group-hover/entry:duration-0",
							experience.isCurrent
								? "bg-white"
								: "border border-gray-600 bg-transparent",
							isExpanded && "bg-white border-white",
						)}
						aria-hidden="true"
					/>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
						<h3 className="font-serif text-lg italic text-white">
							{experience.company}
						</h3>
						<span className="font-mono text-sm text-gray-400">
							{experience.role}
						</span>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						<time className="text-xs uppercase tracking-widest text-gray-600">
							{experience.duration.start} —{" "}
							{experience.duration.end === "present"
								? "PRESENT"
								: experience.duration.end}
						</time>
						<CaretRightIcon
							size={14}
							aria-hidden="true"
							className={cn(
								"text-gray-500 transition-[color_200ms_ease-out,_rotate_200ms_ease-out] group-hover/entry:text-white group-hover/entry:transition-[color_0ms,_rotate_200ms_ease-out] group-focus-visible:text-gray-300",
								isExpanded ? "rotate-90" : "rotate-0",
							)}
						/>
					</div>
				</button>

				<AnimatePresence initial={false}>
					{isExpanded && (
						<motion.div
							id={contentId}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
							}
							className="mt-2 overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-sm shadow-xl shadow-black/20 ring-1 ring-white/5"
						>
							<ul className="space-y-2 p-4 border-l border-dashed border-gray-800">
								{experience.impacts.map((impact, i) => (
									<li
										key={`${experience.id}-impact-${i}`}
										className="text-sm leading-relaxed text-gray-500"
									>
										{impact}
									</li>
								))}
							</ul>

							{experience.technologies.length > 0 && (
								<div className="flex flex-wrap gap-2 px-4 pb-4">
									{experience.technologies.map((tech) => (
										<span
											key={`${experience.id}-tech-${tech}`}
											className="inline-flex items-center text-xs text-gray-500 before:content-['◆'] before:-translate-y-[0.1em] before:mr-1.5 before:text-[0.5rem] before:text-gray-700"
										>
											{tech}
										</span>
									))}
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</article>
		</li>
	);
};
