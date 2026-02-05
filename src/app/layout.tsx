import type { Metadata, Viewport } from "next";
import { type ReactNode, Suspense } from "react";
import { ConsoleGreeting } from "@/components/console-greeting";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NarrationProvider } from "@/components/narration";
import { SoundProvider } from "@/components/sound-provider";
import { SoundToggle } from "@/components/sound-toggle";
import { GhostAnimationProvider } from "@/contexts/ghost-animation";
import { cn } from "@/utils/classNames";
import { description, ogImage, title, url } from "@/utils/consts";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const metadata: Metadata = {
	title: {
		default: title,
		template: "%s | Esaú Morais",
	},
	description,
	openGraph: {
		locale: "en-UK",
		type: "website",
		url: url,
		title: title,
		description: description,
		images: { url: ogImage, width: 1600, height: 630 },
	},
	twitter: {
		card: "summary_large_image",
		title: title,
		description: description,
		images: {
			url: ogImage,
			width: 1600,
			height: 630,
		},
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		shortcut: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: "400",
	variable: "--font-serif",
});

const RootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<html
			lang="en"
			className={cn(
				jetbrainsMono.variable,
				instrumentSerif.variable,
				"font-mono hide-scrollbar",
			)}
			suppressHydrationWarning
		>
			<head />
			<body className="relative min-h-dvh w-full overflow-x-hidden bg-black selection:bg-gray-800 selection:text-white text-white">
				<a
					href="#main-content"
					className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-[100] focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-black focus:outline-none"
				>
					Skip to content
				</a>
				<SoundProvider>
					<GhostAnimationProvider>
						<NarrationProvider>
							<div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 md:px-8">
								<Header />
								<main
									id="main-content"
									className="my-20 min-h-[calc(100dvh-80px-160px)]"
								>
									{children}
								</main>
							</div>
							<Footer>
								<span>emots.dev</span>
								<Suspense>
									<SoundToggle />
								</Suspense>
							</Footer>
						</NarrationProvider>
					</GhostAnimationProvider>
				</SoundProvider>
				<Analytics />
				<ConsoleGreeting />
			</body>
		</html>
	);
};

export default RootLayout;
