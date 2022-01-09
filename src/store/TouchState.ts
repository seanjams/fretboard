import { Store } from "./store";
import { DragStatusTypes } from "../types";

// Types
export interface TouchStateType {
    isDragging: boolean;
    isPressed: boolean;
    isMultiPressed: boolean;
    dragStatus: DragStatusTypes;
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
    setDragStatus(state: TouchStateType, dragStatus: DragStatusTypes) {
        return { ...state, dragStatus };
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
        dragStatus: null,
    };
}
