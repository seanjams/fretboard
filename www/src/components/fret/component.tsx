import React, { useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
    AppStore,
    SliderStore,
    current,
    useStateRef,
    AudioStore,
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
    getFretboardDimensions,
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

const getTopMargin = (diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return `calc((100% - ${diameter}px) / 2)`;
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

interface Props {
    value: number;
    stringIndex: number;
    openString?: boolean;
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const Fret: React.FC<Props> = ({
    value,
    openString,
    stringIndex,
    store,
    sliderStore,
    audioStore,
}) => {
    const noteValue = mod(value, 12);
    const fretIndex = value - STANDARD_TUNING[stringIndex];

    // makes frets progressively smaller
    const fretWidth = getFretWidth(FRETBOARD_WIDTH, STRING_SIZE, fretIndex);

    const { fretboard, progression } = current(store.state);
    const { label } = progression;

    const [getState, setState] = useStateRef(() => ({
        showInput: store.state.showInput,
    }));
    const { showInput } = getState();

    const { minFretboardHeight, maxFretboardHeight } = getFretboardDimensions();
    const maxFretHeight = maxFretboardHeight / 6;
    const minFretHeight = minFretboardHeight / 6;

    const thickness = (6 - stringIndex + 1) / 2;
    const border = openString ? "none" : "1px solid #333";
    const noteName =
        label === "sharp" ? SHARP_NAMES[noteValue] : FLAT_NAMES[noteValue];

    // init refs
    const progressRef = useRef(sliderStore.state.progress);
    const shadowRef = useRef<HTMLDivElement>(null);
    const isHighlightedRef = useRef(
        fretboard[stringIndex][value] === HIGHLIGHTED
    );
    const isSelectedRef = useRef(
        [SELECTED, HIGHLIGHTED].includes(fretboard[stringIndex][value])
    );

    const backgroundColor = getBackgroundColor(
        isSelectedRef.current,
        isHighlightedRef.current
    );
    const top = getTopMargin(CIRCLE_SIZE);
    const color = "#333";
    // const color = isHighlighted ? "white" : "#333";

    useEffect(() => {
        const destroyListener = store.addListener((newState) => {
            const { showInput, fretboard } = current(newState);
            if (getState().showInput !== showInput) setState({ showInput });

            const isHighlighted = fretboard[stringIndex][value] === HIGHLIGHTED;
            const isSelected = [SELECTED, HIGHLIGHTED].includes(
                fretboard[stringIndex][value]
            );
            if (
                isHighlightedRef.current !== isHighlighted ||
                isSelectedRef.current !== isSelected
            ) {
                // check if switching from not highlighted to highlighted
                const highlightEnabled =
                    !isHighlightedRef.current && isHighlighted;
                isHighlightedRef.current = isHighlighted;
                isSelectedRef.current = isSelected;
                // if (highlightEnabled) playNoteAudio();
            }
            move();
        });
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
        const isSelected = [HIGHLIGHTED, SELECTED].includes(
            fretboard[stringIndex][value]
        );
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
        shadowRef.current.style.top = getTopMargin(diameter);

        // set background color
        shadowRef.current.style.backgroundColor = backgroundColor;
    }

    function playNoteAudio() {
        audioStore.dispatch.playNote(stringIndex, fretIndex);
    }

    function onContextMenu(
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        event.preventDefault();
        // highlight note on right click
        const { fretboard } = current(store.state);
        const status =
            fretboard[stringIndex][value] === HIGHLIGHTED
                ? SELECTED
                : HIGHLIGHTED;
        store.dispatch.setHighlightedNote(stringIndex, value, status);
    }

    function onClick(
        event:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        // highlight note if brush mode is highlight
        const { status, fretboard } = current(store.state);
        const highlightConditions = [status === HIGHLIGHTED];

        if (event.nativeEvent instanceof MouseEvent) {
            // highlight note if user is pressing shift + click or command + click
            highlightConditions.push(
                event.nativeEvent.metaKey,
                event.nativeEvent.shiftKey
            );
        } else if (event.nativeEvent instanceof TouchEvent) {
            // highlight note if using touch device and press with two fingers
            highlightConditions.push(event.nativeEvent.touches.length > 1);
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
        // if (toStatus !== NOT_SELECTED) playNoteAudio();
        playNoteAudio();
    }

    return (
        <FretDiv
            fretBorder={border}
            width={`${fretWidth}px`}
            height="100%"
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
                top={`${top}`}
            />
            <StringSegmentDiv
                height={`${thickness}px`}
                backgroundColor={!!fretIndex ? "#333" : "transparent"}
            />
            <Legend stringIndex={stringIndex} fretIndex={fretIndex} />
        </FretDiv>
    );
};
