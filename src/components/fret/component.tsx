import React, { useCallback, useEffect, useRef } from "react";
import {
    AppStore,
    getComputedAppState,
    AudioStore,
    TouchStore,
} from "../../store";
import { StatusTypes, StringSwitchType } from "../../types";
import {
    getFretWidth,
    mod,
    COLORS,
    STANDARD_TUNING,
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
} from "../../utils";
import { fade } from "../../utils/colorFade";
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
const playingColor = "#FFD700";

const getTopMargin = (diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return `calc((100% - ${diameter}px) / 2)`;
};

const inRange = (value: number, leftBound: number, rightBound: number) => {
    return value >= leftBound && value <= rightBound;
};

const getBackgroundColor = (
    isSelected: boolean,
    isHighlighted: boolean,
    playProgress: number
) => {
    const progress = Math.min(Math.max(0, playProgress), 1);
    return isHighlighted
        ? fade(playingColor, primaryColor, progress) || primaryColor
        : isSelected
        ? secondaryColor
        : "transparent";
};

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

interface FretProps {
    fretIndex: number;
    stringIndex: number;
    openString?: boolean;
    appStore: AppStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const Fret: React.FC<FretProps> = ({
    fretIndex,
    openString,
    stringIndex,
    appStore,
    audioStore,
    touchStore,
}) => {
    const fretValue = getFretValue(stringIndex, fretIndex);
    const fretName = `${stringIndex}_${fretIndex}`;

    // makes frets progressively smaller
    const fretWidth = getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, fretIndex);

    const { display, fretboard, progression, progress, status } =
        appStore.getComputedState();
    const { label } = progression;

    const thickness = (6 - stringIndex + 1) / 2;
    const fretBorder = openString ? "none" : `1px solid ${lightGrey}`;
    const noteName =
        label === "sharp" ? SHARP_NAMES[fretValue] : FLAT_NAMES[fretValue];

    // init refs
    const progressRef = useRef(progress);
    const circleRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    const getIsSelected = (fretboard: StringSwitchType) => {
        return [SELECTED, HIGHLIGHTED].includes(
            fretboard[stringIndex][fretIndex]
        );
    };

    const getIsHighlighted = (fretboard: StringSwitchType) => {
        return fretboard[stringIndex][fretIndex] === HIGHLIGHTED;
    };

    // refs
    const statusRef = useRef(status);
    const isHighlightedRef = useRef(getIsHighlighted(fretboard));
    const isSelectedRef = useRef(getIsSelected(fretboard));
    const isPlayingRef = useRef(audioStore.state.isPlaying.has(fretName));
    // for isMouseOver drag logic
    const isMouseOverRef = useRef(false);
    const isMouseOverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    // for fretIsPlaying color fade animation
    const fretIsPlayingAnimationRef =
        useRef<ReturnType<typeof requestAnimationFrame>>();
    const fretIsPlayingProgressRef = useRef(1);
    // for long touch timoute
    const isLongTouchRef = useRef(false);
    const isLongTouchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    // for disabling note selection when fretboard is small
    const isDisabledRef = useRef(display !== "normal");

    const backgroundColor = getBackgroundColor(
        isSelectedRef.current,
        isHighlightedRef.current,
        fretIsPlayingProgressRef.current
    );
    const textColor =
        status === HIGHLIGHTED && !isSelectedRef.current ? lightGrey : darkGrey;
    const top = getTopMargin(CIRCLE_SIZE);

    useEffect(() => {
        const destroyAppStoreListener = appStore.addListener((newState) => {
            const { display, fretboard, progress, status } =
                getComputedAppState(newState);

            const isHighlighted = getIsHighlighted(fretboard);
            const isSelected = getIsSelected(fretboard);
            const isDisabled = display !== "normal";
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
                setFretStyles();
            }
        });
        const destroyAudioStoreListener = audioStore.addListener(
            ({ isPlaying }) => {
                const fretIsPlaying = isPlaying.has(fretName);
                if (isPlaying.has(fretName) !== isPlayingRef.current) {
                    isPlayingRef.current = fretIsPlaying;

                    if (fretIsPlaying && shadowRef.current) {
                        fretIsPlayingProgressRef.current = 0;
                        fretIsPlayingAnimation(setFretStyles);
                    } else {
                        setFretStyles();
                    }
                }
            }
        );

        window.addEventListener("mousemove", onTouchMove);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("mouseup", onTouchEnd);
        window.addEventListener("touchend", onTouchEnd);
        return () => {
            destroyAppStoreListener();
            destroyAudioStoreListener();
            window.removeEventListener("mousemove", onTouchMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("mouseup", onTouchEnd);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    function fretIsPlayingAnimation(callback: () => void) {
        const animationDuration = 1.2;
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

    function setFretStyles() {
        if (!shadowRef.current || !circleRef.current) return;

        const progress = progressRef.current;
        const { progression, invert, currentFretboardIndex, status } =
            appStore.getComputedState();
        const { leftDiffs, rightDiffs, fretboards } = progression;
        const leftDiff = leftDiffs[currentFretboardIndex];
        const rightDiff = rightDiffs[currentFretboardIndex];
        const isSelected = isSelectedRef.current;
        const leftIsSelected = fretboards[currentFretboardIndex - 1]
            ? !!fretboards[currentFretboardIndex - 1][stringIndex][fretIndex]
            : false;
        const rightIsSelected = fretboards[currentFretboardIndex + 1]
            ? !!fretboards[currentFretboardIndex + 1][stringIndex][fretIndex]
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

        let x: number; // percentage of journey between slider windows
        let diffSteps: number; // how many frets to move
        let newLeft; // new left position for sliding shadowDiv
        let fillPercentage = 100; // new diameter for growing/shrinking shadowDiv
        let fillOpacityPercentage = 100; // new opacity for growing/shrinking shadowDiv
        let backgroundColor = getBackgroundColor(
            isSelected,
            isHighlightedRef.current,
            fretIsPlayingProgressRef.current
        ); // background color for shadow div
        let textColor = !isSelected ? lightGrey : darkGrey; // text color for circle div
        if (insideLeft) {
            // all altered notes should be x% to the left
            x = ((leftWindow - progress) * 100) / SLIDER_WINDOW_LENGTH;
            if (leftEmpty) {
                fillPercentage = 100 - (x / 100) * 50;
                fillOpacityPercentage = 100 - x;
                textColor = fade(darkGrey, lightGrey, x / 100) || textColor;
            } else if (leftFill) {
                fillPercentage = 50 + (x / 100) * 50;
                fillOpacityPercentage = x;
                backgroundColor = secondaryColor;
                textColor = fade(lightGrey, darkGrey, x / 100) || textColor;
            } else {
                let fromColor = isSelected ? darkGrey : lightGrey;
                let toColor = leftIsSelected ? darkGrey : lightGrey;
                textColor = fade(fromColor, toColor, x / 100) || textColor;
                diffSteps = leftDiff[fretValue];
                if (diffSteps !== undefined)
                    newLeft = direction * diffSteps * x + 50;
            }
        } else if (middle) {
            // all altered notes should be in the middle
            if (leftEmpty || rightEmpty) {
                fillPercentage = 100;
            } else if (leftFill || rightFill) {
                fillPercentage = 0;
                fillOpacityPercentage = 0;
            }
            newLeft = 50;
        } else if (insideRight) {
            // all altered notes should be x% to the left
            x = ((progress - rightWindow) * 100) / SLIDER_WINDOW_LENGTH;
            if (rightEmpty) {
                fillPercentage = 100 - (x / 100) * 50;
                fillOpacityPercentage = 100 - x;
                textColor = fade(darkGrey, lightGrey, x / 100) || textColor;
            } else if (rightFill) {
                fillPercentage = 50 + (x / 100) * 50;
                fillOpacityPercentage = x;
                backgroundColor = secondaryColor;
                textColor = fade(lightGrey, darkGrey, x / 100) || textColor;
            } else {
                let fromColor = isSelected ? darkGrey : lightGrey;
                let toColor = rightIsSelected ? darkGrey : lightGrey;
                textColor = fade(fromColor, toColor, x / 100) || textColor;
                diffSteps = rightDiff[fretValue];
                if (diffSteps !== undefined)
                    newLeft = direction * diffSteps * x + 50;
            }
        }

        // set position
        if (newLeft !== undefined) {
            shadowRef.current.style.left = `${newLeft}%`;
        }

        // set background color
        shadowRef.current.style.backgroundColor = backgroundColor;

        // set shadow diameter
        const diameter = (CIRCLE_SIZE * fillPercentage) / 100;
        const radius = diameter / 2;
        shadowRef.current.style.opacity = `${fillOpacityPercentage / 100}`;
        shadowRef.current.style.width = `${diameter}px`;
        shadowRef.current.style.height = `${diameter}px`;
        shadowRef.current.style.marginLeft = `-${radius}px`;
        shadowRef.current.style.marginRight = `-${radius}px`;
        shadowRef.current.style.top = getTopMargin(diameter);

        // set circle colors
        circleRef.current.style.color =
            status === HIGHLIGHTED ? textColor : darkGrey;
    }

    function playNoteAudio() {
        // audioStore.timerWorker.postMessage("stop");
        audioStore.playNote(stringIndex, fretIndex);
    }

    function onContextMenu(
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) {
        event.preventDefault();
        event.stopPropagation();
    }

    const onTouchEnd = useCallback((event: MouseEvent | TouchEvent) => {
        // dont select/deselect notes when disabled
        if (isDisabledRef.current) return;

        isMouseOverRef.current = false;
        // isLongTouch should be turned off. It its on, it should trigger the
        if (isLongTouchRef.current) {
            isLongTouchRef.current = false;
            if (appStore.state.status === HIGHLIGHTED)
                appStore.dispatch.setStatus(SELECTED);
        }
        if (isMouseOverTimeoutRef.current) {
            clearTimeout(isMouseOverTimeoutRef.current);
            isMouseOverTimeoutRef.current = null;
        }
        if (isLongTouchTimeoutRef.current) {
            clearTimeout(isLongTouchTimeoutRef.current);
            isLongTouchTimeoutRef.current = null;
        }
    }, []);

    function onTouchStart(
        event:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        // dont select/deselect notes when disabled
        if (isDisabledRef.current) return;

        // highlight note if brush mode is highlight
        const { status, fretboard } = appStore.getComputedState();
        const { fretDragStatus } = touchStore.state;

        // toggle selection of note
        const fromStatus = fretboard[stringIndex][fretIndex];
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

        isLongTouchRef.current = false;
        if (toStatus !== HIGHLIGHTED) {
            isLongTouchTimeoutRef.current = setTimeout(() => {
                isLongTouchRef.current = true;
                appStore.dispatch.setStatus(HIGHLIGHTED);
                appStore.dispatch.setHighlightedNote(
                    stringIndex,
                    fretIndex,
                    HIGHLIGHTED
                );
                touchStore.dispatch.setFretDragStatus("on");
            }, 700);
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
            touchStore.dispatch.setFretDragStatus(toDragStatus);

        isMouseOverRef.current = true;
    }

    const onTouchMove = useCallback((event: MouseEvent | TouchEvent) => {
        // dont select/deselect notes when disabled
        if (isDisabledRef.current) return;

        const { fretboard, status } = appStore.getComputedState();
        const { fretDragStatus } = touchStore.state;

        if (!fretDragStatus || !circleRef.current) return;

        let clientX;
        let clientY;
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
        const { top, left, bottom, right } =
            circleRef.current.getBoundingClientRect();

        if (
            clientX <= right &&
            clientX >= left &&
            clientY <= bottom &&
            clientY >= top
        ) {
            if (!isMouseOverRef.current) {
                const fromStatus = fretboard[stringIndex][fretIndex];
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
                    touchStore.dispatch.setFretDragStatus(fretDragStatus);
                    playNoteAudio();
                }

                isMouseOverRef.current = true;
            }
        } else {
            // remove isMouseOver when leaving the circle boundaries,
            // with small delay to prevent flickering
            if (!isMouseOverTimeoutRef.current && isMouseOverRef.current) {
                isMouseOverTimeoutRef.current = setTimeout(() => {
                    isMouseOverRef.current = false;
                    isMouseOverTimeoutRef.current = null;
                }, 50);
            }

            // remove isLongTouchTimeout when leaving the circle boundaries + a threshold
            const longTouchDelta = 10;
            if (
                !(
                    clientX <= right + longTouchDelta &&
                    clientX >= left - longTouchDelta &&
                    clientY <= bottom + longTouchDelta &&
                    clientY >= top - longTouchDelta
                )
            ) {
                if (isLongTouchTimeoutRef.current)
                    clearTimeout(isLongTouchTimeoutRef.current);
            }
        }
    }, []);

    return (
        <FretDiv
            borderLeft={fretBorder}
            borderRight={fretBorder}
            width={`${fretWidth}px`}
            onContextMenu={onContextMenu}
            // animationBackground={playingColor}
        >
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? lightGrey : "transparent"}
            />
            <CircleDiv
                // onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                ref={circleRef}
                color={textColor}
            >
                {label === "value" ? (
                    fretValue
                ) : (
                    <ChordSymbol
                        rootName={noteName}
                        chordName=""
                        fontSize={16}
                    />
                )}
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
