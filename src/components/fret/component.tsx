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
const playingColor = "#44FF00";

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
    // return isHighlighted
    //     ? primaryColor
    //     : isSelected
    //     ? secondaryColor
    //     : "transparent";
    const progress = Math.min(Math.max(0, playProgress), 1);
    return isHighlighted
        ? fade(playingColor, primaryColor, progress) || primaryColor
        : isSelected
        ? secondaryColor
        : "transparent";
};

const getCircleBorderColor = (status: StatusTypes, isSelected: boolean) => {
    return status === HIGHLIGHTED && !isSelected ? lightGrey : darkGrey;
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

    const { fretboard, progression } = appStore.getComputedState();
    const { label } = progression;

    const thickness = (6 - stringIndex + 1) / 2;
    const fretBorder = openString ? "none" : `1px solid ${lightGrey}`;
    const noteName =
        label === "sharp" ? SHARP_NAMES[fretValue] : FLAT_NAMES[fretValue];

    // init refs
    const progressRef = useRef(appStore.state.progress);
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

    const statusRef = useRef(appStore.state.status);
    const isHighlightedRef = useRef(getIsHighlighted(fretboard));
    const isSelectedRef = useRef(getIsSelected(fretboard));
    const isPlayingRef = useRef(audioStore.state.isPlaying.has(fretName));
    const isMouseOverRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fretIsPlayingAnimationRef =
        useRef<ReturnType<typeof requestAnimationFrame>>();
    const fretIsPlayingProgressRef = useRef(1);

    const backgroundColor = getBackgroundColor(
        isSelectedRef.current,
        isHighlightedRef.current,
        fretIsPlayingProgressRef.current
    );
    const circleBorderColor = getCircleBorderColor(
        statusRef.current,
        isSelectedRef.current
    );
    const top = getTopMargin(CIRCLE_SIZE);

    useEffect(() => {
        const destroyAppStoreListener = appStore.addListener((newState) => {
            const { status, fretboard, progress } =
                getComputedAppState(newState);

            const isHighlighted = getIsHighlighted(fretboard);
            const isSelected = getIsSelected(fretboard);
            if (
                progressRef.current !== progress ||
                isHighlightedRef.current !== isHighlighted ||
                isSelectedRef.current !== isSelected ||
                statusRef.current !== status
            ) {
                // check if switching from not highlighted to highlighted
                // const highlightEnabled =
                //     !isHighlightedRef.current && isHighlighted;
                isHighlightedRef.current = isHighlighted;
                isSelectedRef.current = isSelected;
                statusRef.current = status;
                progressRef.current = progress;
                setFretStyles();

                // if (highlightEnabled) playNoteAudio();
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
        return () => {
            destroyAppStoreListener();
            destroyAudioStoreListener();
            window.removeEventListener("mousemove", onTouchMove);
            window.removeEventListener("touchmove", onTouchMove);
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
        const { progression, invert, currentFretboardIndex } =
            appStore.getComputedState();
        const { leftDiffs, rightDiffs } = progression;
        const leftDiff = leftDiffs[currentFretboardIndex];
        const rightDiff = rightDiffs[currentFretboardIndex];
        const isSelected = isSelectedRef.current;

        // consts
        const leftWindow = currentFretboardIndex + SLIDER_LEFT_WINDOW;
        const rightWindow = currentFretboardIndex + SLIDER_RIGHT_WINDOW;
        let diameter = CIRCLE_SIZE;
        let direction = invert ? -1 : 1;

        let backgroundColor = getBackgroundColor(
            isSelected,
            isHighlightedRef.current,
            fretIsPlayingProgressRef.current
        );
        const circleBorderColor = getCircleBorderColor(
            statusRef.current,
            isSelected
        );

        // this fret is filled now,
        // and does not have a destination in the fretboard to the left/right
        const leftEmpty =
            isSelected && leftDiff && leftDiff[fretValue] === -9999;
        const rightEmpty =
            isSelected && rightDiff && rightDiff[fretValue] === -9999;

        // this fret is empty now,
        // and has a destination in the fretboard to the left/right
        const leftFill =
            !isSelected && leftDiff && leftDiff[fretValue] === 9999;
        const rightFill =
            !isSelected && rightDiff && rightDiff[fretValue] === 9999;

        // slider range booleans
        const insideLeft =
            leftDiff &&
            leftDiff[fretValue] !== undefined &&
            inRange(progress, currentFretboardIndex, leftWindow);
        const middle = inRange(progress, leftWindow, rightWindow);
        const insideRight =
            rightDiff &&
            rightDiff[fretValue] !== undefined &&
            inRange(progress, rightWindow, currentFretboardIndex + 1);

        let x: number; // percentage of journey between slider windows
        let diffSteps: number; // how many frets to move
        let newLeft; // new left position for sliding shadowDiv
        let fillPercentage; // new diameter for growing/shrinking shadowDiv
        let fillOpacityPercentage = 100; // new opacity for growing/shrinking shadowDiv
        if (insideLeft) {
            // all altered notes should be x% to the left
            x = ((leftWindow - progress) * 100) / SLIDER_WINDOW_LENGTH;
            if (leftEmpty) {
                fillPercentage = 100 - (x / 100) * 50;
            } else if (leftFill) {
                fillPercentage = 50 + (x / 100) * 50;
                fillOpacityPercentage = x;
                backgroundColor =
                    leftDiff[fretValue] === 10000
                        ? primaryColor
                        : secondaryColor;
            } else {
                diffSteps = leftDiff[fretValue];
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
            } else if (rightFill) {
                fillPercentage = 50 + (x / 100) * 50;
                fillOpacityPercentage = x;
                backgroundColor =
                    rightDiff[fretValue] === 10000
                        ? primaryColor
                        : secondaryColor;
            } else {
                diffSteps = rightDiff[fretValue];
                newLeft = direction * diffSteps * x + 50;
            }
        }

        // set position
        if (newLeft !== undefined) {
            shadowRef.current.style.left = `${newLeft}%`;
        }

        if (fillPercentage !== undefined) {
            diameter = (diameter * fillPercentage) / 100;
        }

        // set shadow diameter
        const radius = diameter / 2;
        shadowRef.current.style.opacity = `${fillOpacityPercentage / 100}`;
        shadowRef.current.style.width = `${diameter}px`;
        shadowRef.current.style.height = `${diameter}px`;
        shadowRef.current.style.marginLeft = `-${radius}px`;
        shadowRef.current.style.marginRight = `-${radius}px`;
        shadowRef.current.style.top = getTopMargin(diameter);

        // set circle colors
        circleRef.current.style.color = circleBorderColor;
        // circleRef.current.style.border = `1px solid ${circleBorderColor}`;

        // set background color
        shadowRef.current.style.backgroundColor = backgroundColor;
    }

    function playNoteAudio() {
        audioStore.playNote(stringIndex, fretIndex);
    }

    // function onContextMenu(
    //     event: React.MouseEvent<HTMLDivElement, MouseEvent>
    // ) {
    //     event.preventDefault();
    //     event.stopPropagation();
    // highlight note on right click
    // const { fretboard } = appStore.getComputedState();
    // const status =
    //     fretboard[stringIndex][fretIndex] === HIGHLIGHTED
    //         ? SELECTED
    //         : HIGHLIGHTED;
    // appStore.dispatch.setHighlightedNote(stringIndex, fretIndex, status);
    // }

    function onTouchStart(
        event:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        // highlight note if brush mode is highlight
        const { status, fretboard } = appStore.getComputedState();
        const { fretDragStatus } = touchStore.state;
        // const highlightConditions = [status === HIGHLIGHTED];

        // if (event.nativeEvent instanceof MouseEvent) {
        //     // highlight note if user is pressing shift + click or command + click
        //     highlightConditions.push(
        //         event.nativeEvent.metaKey,
        //         event.nativeEvent.shiftKey
        //     );
        // } else if (event.nativeEvent instanceof TouchEvent) {
        //     // highlight note if using touch device and press with two fingers
        //     highlightConditions.push(event.nativeEvent.touches.length > 1);
        // } else {
        //     return;
        // }

        // toggle selection of note
        const fromStatus = fretboard[stringIndex][fretIndex];
        let toStatus = fromStatus;
        let toDragStatus = fretDragStatus;
        if (status === HIGHLIGHTED && fromStatus > NOT_SELECTED) {
            toStatus = fromStatus === HIGHLIGHTED ? SELECTED : HIGHLIGHTED;
            toDragStatus = fromStatus === HIGHLIGHTED ? "off" : "on";
        } else if (status === SELECTED) {
            toStatus = fromStatus === NOT_SELECTED ? SELECTED : NOT_SELECTED;
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
            touchStore.dispatch.setFretDragStatus(toDragStatus);

        isMouseOverRef.current = true;
    }

    const onTouchMove = useCallback((event: MouseEvent | TouchEvent) => {
        // event.preventDefault();
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
            if (!timeoutRef.current && isMouseOverRef.current) {
                timeoutRef.current = setTimeout(() => {
                    isMouseOverRef.current = false;
                    timeoutRef.current = null;
                }, 50);
            }
        }
    }, []);

    return (
        <FretDiv
            borderLeft={fretBorder}
            borderRight={fretBorder}
            width={`${fretWidth}px`}
            // animationBackground={playingColor}
            // onContextMenu={onContextMenu}
        >
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? lightGrey : "transparent"}
            />
            <CircleDiv
                // onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                ref={circleRef}
                color={circleBorderColor}
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
