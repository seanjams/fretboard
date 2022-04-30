import React from "react";
import { AppStore, useDerivedState } from "../../store";
import { getFretboardDimensions } from "../../utils";
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
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { showTopDrawer } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        return { showTopDrawer: appState.showTopDrawer };
    }

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
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { showBottomDrawer } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        return { showBottomDrawer: appState.showBottomDrawer };
    }

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
