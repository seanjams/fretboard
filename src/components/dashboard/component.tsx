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
import { Fretboard } from "../fretboard";
import {
    PositionControls,
    HighlightControls,
    SliderControls,
} from "../controls";
import { ChordInput } from "../input";
// import { Menu } from "../menu";
import { Slider } from "../slider";
import { Title } from "../title";
import {
    ContainerDiv,
    DashboardContainerDiv,
    FlexContainerDiv,
    FlexRow,
} from "./style";

interface Props {
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Dashboard: React.FC<Props> = ({
    store,
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
            <DashboardContainerDiv height={`${height}px`} width={`${width}px`}>
                <FlexContainerDiv
                    height={`${gutterHeight}px`}
                    marginTop={`${SAFETY_AREA_MARGIN}px`}
                    marginBottom={0}
                >
                    <FlexRow
                        alignItems="end"
                        padding={`0 ${SAFETY_AREA_MARGIN}px`}
                    >
                        <div style={{ flex: 1 }}>
                            <Title store={store} />
                        </div>
                        <div style={{ flex: 2 }}>
                            <Slider
                                store={store}
                                sliderStore={sliderStore}
                                audioStore={audioStore}
                            />
                        </div>
                        <div style={{ flexShrink: 1 }}>
                            <SliderControls store={store} />
                        </div>
                    </FlexRow>
                </FlexContainerDiv>
                <ChordInput
                    store={store}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                />
                <Fretboard
                    store={store}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
                <FlexContainerDiv
                    height={`${gutterHeight}px`}
                    marginTop="0px"
                    marginBottom={`${SAFETY_AREA_MARGIN}px`}
                >
                    <FlexRow
                        alignItems="start"
                        padding={`0 ${SAFETY_AREA_MARGIN}px`}
                    >
                        <div style={{ flexGrow: 1 }}>
                            <HighlightControls store={store} />
                        </div>
                        <div style={{ flexShrink: 1 }}>
                            <PositionControls
                                store={store}
                                audioStore={audioStore}
                            />
                        </div>
                    </FlexRow>
                </FlexContainerDiv>
            </DashboardContainerDiv>
        </ContainerDiv>
    );
};
