import React, { useRef, useEffect, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import {
    useStateRef,
    current,
    AppStore,
    SliderStore,
    AudioStore,
} from "../../store";
import {
    getFretWidth,
    FRETBOARD_WIDTH,
    STRING_SIZE,
    SAFETY_AREA_MARGIN,
    NATURAL_NOTE_KEYMAP,
    SELECTED,
    getScreenDimensions,
    getFretboardDimensions,
    STRUM_LOW_TO_HIGH,
    stopClick,
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
    audioStore: AudioStore;
}

interface DashboardStateType {
    showInput: boolean;
    orientation: OrientationType;
    dimensions: [number, number];
}

export const Dashboard: React.FC<Props> = ({
    store,
    sliderStore,
    audioStore,
}) => {
    const { progression } = current(store.state);
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
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const twoFingerTouchRef = useRef(false);

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
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);

        return () => {
            destroyListener();
            window.removeEventListener(
                "orientationchange",
                onOrientationChange
            );
            window.removeEventListener("keydown", onKeyPress);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    const onOrientationChange = useCallback(() => {
        setState({
            orientation: screen.orientation.type,
            dimensions: getScreenDimensions(),
        });
    }, []);

    const onKeyPress = useCallback((event: KeyboardEvent) => {
        const { invert, leftHand, progression } = current(store.state);
        const { label } = progression;
        const highEBottom = invert !== leftHand;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        let dir = event.key;
        const up = (dir === "ArrowDown" && highEBottom) || dir === "ArrowUp";
        const down = (dir === "ArrowUp" && highEBottom) || dir === "ArrowDown";
        const right = (dir === "ArrowLeft" && invert) || dir === "ArrowRight";
        const left = (dir === "ArrowRight" && invert) || dir === "ArrowLeft";
        let playSound = up || down || left || right;

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
            if (naturalNotesKeyMap.hasOwnProperty(event.key)) {
                event.preventDefault();
                store.dispatch.setHighlightedNote(
                    0,
                    naturalNotesKeyMap[event.key],
                    SELECTED
                );
            }
        }

        if (playSound) {
            const { fretboard, strumMode } = current(store.state);
            if (strumMode === STRUM_LOW_TO_HIGH)
                audioStore.dispatch.strumChord(fretboard);
            else {
                audioStore.dispatch.arpeggiateChord(fretboard);
            }
        }
    }, []);

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        const { isDragging } = current(store.state);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (isDragging) {
            store.dispatch.setIsDragging(false);
            store.dispatch.setDragStatus(null);
            stopClick();
        }

        twoFingerTouchRef.current = false;
    }, []);

    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        // event.stopPropagation();

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            const { isDragging } = store.state;
            if (!isDragging) store.dispatch.setIsDragging(true);
            timeoutRef.current = null;
        }, 100);

        console.log("in here");

        if (event.nativeEvent instanceof TouchEvent) {
            // highlight note if using touch device and press with two fingers
            console.log("in here 2", event.nativeEvent.touches.length);
            twoFingerTouchRef.current = event.nativeEvent.touches.length > 1;
            if (fretboardContainerRef.current)
                fretboardContainerRef.current.style.overflowX =
                    twoFingerTouchRef.current ? "auto" : "hidden";
        }
    };

    return (
        <ContainerDiv
            height={`${height}px`}
            width={`${width}px`}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
        >
            <FlexContainerDiv
                height={`${gutterHeight}px`}
                marginTop={`${SAFETY_AREA_MARGIN}px`}
                marginBottom={0}
            >
                <FlexRow alignItems="end" padding={`0 ${SAFETY_AREA_MARGIN}px`}>
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
            <InputAnimationWrapper
                minInputHeight={minInputHeight}
                maxInputHeight={maxInputHeight}
            >
                <CSSTransition
                    in={showInput}
                    timeout={150}
                    classNames="input-grow"
                    // onEnter={() => setShowButton(false)}
                    // onExited={() => setShowButton(true)}
                >
                    <div className="input-container">
                        <ChordInput
                            store={store}
                            sliderStore={sliderStore}
                            audioStore={audioStore}
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
                    timeout={150}
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
                                audioStore={audioStore}
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
        </ContainerDiv>
    );
};
