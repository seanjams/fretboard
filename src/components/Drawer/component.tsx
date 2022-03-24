import React, { useEffect } from "react";
import { useStateRef, AppStore } from "../../store";
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
    const [getState, setState] = useStateRef(() => ({
        showTopDrawer: appStore.state.showTopDrawer,
    }));
    const { showTopDrawer } = getState();

    useEffect(
        () =>
            appStore.addListener(({ showTopDrawer }) => {
                if (getState().showTopDrawer !== showTopDrawer)
                    setState({ showTopDrawer });
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
    const [getState, setState] = useStateRef(() => ({
        // custom state for component
        showBottomDrawer: appStore.state.showBottomDrawer,
    }));
    const { showBottomDrawer } = getState();

    useEffect(
        () =>
            appStore.addListener(({ showBottomDrawer }) => {
                if (getState().showBottomDrawer !== showBottomDrawer)
                    setState({ showBottomDrawer });
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
