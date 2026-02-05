"use client";

import Link from "next/link";
import { CrashReportButton } from "@/components/crash-report-button";
import { cn } from "@/utils/classNames";

const FAKE_LOGS = [
	{ level: "INFO", message: "Application started" },
	{ level: "WARN", message: "Memory usage above threshold" },
	{ level: "ERROR", message: "Unhandled exception in render" },
	{ level: "ERROR", message: "Component tree unmounted unexpectedly" },
	{ level: "FATAL", message: "Process terminated" },
];

const getLevelColor = (level: string) => {
	switch (level) {
		case "INFO":
			return "text-blue-400";
		case "WARN":
			return "text-yellow-400";
		case "ERROR":
			return "text-red-400";
		case "FATAL":
			return "text-red-600";
		default:
			return "text-gray-400";
	}
};

const ErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-8">
			<h1 className="text-4xl md:text-5xl">
				Something <span className="font-serif italic text-red-500">broke.</span>
			</h1>

			<div className="w-full max-w-md border border-red-900/50 bg-red-950/20 p-4 font-mono text-xs">
				<span className="text-red-400">[ERROR]</span>{" "}
				<span className="text-red-300">{error.message || "Unknown error"}</span>
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex gap-4">
					<button
						type="button"
						onClick={reset}
						className="flex-1 border border-gray-700 px-4 py-2 text-sm transition-colors hover:border-gray-500 hover:text-white focus:outline-none focus-visible:border-gray-500 focus-visible:text-white"
						data-sound="click"
					>
						retry
					</button>
					<Link
						href="/"
						className="flex-1 border border-gray-700 px-4 py-2 text-center text-sm transition-colors hover:border-gray-500 hover:text-white focus:outline-none focus-visible:border-gray-500 focus-visible:text-white"
					>
						home
					</Link>
				</div>
				<CrashReportButton errorMessage={error.message || "Unknown error"} />
			</div>

			<div className="w-full max-w-md mask-[linear-gradient(to_bottom,black_80%,transparent)]">
				<div className="border border-gray-800 bg-gray-900/50 p-4 font-mono text-xs">
					{FAKE_LOGS.map((log, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static array, never reorder
						<div key={i} className="flex gap-2">
							<span className={cn("w-[7ch]", getLevelColor(log.level))}>
								[{log.level}]
							</span>
							<span className="text-gray-400">{log.message}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
