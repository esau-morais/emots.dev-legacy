"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

type CopyEmailProps = {
	email: string;
};

export const CopyEmail = ({ email }: CopyEmailProps) => {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

	const copyEmail = async () => {
		if (copied) return;
		await navigator.clipboard.writeText(email);
		setCopied(true);
		timeoutRef.current = setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={copyEmail}
			aria-label={`Copy email address ${email}`}
			{...(!copied && { "data-sound": "click" })}
			className="group flex items-center gap-2.5 focus:outline-none text-gray-500 focus-visible:text-gray-300 transition-transform duration-150 ease-out hover:text-white active:scale-[0.98]"
		>
			<span className="relative size-4 shrink-0" aria-hidden="true">
				<CopyIcon
					size={16}
					className="absolute inset-0 text-gray-600 group-focus-visible:text-gray-300 transition-all duration-150 ease-out group-hover:text-white"
					style={{
						opacity: copied ? 0 : 1,
						transform: copied ? "scale(0.9)" : "scale(1)",
						filter: copied ? "blur(2px)" : "blur(0)",
					}}
				/>
				<CheckIcon
					size={16}
					className="absolute inset-0 text-white transition-all duration-150 ease-out"
					style={{
						opacity: copied ? 1 : 0,
						transform: copied ? "scale(1)" : "scale(0.9)",
						filter: copied ? "blur(0)" : "blur(2px)",
					}}
				/>
			</span>
			<span className="font-mono" aria-live="polite">
				{copied ? "copied!" : email}
			</span>
		</button>
	);
};
