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
const playingColor = "#FF4000";

const getTopMargin = (diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return `calc((100% - ${diameter}px) / 2)`;
};

const getBackgroundColor = (
    isSelected: boolean,
    isHighlighted: boolean,
    isPlaying: boolean
) => {
    // return isHighlighted
    //     ? primaryColor
    //     : isSelected
    //     ? secondaryColor
    //     : "transparent";

    return isPlaying && isHighlighted
        ? playingColor
        : isHighlighted
        ? primaryColor
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

    const backgroundColor = getBackgroundColor(
        isSelectedRef.current,
        isHighlightedRef.current,
        isPlayingRef.current
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
                    setFretStyles();
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

    function setFretStyles() {
        if (!shadowRef.current || !circleRef.current) return;

        const progress = progressRef.current;
        const { progression, invert } = appStore.getComputedState();
        const { leftDiffs, rightDiffs } = progression;
        const i = Math.floor(progress); // to battle verbosity
        const leftDiff = leftDiffs[i];
        const rightDiff = rightDiffs[i];

        let direction = invert ? -1 : 1;
        let newLeft;
        let fillPercentage;
        let diameter = CIRCLE_SIZE;

        let backgroundColor = getBackgroundColor(
            isSelectedRef.current,
            isHighlightedRef.current,
            isPlayingRef.current
        );
        const circleBorderColor = getCircleBorderColor(
            statusRef.current,
            isSelectedRef.current
        );

        // this fret has a destination in the fretboard to the left/right
        // const leftExists = isNot(leftDiff, fretValue, undefined);
        // const rightExists = isNot(rightDiff, fretValue, undefined);
        const leftExists = leftDiff && leftDiff[fretValue] !== undefined;
        const rightExists = rightDiff && rightDiff[fretValue] !== undefined;

        // this fret is filled now,
        // and does not have a destination in the fretboard to the left/right
        const leftEmpty =
            isSelectedRef.current &&
            leftExists &&
            leftDiff[fretValue] === -9999;
        const rightEmpty =
            isSelectedRef.current &&
            rightExists &&
            rightDiff[fretValue] === -9999;

        // this fret is empty now,
        // and has a destination in the fretboard to the left/right
        const leftFill =
            !isSelectedRef.current &&
            leftExists &&
            leftDiff[fretValue] === 9999;
        const rightFill =
            !isSelectedRef.current &&
            rightExists &&
            rightDiff[fretValue] === 9999;

        // consts
        const origin = 50;
        const leftWindow = SLIDER_LEFT_WINDOW;
        const rightWindow = SLIDER_RIGHT_WINDOW;
        const windowLength = SLIDER_WINDOW_LENGTH;

        // slider range booleans
        const outsideLeft = leftExists && progress < i;
        const insideLeft =
            leftExists && i <= progress && progress <= i + leftWindow;
        const middle = i + leftWindow < progress && progress <= i + rightWindow;
        const insideRight =
            rightExists && i + rightWindow < progress && progress < i + 1;
        const outsideRight = rightExists && i + 1 <= progress;

        // percentage of journey between slider windows
        let x: number;
        // how many frets to move
        let diffSteps: number;

        if (outsideLeft) {
            // all altered notes should be 50% to the left
            if (leftEmpty) {
                fillPercentage = 100;
            } else if (leftFill) {
                fillPercentage = 0;
            } else {
                newLeft = direction * leftDiff[fretValue] * 50 + origin;
            }
        } else if (insideLeft) {
            // all altered notes should be x% to the left
            x = ((i + leftWindow - progress) * 100) / windowLength;
            if (leftEmpty) {
                fillPercentage = 100 - x;
            } else if (leftFill) {
                fillPercentage = x;
                backgroundColor = secondaryColor;
            } else {
                diffSteps = leftDiff[fretValue];
                newLeft = direction * diffSteps * x + origin;
            }
        } else if (middle) {
            // all altered notes should be in the middle
            if (leftEmpty || rightEmpty) {
                fillPercentage = 100;
            } else if (leftFill || rightFill) {
                fillPercentage = 0;
            }
            newLeft = origin;
        } else if (insideRight) {
            // all altered notes should be x% to the left
            x = ((progress - (i + rightWindow)) * 100) / windowLength;
            if (rightEmpty) {
                fillPercentage = 100 - x;
            } else if (rightFill) {
                fillPercentage = x;
                backgroundColor = secondaryColor;
            } else {
                diffSteps = rightDiff[fretValue];
                newLeft = direction * diffSteps * x + origin;
            }
        } else if (outsideRight) {
            // all altered notes should be 50% to the right
            if (rightEmpty) {
                fillPercentage = 100;
            } else if (rightFill) {
                fillPercentage = 0;
            } else {
                diffSteps = rightDiff[fretValue];
                newLeft = direction * diffSteps * 50 + origin;
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
        shadowRef.current.style.width = `${diameter}px`;
        shadowRef.current.style.height = `${diameter}px`;
        shadowRef.current.style.marginLeft = `-${radius}px`;
        shadowRef.current.style.marginRight = `-${radius}px`;
        shadowRef.current.style.top = getTopMargin(diameter);

        // set circle colors
        circleRef.current.style.color = circleBorderColor;
        circleRef.current.style.border = `1px solid ${circleBorderColor}`;

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
        const { dragStatus } = touchStore.state;
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
        let toDragStatus = dragStatus;
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
        if (toDragStatus !== dragStatus)
            touchStore.dispatch.setDragStatus(toDragStatus);

        isMouseOverRef.current = true;
    }

    // const onTouchMove = (
    //     event:
    //         | React.MouseEvent<HTMLDivElement, MouseEvent>
    //         | React.TouchEvent<HTMLDivElement>
    // ) => {
    const onTouchMove = useCallback((event: MouseEvent | TouchEvent) => {
        // event.preventDefault();
        const { fretboard, status } = appStore.getComputedState();
        const { isDragging, dragStatus } = touchStore.state;
        if (!isDragging || !circleRef.current) return;

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
                let toDragStatus = dragStatus;

                if (status === HIGHLIGHTED && fromStatus > NOT_SELECTED) {
                    // case when dragging over a selected/highlighted note in highlight mode
                    toStatus =
                        dragStatus === "off"
                            ? SELECTED
                            : dragStatus === "on"
                            ? HIGHLIGHTED
                            : fromStatus === HIGHLIGHTED
                            ? SELECTED
                            : HIGHLIGHTED;

                    // if this is the first note in the drag sequence, set dragStatus based off what we just did
                    if (dragStatus === null)
                        toDragStatus = toStatus === SELECTED ? "off" : "on";
                } else if (status === SELECTED) {
                    // case when dragging over any note in standard mode
                    toStatus =
                        dragStatus === "on"
                            ? SELECTED
                            : dragStatus === "off"
                            ? NOT_SELECTED
                            : fromStatus === NOT_SELECTED
                            ? SELECTED
                            : NOT_SELECTED;

                    // if this is the first note in the drag sequence, set dragStatus based off what we just did
                    if (dragStatus === null)
                        toDragStatus = toStatus === SELECTED ? "on" : "off";
                }

                if (toStatus !== fromStatus) {
                    appStore.dispatch.setHighlightedNote(
                        stringIndex,
                        fretIndex,
                        toStatus
                    );
                    playNoteAudio();
                }
                if (toDragStatus !== dragStatus) {
                    touchStore.dispatch.setDragStatus(dragStatus);
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
            height="100%"
            animationBackground={playingColor}
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
                border={`1px solid ${circleBorderColor}`}
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
                left="50%"
                top={`${top}`}
                // className="fret-animation"
            />
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? lightGrey : "transparent"}
            />
            <Legend stringIndex={stringIndex} fretIndex={fretIndex} />
        </FretDiv>
    );
};
