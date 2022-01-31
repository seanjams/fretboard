import React, { useMemo, useEffect } from "react";
import "reset-css";
import {
    DEFAULT_MAIN_STATE,
    AppStateType,
    AppStore,
    AudioStore,
    useTouchStore,
    getComputedAppState,
} from "../store";
import { Dashboard } from "./Dashboard";
// import { Menu } from "./menu";

interface AppProps {
    oldState?: AppStateType;
}

export const App: React.FC<AppProps> = ({ oldState }) => {
    const appStore = useMemo(() => new AppStore(), []);
    const audioStore = useMemo(() => new AudioStore(), []);
    const touchStore = useTouchStore();

    const w = window as any;
    w.reset = () => {
        localStorage.clear();
        appStore.setState(DEFAULT_MAIN_STATE());
    };

    useEffect(() => {
        rehydrateState();
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
        };
    }, []);

    const saveToLocalStorage = () => {
        localStorage.setItem("state", JSON.stringify(appStore.state));
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

        newState.progress = 0.5;
        newState.rehydrateSuccess = true;
        appStore.setState(newState);
    };

    return (
        <Dashboard
            appStore={appStore}
            audioStore={audioStore}
            touchStore={touchStore}
        />
    );
};
