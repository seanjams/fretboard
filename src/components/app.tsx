import React, { useMemo, useEffect } from "react";
import "reset-css";
import {
    DEFAULT_MAIN_STATE,
    AppStateType,
    currentProgression,
    AppStore,
    SliderStore,
    AudioStore,
    useTouchStore,
} from "../store";
import { Dashboard } from "./dashboard";
// import { Menu } from "./menu";

interface Props {
    oldState?: AppStateType;
}

export const App: React.FC<Props> = ({ oldState }) => {
    const store = useMemo(() => new AppStore(), []);
    const sliderStore = useMemo(() => new SliderStore(), []);
    const audioStore = useMemo(() => new AudioStore(), []);
    const touchStore = useTouchStore();

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
        let newState: AppStateType;
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

    return (
        <div>
            <Dashboard
                store={store}
                sliderStore={sliderStore}
                audioStore={audioStore}
                touchStore={touchStore}
            />
        </div>
    );
};
