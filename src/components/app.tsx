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
    const w = window as any;
    const onAudioLoad = () => {
        w.navigator &&
            w.navigator.splashscreen &&
            w.navigator.splashscreen.hide();
        console.log("Tone.Players Loaded!");
    };
    const onAudioError = (error: Error) => {
        console.log("Tone.Players Error:", error.message);
    };

    // create data stores to hold app state
    const appStore = useMemo(() => new AppStore(), []);
    const audioStore = useMemo(
        () => new AudioStore(onAudioLoad, onAudioError),
        []
    );

    w.reset = (resetAudio = true) => {
        localStorage.clear();
        appStore.setState(DEFAULT_MAIN_STATE());
        if (resetAudio)
            audioStore.setState(DEFAULT_AUDIO_STATE(onAudioLoad, onAudioError));
    };

    useEffect(() => {
        window.addEventListener("beforeunload", saveToLocalStorage, false);
        rehydrateState();
        return () => {
            saveToLocalStorage();
            window.removeEventListener(
                "beforeunload",
                saveToLocalStorage,
                false
            );
        };
    }, []);

    const saveToLocalStorage = () => {
        localStorage.setItem("state", JSON.stringify(appStore.state));
    };

    const rehydrateState = () => {
        // rehydrate main state
        try {
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
        } catch (e) {
            w.reset(false);
        }
    };

    return <Dashboard appStore={appStore} audioStore={audioStore} />;
};
