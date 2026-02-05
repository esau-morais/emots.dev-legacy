import type { RefObject } from "react";
import { useEffect, useState } from "react";

interface Args extends IntersectionObserverInit {
	freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
	elementRef: RefObject<Element | null>,
	{
		threshold = 0,
		root = null,
		rootMargin = "0%",
		freezeOnceVisible = false,
	}: Args,
) => {
	const [entry, setEntry] = useState<IntersectionObserverEntry>();

	const frozen = entry?.isIntersecting && freezeOnceVisible;

	const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
		setEntry(entry);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(elementRef?.current): ref is mutable and non-reactive
	// biome-ignore lint/correctness/useExhaustiveDependencies(updateEntry): leave to compiler
	useEffect(() => {
		const node = elementRef?.current; // DOM Ref
		const hasIOSupport = "IntersectionObserver" in window;

		if (!hasIOSupport || frozen || !node) return;

		const observerParams = { threshold, root, rootMargin };
		const observer = new IntersectionObserver(updateEntry, observerParams);

		observer.observe(node);

		return () => observer.disconnect();
	}, [threshold, root, rootMargin, frozen]);

	return entry;
};
