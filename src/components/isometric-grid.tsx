"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { sounds } from "@/lib/sounds";
import { cn } from "@/utils/classNames";

type TileProps = {
	children?: React.ReactNode;
	className?: string;
	isHome?: boolean;
	onHover?: () => void;
} & ({ href?: undefined } | { href: "/" });

const Tile = ({ children, className, href, isHome, onHover }: TileProps) => {
	const lastHoverTime = useRef(0);

	const handleMouseEnter = useCallback(() => {
		const now = Date.now();
		if (now - lastHoverTime.current > 100) {
			lastHoverTime.current = now;
			onHover?.();
		}
	}, [onHover]);

	const tileInner = (
		<div
			className={cn(
				"relative flex size-20 items-center justify-center bg-gray-950 transition-all duration-300 ease-out md:size-24",
				"border border-gray-800 shadow-[-4px_4px_12px_rgba(0,0,0,0.4)]",
				"group-hover:md:-translate-y-3 group-hover:shadow-[-15px_15px_30px_rgba(0,0,0,0.6)]",
				"group-focus-visible:md:-translate-y-3 group-focus-visible:shadow-[-15px_15px_30px_rgba(0,0,0,0.6)]",
				className,
			)}
		>
			{isHome && (
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			)}
			{children}
		</div>
	);

	if (href) {
		return (
			<Link
				href={href}
				className="group outline-none focus-visible:ring-2 focus-visible:ring-white/50"
				onMouseEnter={handleMouseEnter}
			>
				{tileInner}
			</Link>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative hover effect, not interactive
		<div className="group" onMouseEnter={handleMouseEnter}>
			{tileInner}
		</div>
	);
};

const Text404Char = ({ char }: { char: string }) => (
	<span
		className="text-404-char relative inline-block text-gray-500"
		data-char={char}
	>
		{char}
	</span>
);

const TILE_SIZE = 96;
const GAP = 12;
const GRID_SIZE = 5;
const EXTEND = 500;

const GridExtensionLines = () => {
	const cellSize = TILE_SIZE + GAP;
	const gridDim = GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * GAP;

	const hLines = Array.from({ length: GRID_SIZE + 1 }, (_, i) => {
		const y = i * cellSize - (i > 0 ? GAP : 0);
		return (
			<g key={`h-${y}`}>
				<line
					x1={-EXTEND}
					y1={y}
					x2={0}
					y2={y}
					stroke="#555"
					strokeDasharray="6,10"
				/>
				<line
					x1={gridDim}
					y1={y}
					x2={gridDim + EXTEND}
					y2={y}
					stroke="#555"
					strokeDasharray="6,10"
				/>
			</g>
		);
	});

	const vLines = Array.from({ length: GRID_SIZE + 1 }, (_, i) => {
		const x = i * cellSize - (i > 0 ? GAP : 0);
		return (
			<g key={`v-${x}`}>
				<line
					x1={x}
					y1={-EXTEND}
					x2={x}
					y2={0}
					stroke="#555"
					strokeDasharray="6,10"
				/>
				<line
					x1={x}
					y1={gridDim}
					x2={x}
					y2={gridDim + EXTEND}
					stroke="#555"
					strokeDasharray="6,10"
				/>
			</g>
		);
	});

	return (
		<svg
			className="pointer-events-none absolute left-0 top-0 overflow-visible"
			width={gridDim}
			height={gridDim}
			style={{ opacity: 0.4 }}
			aria-hidden="true"
		>
			{hLines}
			{vLines}
		</svg>
	);
};

const LostCat = () => (
	<figure aria-label="Lost cat">
		<pre className="select-none text-center font-mono text-sm leading-tight text-gray-600">
			{"/\\_/\\\n( x.x )"}
		</pre>
	</figure>
);

export const IsometricGrid = () => {
	const handleTileHover = useCallback(() => {
		sounds.hover();
	}, []);

	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
			{/* Halftone gradient overlay */}
			<div
				className="pointer-events-none absolute inset-0 z-10"
				style={{
					background: `
						radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%),
						radial-gradient(2px 2px at 0 0, rgba(255,255,255,0.02) 1px, transparent 0)
					`,
					backgroundSize: "100% 100%, 8px 8px",
					maskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
					WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
				}}
			/>

			{/* Desktop: Isometric 3D view */}
			<div className="hidden md:block">
				<h1 className="sr-only">404</h1>
				<div
					className="isometric-scene relative"
					style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
				>
					<div
						className="isometric-plane relative"
						style={{
							transform: "rotateX(55deg) rotateZ(-30deg)",
							transformStyle: "preserve-3d",
						}}
					>
						<GridExtensionLines />

						{/* Grid layout: 5x5, 404 platform centered */}
						<div
							className="grid gap-3"
							style={{
								gridTemplateColumns: "repeat(5, 96px)",
								gridTemplateRows: "repeat(5, 96px)",
								transform: "translateZ(2px)",
							}}
						>
							{/* Row 1 */}
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />

							{/* Row 2: 404 Platform starts (cols 2-4, rows 2-3) */}
							<Tile onHover={handleTileHover} />
							<div
								className="relative col-span-3 row-span-2 border border-gray-800 bg-gray-950"
								style={{
									boxShadow: "-8px 8px 24px rgba(0,0,0,0.5)",
								}}
							>
								<div
									className="text-404 absolute inset-0 flex items-center justify-center whitespace-nowrap font-mono text-[8rem] font-black leading-none tracking-tighter"
									style={{
										transformStyle: "preserve-3d",
										transform: "translateZ(45px)",
									}}
								>
									<Text404Char char="4" />
									<Text404Char char="0" />
									<Text404Char char="4" />
								</div>
							</div>
							<Tile onHover={handleTileHover} />

							{/* Row 3 (platform continues) */}
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />

							{/* Row 4: [home] centered */}
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile href="/" isHome onHover={handleTileHover}>
								<span className="text-sm text-gray-400">[home]</span>
							</Tile>
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />

							{/* Row 5 */}
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
							<Tile onHover={handleTileHover} />
						</div>
					</div>
				</div>

				{/* Column: cat + dashed line + label */}
				<div className="mt-16 flex flex-col items-center gap-3">
					<LostCat />
					<div className="h-8 border-l border-dashed border-gray-700" />
					<span className="font-mono text-xs text-gray-600">
						&quot;go home&quot;
					</span>
				</div>
			</div>

			{/* Mobile: Simplified 2D layout */}
			<div className="flex flex-col items-center gap-8 md:hidden">
				<h1 className="font-mono text-6xl font-black tracking-tighter text-gray-500">
					404
				</h1>

				<div className="grid grid-cols-2 gap-3">
					<Tile onHover={handleTileHover} />
					<Tile onHover={handleTileHover} />
					<Tile href="/" isHome onHover={handleTileHover}>
						<span className="text-sm text-gray-400">[home]</span>
					</Tile>
					<Tile onHover={handleTileHover} />
				</div>

				<div className="flex flex-col items-center gap-2">
					<LostCat />
					<div className="h-6 border-l border-dashed border-gray-700" />
					<span className="font-mono text-xs text-gray-600">
						&quot;go home&quot;
					</span>
				</div>
			</div>
		</div>
	);
};
