import {
	ArrowRightIcon,
	ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { CopyEmail } from "@/components/copy-email";
import { Timeline } from "@/components/experience/timeline";
import { GhostCat } from "@/components/ghost-cat";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { getFeaturedWorks } from "@/lib/work";

const SOCIAL_LINKS = [
	{
		href: "https://github.com/esau-morais",
		label: "github",
		Icon: GitHubIcon,
	},
	{
		href: "https://x.com/mor3is_",
		label: "twitter",
		Icon: XIcon,
	},
	{
		href: "https://linkedin.com/in/emmorais",
		label: "linkedin",
		Icon: LinkedInIcon,
	},
] as const;

const Home = async () => {
	const featuredWorks = await getFeaturedWorks();

	return (
		<div className="relative mx-auto max-w-2xl px-6">
			<section className="mb-12">
				<GhostCat />
				<h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
					<span className="block">front-end</span>
					<span className="text-gray-400">engineer</span>
				</h1>
				<p className="text-xl text-gray-500">
					building what people{" "}
					<span className="font-serif italic text-white">need.</span>
				</p>
			</section>

			<div className="my-12 flex items-center gap-2">
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<hr className="flex-1 h-px bg-none border-gray-800" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
			</div>

			<section className="mb-12 grid gap-12 md:grid-cols-[1.2fr_1px_1fr]">
				<div>
					<h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
						the work
					</h2>
					<div className="space-y-4 leading-relaxed text-gray-500">
						<p className="[&_span]:text-white">
							i create <span>unique</span> and <span>easy</span> experiences. i
							care less about technology debates and more about{" "}
							<span>delivering results people love using</span>.
						</p>
						<p>
							20 y/o, based in <span className="text-white">brazil</span>.
							currently{" "}
							<a
								className="group inline-flex items-center gap-0.5 text-white underline decoration-gray-600 underline-offset-4 focus-visible:outline-none transition-colors hover:decoration-white focus-visible:decoration-white"
								href="https://emots.dev/meet"
							>
								open to work
								<ArrowUpRightIcon
									size={14}
									className="opacity-50 group-hover:text-white group-hover:opacity-100 group-focus-visible:text-white group-focus-visible:opacity-100 transition-opacity"
									aria-hidden="true"
								/>
							</a>
						</p>
						<p className="text-gray-600">
							btw, i use <span className="text-gray-400">neovim</span>.
						</p>
					</div>
				</div>

				<hr className="hidden h-auto w-px self-stretch border-0 bg-gray-800/40 md:block" />

				<div>
					<h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
						connect
					</h2>
					<ul className="flex flex-col gap-2">
						{SOCIAL_LINKS.map((link) => (
							<li key={link.label}>
								<a
									className="group flex items-center gap-2.5 text-gray-500 focus:outline-none focus-visible:text-gray-300 transition-colors hover:text-white"
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
								>
									<link.Icon
										size={16}
										className="shrink-0 text-gray-600 group-focus-visible:text-gray-300 transition-colors group-hover:text-white"
									/>
									{link.label}
									<ArrowUpRightIcon
										size={14}
										className="opacity-0 transition-opacity group-hover:opacity-50"
										aria-hidden="true"
									/>
								</a>
							</li>
						))}
						<li>
							<div className="flex items-center">
								<CopyEmail email="me@emots.dev" />
							</div>
						</li>
					</ul>
				</div>
			</section>

			<div className="my-12 flex items-center gap-2">
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<hr className="flex-1 h-px bg-none border-gray-800" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
			</div>

			<Timeline />

			<div className="my-12 flex items-center gap-2">
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<hr className="flex-1 h-px bg-none border-gray-800" />
				<div className="size-1 shrink-0 bg-gray-700" />
				<div className="hidden md:block size-1 shrink-0 bg-gray-700" />
				<div className="hidden sm:block size-1 shrink-0 bg-gray-700" />
			</div>

			<section>
				<header className="mb-8">
					<p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-600">
						Work
					</p>
					<h2 className="text-3xl md:text-4xl text-balance">
						<span className="font-serif italic text-white">Featured</span>{" "}
						<span className="text-gray-400">Projects</span>
					</h2>
				</header>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{featuredWorks.map((work) => (
						<li key={work.slug}>
							<Link
								href={`/work/${work.slug}`}
								className="group relative block aspect-4/3 overflow-hidden border border-gray-800 bg-gray-950 transition-colors hover:border-gray-700 focus-visible:border-gray-700 focus-visible:outline-none"
							>
								{work.frontmatter.cover && (
									<Image
										src={work.frontmatter.cover}
										alt=""
										fill
										className="object-cover opacity-60 grayscale transition-[opacity,filter,transform] duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:scale-105 motion-reduce:transition-none"
										sizes="(min-width: 1024px) 224px, (min-width: 640px) 336px, 100vw"
										unoptimized
									/>
								)}
								<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
									<div className="flex items-end justify-between gap-2">
										<div className="min-w-0">
											<h3 className="font-medium text-white">
												{work.frontmatter.title}
											</h3>
											<p className="mt-0.5 line-clamp-1 text-sm text-gray-400">
												{work.frontmatter.description}
											</p>
										</div>
										<ArrowUpRightIcon
											size={16}
											className="shrink-0 text-gray-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
											aria-hidden="true"
										/>
									</div>
								</div>
							</Link>
						</li>
					))}
				</ul>

				<Link
					href="/work"
					className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
				>
					View all work
					<ArrowRightIcon size={14} />
				</Link>
			</section>
		</div>
	);
};

export default Home;
