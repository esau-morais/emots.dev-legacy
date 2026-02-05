"use client";

import { useEffect } from "react";

const STORAGE_KEY = "console-greeted";

const CAT_ART = `
     /\\_/\\
    ( •.• )  ← hi
     > ^ <
`;

export function ConsoleGreeting() {
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (sessionStorage.getItem(STORAGE_KEY)) return;

		console.groupCollapsed(
			`%c${CAT_ART}`,
			"color:#888;font-family:monospace;font-size:11px",
		);
		console.log("%cesaú morais", "color:#888;font-weight:bold");
		console.log("%cfrontend engineer", "color:#666;font-style:italic");
		console.log("%cemots.dev", "color:#666;font-style:italic");
		console.groupEnd();

		sessionStorage.setItem(STORAGE_KEY, "1");
	}, []);

	return null;
}
