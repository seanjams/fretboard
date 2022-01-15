import React, { useCallback, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
    useStateRef,
    AppStore,
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
import { ArrowTypes } from "../../types";

// Component
interface Props {
    appStore: AppStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Fretboard: React.FC<Props> = ({
    appStore,
    audioStore,
    touchStore,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [getState, setState] = useStateRef(() => ({
        highEBottom: appStore.state.invert !== appStore.state.leftHand,
        showTopDrawer: appStore.state.showTopDrawer,
        showBottomDrawer: appStore.state.showBottomDrawer,
        transformOrigin: "bottom",
    }));
    const { highEBottom, showTopDrawer, showBottomDrawer, transformOrigin } =
        getState();

    const fretboardContainerRef = useRef<HTMLDivElement>(null);
    const scrollToFretRef = useRef(0);

    useEffect(() => {
        const destroyAppStoreListener = appStore.addListener((newState) => {
            const {
                showTopDrawer,
                progression,
                invert,
                leftHand,
                showBottomDrawer,
            } = getComputedAppState(newState);
            const { scrollToFret } = progression;
            const highEBottom = invert !== leftHand;

            if (
                getState().highEBottom !== highEBottom ||
                getState().showTopDrawer !== showTopDrawer ||
                getState().showBottomDrawer !== showBottomDrawer
            ) {
                let transformOrigin =
                    showTopDrawer && !getState().showTopDrawer
                        ? "bottom"
                        : showBottomDrawer && !getState().showBottomDrawer
                        ? "top"
                        : getState().transformOrigin;
                setState({
                    highEBottom,
                    showTopDrawer,
                    showBottomDrawer,
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
                const scrollCenter = invert
                    ? FRETBOARD_WIDTH - fretXPosition - halfContainerWidth
                    : fretXPosition - halfContainerWidth;
                // const left = invert
                //     ? FRETBOARD_WIDTH - scrollCenter
                //     : scrollCenter;

                fretboardContainerRef.current.scrollTo({
                    top: 0,
                    left: scrollCenter,
                    behavior: "smooth",
                });
                scrollToFretRef.current = scrollToFret;
            }
        });

        window.addEventListener("keydown", onKeyPress);
        return () => {
            destroyAppStoreListener();
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const onKeyPress = useCallback((event: KeyboardEvent) => {
        const { progression } = appStore.getComputedState();
        const { label } = progression;
        let dir = event.key;
        const isArrowDir =
            dir === "ArrowUp" ||
            dir === "ArrowDown" ||
            dir === "ArrowLeft" ||
            dir === "ArrowRight";

        if (isArrowDir) {
            appStore.dispatch.setHighlightedPosition(dir as ArrowTypes);
            const { fretboard, strumMode } = appStore.getComputedState();
            strumMode === STRUM_LOW_TO_HIGH
                ? audioStore.strumChord(fretboard)
                : audioStore.arpeggiateChord(fretboard);
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
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => (
        <FretboardString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            appStore={appStore}
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
                in={showTopDrawer || showBottomDrawer}
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
