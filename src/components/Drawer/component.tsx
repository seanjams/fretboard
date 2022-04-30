import React, { useEffect } from "react";
import { useStateRef, AppStore } from "../../store";
import { getFretboardDimensions, shouldUpdate } from "../../utils";
import {
    BottomDrawerAnimation,
    BottomDrawerContainer,
    TopDrawerAnimation,
    TopDrawerContainer,
} from "./style";

interface DrawerProps {
    appStore: AppStore;
}

export const TopDrawer: React.FC<DrawerProps> = ({ appStore, children }) => {
    // state
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef(() => derivedState);
    const { showTopDrawer } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        return { showTopDrawer: appState.showTopDrawer };
    }

    useEffect(
        () =>
            appStore.addListener((appState) => {
                const derivedState = deriveStateFromAppState(appState);
                if (shouldUpdate(getState(), derivedState))
                    setState(derivedState);
            }),
        []
    );

    const fretboardDimensions = getFretboardDimensions();

    return (
        <TopDrawerAnimation trigger={showTopDrawer} {...fretboardDimensions}>
            <TopDrawerContainer {...fretboardDimensions}>
                {showTopDrawer ? children : null}
            </TopDrawerContainer>
        </TopDrawerAnimation>
    );
};

export const BottomDrawer: React.FC<DrawerProps> = ({ appStore, children }) => {
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef(() => derivedState);
    const { showBottomDrawer } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        return { showBottomDrawer: appState.showBottomDrawer };
    }

    useEffect(
        () =>
            appStore.addListener((appState) => {
                const derivedState = deriveStateFromAppState(appState);
                if (shouldUpdate(getState(), derivedState))
                    setState(derivedState);
            }),
        []
    );

    const fretboardDimensions = getFretboardDimensions();

    return (
        <BottomDrawerAnimation
            trigger={showBottomDrawer}
            {...fretboardDimensions}
        >
            <BottomDrawerContainer {...fretboardDimensions}>
                {showBottomDrawer ? children : null}
            </BottomDrawerContainer>
        </BottomDrawerAnimation>
    );
};
