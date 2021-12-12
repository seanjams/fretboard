import React, { useEffect, useRef } from "react";
import {
    Store,
    StateType,
    SliderStateType,
    AnyReducersType,
    current,
} from "../../store";
import { DiffType, StatusTypes } from "../../types";
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
} from "../../utils";
import { ChordSymbol } from "../symbol";
import {
    CircleDiv,
    FretDiv,
    LegendDot,
    OctaveDot,
    ShadowDiv,
    StringSegmentDiv,
} from "./style";

const [secondaryColor, primaryColor] = COLORS[0];

const getTopMargin = (fretHeight: number, diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return (fretHeight - diameter) / 2;
};

const getBackgroundColor = (isSelected: boolean, isHighlighted: boolean) => {
    return isHighlighted
        ? primaryColor
        : isSelected
        ? secondaryColor
        : "transparent";
};

const is = (diff: DiffType, key: number, val: any, negate: boolean = false) =>
    diff && (negate ? diff[key] !== val : diff[key] === val);

const isNot = (diff: DiffType, key: number, val: any) =>
    is(diff, key, val, true);

interface LegendProps {
    stringIndex: number;
    fretIndex: number;
    fretHeight: number;
}

const Legend: React.FC<LegendProps> = ({
    stringIndex,
    fretIndex,
    fretHeight,
}) => (
    <>
        {" "}
        {fretIndex !== 0 &&
            (stringIndex === 0 || stringIndex === 5) &&
            [0, 3, 5, 7, 9].includes(mod(fretIndex, 12)) && (
                <LegendDot
                    legendTop={stringIndex !== 0}
                    legendHeight={fretHeight}
                />
            )}
        {fretIndex !== 0 &&
            (stringIndex === 0 || stringIndex === 5) &&
            mod(fretIndex, 12) === 0 && (
                <OctaveDot
                    legendTop={stringIndex !== 0}
                    legendHeight={fretHeight}
                />
            )}
    </>
);

interface Props {
    value: number;
    stringIndex: number;
    openString?: boolean;
    fretboardHeight: number;
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
}

export const Fret: React.FC<Props> = ({
    value,
    openString,
    stringIndex,
    fretboardHeight,
    store,
    sliderStore,
}) => {
    const fretIndex = value - STANDARD_TUNING[stringIndex];

    // makes frets progressively smaller
    const fretWidth = getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, fretIndex);

    // should i shrink this if input is open?
    const fretHeight = fretboardHeight / 6;

    const thickness = (6 - stringIndex + 1) / 2;
    const border = openString ? "none" : "1px solid #333";
    const { fretboard, progression } = current(store.state);
    const { label } = progression;
    const noteValue = mod(value, 12);
    const noteName =
        label === "sharp" ? SHARP_NAMES[noteValue] : FLAT_NAMES[noteValue];

    // init refs
    const progressRef = useRef(sliderStore.state.progress);
    const shadowRef = useRef<HTMLDivElement>(null);

    const isHighlighted = fretboard[stringIndex][value] === HIGHLIGHTED;
    const isSelected =
        isHighlighted || fretboard[stringIndex][value] === SELECTED;
    const backgroundColor = getBackgroundColor(isSelected, isHighlighted);
    const top = getTopMargin(fretboardHeight / 6, CIRCLE_SIZE);
    const color = "#333";
    // const color = isHighlighted ? "white" : "#333";

    useEffect(() => {
        const destroyListener = store.addListener(move);
        const destroySliderListener = sliderStore.addListener(
            ({ progress }) => {
                progressRef.current = progress;
                move();
            }
        );

        return () => {
            destroyListener();
            destroySliderListener();
        };
    }, []);

    function move() {
        if (!shadowRef.current) return;

        const progress = progressRef.current;
        const { invert } = store.state;
        const { fretboard, progression } = current(store.state);
        const { focusedIndex, leftDiffs, rightDiffs } = progression;
        const i = focusedIndex; // to battle verbosity
        const leftDiff = leftDiffs[i];
        const rightDiff = rightDiffs[i];
        const isHighlighted = fretboard[stringIndex][value] === HIGHLIGHTED;
        const isSelected =
            isHighlighted || fretboard[stringIndex][value] === SELECTED;
        let direction = invert ? -1 : 1;

        let newLeft;
        let fillPercentage;
        let diameter = CIRCLE_SIZE;
        let backgroundColor = getBackgroundColor(isSelected, isHighlighted);

        // this fret has a destination in the fretboard to the left/right
        const leftExists = isNot(leftDiff, noteValue, undefined);
        const rightExists = isNot(rightDiff, noteValue, undefined);

        // this fret is filled now,
        // and does not have a destination in the fretboard to the left/right
        const leftEmpty = isSelected && is(leftDiff, noteValue, -9999);
        const rightEmpty = isSelected && is(rightDiff, noteValue, -9999);

        // this fret is empty now,
        // and has a destination in the fretboard to the left/right
        const leftFill = !isSelected && is(leftDiff, noteValue, 9999);
        const rightFill = !isSelected && is(rightDiff, noteValue, 9999);

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
                newLeft = direction * leftDiff[noteValue] * 50 + origin;
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
                diffSteps = leftDiff[noteValue];
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
                diffSteps = rightDiff[noteValue];
                newLeft = direction * diffSteps * x + origin;
            }
        } else if (outsideRight) {
            // all altered notes should be 50% to the right
            if (rightEmpty) {
                fillPercentage = 100;
            } else if (rightFill) {
                fillPercentage = 0;
            } else {
                diffSteps = rightDiff[noteValue];
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

        // set circle diameter
        const radius = diameter / 2;
        shadowRef.current.style.width = `${diameter}px`;
        shadowRef.current.style.height = `${diameter}px`;
        shadowRef.current.style.marginLeft = `-${radius}px`;
        shadowRef.current.style.marginRight = `-${radius}px`;
        shadowRef.current.style.top = `${getTopMargin(fretHeight, diameter)}px`;

        // set background color
        shadowRef.current.style.backgroundColor = backgroundColor;
    }

    function onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        // highlight note on right click
        const { fretboard } = current(store.state);
        const status =
            fretboard[stringIndex][value] === HIGHLIGHTED
                ? SELECTED
                : HIGHLIGHTED;
        store.dispatch.setHighlightedNote(stringIndex, value, status);
    }

    function onClick(
        e:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        // highlight note if brush mode is highlight
        const { status, fretboard } = current(store.state);
        const highlightConditions = [status === HIGHLIGHTED];

        if (e.nativeEvent instanceof MouseEvent) {
            // highlight note if user is pressing shift + click or command + click
            highlightConditions.push(
                e.nativeEvent.metaKey,
                e.nativeEvent.shiftKey
            );
        } else if (e.nativeEvent instanceof TouchEvent) {
            // highlight note if using touch device and press with two fingers
            highlightConditions.push(e.nativeEvent.touches.length > 1);
        } else {
            return;
        }

        // toggle selection of note
        const fromStatus = fretboard[stringIndex][value];
        let toStatus: StatusTypes;
        if (highlightConditions.some((condition) => condition)) {
            toStatus = fromStatus === HIGHLIGHTED ? SELECTED : HIGHLIGHTED;
        } else {
            toStatus = fromStatus === NOT_SELECTED ? SELECTED : NOT_SELECTED;
        }
        store.dispatch.setHighlightedNote(stringIndex, value, toStatus);
    }

    return (
        <FretDiv
            border={border}
            width={`${fretWidth}px`}
            height={`${fretHeight}px`}
            onContextMenu={onContextMenu}
        >
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? "#333" : "transparent"}
            />
            <CircleDiv onClick={onClick} onTouchStart={onClick} color={color}>
                {label === "value" ? (
                    noteValue
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
                left="50}%"
                top={`${top}px`}
            />
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? "#333" : "transparent"}
            />
            <Legend
                stringIndex={stringIndex}
                fretIndex={fretIndex}
                fretHeight={fretHeight}
            />
        </FretDiv>
    );
};
