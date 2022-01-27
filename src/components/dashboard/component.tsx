import React, { useEffect, useCallback } from "react";
import { useStateRef, AppStore, AudioStore, TouchStore } from "../../store";
import {
    SAFETY_AREA_MARGIN,
    getScreenDimensions,
    getFretboardDimensions,
    SP,
    updateIfChanged,
} from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div } from "../Common";
import {
    PositionControls,
    HighlightControls,
    PlayButton,
    SettingsButton,
} from "../Controls";
import { ChordInput } from "../ChordInput";
import { FretboardSettings } from "../FretboardSettings";
import { Slider } from "../Slider";
import { Title } from "../Title";
import { ContainerDiv } from "./style";
import { BottomDrawer, TopDrawer } from "../Drawer";

interface DashboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Dashboard: React.FC<DashboardProps> = ({
    appStore,
    audioStore,
    touchStore,
}) => {
    const [getState, setState] = useStateRef(() => ({
        orientation: "portrait-primary",
        dimensions: getScreenDimensions(),
        display: appStore.state.display,
    }));

    const { orientation, dimensions, display } = getState();
    // const width = orientation.startsWith("portrait")
    //     ? windowHeight
    //     : windowWidth;
    // const height = orientation.startsWith("portrait")
    //     ? windowWidth
    //     : windowHeight;
    const [width, height] = dimensions;
    const { gutterHeight } = getFretboardDimensions();

    useEffect(() => {
        // const destroyAppStateListener = appStore.addListener(({ display }) => {
        //     if (getState().display !== display) setState({ display });
        // });

        const destroyAppStateListener = appStore.addListener((newState) => {
            updateIfChanged(getState(), newState, ["display"], () =>
                setState({ display: newState.display })
            );
        });

        window.addEventListener("orientationchange", onOrientationChange);
        return () => {
            destroyAppStateListener();
            window.removeEventListener(
                "orientationchange",
                onOrientationChange
            );
        };
    }, []);

    const onOrientationChange = useCallback(() => {
        setState({
            orientation: screen.orientation.type,
            dimensions: getScreenDimensions(),
        });
    }, []);

    return (
        <ContainerDiv>
            <Div
                height={`${gutterHeight}px`}
                marginTop={`${SAFETY_AREA_MARGIN}px`}
                marginBottom={0}
                verticalAlign="top"
            >
                <Slider appStore={appStore} audioStore={audioStore} />
            </Div>
            <Div height={`${height}px`} width={`${width}px`}>
                <TopDrawer appStore={appStore} />
                <Fretboard
                    appStore={appStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
                <BottomDrawer appStore={appStore}>
                    {display === "input" ? (
                        <ChordInput
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    ) : display === "settings" ? (
                        <FretboardSettings
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    ) : null}
                </BottomDrawer>
            </Div>
            <Div
                height={`${gutterHeight}px`}
                marginTop="0px"
                marginBottom={`${SAFETY_AREA_MARGIN}px`}
                verticalAlign="bottom"
            >
                <Div
                    display="flex"
                    justifyContent="space-evenly"
                    alignItems="start"
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    <Div flexShrink={1}>
                        <HighlightControls appStore={appStore} />
                    </Div>
                    <Div
                        flexGrow={1}
                        marginLeft={`${SP[4]}px`}
                        marginRight={`${SP[4]}px`}
                    >
                        <PlayButton
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </Div>
                    <Div
                        flexGrow={1}
                        display="flex"
                        justifyContent="flex-end"
                        marginLeft={`${SP[4]}px`}
                        marginRight={`${SP[4]}px`}
                    >
                        <SettingsButton appStore={appStore} />
                    </Div>
                    <Div flexShrink={1}>
                        <PositionControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </Div>
                </Div>
            </Div>
        </ContainerDiv>
    );
};
