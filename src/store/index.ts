import create from "zustand";

export * from "./actions";
export * from "./context";
export * from "./reducer";
export * from "./state";

type Store = {
	progress: number;
	setProgress: (progress: number) => void;
};

export const useStore = create<Store>((set) => ({
	progress: 0,
	setProgress: (progress: number) => {
		set(() => ({ progress }));
	},
}));
