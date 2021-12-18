import React, { useRef, useEffect, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import { useStateRef, current, AppStore, SliderStore } from "../../store";
import {
    getFretWidth,
    FRETBOARD_WIDTH,
    STRING_SIZE,
    SAFETY_AREA_MARGIN,
    NATURAL_NOTE_KEYMAP,
    SELECTED,
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
    InputAnimationWrapper,
    FretboardAnimationWrapper,
    ContainerDiv,
    FlexContainerDiv,
    FlexRow,
    OverflowContainerDiv,
} from "./style";

interface Props {
    store: AppStore;
    sliderStore: SliderStore;
}

interface DashboardStateType {
    showInput: boolean;
    orientation: OrientationType;
    dimensions: [number, number];
}

export const Dashboard: React.FC<Props> = ({ store, sliderStore }) => {
    const [getState, setState] = useStateRef<DashboardStateType>(() => ({
        showInput: store.state.showInput,
        orientation: "portrait-primary",
        dimensions: getScreenDimensions(),
    }));

    const { showInput, orientation, dimensions } = getState();
    // const width = orientation.startsWith("portrait")
    //     ? windowHeight
    //     : windowWidth;
    // const height = orientation.startsWith("portrait")
    //     ? windowWidth
    //     : windowHeight;
    const [width, height] = dimensions;

    const fretboardContainerRef = useRef<HTMLDivElement>(null);
    const scrollToFretRef = useRef(0);

    const {
        gutterHeight,
        minInputHeight,
        maxInputHeight,
        minFretboardHeight,
        maxFretboardHeight,
    } = getFretboardDimensions();

    useEffect(() => {
        const destroyListener = store.addListener((newState) => {
            const { showInput, progression } = current(newState);
            const { scrollToFret } = progression;

            if (getState().showInput !== showInput) setState({ showInput });

            if (
                fretboardContainerRef.current &&
                scrollToFretRef.current !== scrollToFret
            ) {
                let fretXPosition = 0;
                for (let i = 0; i < scrollToFret; i++) {
                    fretXPosition += getFretWidth(
                        FRETBOARD_WIDTH,
                        STRING_SIZE,
                        i
                    );
                }

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
        window.addEventListener("keydown", onKeyPress);

        return () => {
            destroyListener();
            window.removeEventListener(
                "orientationchange",
                onOrientationChange
            );
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const onOrientationChange = useCallback(() => {
        setState({
            orientation: screen.orientation.type,
            dimensions: getScreenDimensions(),
        });
    }, []);

    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const { invert, leftHand, progression } = current(store.state);
        const { label } = progression;
        const highEBottom = invert !== leftHand;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        let dir = e.key;
        const up = (dir === "ArrowDown" && highEBottom) || dir === "ArrowUp";
        const down = (dir === "ArrowUp" && highEBottom) || dir === "ArrowDown";
        const right = (dir === "ArrowLeft" && invert) || dir === "ArrowRight";
        const left = (dir === "ArrowRight" && invert) || dir === "ArrowLeft";
        if (up) {
            store.dispatch.incrementPositionY();
        } else if (down) {
            store.dispatch.decrementPositionY();
        } else if (right) {
            store.dispatch.incrementPositionX();
        } else if (left) {
            store.dispatch.decrementPositionX();
        } else {
            const naturalNotesKeyMap = NATURAL_NOTE_KEYMAP[label];
            if (naturalNotesKeyMap.hasOwnProperty(e.key)) {
                e.preventDefault();
                store.dispatch.setHighlightedNote(
                    0,
                    naturalNotesKeyMap[e.key],
                    SELECTED
                );
            }
        }
    }

    return (
        <>
            <ContainerDiv
                // onMouseDown={onDragStart}
                // onTouchStart={onDragEnd}
                height={`${height}px`}
                width={`${width}px`}
                // height={height}
                // width={width}
            >
                <FlexContainerDiv
                    height={`${gutterHeight}px`}
                    marginTop={`${SAFETY_AREA_MARGIN}px`}
                    marginBottom={0}
                >
                    <FlexRow alignItems="end">
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
                <InputAnimationWrapper
                    minInputHeight={minInputHeight}
                    maxInputHeight={maxInputHeight}
                >
                    <CSSTransition
                        in={showInput}
                        timeout={300}
                        classNames="input-grow"
                        // onEnter={() => setShowButton(false)}
                        // onExited={() => setShowButton(true)}
                    >
                        <div className="input-container">
                            <ChordInput
                                store={store}
                                sliderStore={sliderStore}
                            />
                        </div>
                    </CSSTransition>
                </InputAnimationWrapper>
                <FretboardAnimationWrapper
                    maxFretboardHeight={maxFretboardHeight}
                    minFretboardHeight={minFretboardHeight}
                >
                    <CSSTransition
                        in={showInput}
                        timeout={300}
                        classNames="fretboard-shrink"
                        // onEnter={() => setShowButton(false)}
                        // onExited={() => setShowButton(true)}
                    >
                        <OverflowContainerDiv
                            height={`${maxFretboardHeight}px`}
                            ref={fretboardContainerRef}
                        >
                            <div className="fretboard-container">
                                <Fretboard
                                    store={store}
                                    sliderStore={sliderStore}
                                />
                            </div>
                        </OverflowContainerDiv>
                    </CSSTransition>
                </FretboardAnimationWrapper>
                <FlexContainerDiv
                    height={`${gutterHeight}px`}
                    marginTop="0px"
                    marginBottom={`${SAFETY_AREA_MARGIN}px`}
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
