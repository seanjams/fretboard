import React, { useEffect, useRef } from "react";
import {
    useStateRef,
    AppStore,
    AudioStore,
    useKeyPressHandlers,
    useTouchHandlers,
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
    FretboardAnimation,
    FretboardContainer,
    FretboardDiv,
    OverflowContainerDiv,
} from "./style";
import { ArrowTypes } from "../../types";

// Component
interface FretboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Fretboard: React.FC<FretboardProps> = ({
    appStore,
    audioStore,
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

    useEffect(
        () =>
            appStore.addListener((newState) => {
                const {
                    showTopDrawer,
                    invert,
                    leftHand,
                    showBottomDrawer,
                    scrollToFretUpdated,
                } = newState;
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

                if (fretboardContainerRef.current && scrollToFretUpdated) {
                    scrollFretboard();
                }
            }),
        []
    );

    const scrollFretboard = () => {
        if (!fretboardContainerRef.current) return;

        const { invert, strumMode, fretboard, scrollToFret } =
            appStore.getComputedState();

        // Get position of scrollToFret, oldScrollToFret
        let fretXPosition = 0;
        let oldFretXPosition = 0;
        let newFretXPosition = 0;
        for (
            let i = 0;
            i < Math.max(scrollToFret, scrollToFretRef.current);
            i++
        ) {
            fretXPosition += getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, i);
            if (i === Math.floor(scrollToFretRef.current) - 1)
                oldFretXPosition = fretXPosition;
            if (i === Math.floor(scrollToFret) - 1)
                newFretXPosition = fretXPosition;
        }

        const containerWidth = fretboardContainerRef.current.offsetWidth;
        const containerLeftBound =
            fretboardContainerRef.current.scrollLeft - 0.4 * containerWidth;
        const containerRightBound =
            fretboardContainerRef.current.scrollLeft + 0.4 * containerWidth;
        const oldScrollLeft = oldFretXPosition - containerWidth / 2;
        const newScrollLeft = newFretXPosition - containerWidth / 2;
        const oldScrollCenter = invert
            ? FRETBOARD_WIDTH - oldScrollLeft
            : oldScrollLeft;
        const newScrollCenter = invert
            ? FRETBOARD_WIDTH - newScrollLeft
            : newScrollLeft;

        const newScrollCenterInView =
            containerLeftBound <= newScrollCenter &&
            newScrollCenter <= containerRightBound;

        let delayStrum = 150;
        if (!newScrollCenterInView) {
            // should not delayStrum if we don't scroll.
            // Otherwise delay by SCROLL_TIME
            delayStrum =
                (oldScrollCenter > 0 &&
                    oldScrollCenter < FRETBOARD_WIDTH - containerWidth) ||
                (newScrollCenter > 0 &&
                    newScrollCenter < FRETBOARD_WIDTH - containerWidth)
                    ? 468
                    : 150;

            fretboardContainerRef.current.scrollTo({
                top: 0,
                left: newScrollCenter,
                behavior: "smooth",
            });
        }

        setTimeout(() => {
            // const { fretboard, strumMode } =
            //     appStore.getComputedState();
            strumMode === STRUM_LOW_TO_HIGH
                ? audioStore.strumChord(fretboard)
                : audioStore.arpeggiateChord(fretboard);
        }, delayStrum);

        // udpate ref
        scrollToFretRef.current = scrollToFret;
        appStore.setKey("scrollToFretUpdated", false);
    };

    useKeyPressHandlers((event: KeyboardEvent) => {
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
    });

    const strings = STANDARD_TUNING.map((value, i) => (
        <FretboardString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            appStore={appStore}
            audioStore={audioStore}
        />
    ));

    const fretboardDimensions = getFretboardDimensions();

    const touchHandlers = useTouchHandlers({
        onClick: () => {
            if (appStore.state.display !== "normal")
                appStore.dispatch.setDisplay("normal");
        },
    });

    return (
        <FretboardAnimation
            trigger={showTopDrawer || showBottomDrawer}
            transformOrigin={transformOrigin}
            {...fretboardDimensions}
        >
            <OverflowContainerDiv
                ref={fretboardContainerRef}
                {...fretboardDimensions}
                {...touchHandlers}
            >
                <FretboardContainer {...fretboardDimensions}>
                    <FretboardDiv>
                        {highEBottom ? strings : strings.reverse()}
                    </FretboardDiv>
                </FretboardContainer>
            </OverflowContainerDiv>
        </FretboardAnimation>
    );
};
