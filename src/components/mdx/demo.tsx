"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { cn } from "@/utils/classNames";

type DemoContextType = {
	slowMode: boolean;
	debugMode: boolean;
	autoScroll: boolean;
	restartKey: number;
};

const DemoContext = createContext<DemoContextType>({
	slowMode: false,
	debugMode: false,
	autoScroll: false,
	restartKey: 0,
});

export const useDemoContext = () => useContext(DemoContext);

type ControlType = "restart" | "slow" | "debug" | "auto";

type DemoProps = {
	children: ReactNode;
	className?: string;
	controls?: ControlType[];
};

export const Demo = ({
	children,
	className = "",
	controls = ["restart"],
}: DemoProps) => {
	const [slowMode, setSlowMode] = useState(false);
	const [debugMode, setDebugMode] = useState(false);
	const [autoScroll, setAutoScroll] = useState(false);
	const [restartKey, setRestartKey] = useState(0);

	const handleRestart = useCallback(() => {
		setRestartKey((k) => k + 1);
	}, []);

	const hasControl = (c: ControlType) => controls.includes(c);

	return (
		<DemoContext.Provider
			value={{ slowMode, debugMode, autoScroll, restartKey }}
		>
			<div
				data-narration-skip
				className={cn(
					"relative my-8 min-h-60 sm:min-h-75 border border-gray-800 bg-gray-950",
					className,
				)}
			>
				<div className="flex items-center justify-end gap-3 border-b border-gray-800 px-3 py-2">
					{hasControl("restart") && (
						<button
							type="button"
							onClick={handleRestart}
							className="text-xs text-gray-600 transition-colors hover:text-white focus-visible:text-white focus:outline-none"
						>
							[restart]
						</button>
					)}
					{hasControl("slow") && (
						<button
							type="button"
							onClick={() => setSlowMode(!slowMode)}
							className={cn(
								"text-xs transition-colors hover:text-white focus-visible:text-white focus:outline-none",
								slowMode ? "text-white" : "text-gray-600",
							)}
						>
							[slow:{" "}
							<span className="inline-block w-[3ch]">
								{slowMode ? "on" : "off"}
							</span>
							]
						</button>
					)}
					{hasControl("debug") && (
						<button
							type="button"
							onClick={() => setDebugMode(!debugMode)}
							className={cn(
								"text-xs transition-colors hover:text-white focus-visible:text-white focus:outline-none",
								debugMode ? "text-white" : "text-gray-600",
							)}
						>
							[debug:{" "}
							<span className="inline-block w-[3ch]">
								{debugMode ? "on" : "off"}
							</span>
							]
						</button>
					)}
					{hasControl("auto") && (
						<label className="inline-flex cursor-pointer items-center gap-1 text-xs text-gray-600 transition-colors hover:text-white">
							<input
								type="checkbox"
								checked={autoScroll}
								onChange={(e) => setAutoScroll(e.target.checked)}
								className="size-3 accent-white"
							/>
							<span>auto</span>
						</label>
					)}
				</div>
				<div
					className={cn(
						"relative flex min-h-70 items-center justify-center p-4 sm:p-8",
						debugMode && "demo-debug-grid",
					)}
				>
					{children}
				</div>
			</div>
		</DemoContext.Provider>
	);
};
