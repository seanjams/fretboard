import React, { useRef, useEffect, useState } from "react";
import { Store, StateType, useStore, ActionTypes } from "../store";

interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Example: React.FC<Props> = ({ store }) => {
    const [state, setState] = useStore(store);
    const [focusedIndex, setFocusedIndex] = useState(state.focusedIndex);
    const focusedIndexRef = useRef(focusedIndex);
    focusedIndexRef.current = focusedIndex;

    useEffect(() => {
        store.addListener((newState) => {
            if (newState.focusedIndex !== focusedIndexRef.current)
                setFocusedIndex(newState.focusedIndex);
        });
    }, []);

    const onClick = () => {
        // need to use the ref inside callbacks
        if (focusedIndexRef.current === 0) return;
    };

    // need to use the state in jsx return
    return <div onClick={onClick}>{focusedIndex}</div>;
};

export default Example;
