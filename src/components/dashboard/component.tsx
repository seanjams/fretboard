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
} from "../../utils";
import { Fretboard } from "../Fretboard";
import {
    PositionControls,
    HighlightControls,
    SliderControls,
} from "../Controls";
import { ChordInput } from "../ChordInput";
import { FretboardSettings } from "../FretboardSettings";
// import { Menu } from "../menu";
import { Slider } from "../Slider";
import { Title } from "../Title";
import {
    ContainerDiv,
    DashboardContainerDiv,
    FlexContainerDiv,
    FlexRow,
} from "./style";

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
            <FlexContainerDiv
                height={`${gutterHeight}px`}
                marginTop={`${SAFETY_AREA_MARGIN}px`}
                marginBottom={0}
                verticalAlign="top"
            >
                <FlexRow alignItems="end" padding={`0 ${SAFETY_AREA_MARGIN}px`}>
                    <div style={{ flex: 1 }}>
                        <Title appStore={appStore} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <Slider
                            appStore={appStore}
                            sliderStore={sliderStore}
                            audioStore={audioStore}
                        />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <SliderControls appStore={appStore} />
                    </div>
                </FlexRow>
            </FlexContainerDiv>
            <DashboardContainerDiv height={`${height}px`} width={`${width}px`}>
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
            </DashboardContainerDiv>
            <FlexContainerDiv
                height={`${gutterHeight}px`}
                marginTop="0px"
                marginBottom={`${SAFETY_AREA_MARGIN}px`}
                verticalAlign="bottom"
            >
                <FlexRow
                    alignItems="start"
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    <div style={{ flexGrow: 1 }}>
                        <HighlightControls appStore={appStore} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <PositionControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </div>
                </FlexRow>
            </FlexContainerDiv>
        </ContainerDiv>
    );
};
