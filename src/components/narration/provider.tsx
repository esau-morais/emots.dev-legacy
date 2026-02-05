"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NarrationPlayer } from "./player";
import { NarrationStoreProvider } from "./store";
import { NarrationTextHighlighter } from "./text-highlighter";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { staleTime: 60 * 1000, retry: 2 },
	},
});

export function NarrationProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<NarrationStoreProvider>
				{children}
				<NarrationPlayer />
				<NarrationTextHighlighter />
			</NarrationStoreProvider>
		</QueryClientProvider>
	);
}
