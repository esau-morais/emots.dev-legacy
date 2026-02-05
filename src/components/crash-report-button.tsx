"use client";

import { useState } from "react";
import { cn } from "@/utils/classNames";

type ReportState = "idle" | "sending" | "sent" | "error";

type CrashReportButtonProps = {
	errorMessage: string;
};

export function CrashReportButton({ errorMessage }: CrashReportButtonProps) {
	const [state, setState] = useState<ReportState>("idle");

	const sendReport = async () => {
		if (state === "sending" || state === "sent") return;

		setState("sending");

		const minDelay = new Promise((r) => setTimeout(r, 400));

		try {
			const [response] = await Promise.all([
				fetch("/api/error-report", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: errorMessage,
						url: window.location.href,
						userAgent: navigator.userAgent,
						timestamp: new Date().toISOString(),
					}),
				}),
				minDelay,
			]);

			setState(response.ok ? "sent" : "error");
		} catch {
			setState("error");
		}
	};

	const label = {
		idle: "send crash report",
		sending: "sending…",
		sent: "sent ✓",
		error: "failed to send",
	}[state];

	return (
		<button
			type="button"
			onClick={sendReport}
			disabled={state === "sent"}
			{...(state === "idle" && { "data-sound": "click" })}
			className={cn(
				"text-sm underline-offset-4 transition-colors focus:outline-none",
				state === "idle" &&
					"text-gray-500 hover:text-gray-300 hover:underline focus-visible:text-gray-300 focus-visible:underline",
				state === "sending" && "text-gray-500 opacity-70",
				state === "sent" && "text-green-400",
				state === "error" &&
					"text-red-400 hover:text-red-300 hover:underline focus-visible:text-red-300 focus-visible:underline",
			)}
		>
			{label}
		</button>
	);
}
