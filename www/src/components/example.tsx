import React, { useRef, useEffect, useState } from "react";
import { Store, StateType, useActiveStore, ActionTypes } from "../store";

interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Example: React.FC<Props> = ({ store }) => {
    const [getState, setState] = useActiveStore(store);
    const [focusedIndex, setFocusedIndex] = useState(getState().focusedIndex);
    const focusedIndexRef = useRef(focusedIndex);
    focusedIndexRef.current = focusedIndex;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            if (newState.focusedIndex !== focusedIndexRef.current)
                setFocusedIndex(newState.focusedIndex);
        });

        return () => {
            destroy();
        };
    }, []);

    const onClick = () => {
        // need to use the ref inside callbacks
        if (focusedIndexRef.current === 0) return;
    };

    // need to use the state in jsx return
    return <div onClick={onClick}>{focusedIndex}</div>;
};

export default Example;
