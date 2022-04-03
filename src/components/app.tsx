import React, { useMemo, useEffect } from "react";
import "reset-css";
import {
    AppStateType,
    AppStore,
    AudioStore,
    DEFAULT_AUDIO_STATE,
    DEFAULT_MAIN_STATE,
} from "../store";
import { Dashboard } from "./Dashboard";

interface AppProps {
    oldState?: AppStateType;
}

export const App: React.FC<AppProps> = ({ oldState }) => {
    const appStore = useMemo(() => new AppStore(), []);
    const audioStore = useMemo(() => new AudioStore(), []);

    const w = window as any;
    w.reset = () => {
        localStorage.clear();
        appStore.setState(DEFAULT_MAIN_STATE());
        audioStore.setState(DEFAULT_AUDIO_STATE());
    };

    function onPause() {
        // Handle the pause event
        saveToLocalStorage();
    }

    function onResume() {
        // Handle the resume event
        rehydrateState();
        audioStore.setState(DEFAULT_AUDIO_STATE());
    }

    function onMenuKeyDown() {
        // Handle the menubutton event
    }

    useEffect(() => {
        window.addEventListener("beforeunload", onPause, false);
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
        rehydrateState();
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", onPause, false);
            document.removeEventListener("pause", onPause, false);
            document.removeEventListener("resume", onResume, false);
            document.removeEventListener("menubutton", onMenuKeyDown, false);
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

    return <Dashboard appStore={appStore} audioStore={audioStore} />;
};
