import { getPosts } from "@/lib/blog";
import { getWorks } from "@/lib/work";
import { url } from "@/utils/consts";

const sitemap = async () => {
	const works = await getWorks();
	const posts = await getPosts();

	const allWorks = works.map((work) => ({
		url: `${url}/work/${work.slug}`,
		lastModified: new Date(work.frontmatter.date).toISOString().split("T")[0],
	}));

	const allPosts = posts.map((post) => ({
		url: `${url}/blog/${post.slug}`,
		lastModified: new Date(post.frontmatter.date).toISOString().split("T")[0],
	}));

	const routes = ["", "/work", "/blog", "/craft"].map((route) => ({
		url: `${url}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...allWorks, ...allPosts];
};

export default sitemap;
