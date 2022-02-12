import React, { useCallback, useEffect, useRef } from "react";
import {
    AppStore,
    getComputedAppState,
    AudioStore,
    useStateRef,
    useTouchHandlers,
} from "../../store";
import {
    LabelTypes,
    FretboardType,
    StatusTypes,
    ReactMouseEvent,
    WindowMouseEvent,
} from "../../types";
import {
    getFretWidth,
    mod,
    COLORS,
    CIRCLE_SIZE,
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
} from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import {
    CircleDiv,
    FretDiv,
    LegendDot,
    OctaveDot,
    ShadowDiv,
    StringSegmentDiv,
} from "./style";

const [secondaryColor, primaryColor] = COLORS[0];
const playingColor = gold;

const getTopMargin = (diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return `calc((100% - ${diameter}px) / 2)`;
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
    isSelected: boolean,
    isHighlighted: boolean,
    playProgress: number,
    status: StatusTypes
) => {
    const progress = Math.min(Math.max(0, playProgress), 1);
    // const primary = status === HIGHLIGHTED ? primaryColor : "#FABF26";

    return isHighlighted
        ? // ? colorFade(playingColor, primary, progress) || primary
          colorFade(playingColor, primaryColor, progress) || primaryColor
        : isSelected
        ? secondaryColor
        : "transparent";
};

const getIsSelected = (
    fretboard: FretboardType,
    stringIndex: number,
    fretIndex: number
) => {
    return [SELECTED, HIGHLIGHTED].includes(
        fretboard.strings[stringIndex][fretIndex]
    );
};

const getIsHighlighted = (
    fretboard: FretboardType,
    stringIndex: number,
    fretIndex: number
) => {
    return fretboard.strings[stringIndex][fretIndex] === HIGHLIGHTED;
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

    const {
        display,
        fretboard,
        progression,
        progress,
        status,
        invert,
        leftHand,
    } = appStore.getComputedState();
    const { label } = progression;

    const [getState, setState] = useStateRef(() => ({
        fretName: getFretName(fretValue, label),
        highEBottom: invert !== leftHand,
    }));
    const { fretName, highEBottom } = getState();

    // init refs
    const progressRef = useRef(progress);
    const circleRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    // refs
    const statusRef = useRef(status);
    const isHighlightedRef = useRef(
        getIsHighlighted(fretboard, stringIndex, fretIndex)
    );
    const isSelectedRef = useRef(
        getIsSelected(fretboard, stringIndex, fretIndex)
    );
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

    // state CSS props for first render
    const backgroundColor = getBackgroundColor(
        isSelectedRef.current,
        isHighlightedRef.current,
        fretIsPlayingProgressRef.current,
        status
    );
    const textColor =
        status === HIGHLIGHTED && !isSelectedRef.current ? lightGrey : darkGrey;
    const top = getTopMargin(CIRCLE_SIZE);
    // makes frets progressively smaller
    const fretWidth = getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, fretIndex);
    // makes strings progressively thinner
    const thickness = (6 - stringIndex + 1) / 2;

    useEffect(
        () =>
            appStore.addListener((newState) => {
                const {
                    display,
                    fretboard,
                    progress,
                    progression,
                    status,
                    invert,
                    leftHand,
                } = getComputedAppState(newState);
                const { label } = progression;

                const isHighlighted = getIsHighlighted(
                    fretboard,
                    stringIndex,
                    fretIndex
                );
                const isSelected = getIsSelected(
                    fretboard,
                    stringIndex,
                    fretIndex
                );
                const isDisabled = display !== "normal";
                const fretName = getFretName(fretValue, label);
                const highEBottom = invert !== leftHand;

                // set refs based on changes
                if (
                    progressRef.current !== progress ||
                    isHighlightedRef.current !== isHighlighted ||
                    isSelectedRef.current !== isSelected ||
                    statusRef.current !== status ||
                    isDisabledRef.current !== isDisabled
                ) {
                    isHighlightedRef.current = isHighlighted;
                    isSelectedRef.current = isSelected;
                    statusRef.current = status;
                    progressRef.current = progress;
                    isDisabledRef.current = isDisabled;
                    moveFret();
                }

                // set state based on changes
                if (
                    getState().fretName !== fretName ||
                    getState().highEBottom !== highEBottom
                )
                    setState({ fretName, highEBottom });
            }),
        []
    );

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
            } = styles;
            setFretStyles(
                left,
                fillPercentage,
                fillOpacityPercentage,
                backgroundColor,
                textColor
            );
        }
    }

    function calculateFretStyles() {
        if (!shadowRef.current || !circleRef.current) return;

        const progress = progressRef.current;
        const { progression, invert, currentFretboardIndex, status } =
            appStore.getComputedState();
        const { leftDiffs, rightDiffs, fretboards } = progression;
        const leftDiff = leftDiffs[currentFretboardIndex];
        const rightDiff = rightDiffs[currentFretboardIndex];
        const isSelected = isSelectedRef.current;
        const isHighlighted = isHighlightedRef.current;
        const leftIsSelected = fretboards[currentFretboardIndex - 1]
            ? !!fretboards[currentFretboardIndex - 1].strings[stringIndex][
                  fretIndex
              ]
            : false;
        const rightIsSelected = fretboards[currentFretboardIndex + 1]
            ? !!fretboards[currentFretboardIndex + 1].strings[stringIndex][
                  fretIndex
              ]
            : false;

        // consts
        const leftWindow = currentFretboardIndex + SLIDER_LEFT_WINDOW;
        const rightWindow = currentFretboardIndex + SLIDER_RIGHT_WINDOW;
        let direction = invert ? -1 : 1;

        // this fret is filled now,
        // and will be emptied in the fretboard to the left/right
        const leftEmpty =
            isSelected && leftDiff && leftDiff[fretValue] === -9999;
        const rightEmpty =
            isSelected && rightDiff && rightDiff[fretValue] === -9999;

        // this fret is empty now,
        // and will be filled in the fretboard to the left/right
        const leftFill =
            !isSelected && leftDiff && leftDiff[fretValue] === 9999;
        const rightFill =
            !isSelected && rightDiff && rightDiff[fretValue] === 9999;

        // slider range booleans
        const insideLeft = inRange(progress, currentFretboardIndex, leftWindow);
        const middle = inRange(progress, leftWindow, rightWindow);
        const insideRight = inRange(
            progress,
            rightWindow,
            currentFretboardIndex + 1
        );

        // background color for shadow div
        let backgroundColor = getBackgroundColor(
            isSelected,
            isHighlighted,
            fretIsPlayingProgressRef.current,
            status
        );
        // text color for circle div
        let textColor = !isSelected ? lightGrey : darkGrey;

        let x: number; // percentage of journey between slider windows, 0-1
        let xPercent: number; // percentage of journey between slider windows, 0-100
        let diffSteps: number; // how many frets to move
        let newLeft; // new left position for sliding shadowDiv
        let fillPercentage = 100; // new diameter for growing/shrinking shadowDiv
        let fillOpacityPercentage = 100; // new opacity for growing/shrinking shadowDiv

        if (insideLeft) {
            // The progress is between the left border and leftWindow

            // all altered notes should be x% to the left
            x = (leftWindow - progress) / SLIDER_WINDOW_LENGTH;
            xPercent = x * 100;

            if (leftEmpty) {
                fillPercentage = 100 - x * 50;
                fillOpacityPercentage = 100 - xPercent;
                textColor = colorFade(darkGrey, lightGrey, x) || textColor;
            } else if (leftFill) {
                fillPercentage = 50 + x * 50;
                fillOpacityPercentage = xPercent;
                backgroundColor = secondaryColor;
                textColor = colorFade(lightGrey, darkGrey, x) || textColor;
            } else if (leftDiff) {
                let fromColor = isSelected ? darkGrey : lightGrey;
                let toColor = leftIsSelected ? darkGrey : lightGrey;
                textColor = colorFade(fromColor, toColor, x) || textColor;
                diffSteps = leftDiff[fretValue];
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
        } else if (insideRight) {
            // The progress is between the rightWindow and right border

            // all altered notes should be x% to the left
            x = (progress - rightWindow) / SLIDER_WINDOW_LENGTH;
            xPercent = x * 100;

            if (rightEmpty) {
                fillPercentage = 100 - x * 50;
                fillOpacityPercentage = 100 - xPercent;
                textColor = colorFade(darkGrey, lightGrey, x) || textColor;
            } else if (rightFill) {
                fillPercentage = 50 + x * 50;
                fillOpacityPercentage = xPercent;
                backgroundColor = secondaryColor;
                textColor = colorFade(lightGrey, darkGrey, x) || textColor;
            } else if (rightDiff) {
                let fromColor = isSelected ? darkGrey : lightGrey;
                let toColor = rightIsSelected ? darkGrey : lightGrey;
                textColor = colorFade(fromColor, toColor, x) || textColor;
                diffSteps = rightDiff[fretValue];
                if (diffSteps !== undefined)
                    newLeft = direction * diffSteps * xPercent + 50;
            }
        }

        return {
            left: newLeft,
            fillPercentage,
            fillOpacityPercentage,
            backgroundColor,
            textColor,
        };
    }

    function setFretStyles(
        left: number | undefined,
        fillPercentage: number,
        fillOpacityPercentage: number,
        backgroundColor: string,
        textColor: string
    ) {
        if (!shadowRef.current || !circleRef.current) return;
        const status = statusRef.current;
        const isHighlighted = isHighlightedRef.current;

        // set position
        if (left !== undefined) shadowRef.current.style.left = `${left}%`;

        // set background color
        if (shadowRef.current.style.backgroundColor !== backgroundColor)
            shadowRef.current.style.backgroundColor = backgroundColor;

        // set shadow diameter/radius consts
        const d = (CIRCLE_SIZE * fillPercentage) / 100;
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
        const boxShadow =
            status === HIGHLIGHTED && isHighlighted
                ? `0 0 20px 1px ${playingColor}`
                : "none";
        if (shadowRef.current.style.boxShadow !== boxShadow)
            shadowRef.current.style.boxShadow = boxShadow;

        // set shadow z-index
        const zIndex = status === HIGHLIGHTED && isHighlighted ? "1" : "0";
        if (shadowRef.current.style.zIndex !== zIndex)
            shadowRef.current.style.zIndex = zIndex;

        // set circle color
        const color = status === HIGHLIGHTED ? textColor : darkGrey;
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

        if (delay) {
            isMouseOverTimeoutRef.current = setTimeout(() => {
                isMouseOverRef.current = false;
                isMouseOverTimeoutRef.current = undefined;
            }, delay);
        } else {
            isMouseOverRef.current = false;
        }
    }

    const touchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            // dont select/deselect notes when disabled
            if (isDisabledRef.current) return;

            // highlight note if brush mode is highlight
            const { status, fretboard, fretDragStatus } =
                appStore.getComputedState();

            // toggle selection of note
            const fromStatus = fretboard.strings[stringIndex][fretIndex];
            let toStatus = fromStatus;
            let toDragStatus = fretDragStatus;
            if (status === HIGHLIGHTED && fromStatus > NOT_SELECTED) {
                // only handle events on selected notes, the rest are disabled
                toStatus = fromStatus === HIGHLIGHTED ? SELECTED : HIGHLIGHTED;
                toDragStatus = fromStatus === HIGHLIGHTED ? "off" : "on";
            } else if (status === SELECTED) {
                // Demote the selection status, or select if not selected already
                toStatus =
                    fromStatus === HIGHLIGHTED
                        ? SELECTED
                        : fromStatus === SELECTED
                        ? NOT_SELECTED
                        : fromStatus === NOT_SELECTED
                        ? SELECTED
                        : NOT_SELECTED;
                toDragStatus = fromStatus === NOT_SELECTED ? "on" : "off";
            }

            if (toStatus !== fromStatus) {
                appStore.dispatch.setHighlightedNote(
                    stringIndex,
                    fretIndex,
                    toStatus
                );
                playNoteAudio();
            }
            if (toDragStatus !== fretDragStatus)
                appStore.dispatch.setFretDragStatus(toDragStatus);

            // this is needed to let onTouchMove know that this element started
            // the drag sequence, and therefore doesn't need to be processed
            startMouseOver();
        },
        onEnd: () => clearMouseOver(),
        onMove: (event: WindowMouseEvent) => {
            // dont select/deselect notes when disabled
            if (isDisabledRef.current) return;

            const { fretboard, status, fretDragStatus } =
                appStore.getComputedState();

            if (!fretDragStatus || !circleRef.current) return;

            let clientX: number;
            let clientY: number;
            if (event instanceof MouseEvent) {
                clientX = event.clientX;
                clientY = event.clientY;
            } else if (event instanceof TouchEvent) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                return;
            }

            // could speed up by cacheing this
            const circleBoundary = circleRef.current.getBoundingClientRect();
            if (isWithinBoundary(circleBoundary, clientX, clientY)) {
                if (!isMouseOverRef.current) {
                    const fromStatus =
                        fretboard.strings[stringIndex][fretIndex];
                    let toStatus = fromStatus;
                    let toDragStatus = fretDragStatus;

                    if (status === HIGHLIGHTED && fromStatus > NOT_SELECTED) {
                        // case when dragging over a selected/highlighted note in highlight mode
                        toStatus =
                            fretDragStatus === "off" ? SELECTED : HIGHLIGHTED;
                    } else if (status === SELECTED) {
                        // case when dragging over any note in standard mode
                        toStatus =
                            fretDragStatus === "on" ? SELECTED : NOT_SELECTED;
                    }

                    if (toStatus !== fromStatus) {
                        appStore.dispatch.setHighlightedNote(
                            stringIndex,
                            fretIndex,
                            toStatus
                        );
                        playNoteAudio();
                    }
                    if (toDragStatus !== fretDragStatus) {
                        appStore.dispatch.setFretDragStatus(fretDragStatus);
                        playNoteAudio();
                    }

                    startMouseOver();
                }
            } else {
                // remove isMouseOver when leaving the circle boundaries,
                // with small delay to prevent flickering
                clearMouseOver(50);
            }
        },
    });

    return (
        <FretDiv
            width={`${fretWidth}px`}
            onContextMenu={onContextMenu}
            isOpenString={isOpenString}
            isTop={highEBottom ? stringIndex === 0 : stringIndex === 5}
            isBottom={highEBottom ? stringIndex === 5 : stringIndex === 0}
        >
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? lightGrey : "transparent"}
            />
            <CircleDiv {...touchHandlers} ref={circleRef} color={textColor}>
                <ChordSymbol rootName={fretName} chordName="" fontSize={16} />
            </CircleDiv>
            <ShadowDiv
                ref={shadowRef}
                backgroundColor={backgroundColor}
                top={top}
            />
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? lightGrey : "transparent"}
            />
            <Legend stringIndex={stringIndex} fretIndex={fretIndex} />
        </FretDiv>
    );
};

// the Dots that appear on the fretboard
interface LegendProps {
    stringIndex: number;
    fretIndex: number;
}

const Legend: React.FC<LegendProps> = ({ stringIndex, fretIndex }) => (
    <>
        {" "}
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
    </>
);
