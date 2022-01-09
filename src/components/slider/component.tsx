import React, { useEffect, useMemo, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
    stopClick,
    getName,
    getNotes,
    getVisibleFretboards,
    SLIDER_WINDOW_LENGTH,
    SLIDER_RIGHT_WINDOW,
    SLIDER_LEFT_WINDOW,
    STRUM_LOW_TO_HIGH,
} from "../../utils";
import {
    useStateRef,
    AppStore,
    SliderStore,
    current,
    AudioStore,
} from "../../store";
import { ChordSymbol } from "../symbol";
import {
    AnimationWrapper,
    ContainerDiv,
    ProgressBar,
    ProgressBarFragment,
    ProgressBarName,
    SliderBar,
} from "./style";
import { isEqual } from "lodash";

interface SliderProps {
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const Slider: React.FC<SliderProps> = ({
    store,
    sliderStore,
    audioStore,
}) => {
    // state
    const { progression } = current(store.state);
    const [getState, setState] = useStateRef(() => ({
        label: progression.label,
        hiddenFretboardIndices: progression.hiddenFretboardIndices,
        rehydrateSuccess: sliderStore.state.rehydrateSuccess,
        currentProgressionIndex: store.state.currentProgressionIndex,
        visibleFretboards: getVisibleFretboards(
            progression.fretboards,
            progression.hiddenFretboardIndices
        ),
        left: -1000000,
        dragging: false,
    }));
    const {
        label,
        left,
        rehydrateSuccess,
        currentProgressionIndex,
        visibleFretboards,
        dragging,
    } = getState();

    // refs
    // const draggingRef = useRef(false);
    const deltaRef = useRef(0);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const sliderBarRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

    useEffect(() => {
        const destroySliderListener = sliderStore.addListener(
            (newSliderData) => {
                const { rehydrateSuccess } = newSliderData;
                if (getState().rehydrateSuccess !== rehydrateSuccess)
                    setState({ rehydrateSuccess });
            }
        );

        const destroyListener = store.addListener((newData) => {
            const { currentProgressionIndex, progression } = current(newData);
            const { label, fretboards, hiddenFretboardIndices } = progression;
            const visibleFretboards = getVisibleFretboards(
                fretboards,
                hiddenFretboardIndices
            );

            const visibleFretboardsChanged = !isEqual(
                getState().visibleFretboards,
                visibleFretboards
            );
            if (
                visibleFretboardsChanged ||
                getState().label !== label ||
                getState().hiddenFretboardIndices !== hiddenFretboardIndices ||
                getState().currentProgressionIndex !== currentProgressionIndex
            ) {
                setState({
                    visibleFretboards: JSON.parse(
                        JSON.stringify(visibleFretboards)
                    ),
                    label,
                    hiddenFretboardIndices,
                    currentProgressionIndex,
                });
                // if (visibleFretboardsChanged) snapToGridAnimation(true);
            }
        });

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);

        // set initial slider position in case rehydrateSuccess doesn't succeed
        if (progressBarRef.current && sliderBarRef.current) {
            const origin = progressBarRef.current.offsetLeft;
            const sliderBarWidth = sliderBarRef.current.offsetWidth;
            const fragmentWidth =
                getProgressBarFragmentWidth(visibleFretboards);
            setState({ left: origin + fragmentWidth / 2 - sliderBarWidth / 2 });
        }

        return () => {
            destroyListener();
            destroySliderListener();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    // useEffect(() => {
    //     // set default position to be halfway through the fragment of the current focusedIndex
    //     if (sliderBarRef.current && progressBarRef.current) {
    //         const { focusedIndex, fretboards } = current(
    //             store.state
    //         ).progression;

    //         // dont update if in middle of animation
    //         const { visibleFretboards, hiddenFretboardIndices } = getState();

    //         if (hiddenFretboardIndices && hiddenFretboardIndices.length) return;

    //         const newVisibleFretboards = getVisibleFretboards(
    //             fretboards,
    //             hiddenFretboardIndices
    //         );
    //         const visibleFretboardsChanged = !isEqual(
    //             visibleFretboards,
    //             newVisibleFretboards
    //         );

    //         const progressBarFragmentWidth =
    //             getProgressBarFragmentWidth(newVisibleFretboards);
    //         const origin = progressBarRef.current.offsetLeft;
    //         const newLeft =
    //             progressBarFragmentWidth * (focusedIndex + 0.5) -
    //             sliderBarRef.current.offsetWidth / 2 +
    //             origin;

    //         setState({
    //             left: newLeft,
    //             visibleFretboards: newVisibleFretboards,
    //         });
    //         if (visibleFretboardsChanged) {
    //             console.log("HERE");
    //             snapToGridAnimation();
    //         }
    //     }
    // }, [
    //     rehydrateSuccess, // when state successfully imported from localStorage, reset slider
    //     currentProgressionIndex, // when updating progression, reset slider
    // ]);

    const getProgressBarFragmentWidth = (visibleFretboards: any[]) => {
        const width = progressBarRef.current
            ? progressBarRef.current.offsetWidth
            : 0;
        return width / Math.max(visibleFretboards.length, 1);
    };

    const repositionSlider = (clientX: number) => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // get widths, maxwidth is how far the left of the slider can move
        // aka full bar - width of slider
        const { visibleFretboards, dragging } = getState();
        const { focusedIndex } = current(store.state).progression;
        const origin = progressBarRef.current.offsetLeft;
        const progressBarWidth = progressBarRef.current.offsetWidth;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;
        const maxLeft = progressBarWidth - sliderBarWidth + origin;

        // we want to center slider on new click location,
        // so we take the click location - half the slider width
        const d = dragging ? deltaRef.current : sliderBarWidth / 2;
        const newLeft = Math.min(Math.max(clientX - d, origin), maxLeft);

        // get the current focused fretboard index from progress of slider
        const progressBarFragmentWidth =
            getProgressBarFragmentWidth(visibleFretboards);
        const sliderProgressFragment = newLeft + sliderBarWidth / 2 - origin;

        const newFocusedIndex = Math.min(
            Math.max(
                Math.floor(sliderProgressFragment / progressBarFragmentWidth),
                0
            ),
            visibleFretboards.length - 1
        );

        // progress is decimal value of focusedIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.
        sliderStore.dispatch.setProgress(
            Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
        );

        if (newFocusedIndex !== focusedIndex) {
            store.dispatch.setFocusedIndex(newFocusedIndex || 0);
            const { fretboard, strumMode } = current(store.state);
            if (strumMode === STRUM_LOW_TO_HIGH)
                audioStore.strumChord(fretboard);
            else {
                audioStore.arpeggiateChord(fretboard);
            }
        }

        // update slider position
        setState({
            left: newLeft,
        });
    };

    const snapToGridAnimation = () => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // cancel past animation if pressed quickly
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const { progression } = current(store.state);
        const { focusedIndex, fretboards, hiddenFretboardIndices } =
            progression;
        const visibleFretboards = getVisibleFretboards(
            fretboards,
            hiddenFretboardIndices
        );
        const origin = progressBarRef.current.offsetLeft;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;

        // aliases for
        const leftSlideWindow = focusedIndex + SLIDER_LEFT_WINDOW;
        const rightSlideWindow = focusedIndex + SLIDER_RIGHT_WINDOW;
        const halfSlideWindow = focusedIndex + 0.5;

        // only go to edge of slider window to make animation smoother
        let nextProgress = sliderStore.state.progress;
        let lastProgress =
            nextProgress > rightSlideWindow
                ? rightSlideWindow
                : nextProgress < leftSlideWindow
                ? leftSlideWindow
                : halfSlideWindow;

        const { left } = getState();
        let nextLeft = left;
        let lastLeft =
            origin +
            getProgressBarFragmentWidth(visibleFretboards) * halfSlideWindow -
            sliderBarWidth / 2;

        let frameCount = 0;
        let animationDuration = 0.15; // 0.15 seconds roughly comes out to 9 frames
        let totalFrames = Math.ceil(animationDuration * 60);
        let animationLeftLength = lastLeft - nextLeft;
        let animationProgressLength = lastProgress - nextProgress;

        const performAnimation = () => {
            animationRef.current = requestAnimationFrame(performAnimation);

            frameCount++;

            // linear animation
            nextLeft += animationLeftLength / totalFrames;
            nextProgress += animationProgressLength / totalFrames;

            // sinusoidal animation
            // nextProgress +=
            //     2 *
            //     (SLIDER_WINDOW_LENGTH / totalFrames) *
            //     Math.sin((Math.PI * frameCount) / totalFrames) ** 2;

            // increment progress and left on each frame
            setState({ left: nextLeft });
            sliderStore.dispatch.setProgress(nextProgress);
            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);
                setState({ left: lastLeft });
                sliderStore.dispatch.setProgress(halfSlideWindow);
            }
        };
        requestAnimationFrame(performAnimation);
    };

    // slider drag release (set ratio for resize experiment)
    const onMouseUp = (event: MouseEvent | TouchEvent) => {
        event.stopPropagation();

        if (getState().dragging) {
            setState({ dragging: false });
            stopClick();
        }

        // snap to grid if click or drag release
        snapToGridAnimation();
    };

    // slider grab
    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        let clientX;
        if (event.nativeEvent instanceof MouseEvent) {
            clientX = event.nativeEvent.clientX;
        } else if (event.nativeEvent instanceof TouchEvent) {
            clientX = event.nativeEvent.touches[0].clientX;
        } else {
            return;
        }

        // grab slider
        if (progressBarRef.current && sliderBarRef.current)
            deltaRef.current = clientX - sliderBarRef.current.offsetLeft;
        if (!getState().dragging) setState({ dragging: true });
    };

    // slider drag
    const onMouseMove = (event: MouseEvent | TouchEvent) => {
        // event.preventDefault();
        let clientX;
        if (event instanceof MouseEvent) {
            clientX = event.clientX;
        } else if (event instanceof TouchEvent) {
            clientX = event.touches[0].clientX;
        } else {
            return;
        }

        // drag slider
        if (
            progressBarRef.current &&
            sliderBarRef.current &&
            getState().dragging
        ) {
            repositionSlider(clientX);
        }
    };

    // progress bar click
    const onSliderClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        let clientX;
        if (event.nativeEvent instanceof MouseEvent) {
            clientX = event.nativeEvent.clientX;
        } else if (event.nativeEvent instanceof TouchEvent) {
            clientX = event.nativeEvent.touches[0].clientX;
        } else {
            return;
        }
        if (progressBarRef.current && sliderBarRef.current) {
            repositionSlider(clientX);
        }
    };

    return (
        <ContainerDiv>
            {visibleFretboards.length > 1 && (
                <ProgressBar
                    id="progress-bar"
                    ref={progressBarRef}
                    width="100%"
                    onClick={onSliderClick}
                    onTouchStart={onSliderClick}
                >
                    <AnimationWrapper minSliderSize={44} maxSliderSize={50}>
                        <CSSTransition
                            in={dragging}
                            timeout={300}
                            classNames="slider-grow"
                            // onEnter={() => setShowButton(false)}
                            // onExited={() => setShowButton(true)}
                        >
                            <SliderBar
                                className="slider-bar"
                                ref={sliderBarRef}
                                left={`${left}px`}
                                onMouseDown={onMouseDown}
                                onTouchStart={onMouseDown}
                                show={true}
                            />
                        </CSSTransition>
                    </AnimationWrapper>
                    {visibleFretboards.map((fretboard, i) => {
                        const { rootName, chordName } = getName(
                            getNotes(fretboard),
                            label
                        )[0];
                        return (
                            <ProgressBarFragment
                                key={`button-pad-${i}`}
                                width={`${100 / visibleFretboards.length}%`}
                                isFirst={i === 0}
                                isLast={i === visibleFretboards.length - 1}
                            >
                                <ProgressBarName>
                                    <ChordSymbol
                                        rootName={rootName}
                                        chordName={chordName}
                                        fontSize={12}
                                    />
                                </ProgressBarName>
                            </ProgressBarFragment>
                        );
                    })}
                </ProgressBar>
            )}
        </ContainerDiv>
    );
};
