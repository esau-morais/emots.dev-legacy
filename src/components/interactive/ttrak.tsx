"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useDemoContext } from "@/components/mdx/demo";
import { cn } from "@/utils/classNames";

type TaskStatus = "todo" | "inProgress" | "done";
type TaskPriority = "high" | "medium" | "low" | "none";
type TaskSource = "github" | "linear" | "local";
type TabFilter = "all" | "todo" | "inProgress" | "done";

type Task = {
	id: string;
	title: string;
	priority: TaskPriority;
	status: TaskStatus;
	source: TaskSource;
};

const INITIAL_TASKS: Task[] = [
	{
		id: "GH-42",
		title: "Add user settings page",
		priority: "high",
		status: "todo",
		source: "github",
	},
	{
		id: "LIN-15",
		title: "Update documentation",
		priority: "medium",
		status: "inProgress",
		source: "linear",
	},
	{
		id: "LOCAL-1",
		title: "Fix login validation",
		priority: "low",
		status: "inProgress",
		source: "local",
	},
	{
		id: "GH-89",
		title: "Refactor API routes",
		priority: "none",
		status: "done",
		source: "github",
	},
];

const STATUS_ICON: Record<TaskStatus, string> = {
	todo: "○",
	inProgress: "◉",
	done: "✓",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
	high: "HIG",
	medium: "MED",
	low: "LOW",
	none: "",
};

const SOURCE_ICON: Record<TaskSource, string> = {
	github: "G",
	linear: "L",
	local: "▸",
};

const TABS: { key: TabFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "todo", label: "Todo" },
	{ key: "inProgress", label: "In Progress" },
	{ key: "done", label: "Done" },
];

const DEFAULT_FOOTER_MOBILE = "j/k:nav  space:status  s:sync";
const DEFAULT_FOOTER_DESKTOP =
	"/:search  j/k:nav  space:status  s:sync  1-4:filter  q:quit";

const cycleStatus = (status: TaskStatus): TaskStatus => {
	const cycle: Record<TaskStatus, TaskStatus> = {
		todo: "inProgress",
		inProgress: "done",
		done: "todo",
	};
	return cycle[status];
};

const filterTasks = (tasks: Task[], filter: TabFilter): Task[] => {
	if (filter === "all") return tasks;
	return tasks.filter((t) => t.status === filter);
};

export const Ttrak = () => {
	const { slowMode, restartKey } = useDemoContext();
	const [isVisible, setIsVisible] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [activeTab, setActiveTab] = useState<TabFilter>("all");
	const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
	const [footerMsg, setFooterMsg] = useState<string | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);
	const [keystroke, setKeystroke] = useState<string | null>(null);

	const delay = slowMode ? 2500 : 600;
	const duration = slowMode ? 0.8 : 0.2;
	const stagger = slowMode ? 0.3 : 0.08;
	const springConfig = {
		type: "spring" as const,
		stiffness: slowMode ? 180 : 500,
		damping: slowMode ? 16 : 35,
	};
	const cancelledRef = useRef(false);

	const filteredTasks = filterTasks(tasks, activeTab);
	const totalCount = tasks.length;
	const filteredCount = filteredTasks.length;

	// biome-ignore lint/correctness/useExhaustiveDependencies: restartKey triggers reset
	useEffect(() => {
		setIsVisible(false);
		setSelectedIndex(0);
		setActiveTab("all");
		setTasks(INITIAL_TASKS);
		setFooterMsg(null);
		setIsSyncing(false);
		setKeystroke(null);
	}, [restartKey]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: restartKey triggers animation restart
	useEffect(() => {
		cancelledRef.current = false;

		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = setTimeout(() => {
					if (!cancelledRef.current) resolve();
				}, ms);
				return () => clearTimeout(id);
			});

		const pressKey = (key: string) => {
			if (cancelledRef.current) return;
			setKeystroke(key);
		};

		const sequence = async () => {
			if (cancelledRef.current) return;

			await wait(delay * 0.5);
			if (cancelledRef.current) return;
			setIsVisible(true);

			await wait(delay);
			if (cancelledRef.current) return;
			pressKey("j");
			setSelectedIndex(1);

			await wait(delay * 0.6);
			if (cancelledRef.current) return;
			pressKey("j");
			setSelectedIndex(2);

			await wait(delay * 0.8);
			if (cancelledRef.current) return;
			pressKey("space");
			setTasks((prev) =>
				prev.map((t, i) =>
					i === 2 ? { ...t, status: cycleStatus(t.status) } : t,
				),
			);

			await wait(delay);
			if (cancelledRef.current) return;
			pressKey("2");
			setActiveTab("todo");
			setSelectedIndex(0);

			await wait(delay * 0.8);
			if (cancelledRef.current) return;
			pressKey("3");
			setActiveTab("inProgress");
			setSelectedIndex(0);

			await wait(delay * 0.8);
			if (cancelledRef.current) return;
			pressKey("4");
			setActiveTab("done");
			setSelectedIndex(0);

			await wait(delay * 0.8);
			if (cancelledRef.current) return;
			pressKey("1");
			setActiveTab("all");
			setSelectedIndex(0);

			await wait(delay);
			if (cancelledRef.current) return;
			pressKey("s");
			setIsSyncing(true);
			setFooterMsg("syncing...");

			await wait(delay * 1.5);
			if (cancelledRef.current) return;
			setIsSyncing(false);
			setFooterMsg(`✓ synced ${totalCount} tasks`);

			await wait(delay * 1.5);
			if (cancelledRef.current) return;
			setFooterMsg(null);

			await wait(delay * 2);
			if (cancelledRef.current) return;

			setIsVisible(false);
			setSelectedIndex(0);
			setActiveTab("all");
			setTasks(INITIAL_TASKS);
		};

		sequence();

		const totalDuration = delay * 15;
		const interval = setInterval(() => {
			if (!cancelledRef.current) sequence();
		}, totalDuration);

		return () => {
			cancelledRef.current = true;
			clearInterval(interval);
		};
	}, [restartKey, delay, totalCount]);

	return (
		<div className="w-full max-w-lg font-mono text-sm select-none">
			<div className="border border-gray-800 bg-gray-950 overflow-hidden relative">
				<div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
					<span className="text-gray-300 font-medium">TTRAK</span>
					<span className="text-gray-500">
						{filteredCount}/{totalCount} tasks
					</span>
				</div>

				<div className="border-b border-gray-800 px-4 py-2">
					<span className="text-gray-600">
						Search tasks... (Press / to focus)
					</span>
				</div>

				<div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
					<div className="flex gap-3 sm:gap-6">
						{TABS.map((tab) => {
							const isActive = activeTab === tab.key;
							return (
								<div key={tab.key} className="relative">
									<span
										className={isActive ? "text-gray-200" : "text-gray-600"}
									>
										{tab.label}
									</span>
									{isActive ? (
										<motion.div
											layoutId="tab-underline"
											className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-500"
											transition={springConfig}
										/>
									) : null}
								</div>
							);
						})}
					</div>
					<div
						className={cn(
							"px-1.5 text-center bg-gray-800 border border-gray-700 text-xs text-gray-400 transition-opacity",
							keystroke ? "opacity-100" : "opacity-0",
						)}
					>
						{keystroke}
					</div>
				</div>

				<div className="py-1 min-h-35">
					{filteredTasks.length === 0 ? (
						<div className="px-4 py-4 text-gray-600 text-center">No tasks</div>
					) : (
						filteredTasks.map((task, index) => {
							const isSelected = selectedIndex === index;
							const statusColor =
								task.status === "done"
									? "text-gray-400"
									: task.status === "inProgress"
										? "text-gray-300"
										: "text-gray-600";

							return (
								<motion.div
									key={task.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: isVisible ? 1 : 0 }}
									transition={{ delay: index * stagger, duration }}
									className={cn(
										"flex items-center gap-3 px-4 py-1.5 transition-colors",
										isSelected ? "bg-gray-800 text-white" : "text-gray-500",
									)}
								>
									<span className={cn("w-3 text-center", statusColor)}>
										{STATUS_ICON[task.status]}
									</span>
									<span className="w-16 text-gray-600 shrink-0">{task.id}</span>
									<span
										className={cn(
											"flex-1 truncate",
											isSelected && "text-gray-100",
										)}
									>
										{task.title}
									</span>
									{task.priority !== "none" ? (
										<span className="text-gray-600 shrink-0">
											[{PRIORITY_LABEL[task.priority]}]
										</span>
									) : null}
									<span className="text-gray-700 shrink-0">
										{SOURCE_ICON[task.source]}
									</span>
								</motion.div>
							);
						})
					)}
				</div>

				<div className="border-t border-gray-800 px-4 py-2 text-gray-600 h-8 flex items-center">
					{isSyncing ? (
						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-gray-400"
						>
							{footerMsg}
						</motion.span>
					) : footerMsg ? (
						<motion.span
							key={footerMsg}
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="text-gray-400"
						>
							{footerMsg}
						</motion.span>
					) : (
						<>
							<span className="sm:hidden">{DEFAULT_FOOTER_MOBILE}</span>
							<span className="hidden sm:inline">{DEFAULT_FOOTER_DESKTOP}</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
