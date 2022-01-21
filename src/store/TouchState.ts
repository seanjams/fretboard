import { Store } from "./store";
import { DragStatusTypes } from "../types";

// Types
export interface TouchStateType {
    isDragging: boolean;
    isPressed: boolean;
    isMultiPressed: boolean;
    fretDragStatus: DragStatusTypes;
}

// Reducers
export const touchReducers = {
    setIsDragging(state: TouchStateType, isDragging: boolean): TouchStateType {
        return {
            ...state,
            isDragging,
        };
    },
    setIsPressed(state: TouchStateType, isPressed: boolean): TouchStateType {
        return {
            ...state,
            isPressed,
        };
    },
    setIsMultiPressed(
        state: TouchStateType,
        isMultiPressed: boolean
    ): TouchStateType {
        return {
            ...state,
            isMultiPressed,
        };
    },
    setFretDragStatus(state: TouchStateType, fretDragStatus: DragStatusTypes) {
        return { ...state, fretDragStatus };
    },
    clearState(state: TouchStateType) {
        return {
            ...state,
            isDragging: false,
            isPressed: false,
            isMultiPressed: false,
        };
    },
};

// Store
export class TouchStore extends Store<TouchStateType, typeof touchReducers> {
    constructor() {
        super(DEFAULT_TOUCH_STATE(), touchReducers);
    }
}

// Default State
export function DEFAULT_TOUCH_STATE(): TouchStateType {
    return {
        isDragging: false,
        isPressed: false,
        isMultiPressed: false,
        fretDragStatus: null,
    };
}
