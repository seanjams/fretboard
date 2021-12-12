import React, { useRef, useEffect, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import { isMobile } from "react-device-detect";
import {
    Store,
    useStateRef,
    StateType,
    SliderStateType,
    AnyReducersType,
    current,
} from "../../store";
import {
    getFretWidth,
    FRETBOARD_WIDTH,
    STRING_SIZE,
    SAFETY_AREA_MARGIN,
    FRETBOARD_MARGIN,
    NATURAL_NOTE_NAMES,
    B,
    C,
    E,
    F,
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
    FlexContainerDiv,
    FlexRow,
    OverflowContainerDiv,
} from "./style";

interface Props {
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
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
    // const width = orientation.startsWith("portrait")
    //     ? windowHeight
    //     : windowWidth;
    // const height = orientation.startsWith("portrait")
    //     ? windowWidth
    //     : windowHeight;
    const [width, height] = dimensions;

    const fretboardContainerRef = useRef<HTMLDivElement>(null);
    const scrollToFretRef = useRef(0);

    // -------------------------------
    // Safety Area
    // -------------------------------
    // Gutter
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Main Height
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Gutter
    // -------------------------------
    // Safety Area
    // -------------------------------

    const gutterHeight = height * 0.15 - SAFETY_AREA_MARGIN;
    const mainHeight = height * 0.7 - 2 * FRETBOARD_MARGIN;
    const fretboardHeight = mainHeight;

    useEffect(() => {
        const destroyListener = store.addListener((newState) => {
            const { showInput, progression } = current(newState);
            const { scrollToFret } = progression;

            if (getState().showInput !== showInput)
                setState((prevState) => ({
                    ...prevState,
                    showInput,
                }));

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
        setState((prevState) => ({
            ...prevState,
            orientation: screen.orientation.type,
            dimensions: getScreenDimensions(),
        }));
    }, []);

    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const { invert, leftHand, progression } = current(store.state);
        const { label } = progression;
        const verticalDirections = ["ArrowUp", "ArrowDown"];
        const horizontalDirections = ["ArrowLeft", "ArrowRight"];
        const keyMap: { [key in string]: (...args: any[]) => StateType } = {
            ArrowUp: store.dispatch.incrementPositionY,
            ArrowDown: store.dispatch.decrementPositionY,
            ArrowRight: store.dispatch.incrementPositionX,
            ArrowLeft: store.dispatch.decrementPositionX,
        };

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        let direction = e.key;
        if (verticalDirections.includes(direction) && highEBottom) {
            let dirs = verticalDirections;
            direction = dirs[(dirs.indexOf(direction) + 1) % 2];
        } else if (horizontalDirections.includes(direction) && invert) {
            let dirs = horizontalDirections;
            direction = dirs[(dirs.indexOf(direction) + 1) % 2];
        }

        if (keyMap[direction]) {
            e.preventDefault();
            keyMap[direction]();
        } else {
            let naturals: { [key in string]: number } = {};
            let i = 0;
            for (let name of NATURAL_NOTE_NAMES) {
                if (label === "flat") {
                    naturals[name] = i;
                    if (name !== F && name !== C) i++;
                    naturals[name.toLowerCase()] = i;
                    i++;
                } else if (label === "sharp") {
                    naturals[name.toLowerCase()] = i;
                    if (name !== E && name !== B) i++;
                    naturals[name] = i;
                    i++;
                }
            }

            if (naturals.hasOwnProperty(e.key)) {
                e.preventDefault();
                store.dispatch.setNote(naturals[e.key]);
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
                    height={`${mainHeight}px`}
                    ref={fretboardContainerRef}
                >
                    <Fretboard
                        fretboardHeight={fretboardHeight}
                        store={store}
                        sliderStore={sliderStore}
                    />
                </OverflowContainerDiv>
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
