import React, { useEffect, useCallback } from "react";
import {
    useStateRef,
    AppStore,
    SliderStore,
    AudioStore,
    TouchStore,
} from "../../store";
import {
    SAFETY_AREA_MARGIN,
    getScreenDimensions,
    getFretboardDimensions,
    SP,
} from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div } from "../Common";
import {
    PositionControls,
    HighlightControls,
    SliderControls,
    PlayButton,
    SettingsButton,
} from "../Controls";
import { ChordInput } from "../ChordInput";
import { FretboardSettings } from "../FretboardSettings";
// import { Menu } from "../menu";
import { Slider } from "../Slider";
import { Title } from "../Title";
import { ContainerDiv } from "./style";

interface Props {
    appStore: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Dashboard: React.FC<Props> = ({
    appStore,
    sliderStore,
    audioStore,
    touchStore,
}) => {
    const [getState, setState] = useStateRef(() => ({
        orientation: "portrait-primary",
        dimensions: getScreenDimensions(),
    }));

    const { orientation, dimensions } = getState();
    // const width = orientation.startsWith("portrait")
    //     ? windowHeight
    //     : windowWidth;
    // const height = orientation.startsWith("portrait")
    //     ? windowWidth
    //     : windowHeight;
    const [width, height] = dimensions;
    const { gutterHeight } = getFretboardDimensions();

    useEffect(() => {
        window.addEventListener("orientationchange", onOrientationChange);
        return () => {
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
                <Div
                    display="flex"
                    justifyContent="space-evenly"
                    alignItems="end"
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    <Div flex={1}>
                        <Title appStore={appStore} />
                    </Div>
                    <Div flex={2}>
                        <Slider
                            appStore={appStore}
                            sliderStore={sliderStore}
                            audioStore={audioStore}
                        />
                    </Div>
                    <Div flexShrink={1}>
                        <SliderControls appStore={appStore} />
                    </Div>
                </Div>
            </Div>
            <Div height={`${height}px`} width={`${width}px`}>
                <ChordInput
                    appStore={appStore}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                />
                <Fretboard
                    appStore={appStore}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
                <FretboardSettings
                    appStore={appStore}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                />
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
