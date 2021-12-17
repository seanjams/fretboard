import React, { useMemo, useEffect } from "react";
import "reset-css";
import {
    DEFAULT_MAIN_STATE,
    StateType,
    currentProgression,
    AppStore,
    SliderStore,
} from "../store";
import { Dashboard } from "./dashboard";
// import { Menu } from "./menu";

interface Props {
    oldState?: StateType;
}

export const App: React.FC<Props> = ({ oldState }) => {
    const store = useMemo(() => new AppStore(), []);
    const sliderStore = useMemo(() => new SliderStore(), []);

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
        // rehydrate main state
        let newState: StateType;
        if (oldState) {
            newState = {
                ...DEFAULT_MAIN_STATE(),
                ...oldState,
            };
        } else {
            let parsedState = {};
            if (localStorage.getItem("state")) {
                parsedState =
                    JSON.parse(localStorage.getItem("state") || "") || {};
            }
            newState = {
                ...DEFAULT_MAIN_STATE(),
                ...parsedState,
            };
        }
        store.setState(newState);

        // rehydrate slider state
        const { focusedIndex } = currentProgression(newState);
        sliderStore.setState({
            progress: focusedIndex + 0.5,
            rehydrateSuccess: true,
        });
    };

    return <div>{<Dashboard store={store} sliderStore={sliderStore} />}</div>;
};
