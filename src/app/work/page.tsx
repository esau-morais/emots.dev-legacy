import type { Metadata } from "next";

import { WorkList } from "@/components/work-list";
import { getWorks } from "@/lib/work";

export const metadata: Metadata = {
	title: "Works",
};

const Works = async () => {
	const works = await getWorks();

	return (
		<div className="mx-auto max-w-2xl px-6">
			<h1 className="mb-12 text-lg font-medium text-white">work</h1>

			{works.length === 0 ? (
				<p className="text-gray-500">no works yet.</p>
			) : (
				<WorkList works={works} />
			)}
		</div>
	);
};

export default Works;
