"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useCallback, useRef } from "react";
import { useWindowResize } from "@/lib/hooks/window-resize";
import { cn } from "@/utils/classNames";

const NAV_ITEMS = [
	{ path: "/", label: "home" },
	{ path: "/work", label: "work" },
	{ path: "/blog", label: "blog" },
	{ path: "/craft", label: "craft" },
] as const;

export const Header = () => {
	const path = usePathname();
	const navRef = useRef<HTMLElement>(null);
	const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

	const activeIndex = NAV_ITEMS.findIndex((item) =>
		item.path === "/" ? path === "/" : path.startsWith(item.path),
	);

	const updatePill = useCallback(() => {
		const nav = navRef.current;
		const link = linkRefs.current[activeIndex];
		if (!nav || !link) return;

		nav.style.setProperty("--pill-left", `${link.offsetLeft}px`);
		nav.style.setProperty("--pill-width", `${link.offsetWidth}px`);
	}, [activeIndex]);

	useWindowResize(updatePill);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-10 max-w-3xl items-center justify-center border-b border-gray-800 bg-black/80 px-4 shadow-[0_20px_30px_-10px_rgba(0,0,0,0.9)] backdrop-blur-sm before:absolute before:left-4 before:-bottom-6 before:hidden before:h-6 before:w-px before:bg-gray-800 after:absolute after:right-4 after:-bottom-6 after:hidden after:h-6 after:w-px after:bg-gray-800 md:justify-between md:px-8 md:before:left-8 md:before:-bottom-8 md:before:block md:before:h-8 md:after:right-8 md:after:-bottom-8 md:after:block md:after:h-8">
			<nav
				ref={navRef}
				className="relative flex h-full divide-x divide-gray-800 border-l border-gray-800"
				style={{ "--pill-left": "0px", "--pill-width": "0px" } as CSSProperties}
			>
				{NAV_ITEMS.map((item, i) => (
					<Link
						key={item.label}
						ref={(el) => {
							linkRefs.current[i] = el;
						}}
						className={cn(
							"relative z-10 flex items-center px-4 text-white focus-visible:outline-none touch-manipulation",
							i !== activeIndex &&
								"hover:bg-gray-900/50 focus-visible:bg-gray-900/50",
						)}
						href={item.path}
						aria-current={i === activeIndex ? "page" : undefined}
					>
						{item.label}
					</Link>
				))}
				<span
					className="pointer-events-none absolute inset-y-0 bg-gray-800 transition-all duration-300 ease-out"
					style={{ left: "var(--pill-left)", width: "var(--pill-width)" }}
				/>
			</nav>
		</header>
	);
};
