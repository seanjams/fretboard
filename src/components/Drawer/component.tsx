import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useStateRef, AppStore } from "../../store";
import { getFretboardDimensions, SAFETY_AREA_MARGIN } from "../../utils";
import { FlexRow } from "../Common";
import { BottomDrawerAnimation, TopDrawerAnimation } from "./style";

interface DrawerProps {
    appStore: AppStore;
}

export const TopDrawer: React.FC<DrawerProps> = ({ appStore, children }) => {
    // state
    const [getState, setState] = useStateRef(() => ({
        showTopDrawer: appStore.state.showTopDrawer,
    }));
    const { showTopDrawer } = getState();

    useEffect(() => {
        return appStore.addListener(({ showTopDrawer }) => {
            if (getState().showTopDrawer !== showTopDrawer)
                setState({ showTopDrawer });
        });
    }, []);

    const { maxInputHeight, minInputHeight } = getFretboardDimensions();

    return (
        <TopDrawerAnimation.wrapper
            minInputHeight={minInputHeight}
            maxInputHeight={maxInputHeight}
        >
            <CSSTransition
                in={showTopDrawer}
                timeout={TopDrawerAnimation.timeout}
                classNames="top-drawer-grow"
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                <FlexRow
                    className="top-drawer-form"
                    height={`${maxInputHeight}px`}
                    width={`calc(100% - ${2 * SAFETY_AREA_MARGIN}px)`}
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    {showTopDrawer ? children : null}
                </FlexRow>
            </CSSTransition>
        </TopDrawerAnimation.wrapper>
    );
};

export const BottomDrawer: React.FC<DrawerProps> = ({ appStore, children }) => {
    const [getState, setState] = useStateRef(() => ({
        // custom state for component
        showBottomDrawer: appStore.state.showBottomDrawer,
    }));
    const { showBottomDrawer } = getState();

    useEffect(() => {
        return appStore.addListener(({ showBottomDrawer }) => {
            if (getState().showBottomDrawer !== showBottomDrawer)
                setState({ showBottomDrawer });
        });
    }, []);

    const { minInputHeight, maxInputHeight } = getFretboardDimensions();

    return (
        <BottomDrawerAnimation.wrapper
            minInputHeight={minInputHeight}
            maxInputHeight={maxInputHeight}
        >
            <CSSTransition
                in={showBottomDrawer}
                timeout={BottomDrawerAnimation.timeout}
                classNames="bottom-drawer-grow"
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                <FlexRow
                    className="bottom-drawer-form"
                    height={`${maxInputHeight}px`}
                    width={`calc(100% - ${2 * SAFETY_AREA_MARGIN}px)`}
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    {showBottomDrawer ? children : null}
                </FlexRow>
            </CSSTransition>
        </BottomDrawerAnimation.wrapper>
    );
};
