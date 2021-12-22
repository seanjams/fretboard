import { Store } from "./store";

// Types
export interface SliderStateType {
    progress: number;
    rehydrateSuccess: boolean;
}

// Reducers
export const sliderReducers = {
    setProgress(state: SliderStateType, progress: number): SliderStateType {
        // dangerous method, does not return new state object on purpose, use with caution
        state.progress = progress;
        return state;
    },
};

// Store
export class SliderStore extends Store<SliderStateType, typeof sliderReducers> {
    constructor() {
        super(DEFAULT_SLIDER_STATE(), sliderReducers);
    }
}

// Default State
export function DEFAULT_SLIDER_STATE(): SliderStateType {
    return {
        progress: 0.5,
        rehydrateSuccess: false,
    };
}
