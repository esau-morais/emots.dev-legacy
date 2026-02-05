import { useEffect } from "react";

export const useWindowResize = (
	callback: () => void,
	options?: boolean | AddEventListenerOptions | EventListenerOptions,
) => {
	useEffect(() => {
		callback();
		window.addEventListener("resize", callback, options);
		return () => window.removeEventListener("resize", callback, options);
	}, [callback, options]);
};
