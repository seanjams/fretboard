import React, { useRef, useEffect, useState, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";
import {
    useStateRef,
    AppStore,
    SliderStore,
    getComputedAppState,
    AudioStore,
} from "../../store";
import { ChordTypes, NoteTypes } from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    cascadeDiffs,
    SLIDER_RIGHT_WINDOW,
    SLIDER_WINDOW_LENGTH,
    DEFAULT_STRINGSWITCH,
    getName,
    getNotesByChordName,
    SELECTED,
    setFret,
    clearHighlight,
    STANDARD_TUNING,
    majorChord,
    SP,
    getScrollToFret,
    getFretboardDimensions,
} from "../../utils";
import {
    AnimationWrapper,
    ChordInputContainer,
    OverflowContainerDiv,
    Tag,
    Title,
} from "./style";

interface TagButtonProps {
    highlighted?: boolean;
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const TagButton: React.FC<TagButtonProps> = ({
    onClick,
    highlighted,
    children,
}) => {
    const [active, setActive] = useState(highlighted);
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useEffect(() => {
        if (!highlighted) setActive(false);
    }, [highlighted]);

    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.stopPropagation();

        if (!activeRef.current) setActive(true);
    };

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.stopPropagation();

        if (activeRef.current && onClick) onClick(event);
    }, []);

    return (
        <Tag
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}
            highlighted={highlighted || active}
        >
            {children}
        </Tag>
    );
};

interface Props {
    appStore: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const ChordInput: React.FC<Props> = ({
    appStore,
    sliderStore,
    audioStore,
}) => {
    // state
    const { fretboard, progression } = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        label: progression.label,
        name: getName(fretboard, progression.label)[0],
        showInput: appStore.state.showInput,
    }));
    const { label, name, showInput } = getState();
    const { rootIdx, chordName } = name;
    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

    // refs
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { fretboard, progression, showInput } =
                getComputedAppState(newState);
            const name = getName(fretboard, progression.label)[0];

            if (
                getState().name !== name ||
                getState().showInput !== showInput
            ) {
                setState({
                    name,
                    showInput,
                });
            }
        });
    }, []);

    // const preventDefault = (
    //     event:
    //         | React.MouseEvent<HTMLDivElement, MouseEvent>
    //         | React.TouchEvent<HTMLDivElement>
    // ) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    // };

    const fretboardAnimation = (notes: number[]) => {
        // cancel past animation if pressed quickly
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const { progression } = appStore.getComputedState();
        const { focusedIndex, fretboards } = progression;
        let nextProgress = focusedIndex + SLIDER_RIGHT_WINDOW;

        // create new fretboard from notes, set all on E string arbitrarily
        let newFretboard = DEFAULT_STRINGSWITCH();
        for (let i = 0; i < notes.length; i++) {
            let fretValue = notes[i];
            while (fretValue < STANDARD_TUNING[0]) fretValue += 12;
            setFret(newFretboard, 0, fretValue, SELECTED);
        }
        newFretboard = cascadeDiffs([fretboards[focusedIndex], newFretboard], 0)
            .fretboards[1];

        // add new fretboard to the right of current
        fretboards.splice(focusedIndex + 1, 0, newFretboard);

        // set current fretboard to hidden for slider
        const hiddenFretboardIndices = [focusedIndex];
        // clearHighlight(fretboards[focusedIndex]);

        // update diffs
        appStore.dispatch.setCurrentProgression({
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
            hiddenFretboardIndices,
        });
        sliderStore.dispatch.setProgress(nextProgress);

        let frameCount = 0;
        let animationDuration = 0.15; // 0.25 seconds roughly comes out to 15 frames
        let totalFrames = Math.ceil(animationDuration * 60);
        let animationSlideLength = SLIDER_WINDOW_LENGTH;
        let currentFocusedIndex = focusedIndex;
        let i = 0;

        const performAnimation = () => {
            animationRef.current = requestAnimationFrame(performAnimation);

            // increment progress and focused index on each frame
            frameCount++;

            // linear animation
            nextProgress += animationSlideLength / totalFrames;

            // sinusoidal animation
            // nextProgress +=
            //     2 *
            //     (SLIDER_WINDOW_LENGTH / totalFrames) *
            //     Math.sin((Math.PI * frameCount) / totalFrames) ** 2;

            // set progress, and check if we should update focusedIndex
            sliderStore.dispatch.setProgress(nextProgress);
            if (Math.floor(nextProgress) > currentFocusedIndex + i) {
                appStore.dispatch.setFocusedIndex(currentFocusedIndex + i + 1);
                i++;
            }
            // when done animating, remove extra fretboard and reset progress
            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);

                // remove old fretboard, update diffs, reset progress and focusedIndex
                fretboards.splice(currentFocusedIndex, 1);
                appStore.dispatch.setCurrentProgression({
                    ...progression,
                    ...cascadeDiffs(fretboards, currentFocusedIndex),
                    hiddenFretboardIndices: [],
                    focusedIndex: currentFocusedIndex,
                    // scrollToFret: getScrollToFret(
                    //     fretboards[currentFocusedIndex]
                    // ),
                });
                sliderStore.dispatch.setProgress(currentFocusedIndex + 0.5);
                const { fretboard } = appStore.getComputedState();
                audioStore.strumChord(fretboard);
            }
        };
        requestAnimationFrame(performAnimation);
    };

    const onRootChange =
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newRootIdx === rootIdx) return;
            // default chordName to "maj" if not set
            fretboardAnimation(
                getNotesByChordName(newRootIdx, foundChordName || majorChord)
            );
        };

    const onChordChange =
        (newChordName: ChordTypes) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newChordName === foundChordName) return;
            // default rootIdx to "C" if not set
            fretboardAnimation(
                getNotesByChordName(Math.max(rootIdx, 0), newChordName)
            );
        };

    const onClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        // event.preventDefault();
        // event.stopPropagation();
        // if (appStore.state.showInput) appStore.dispatch.setShowInput(false);
    };

    const { maxInputHeight, minInputHeight } = getFretboardDimensions();

    return (
        <AnimationWrapper
            minInputHeight={minInputHeight}
            maxInputHeight={maxInputHeight}
        >
            <CSSTransition
                in={showInput}
                timeout={{ enter: 300, exit: 150 }}
                classNames="input-grow"
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                <ChordInputContainer
                    onClick={onClick}
                    onTouchStart={onClick}
                    className="input-form"
                    height={`${maxInputHeight}px`}
                >
                    <FlexRow
                        // onClick={preventDefault}
                        // onTouchStart={preventDefault}
                        width="100%"
                    >
                        <Title
                            marginLeft={`${SP[2]}px`}
                            width={`calc(15% - ${SP[2]}px)`}
                            flexShrink={0}
                            textAlign="right"
                            fontWeight="bold"
                            // marginTop={`${SP[2]}px`}
                        >
                            Root:
                        </Title>
                        <FlexRow
                            marginLeft={`${SP[2]}px`}
                            marginRight={`${SP[2]}px`}
                            width={`calc(85% - ${2 * SP[2]}px)`}
                        >
                            {noteNames.map((name, j) => (
                                <TagButton
                                    key={`${name}-key`}
                                    onClick={onRootChange(j)}
                                    highlighted={rootIdx === j}
                                >
                                    <ChordSymbol
                                        rootName={name}
                                        chordName=""
                                        fontSize={12}
                                    />
                                </TagButton>
                            ))}
                        </FlexRow>
                    </FlexRow>
                    <FlexRow
                        // onClick={preventDefault}
                        // onTouchStart={preventDefault}
                        width="100%"
                    >
                        <Title
                            marginLeft={`${SP[2]}px`}
                            width={`calc(15% - ${SP[2]}px)`}
                            textAlign="right"
                            fontWeight="bold"
                            // marginTop={`${SP[2]}px`}
                        >
                            Chord/Scale:
                        </Title>
                        <OverflowContainerDiv
                            marginLeft={`${SP[2]}px`}
                            marginRight={`${SP[2]}px`}
                            width={`calc(85% - ${2 * SP[2]}px)`}
                        >
                            <Div>
                                <FlexRow
                                    paddingLeft={`calc(30% + ${SP[3]}px)`}
                                    paddingRight={`calc(30% + ${SP[3]}px)`}
                                >
                                    {CHORD_NAMES.map((name) => (
                                        <TagButton
                                            key={`${name}-key`}
                                            onClick={onChordChange(name)}
                                            highlighted={chordName === name}
                                        >
                                            <ChordSymbol
                                                rootName=""
                                                chordName={name}
                                                fontSize={12}
                                            />
                                        </TagButton>
                                    ))}
                                </FlexRow>
                            </Div>
                        </OverflowContainerDiv>
                    </FlexRow>
                </ChordInputContainer>
            </CSSTransition>
        </AnimationWrapper>
    );
};
