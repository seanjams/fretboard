import React, { useRef, useState, useEffect, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import { SliderStateType, StateType } from "../types";
import { Store, useStateRef } from "../store";
import { Fretboard } from "./fretboard";
import {
    PositionControls,
    HighlightControls,
    SliderControls,
} from "./controls";
import { ChordInput } from "./input";
// import { Menu } from "./menu";
import { Slider } from "./slider";
import { Title } from "./title";
import {
    FRETBOARD_WIDTH,
    STRING_SIZE,
    SAFETY_AREA_HEIGHT,
    FRETBOARD_MARGIN_HEIGHT,
    currentProgression,
} from "../utils";

// CSS
interface CSSProps {
    width?: number;
    height?: number;
    marginTop?: number;
    marginBottom?: number;
}

const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `${props.width}px`,
        height: `${props.height}px`,
    },
}))<CSSProps>`
    font-family: Arial;
    overflow: hidden;
    width: 100vw;
`;

const FlexContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
        marginTop: props.marginTop ? `${props.marginTop}px` : 0,
        marginBottom: props.marginBottom ? `${props.marginBottom}px` : 0,
    },
}))<CSSProps>``;

const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
    },
}))<CSSProps>`
    width: 100%;
    overflow-x: auto;
    margin: ${FRETBOARD_MARGIN_HEIGHT}px 0;
`;

const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: space-evenly;
    padding: 0 ${SAFETY_AREA_HEIGHT}px;
`;

// Component
interface Props {
    store: Store<StateType>;
    sliderStore: Store<SliderStateType>;
}

interface DashboardStateType {
    showInput: boolean;
    orientation: OrientationType;
    dimensions: [number, number];
}

export const Dashboard: React.FC<Props> = ({ store, sliderStore }) => {
    const getScreenDimensions = (): [number, number] => {
        // hack fix for mobile dimensions
        let width: number;
        let height: number;
        if (isMobile) {
            width = Math.max(screen.width, screen.height);
            height = Math.min(screen.width, screen.height);
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        return [width, height];
    };

    const [getState, setState] = useStateRef<DashboardStateType>({
        showInput: store.state.showInput,
        orientation: "portrait-primary",
        dimensions: getScreenDimensions(),
    });

    const { showInput, orientation, dimensions } = getState();
    const [windowWidth, windowHeight] = dimensions;

    const fretboardContainerRef = useRef<HTMLDivElement>(null);
    const scrollToFretRef = useRef(0);

    const width = orientation.startsWith("portrait")
        ? windowHeight
        : windowWidth;
    const height = orientation.startsWith("portrait")
        ? windowWidth
        : windowHeight;

    const gutterHeight = windowHeight * 0.15 - FRETBOARD_MARGIN_HEIGHT;
    const mainHeight = windowHeight * 0.7 - 2 * SAFETY_AREA_HEIGHT;
    const fretboardHeight = mainHeight;

    useEffect(() => {
        const destroyListener = store.addListener((newState: StateType) => {
            // old data
            const state = getState();
            // new data
            const { showInput } = newState;
            const { scrollToFret } = currentProgression(newState);

            if (state.showInput !== showInput)
                setState({
                    ...state,
                    showInput,
                });

            if (
                fretboardContainerRef.current &&
                scrollToFretRef.current !== scrollToFret
            ) {
                const fretXPosition =
                    (FRETBOARD_WIDTH * scrollToFret) / STRING_SIZE;
                const halfContainerWidth =
                    fretboardContainerRef.current.offsetWidth / 2;

                fretboardContainerRef.current.scrollTo({
                    top: 0,
                    left: fretXPosition - halfContainerWidth,
                    behavior: "smooth",
                });
                scrollToFretRef.current = scrollToFret;
            }
        });

        window.addEventListener("orientationchange", onOrientationChange);

        return () => {
            destroyListener();
            window.removeEventListener(
                "orientationchange",
                onOrientationChange
            );
        };
    }, []);

    const onOrientationChange = useCallback(() => {
        setState({
            ...getState(),
            orientation: screen.orientation.type,
            dimensions: getScreenDimensions(),
        });
    }, []);

    return (
        <>
            <ContainerDiv
                // onMouseDown={onDragStart}
                // onTouchStart={onDragEnd}
                height={windowHeight}
                width={windowWidth}
                // height={height}
                // width={width}
            >
                <FlexContainerDiv
                    height={gutterHeight}
                    marginTop={SAFETY_AREA_HEIGHT}
                    marginBottom={0}
                >
                    <FlexRow>
                        <div style={{ flex: 1 }}>
                            <Title store={store} />
                        </div>
                        <div style={{ flex: 2 }}>
                            <Slider store={store} sliderStore={sliderStore} />
                        </div>
                        <div style={{ flexShrink: 1 }}>
                            <SliderControls store={store} />
                        </div>
                    </FlexRow>
                </FlexContainerDiv>
                <CSSTransition
                    in={showInput}
                    timeout={300}
                    classNames="input-grow"
                    // onEnter={() => setShowButton(false)}
                    // onExited={() => setShowButton(true)}
                >
                    <ChordInput store={store} sliderStore={sliderStore} />
                </CSSTransition>
                <OverflowContainerDiv
                    height={mainHeight}
                    ref={fretboardContainerRef}
                >
                    <Fretboard
                        fretboardHeight={fretboardHeight}
                        store={store}
                        sliderStore={sliderStore}
                    />
                </OverflowContainerDiv>
                <FlexContainerDiv
                    height={gutterHeight}
                    marginTop={0}
                    marginBottom={SAFETY_AREA_HEIGHT}
                >
                    <FlexRow>
                        <div style={{ flexGrow: 1 }}>
                            <HighlightControls store={store} />
                        </div>
                        <div style={{ flexShrink: 1 }}>
                            <PositionControls store={store} />
                        </div>
                    </FlexRow>
                </FlexContainerDiv>
            </ContainerDiv>
            {/* {orientation.startsWith("portrait") && (
                <ContainerDiv>
                    <Menu store={store} />
                </ContainerDiv>
            )} */}
        </>
    );
};
