import React, { useCallback, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
    useStateRef,
    AppStore,
    SliderStore,
    AudioStore,
    TouchStore,
    getComputedAppState,
} from "../../store";
import { FretboardString } from "../FretboardString";
import {
    getFretboardDimensions,
    getFretWidth,
    STANDARD_TUNING,
    FRETBOARD_WIDTH,
    STRING_SIZE,
    NATURAL_NOTE_KEYMAP,
    SELECTED,
    STRUM_LOW_TO_HIGH,
} from "../../utils";
import {
    AnimationWrapper,
    FretboardContainer,
    FretboardDiv,
    OverflowContainerDiv,
} from "./style";

// Component
interface Props {
    appStore: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Fretboard: React.FC<Props> = ({
    appStore,
    sliderStore,
    audioStore,
    touchStore,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [getState, setState] = useStateRef(() => ({
        highEBottom: appStore.state.invert !== appStore.state.leftHand,
        showInput: appStore.state.showInput,
        showSettings: appStore.state.showSettings,
        transformOrigin: "bottom",
    }));
    const { highEBottom, showInput, showSettings, transformOrigin } =
        getState();

    const fretboardContainerRef = useRef<HTMLDivElement>(null);
    const scrollToFretRef = useRef(0);

    useEffect(() => {
        const destroyListener = appStore.addListener((newState) => {
            const { showInput, progression, invert, leftHand, showSettings } =
                getComputedAppState(newState);
            const { scrollToFret } = progression;
            const highEBottom = invert !== leftHand;

            if (
                getState().highEBottom !== highEBottom ||
                getState().showInput !== showInput ||
                getState().showSettings !== showSettings
            ) {
                let transformOrigin =
                    showInput && !getState().showInput
                        ? "bottom"
                        : showSettings && !getState().showSettings
                        ? "top"
                        : getState().transformOrigin;
                setState({
                    highEBottom,
                    showInput,
                    showSettings,
                    transformOrigin,
                });
            }

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

        window.addEventListener("keydown", onKeyPress);
        return () => {
            destroyListener();
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const onKeyPress = useCallback((event: KeyboardEvent) => {
        const { invert, leftHand, progression } = appStore.getComputedState();
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
            appStore.dispatch.incrementPositionY();
        } else if (down) {
            appStore.dispatch.decrementPositionY();
        } else if (right) {
            appStore.dispatch.incrementPositionX();
        } else if (left) {
            appStore.dispatch.decrementPositionX();
        } else {
            const naturalNotesKeyMap = NATURAL_NOTE_KEYMAP[label];
            if (naturalNotesKeyMap.hasOwnProperty(event.key)) {
                event.preventDefault();
                appStore.dispatch.setHighlightedNote(
                    0,
                    naturalNotesKeyMap[event.key],
                    SELECTED
                );
            }
        }

        if (playSound) {
            const { fretboard, strumMode } = appStore.getComputedState();
            if (strumMode === STRUM_LOW_TO_HIGH)
                audioStore.strumChord(fretboard);
            else {
                audioStore.arpeggiateChord(fretboard);
            }
        }
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => (
        <FretboardString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            appStore={appStore}
            sliderStore={sliderStore}
            audioStore={audioStore}
            touchStore={touchStore}
        />
    ));

    const { maxFretboardHeight, minFretboardHeight, maxInputHeight } =
        getFretboardDimensions();

    return (
        <AnimationWrapper
            maxFretboardHeight={maxFretboardHeight}
            minFretboardHeight={minFretboardHeight}
            maxInputHeight={maxInputHeight}
            transformOrigin={transformOrigin}
        >
            <CSSTransition
                in={showInput || showSettings}
                timeout={{ enter: 150, exit: 300 }}
                classNames="fretboard-shrink"
                // onEnter={() => console.log("ENTER")}
                // onEntered={() => console.log("ENTERED")}
                // onExit={() => console.log("EXIT")}
                // onExited={() => console.log("EXITED")}
            >
                <OverflowContainerDiv
                    ref={fretboardContainerRef}
                    className="overflow-container"
                >
                    <FretboardContainer
                        width={`${FRETBOARD_WIDTH}px`}
                        className="fretboard-container"
                    >
                        <FretboardDiv>
                            {highEBottom ? strings : strings.reverse()}
                        </FretboardDiv>
                    </FretboardContainer>
                </OverflowContainerDiv>
            </CSSTransition>
        </AnimationWrapper>
    );
};
