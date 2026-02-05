"use client";

import { useCallback, useEffect, useRef } from "react";
import { useNarrationStore } from "./store";

const HIGHLIGHTABLE_TAGS = new Set([
	"P",
	"LI",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"BLOCKQUOTE",
]);
const PLAYER_HEIGHT = 72;
const HEADER_HEIGHT = 48;

function getHighlightableAncestor(node: Node | null): Element | null {
	let current = node?.parentElement;
	while (current) {
		if (HIGHLIGHTABLE_TAGS.has(current.tagName)) return current;
		current = current.parentElement;
	}
	return null;
}

function isInsideCodeBlock(node: Node): boolean {
	let current = node.parentElement;
	while (current) {
		if (current.tagName === "PRE" || current.tagName === "CODE") return true;
		current = current.parentElement;
	}
	return false;
}

function isInsideSkippedComponent(node: Node): boolean {
	let current = node.parentElement;
	while (current) {
		if (current.hasAttribute("data-narration-skip")) return true;
		current = current.parentElement;
	}
	return false;
}

function isElementInViewport(el: Element): boolean {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= HEADER_HEIGHT + 32 &&
		rect.bottom <= window.innerHeight - PLAYER_HEIGHT - 32
	);
}

interface TextNodeInfo {
	node: Text;
	start: number;
	end: number;
	element: Element | null;
}

export function NarrationTextHighlighter() {
	const { isVisible, currentTime, alignment, followAlong, autoScroll } =
		useNarrationStore();
	const textNodesRef = useRef<TextNodeInfo[]>([]);
	const elementsRef = useRef<Set<Element>>(new Set());
	const articleRef = useRef<Element | null>(null);
	const lastCurrentRef = useRef<Element | null>(null);

	const findCharIndex = useCallback(
		(time: number) => {
			if (!alignment) return 0;
			const times = alignment.character_start_times_seconds;
			let lo = 0;
			let hi = times.length - 1;
			let answer = 0;
			while (lo <= hi) {
				const mid = Math.floor((lo + hi) / 2);
				if (times[mid] <= time) {
					answer = mid;
					lo = mid + 1;
				} else {
					hi = mid - 1;
				}
			}
			return answer;
		},
		[alignment],
	);

	const buildTextNodes = useCallback(() => {
		const article = document.querySelector("article");
		if (!article || article === articleRef.current) return;

		articleRef.current = article;
		textNodesRef.current = [];
		elementsRef.current = new Set();
		let charIndex = 0;
		let prevWasWhitespace = false;

		const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
		for (
			let node = walker.nextNode() as Text | null;
			node;
			node = walker.nextNode() as Text | null
		) {
			if (isInsideCodeBlock(node)) continue;
			if (isInsideSkippedComponent(node)) continue;
			const text = node.textContent || "";
			const element = getHighlightableAncestor(node);

			const nodeStartIndex = charIndex;
			for (const char of text) {
				const isWhitespace = /\s/.test(char);
				if (isWhitespace && prevWasWhitespace) continue;
				prevWasWhitespace = isWhitespace;
				charIndex++;
			}

			textNodesRef.current.push({
				node,
				start: nodeStartIndex,
				end: charIndex,
				element,
			});
			if (element) elementsRef.current.add(element);
		}
	}, []);

	const clearHighlights = useCallback(() => {
		elementsRef.current.forEach((el) => {
			el.removeAttribute("data-narration-status");
		});
		lastCurrentRef.current = null;
	}, []);

	useEffect(() => {
		if (!isVisible || !followAlong || !alignment) {
			clearHighlights();
			return;
		}

		buildTextNodes();
		if (textNodesRef.current.length === 0) return;

		const currentCharIndex = findCharIndex(currentTime);

		const currentNode = textNodesRef.current.find(
			(t) => currentCharIndex >= t.start && currentCharIndex < t.end,
		);
		const currentElement = currentNode?.element;

		for (const info of textNodesRef.current) {
			if (!info.element) continue;
			const isSpoken = info.end <= currentCharIndex;
			const isCurrent = info.element === currentElement;

			if (isCurrent) {
				info.element.setAttribute("data-narration-status", "current");
			} else if (isSpoken) {
				info.element.setAttribute("data-narration-status", "spoken");
			} else {
				info.element.removeAttribute("data-narration-status");
			}
		}

		if (currentElement && currentElement !== lastCurrentRef.current) {
			lastCurrentRef.current = currentElement;
			if (autoScroll && !isElementInViewport(currentElement)) {
				const rect = currentElement.getBoundingClientRect();
				window.scrollTo({
					top: window.scrollY + rect.top - window.innerHeight * 0.35,
					behavior: "smooth",
				});
			}
		}
	}, [
		isVisible,
		currentTime,
		alignment,
		followAlong,
		autoScroll,
		buildTextNodes,
		clearHighlights,
		findCharIndex,
	]);

	return null;
}
