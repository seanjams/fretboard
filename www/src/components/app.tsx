import React, { useMemo, useEffect } from "react";
import "reset-css";
import { DEFAULT_STATE, Store, reducers, useStore } from "../store";
import { StateType, SliderStateType } from "../types";
import { Dashboard } from "./dashboard";
// import { Menu } from "./menu";

interface Props {
    oldState?: StateType;
}

export const App: React.FC<Props> = ({ oldState }) => {
    const store = useMemo(() => new Store(DEFAULT_STATE(), reducers), []);
    const sliderStore = useMemo(
        () => new Store<SliderStateType>({ progress: 0.5 }),
        []
    );

    useEffect(() => {
        rehydrateState();
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
        };
    }, []);

    const saveToLocalStorage = () => {
        localStorage.setItem("state", JSON.stringify(store.state));
    };

    const rehydrateState = () => {
        let newState: StateType;
        if (oldState) {
            newState = {
                ...DEFAULT_STATE(),
                ...oldState,
            };
        } else {
            newState = {
                ...DEFAULT_STATE(),
                ...(JSON.parse(localStorage.getItem("state")) || {}),
            };
        }

        store.setState(newState);
    };

    return <div>{<Dashboard store={store} sliderStore={sliderStore} />}</div>;
};
