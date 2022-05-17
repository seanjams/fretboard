import React, { useCallback, useEffect, useRef } from "react";
import {
    AppStore,
    getComputedAppState,
    AudioStore,
    useTouchHandlers,
    TouchStateType,
    useDerivedState,
} from "../../store";
import {
    LabelTypes,
    StatusTypes,
    ReactMouseEvent,
    WindowMouseEvent,
    DragStatusTypes,
    FretboardType,
    FretboardDiffType,
} from "../../types";
import {
    getFretWidth,
    mod,
    SLIDER_LEFT_WINDOW,
    SLIDER_RIGHT_WINDOW,
    SLIDER_WINDOW_LENGTH,
    HIGHLIGHTED,
    SELECTED,
    NOT_SELECTED,
    SHARP_NAMES,
    FLAT_NAMES,
    FRETBOARD_WIDTH,
    STRING_SIZE,
    darkGrey,
    lightGrey,
    getFretValue,
    colorFade,
    gold,
    getFretboardDimensions,
    white,
    COLORS,
} from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { Div } from "../Common";
import {
    CircleDiv,
    FretDiv,
    FretNumber,
    LegendDot,
    OctaveDot,
    ShadowDiv,
} from "./style";

const getTopMargin = (diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return `calc(50% - ${diameter / 2}px)`;
};

const inRange = (value: number, leftBound: number, rightBound: number) => {
    return value >= leftBound && value <= rightBound;
};

const isWithinBoundary = (
    boundary: DOMRect,
    clientX: number,
    clientY: number,
    threshold: number = 0
) => {
    const { top, left, bottom, right } = boundary;
    return (
        clientX <= right + threshold &&
        clientX >= left - threshold &&
        clientY <= bottom + threshold &&
        clientY >= top - threshold
    );
};

const getBackgroundColor = (
    fretStatus: number,
    playProgress: number,
    colors: string[]
) => {
    const progress = Math.min(Math.max(0, playProgress), 1);
    const primaryColor = colors[1] || "#FABF26";
    const playingColor = colors[0] || gold;
    const isSelected = fretStatus !== NOT_SELECTED;
    const isHighlighted = fretStatus === HIGHLIGHTED;

    return isHighlighted
        ? colorFade(playingColor, primaryColor, progress) || primaryColor
        : isSelected
        ? lightGrey
        : "transparent";
};

const getFretStatus = (
    fretboard: FretboardType,
    stringIndex: number,
    fretIndex: number | undefined
) => {
    return fretIndex !== undefined && fretboard
        ? fretboard.strings[stringIndex][fretIndex]
        : NOT_SELECTED;
};

const getDiffFretIndex = (
    diff: FretboardDiffType,
    stringIndex: number,
    fretIndex: number | undefined
) => {
    if (
        !diff ||
        fretIndex === undefined ||
        diff[stringIndex][fretIndex] === undefined
    )
        return undefined;
    const diffSteps = diff[stringIndex][fretIndex].slide;
    return Math.abs(diffSteps) < 9999 ? fretIndex + diffSteps : undefined;
};

const getDiffEmptyFill = (
    diff: FretboardDiffType,
    stringIndex: number,
    fretIndex: number,
    fill = false
) => {
    if (!diff || !diff[stringIndex][fretIndex]) return false;

    return fill
        ? diff[stringIndex][fretIndex].slide >= 9999
        : diff[stringIndex][fretIndex].slide <= -9999;
};

const getFretName = (fretValue: number, label: LabelTypes) => {
    return label === "sharp" ? SHARP_NAMES[fretValue] : FLAT_NAMES[fretValue];
};

interface FretProps {
    fretIndex: number;
    stringIndex: number;
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Fret: React.FC<FretProps> = ({
    fretIndex,
    stringIndex,
    appStore,
    audioStore,
}) => {
    const fretValue = getFretValue(stringIndex, fretIndex);
    const fretAudioKey = `${stringIndex}_${fretIndex}`;
    const isOpenString = fretIndex === 0;

    const appState = appStore.getComputedState();
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { fretName, highEBottom } = getState();
    const { display, fretboard, progress, status } = appState;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { invert, leftHand, progression } = getComputedAppState(appState);
        const { label } = progression;
        const fretName = getFretName(fretValue, label);
        const highEBottom = invert !== leftHand;
        return { fretName, highEBottom };
    }

    // init refs
    const progressRef = useRef(progress);
    const circleRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    // refs
    const currentFretStatusRef = useRef(
        fretboard.strings[stringIndex][fretIndex]
    );
    const statusModeRef = useRef(status);
    const isPlayingRef = useRef(audioStore.state.isPlaying.has(fretAudioKey));
    // for isMouseOver drag logic
    const isMouseOverRef = useRef(false);
    const isMouseOverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    // for fretIsPlaying color fade animation
    const fretIsPlayingProgressRef = useRef(1);
    const fretIsPlayingAnimationRef =
        useRef<ReturnType<typeof requestAnimationFrame>>();
    // for disabling note selection when fretboard is small
    const isDisabledRef = useRef(display !== "normal");
    // for turning Highlight status off after drag sequence
    // const temporaryHighlightMode = useRef(false);
    // const temporaryEraseMode = useRef(false);

    // state CSS props for first render
    const backgroundColor = "transparent";
    const textColor = "transparent";
    // makes frets progressively smaller
    const fretWidth = getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, fretIndex);
    // makes strings progressively thinner
    const thickness = (6 - stringIndex + 1) / 2;

    const { circleSize } = getFretboardDimensions();
    const top = getTopMargin(circleSize);

    useEffect(() => {
        // initial move top set background color and other styles
        moveFret();
        return appStore.addListener((appState) => {
            const { display, progress, status, fretboard } =
                getComputedAppState(appState);
            const isDisabled = display !== "normal";
            const currentFretStatus = fretboard.strings[stringIndex][fretIndex];

            // set refs based on changes
            if (
                progressRef.current !== progress ||
                statusModeRef.current !== status ||
                currentFretStatusRef.current !== currentFretStatus ||
                isDisabledRef.current !== isDisabled
            ) {
                progressRef.current = progress;
                statusModeRef.current = status;
                currentFretStatusRef.current = currentFretStatus;
                isDisabledRef.current = isDisabled;
                moveFret();
            }
        });
    }, []);

    useEffect(
        () =>
            audioStore.addListener(({ isPlaying }) => {
                const fretIsPlaying = isPlaying.has(fretAudioKey);
                if (isPlaying.has(fretAudioKey) !== isPlayingRef.current) {
                    isPlayingRef.current = fretIsPlaying;

                    if (fretIsPlaying && shadowRef.current) {
                        fretIsPlayingProgressRef.current = 0;
                        fretIsPlayingAnimation(moveFret);
                    } else {
                        moveFret();
                    }
                }
            }),
        []
    );

    function moveFret() {
        const styles = calculateFretStyles();
        if (styles) {
            const {
                left,
                fillPercentage,
                fillOpacityPercentage,
                backgroundColor,
                textColor,
                highlightShadowColor,
            } = styles;
            setFretStyles(
                left,
                fillPercentage,
                fillOpacityPercentage,
                backgroundColor,
                textColor,
                highlightShadowColor
            );
        }
    }

    function calculateFretStyles() {
        if (!shadowRef.current || !circleRef.current) return;

        const progress = progressRef.current;
        const { progression, invert, currentFretboardIndex } =
            appStore.getComputedState();
        const i = currentFretboardIndex;
        const { leftDiffs, rightDiffs, fretboards } = progression;
        const leftDiff = leftDiffs[i];
        const rightDiff = rightDiffs[i];
        const currentFretboard = fretboards[i];
        const leftFretboard = fretboards[i - 1];
        const rightFretboard = fretboards[i + 1];
        const currentFretStatus =
            currentFretboard.strings[stringIndex][fretIndex];

        // consts
        const leftWindow = i + SLIDER_LEFT_WINDOW;
        const rightWindow = i + SLIDER_RIGHT_WINDOW;
        let direction = invert ? -1 : 1;

        // this fret is filled now,
        // and will be emptied in the fretboard to the left/right
        const leftEmpty = !!(
            currentFretStatus &&
            getDiffEmptyFill(leftDiff, stringIndex, fretIndex, false)
        );
        const rightEmpty = !!(
            currentFretStatus &&
            getDiffEmptyFill(rightDiff, stringIndex, fretIndex, false)
        );

        // this fret is empty now,
        // and will be filled in the fretboard to the left/right
        const leftFill =
            !currentFretStatus &&
            getDiffEmptyFill(leftDiff, stringIndex, fretIndex, true);

        const rightFill = !!(
            !currentFretStatus &&
            getDiffEmptyFill(rightDiff, stringIndex, fretIndex, true)
        );

        // index of fret that the leftDiff/rightDiff slides us to
        const leftDiffFretIndex = getDiffFretIndex(
            leftDiff,
            stringIndex,
            fretIndex
        );
        const rightDiffFretIndex = getDiffFretIndex(
            rightDiff,
            stringIndex,
            fretIndex
        );

        // status of current fret on the left/right fretboard
        const leftCurrentFretStatus = getFretStatus(
            leftFretboard,
            stringIndex,
            fretIndex
        );
        const rightCurrentFretStatus = getFretStatus(
            rightFretboard,
            stringIndex,
            fretIndex
        );

        // status of fret that the leftDiff/rightDiff slides us to
        const leftDiffFretStatus = getFretStatus(
            leftFretboard,
            stringIndex,
            leftDiffFretIndex
        );
        const rightDiffFretStatus = getFretStatus(
            rightFretboard,
            stringIndex,
            rightDiffFretIndex
        );
        // const leftDiffFretStatus = leftDiff[stringIndex][fretIndex].toStatus;
        // const rightDiffFretStatus = rightDiff[stringIndex][fretIndex].toStatus;

        // slider range booleans
        const insideLeft = inRange(progress, i, leftWindow);
        const middle = inRange(progress, leftWindow, rightWindow);
        const insideRight = inRange(progress, rightWindow, i + 1);

        // background color for shadow div
        let backgroundColor = getBackgroundColor(
            currentFretStatus,
            fretIsPlayingProgressRef.current,
            COLORS[currentFretboard.colorIndex]
        );
        // text color for circle div
        // let textColor = !currentFretStatus ? lightGrey : darkGrey;
        let textColor = darkGrey;
        const highlightShadowColor = COLORS[currentFretboard.colorIndex][2];

        let newLeft; // new left position for sliding shadowDiv
        let fillPercentage = 100; // new diameter for growing/shrinking shadowDiv
        let fillOpacityPercentage = 100; // new opacity for growing/shrinking shadowDiv

        if (insideLeft || insideRight) {
            // The progress is between the left border and leftWindow
            const diff = insideLeft ? leftDiff : rightDiff;
            const empty = insideLeft ? leftEmpty : rightEmpty;
            const fill = insideLeft ? leftFill : rightFill;
            const nextCurrentFretStatus = insideLeft
                ? leftCurrentFretStatus
                : rightCurrentFretStatus;
            const nextDiffFretStatus = insideLeft
                ? leftDiffFretStatus
                : rightDiffFretStatus;
            const nextFretboard = insideLeft ? leftFretboard : rightFretboard;

            // x is percentage of journey between slider windows, 0-1
            // xPercent is percentage of journey between slider windows, 0-100
            // all altered notes should be x% to the left/right depending on insideLeft
            let x = insideLeft
                ? (leftWindow - progress) / SLIDER_WINDOW_LENGTH
                : (progress - rightWindow) / SLIDER_WINDOW_LENGTH;
            let xPercent = x * 100;

            let fromColor =
                backgroundColor === "transparent" ? white : backgroundColor;
            let toEmptyFillColor = getBackgroundColor(
                nextCurrentFretStatus || NOT_SELECTED,
                fretIsPlayingProgressRef.current,
                nextFretboard ? COLORS[nextFretboard.colorIndex] : []
            );
            let toDiffSlideColor = getBackgroundColor(
                nextDiffFretStatus || NOT_SELECTED,
                fretIsPlayingProgressRef.current,
                nextFretboard ? COLORS[nextFretboard.colorIndex] : []
            );
            toEmptyFillColor =
                toEmptyFillColor === "transparent" ? white : toEmptyFillColor;
            toDiffSlideColor =
                toDiffSlideColor === "transparent" ? white : toDiffSlideColor;

            if (empty) {
                // the next fretboard is empty at our location, we should disappear
                fillPercentage = 100 - x * 50;
                fillOpacityPercentage = 100 - xPercent;
                // textColor = colorFade(darkGrey, lightGrey, x) || textColor;
                backgroundColor =
                    colorFade(fromColor, toEmptyFillColor, x) || "transparent";
            } else if (fill) {
                // the next fretboard is filled at our location, we should appear
                fillPercentage = 50 + x * 50;
                fillOpacityPercentage = xPercent;
                // textColor = colorFade(lightGrey, darkGrey, x) || textColor;
                backgroundColor =
                    colorFade(fromColor, toEmptyFillColor, x) || "transparent";
            } else if (diff) {
                // text color
                // let fromTextColor = currentFretStatus ? darkGrey : lightGrey;
                // let toTextColor = nextCurrentFretStatus ? darkGrey : lightGrey;
                // textColor =
                //     colorFade(fromTextColor, toTextColor, x) || textColor;

                // background color
                if (nextDiffFretStatus) {
                    backgroundColor =
                        colorFade(fromColor, toDiffSlideColor, x) ||
                        "transparent";
                }

                let diffSteps =
                    diff[stringIndex][fretIndex] &&
                    diff[stringIndex][fretIndex].slide; // how many frets to move
                if (diffSteps !== undefined)
                    newLeft = direction * diffSteps * xPercent + 50;
            }
        } else if (middle) {
            // The progress is in the middle of the window

            // all altered notes should be in the middle
            if (leftEmpty || rightEmpty) {
                fillPercentage = 100;
                fillOpacityPercentage = 100;
            } else if (leftFill || rightFill) {
                fillPercentage = 0;
                fillOpacityPercentage = 0;
            }
            newLeft = 50;
        }

        return {
            left: newLeft,
            fillPercentage,
            fillOpacityPercentage,
            backgroundColor,
            textColor,
            highlightShadowColor,
        };
    }

    function setFretStyles(
        left: number | undefined,
        fillPercentage: number,
        fillOpacityPercentage: number,
        backgroundColor: string,
        textColor: string,
        highlightShadowColor: string
    ) {
        if (!shadowRef.current || !circleRef.current) return;
        const statusMode = statusModeRef.current;
        const fretStatus = currentFretStatusRef.current;

        // set position
        if (left !== undefined) shadowRef.current.style.left = `${left}%`;

        // set background color
        if (shadowRef.current.style.backgroundColor !== backgroundColor)
            shadowRef.current.style.backgroundColor = backgroundColor;

        // set shadow diameter/radius consts
        const d = (circleSize * fillPercentage) / 100;
        const r = d / 2;

        // set shadow opacity
        const opacity = `${fillOpacityPercentage / 100}`;
        if (shadowRef.current.style.opacity !== opacity)
            shadowRef.current.style.opacity = opacity;

        // set shadow width/height
        const diameter = `${d}px`;
        if (shadowRef.current.style.width !== diameter)
            shadowRef.current.style.width = diameter;
        if (shadowRef.current.style.height !== diameter)
            shadowRef.current.style.height = diameter;

        // set shadow margin
        const margin = `-${r}px`;
        if (shadowRef.current.style.marginLeft !== margin)
            shadowRef.current.style.marginLeft = margin;
        if (shadowRef.current.style.marginRight !== margin)
            shadowRef.current.style.marginRight = margin;

        // set shadow top
        const top = getTopMargin(d);
        if (shadowRef.current.style.top !== top)
            shadowRef.current.style.top = top;

        // set shadow box-shadow
        // const boxShadow =
        //     statusMode === HIGHLIGHTED && fretStatus === HIGHLIGHTED
        //         ? `0 0 20px 1px ${highlightShadowColor}`
        //         : "none";
        // if (shadowRef.current.style.boxShadow !== boxShadow)
        //     shadowRef.current.style.boxShadow = boxShadow;

        // set circle color
        const color = statusMode === HIGHLIGHTED ? textColor : darkGrey;
        if (circleRef.current.style.color !== color)
            circleRef.current.style.color = color;
    }

    function fretIsPlayingAnimation(callback: () => void) {
        const animationDuration = 1.2; // average length of sprite
        const totalFrames = Math.ceil(animationDuration * 60);
        let frameCount = 0;

        const performAnimation = () => {
            fretIsPlayingAnimationRef.current =
                requestAnimationFrame(performAnimation);

            fretIsPlayingProgressRef.current += 1 / totalFrames;
            frameCount++;

            if (frameCount === totalFrames) {
                cancelAnimationFrame(fretIsPlayingAnimationRef.current);
                fretIsPlayingProgressRef.current = 1;
            }

            callback();
        };
        requestAnimationFrame(performAnimation);
    }

    function playNoteAudio() {
        // audioStore.timerWorker.postMessage("stop");
        audioStore.playNote(stringIndex, fretIndex);
    }

    function onContextMenu(event: ReactMouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    function startMouseOver() {
        // mouse over this element?
        isMouseOverRef.current = true;
    }

    function clearMouseOver(delay: number = 0) {
        // mouse over this element?
        if (isMouseOverTimeoutRef.current) {
            clearTimeout(isMouseOverTimeoutRef.current);
            isMouseOverTimeoutRef.current = undefined;
        }

        if (delay && isMouseOverRef.current) {
            isMouseOverTimeoutRef.current = setTimeout(() => {
                isMouseOverRef.current = false;
                isMouseOverTimeoutRef.current = undefined;
            }, delay);
        } else {
            isMouseOverRef.current = false;
        }
    }

    function setNextHighlightStatus(
        highlightMode: StatusTypes,
        fromStatus: StatusTypes,
        fromDragStatus: DragStatusTypes,
        isDragging: boolean
    ): [StatusTypes, DragStatusTypes] {
        // toggle selection of note
        let toStatus = fromStatus;
        let toDragStatus = fromDragStatus;

        // dont select/deselect notes when disabled
        if (isDisabledRef.current) return [toStatus, toDragStatus];

        if (highlightMode === HIGHLIGHTED) {
            // only handle events on selected notes, the rest are disabled
            if (isDragging) {
                toStatus =
                    fromDragStatus === "off" ? NOT_SELECTED : HIGHLIGHTED;
            } else {
                toStatus =
                    fromStatus === HIGHLIGHTED ? NOT_SELECTED : HIGHLIGHTED;
                toDragStatus = fromStatus === HIGHLIGHTED ? "off" : "on";
            }
        } else if (highlightMode === SELECTED) {
            // Demote the selection status, or select if not selected already
            // if (temporaryEraseMode.current) {
            //     toStatus = NOT_SELECTED;
            //     toDragStatus = "off";
            // } else
            if (isDragging) {
                toStatus = fromDragStatus === "off" ? NOT_SELECTED : SELECTED;
            } else {
                toStatus = fromStatus ? NOT_SELECTED : SELECTED;
                toDragStatus = fromStatus ? "off" : "on";
            }
        }

        if (toStatus !== fromStatus) {
            appStore.dispatch.setHighlightedNote(
                stringIndex,
                fretIndex,
                toStatus
            );
            playNoteAudio();
        }

        return [toStatus, toDragStatus];
    }

    function setHighlightNote(startDrag = false) {
        // dont select/deselect notes when disabled
        if (isDisabledRef.current) return;

        // highlight note if brush mode is highlight
        const { status, fretboard, fretDragStatus } =
            appStore.getComputedState();

        // toggle selection of note
        const fromStatus = fretboard.strings[stringIndex][fretIndex];
        const [_, toDragStatus] = setNextHighlightStatus(
            status,
            fromStatus,
            fretDragStatus,
            false
        );

        if (startDrag && toDragStatus !== fretDragStatus) {
            appStore.dispatch.setFretDragStatus(toDragStatus);
        }
    }

    /*
    1) If i long press a note that is NOT_SELECTED, a drag sequence should start for selecting notes normally
    2) If I long press a note that is SELECTED, highlight mode should turn on and I should only be allowed to highlight currently selected notes
    3) If I long press a note that is HIGHLIGHTED, highlight mode should turn on and I should only be allowed to unhighlight currently highlighted notes
    4) If I click a note that is NOT_SELECTED, it should become SELECTED
    5) If I click a note that is SELECTED, it should become NOT_SELECTED
    6) If I click a note that is HIGHLIGHTED, it should become NOT_SELECTED (OR SELECTED, undecided on this one)
     */
    const touchHandlers = useTouchHandlers(
        {
            onStart: (event: ReactMouseEvent) => {
                const { fretDragStatus } = appStore.state;
                // this is needed to let onTouchMove know that this element started
                // the drag sequence, and therefore doesn't need to be processed
                startMouseOver();
                if (fretDragStatus) appStore.dispatch.setFretDragStatus(null);

                // enable scroll
                if (circleRef.current)
                    circleRef.current.style.touchAction = "auto";

                // temporaryHighlightMode.current = false;
                // temporaryEraseMode.current = false;
            },
            onClick: (event: WindowMouseEvent) => {
                setHighlightNote();
            },
            onEnd: (event: WindowMouseEvent, touchStore: TouchStateType) => {
                clearMouseOver();
                // if (temporaryHighlightMode.current) {
                //     appStore.dispatch.setStatus(SELECTED);
                // }

                // enable scroll
                if (circleRef.current)
                    circleRef.current.style.touchAction = "auto";

                // temporaryHighlightMode.current = false;
                // temporaryEraseMode.current = false;
            },
            onLongPress: () => {
                const { fretboard, status } = appStore.getComputedState();
                const fromStatus = fretboard.strings[stringIndex][fretIndex];

                // if (fromStatus !== NOT_SELECTED && status !== HIGHLIGHTED) {
                //     appStore.dispatch.setStatus(HIGHLIGHTED);
                //     temporaryHighlightMode.current = true;
                //     temporaryEraseMode.current = false;
                // }

                // disable scroll
                if (circleRef.current)
                    circleRef.current.style.touchAction = "none";
                // start highlighting notes regardless of temporaryHighlightMode
                setHighlightNote(true);
            },
            onExtraLongPress: () => {
                // if (temporaryHighlightMode.current) {
                //     appStore.dispatch.setStatus(SELECTED);
                //     temporaryHighlightMode.current = false;
                //     temporaryEraseMode.current = true;
                //     // only start erasing notes if in temporaryHighlightMode
                //     setHighlightNote(true);
                // }
            },
            onMove: (event: WindowMouseEvent, touchStore: TouchStateType) => {
                const { fretboard, status, fretDragStatus } =
                    appStore.getComputedState();
                const { coordinates } = touchStore;

                // dont select/deselect notes when disabled or not isLongPress
                if (
                    isDisabledRef.current ||
                    !fretDragStatus ||
                    !circleRef.current ||
                    !coordinates
                )
                    return;

                const [clientX, clientY] = coordinates;

                // could speed up by cacheing this
                const circleBoundary =
                    circleRef.current.getBoundingClientRect();
                if (
                    clientX &&
                    clientY &&
                    isWithinBoundary(circleBoundary, clientX, clientY)
                ) {
                    if (isMouseOverRef.current) return;
                    const fromStatus =
                        fretboard.strings[stringIndex][fretIndex];
                    setNextHighlightStatus(
                        status,
                        fromStatus,
                        fretDragStatus,
                        true
                    );

                    startMouseOver();
                } else {
                    // remove isMouseOver when leaving the circle boundaries,
                    // with small delay to prevent flickering
                    clearMouseOver(30);
                }
            },
        },
        {
            extraLongPressDelay: 1500,
            longPressDelay: 400,
        }
    );

    const addFretNumber =
        (highEBottom && stringIndex === 0) ||
        (!highEBottom && stringIndex === 5);

    return (
        <Div width={`${fretWidth}px`} height="100%" {...touchHandlers}>
            {addFretNumber && <FretNumber>{fretIndex}</FretNumber>}
            <FretDiv onContextMenu={onContextMenu} isOpenString={isOpenString}>
                <Div
                    height={`${thickness}px`}
                    backgroundColor={!!fretIndex ? lightGrey : "transparent"}
                    width={`calc(50% - ${circleSize / 2}px)`}
                    margin={"auto 0"}
                />
                <CircleDiv
                    ref={circleRef}
                    color={textColor}
                    circleSize={circleSize}
                >
                    <ChordSymbol
                        rootName={fretName}
                        chordName=""
                        fontSize={16}
                    />
                </CircleDiv>
                <ShadowDiv
                    ref={shadowRef}
                    backgroundColor={backgroundColor}
                    top={top}
                    circleSize={circleSize}
                />
                <Div
                    height={`${thickness}px`}
                    backgroundColor={!!fretIndex ? lightGrey : "transparent"}
                    width={`calc(50% - ${circleSize / 2}px)`}
                    margin={"auto 0"}
                />
                {fretIndex !== 0 &&
                    (stringIndex === 0 || stringIndex === 5) &&
                    [0, 3, 5, 7, 9].includes(mod(fretIndex, 12)) && (
                        <LegendDot legendTop={stringIndex !== 0} />
                    )}
                {fretIndex !== 0 &&
                    (stringIndex === 0 || stringIndex === 5) &&
                    mod(fretIndex, 12) === 0 && (
                        <OctaveDot legendTop={stringIndex !== 0} />
                    )}
            </FretDiv>
        </Div>
    );
};
