"use client";

import { useState } from "react";

import type { ChecklistItem } from "@/lib/pages";
import { cn } from "@/utils/classNames";

type Props = {
	items: ChecklistItem[];
	categories: string[];
};

export const InteractiveChecklist = ({ items, categories }: Props) => {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	const toggleItem = (id: string) => {
		setChecked((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleCategory = (category: string) => {
		const categoryItems = items.filter((item) => item.category === category);
		const allChecked = categoryItems.every((item) => checked.has(item.id));

		setChecked((prev) => {
			const next = new Set(prev);
			categoryItems.forEach((item) => {
				if (allChecked) {
					next.delete(item.id);
				} else {
					next.add(item.id);
				}
			});
			return next;
		});
	};

	const progress = Math.round((checked.size / items.length) * 100);

	return (
		<>
			<section className="mb-4" aria-label="Progress tracker">
				<div className="mb-2 flex items-center justify-between text-sm">
					<span className="text-gray-400">Progress</span>
					<span className="font-mono text-white" aria-live="polite">
						{checked.size}/{items.length} ({progress}%)
					</span>
				</div>
				<div
					className="h-2 w-full overflow-hidden bg-gray-800"
					role="progressbar"
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Checklist completion progress"
				>
					<div
						className="h-full bg-white transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</section>

			<section className="space-y-8" aria-label="Checklist categories">
				{categories.map((category) => {
					const categoryItems = items.filter(
						(item) => item.category === category,
					);
					const categoryProgress = categoryItems.filter((item) =>
						checked.has(item.id),
					).length;
					const allChecked = categoryItems.every((item) =>
						checked.has(item.id),
					);

					return (
						<section
							key={category}
							className="border-l-2 border-gray-800 pl-6"
							aria-labelledby={`category-${category}`}
						>
							<button
								onClick={() => toggleCategory(category)}
								className="group mb-4 flex w-full items-center justify-between text-left transition-colors hover:text-white focus-visible:text-white focus:outline-none"
								type="button"
								aria-label={`Toggle all ${category} items`}
							>
								<h2
									id={`category-${category}`}
									className="font-mono text-xl font-semibold text-white"
								>
									{category}
								</h2>
								<span className="font-mono text-sm text-gray-400">
									{categoryProgress}/{categoryItems.length}
									<span
										className={cn(
											"ml-2",
											allChecked ? "text-white" : "text-gray-500",
										)}
										aria-hidden="true"
									>
										{allChecked ? "✓" : "○"}
									</span>
								</span>
							</button>

							<ul className="space-y-3">
								{categoryItems.map((item) => {
									const isChecked = checked.has(item.id);
									return (
										<li key={item.id}>
											<label className="group flex cursor-pointer items-start gap-3 transition-colors hover:text-white">
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleItem(item.id)}
													onMouseDown={(e) => e.preventDefault()}
													className="mt-1 size-4 cursor-pointer appearance-none border border-gray-700 bg-black transition-all checked:border-white checked:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
													aria-label={item.label}
												/>
												<span
													className={cn(
														"flex-1 text-sm",
														isChecked
															? "text-gray-500 line-through"
															: "text-white",
													)}
												>
													{item.label}
												</span>
											</label>
										</li>
									);
								})}
							</ul>
						</section>
					);
				})}
			</section>
		</>
	);
};
