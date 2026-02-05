"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
} from "react";
import type { NarrationAlignment, NarrationMetadata } from "@/lib/narration";

const STORAGE_KEY = "emots@narration-preferences";
const STORAGE_VERSION = 1;

interface Preferences {
	volume: number;
	playbackRate: number;
	followAlong: boolean;
	autoScroll: boolean;
}

interface NarrationState extends Preferences {
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	isMuted: boolean;
	isVisible: boolean;
	audioUrl: string | null;
	alignment: NarrationAlignment | null;
	metadata: NarrationMetadata | null;
	slug: string | null;
}

type Action =
	| { type: "SET_PLAYING"; payload: boolean }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_CURRENT_TIME"; payload: number }
	| { type: "SET_DURATION"; payload: number }
	| { type: "SET_VOLUME"; payload: number }
	| { type: "SET_PLAYBACK_RATE"; payload: number }
	| { type: "SET_MUTED"; payload: boolean }
	| { type: "SET_VISIBLE"; payload: boolean }
	| { type: "SET_FOLLOW_ALONG"; payload: boolean }
	| { type: "SET_AUTO_SCROLL"; payload: boolean }
	| {
			type: "LOAD_NARRATION";
			payload: {
				slug: string;
				audioUrl: string;
				alignment: NarrationAlignment;
				metadata: NarrationMetadata;
			};
	  }
	| { type: "CLOSE" }
	| { type: "HYDRATE_PREFERENCES"; payload: Partial<Preferences> };

const defaultPreferences: Preferences = {
	volume: 0.5,
	playbackRate: 1,
	followAlong: false,
	autoScroll: true,
};

const initialState: NarrationState = {
	...defaultPreferences,
	isPlaying: false,
	isLoading: false,
	currentTime: 0,
	duration: 0,
	isMuted: false,
	isVisible: false,
	audioUrl: null,
	alignment: null,
	metadata: null,
	slug: null,
};

function reducer(state: NarrationState, action: Action): NarrationState {
	switch (action.type) {
		case "SET_PLAYING":
			return { ...state, isPlaying: action.payload };
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_CURRENT_TIME":
			return { ...state, currentTime: action.payload };
		case "SET_DURATION":
			return { ...state, duration: action.payload };
		case "SET_VOLUME":
			return { ...state, volume: action.payload };
		case "SET_PLAYBACK_RATE":
			return { ...state, playbackRate: action.payload };
		case "SET_MUTED":
			return { ...state, isMuted: action.payload };
		case "SET_VISIBLE":
			return { ...state, isVisible: action.payload };
		case "SET_FOLLOW_ALONG":
			return { ...state, followAlong: action.payload };
		case "SET_AUTO_SCROLL":
			return { ...state, autoScroll: action.payload };
		case "LOAD_NARRATION":
			return {
				...state,
				...action.payload,
				isVisible: true,
				isLoading: false,
				currentTime: 0,
			};
		case "CLOSE":
			return {
				...state,
				isVisible: false,
				isPlaying: false,
				currentTime: 0,
				audioUrl: null,
				alignment: null,
				metadata: null,
				slug: null,
			};
		case "HYDRATE_PREFERENCES":
			return { ...state, ...action.payload };
		default:
			return state;
	}
}

interface NarrationContextValue extends NarrationState {
	setPlaying: (playing: boolean) => void;
	setLoading: (loading: boolean) => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setVolume: (volume: number) => void;
	setPlaybackRate: (rate: number) => void;
	setMuted: (muted: boolean) => void;
	setVisible: (visible: boolean) => void;
	setFollowAlong: (follow: boolean) => void;
	setAutoScroll: (scroll: boolean) => void;
	loadNarration: (
		slug: string,
		audioUrl: string,
		alignment: NarrationAlignment,
		metadata: NarrationMetadata,
	) => void;
	close: () => void;
}

const NarrationContext = createContext<NarrationContextValue | null>(null);

interface StoredPreferences {
	v: number;
	volume?: number;
	playbackRate?: number;
	followAlong?: boolean;
	autoScroll?: boolean;
}

function loadPreferences(): Partial<Preferences> {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const data = JSON.parse(raw) as StoredPreferences;
		if (data.v !== STORAGE_VERSION) return {};
		return {
			volume: data.volume ?? defaultPreferences.volume,
			playbackRate: data.playbackRate ?? defaultPreferences.playbackRate,
			followAlong: data.followAlong ?? defaultPreferences.followAlong,
			autoScroll: data.autoScroll ?? defaultPreferences.autoScroll,
		};
	} catch {
		return {};
	}
}

function savePreferences(prefs: Preferences): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				v: STORAGE_VERSION,
				volume: prefs.volume,
				playbackRate: prefs.playbackRate,
				followAlong: prefs.followAlong,
				autoScroll: prefs.autoScroll,
			}),
		);
	} catch {}
}

export function NarrationStoreProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		dispatch({ type: "HYDRATE_PREFERENCES", payload: loadPreferences() });
	}, []);

	useEffect(() => {
		savePreferences({
			volume: state.volume,
			playbackRate: state.playbackRate,
			followAlong: state.followAlong,
			autoScroll: state.autoScroll,
		});
	}, [state.volume, state.playbackRate, state.followAlong, state.autoScroll]);

	const setPlaying = useCallback(
		(playing: boolean) => dispatch({ type: "SET_PLAYING", payload: playing }),
		[],
	);
	const setLoading = useCallback(
		(loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading }),
		[],
	);
	const setCurrentTime = useCallback(
		(time: number) => dispatch({ type: "SET_CURRENT_TIME", payload: time }),
		[],
	);
	const setDuration = useCallback(
		(duration: number) => dispatch({ type: "SET_DURATION", payload: duration }),
		[],
	);
	const setVolume = useCallback(
		(volume: number) => dispatch({ type: "SET_VOLUME", payload: volume }),
		[],
	);
	const setPlaybackRate = useCallback(
		(rate: number) => dispatch({ type: "SET_PLAYBACK_RATE", payload: rate }),
		[],
	);
	const setMuted = useCallback(
		(muted: boolean) => dispatch({ type: "SET_MUTED", payload: muted }),
		[],
	);
	const setVisible = useCallback(
		(visible: boolean) => dispatch({ type: "SET_VISIBLE", payload: visible }),
		[],
	);
	const setFollowAlong = useCallback(
		(follow: boolean) =>
			dispatch({ type: "SET_FOLLOW_ALONG", payload: follow }),
		[],
	);
	const setAutoScroll = useCallback(
		(scroll: boolean) => dispatch({ type: "SET_AUTO_SCROLL", payload: scroll }),
		[],
	);
	const loadNarration = useCallback(
		(
			slug: string,
			audioUrl: string,
			alignment: NarrationAlignment,
			metadata: NarrationMetadata,
		) =>
			dispatch({
				type: "LOAD_NARRATION",
				payload: { slug, audioUrl, alignment, metadata },
			}),
		[],
	);
	const close = useCallback(() => dispatch({ type: "CLOSE" }), []);

	const value = useMemo<NarrationContextValue>(
		() => ({
			...state,
			setPlaying,
			setLoading,
			setCurrentTime,
			setDuration,
			setVolume,
			setPlaybackRate,
			setMuted,
			setVisible,
			setFollowAlong,
			setAutoScroll,
			loadNarration,
			close,
		}),
		[
			state,
			setPlaying,
			setLoading,
			setCurrentTime,
			setDuration,
			setVolume,
			setPlaybackRate,
			setMuted,
			setVisible,
			setFollowAlong,
			setAutoScroll,
			loadNarration,
			close,
		],
	);

	return (
		<NarrationContext.Provider value={value}>
			{children}
		</NarrationContext.Provider>
	);
}

export function useNarrationStore(): NarrationContextValue {
	const ctx = useContext(NarrationContext);
	if (!ctx) {
		throw new Error(
			"useNarrationStore must be used within NarrationStoreProvider",
		);
	}
	return ctx;
}
