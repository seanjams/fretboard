import React, { useEffect } from "react";
import { AppStore, useDerivedState } from "../../store";
import { ContainerDiv } from "./style";

// Component
interface Props {
    appStore: AppStore;
}

export const Template: React.FC<Props> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { message } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        // this object gets merged with the component state returned by "getState"
        // every time relevant fields in the appStore update
        return {
            message: "this is some state",
        };
    }

    useEffect(() => {
        return appStore.addListener((appState) => {
            // this runs everytime appState changes
        });
    }, []);

    return <ContainerDiv>{message}</ContainerDiv>;
};
