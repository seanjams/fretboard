import React, { useEffect, useRef } from "react";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
    useTouchHandlers,
} from "../../store";
import {
    SLIDER_RIGHT_WINDOW,
    SLIDER_LEFT_WINDOW,
    getFretboardNotes,
    SELECTED,
} from "../../utils";
import { FlexRow } from "../Common";
import { Title } from "../Title";
import { ProgressBar, SliderBar } from "./style";
import { isEqual } from "lodash";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";

interface SliderProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Slider: React.FC<SliderProps> = ({ appStore, audioStore }) => {
    // state
    const computedState = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        visibleFretboards: computedState.visibleFretboards,
        left: -1000000,
        dragging: false,
    }));
    const { left, visibleFretboards, dragging } = getState();

    // refs
    const deltaRef = useRef(0);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const sliderBarRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();
    const isAnimatingRef = useRef(computedState.isAnimating);
    const isPressedRef = useRef(false);

    useEffect(() => {
        // set initial slider position
        setLeftFromProgress();

        return appStore.addListener((newState) => {
            const { visibleFretboards, isAnimating } =
                getComputedAppState(newState);
            const visibleFretboardsChanged = !isEqual(
                getState().visibleFretboards,
                visibleFretboards
            );

            if (visibleFretboardsChanged) {
                setState({
                    visibleFretboards: JSON.parse(
                        JSON.stringify(visibleFretboards)
                    ),
                });
            }

            if (isAnimatingRef.current !== isAnimating) {
                isAnimatingRef.current = isAnimating;
                if (isAnimating) setLeftFromProgress();
            }
        });
    }, []);

    const setLeftFromProgress = () => {
        if (!progressBarRef.current || !sliderBarRef.current) return;
        const { visibleFretboards, currentFretboardIndex } =
            appStore.getComputedState();
        const progressBarFragmentWidth =
            getProgressBarFragmentWidth(visibleFretboards);
        const origin = progressBarRef.current.offsetLeft;
        const left =
            progressBarFragmentWidth * (currentFretboardIndex + 0.5) -
            sliderBarRef.current.offsetWidth / 2 +
            origin;

        setState({ left });
    };

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

        // progress is decimal value of currentFretboardIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.
        appStore.dispatch.setProgress(
            sliderProgressFragment / progressBarFragmentWidth
        );

        // update slider position
        setState({
            left: newLeft,
        });
    };

    const snapToGridAnimation = () => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // cancel past animation if pressed quickly
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const { visibleFretboards, currentFretboardIndex } =
            appStore.getComputedState();
        const origin = progressBarRef.current.offsetLeft;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;

        // aliases for
        const leftSlideWindow = currentFretboardIndex + SLIDER_LEFT_WINDOW;
        const rightSlideWindow = currentFretboardIndex + SLIDER_RIGHT_WINDOW;
        const halfSlideWindow = currentFretboardIndex + 0.5;

        // only go to edge of slider window to make animation smoother
        let nextProgress = appStore.state.progress;
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
            appStore.dispatch.setProgress(nextProgress);
            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);
                setState({ left: lastLeft });
                appStore.dispatch.setProgress(halfSlideWindow);
            }
        };
        requestAnimationFrame(performAnimation);
    };

    // progress bar click
    const conatinerTouchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            let clientX;
            if (event.nativeEvent instanceof MouseEvent) {
                clientX = event.nativeEvent.clientX;
            } else if (event.nativeEvent instanceof TouchEvent) {
                clientX = event.nativeEvent.touches[0].clientX;
            } else {
                return;
            }

            if (progressBarRef.current && sliderBarRef.current) {
                const { currentFretboardIndex, progression, showTopDrawer } =
                    appStore.getComputedState();
                const origin = progressBarRef.current.offsetLeft;
                const progressBarWidth = progressBarRef.current.offsetWidth;
                const toIndex = Math.floor(
                    ((clientX - origin) * progression.fretboards.length) /
                        progressBarWidth
                );

                // set delay for closing drawer
                let delay = 0;
                if (currentFretboardIndex !== toIndex && showTopDrawer) {
                    appStore.dispatch.setDisplay("normal");
                    delay = 400;
                }

                setTimeout(() => {
                    appStore.switchFretboardAnimation(
                        currentFretboardIndex,
                        toIndex,
                        () => {
                            // set delay for strumming chord (helps render)
                            setTimeout(() => {
                                const { fretboard } =
                                    appStore.getComputedState();
                                audioStore.strumChord(fretboard);
                            }, 100);
                        }
                    );
                }, delay);
            }
        },
    });

    // slider down/up/move
    const sliderTouchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            // slider grab
            // clicking on the slider is different than clicking somewhere on the line,
            // so stopPropagation here
            event.stopPropagation();
            isPressedRef.current = true;

            let clientX: number;
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
        },
        onClick: () => {
            const { display, fretboard } = appStore.getComputedState();
            if (display === "change-inversion") {
                // set display to normal when inversion menu open
                appStore.dispatch.setDisplay("normal");
            } else if (["normal", "change-chord"].includes(display)) {
                // set chord input when clicking on empty chord
                const notes = getFretboardNotes(fretboard);
                let isEmpty = !notes.some((note) => note === SELECTED);
                if (isEmpty) {
                    appStore.dispatch.setDisplay(
                        display === "normal" ? "change-chord" : "normal"
                    );
                }
            }
        },
        onEnd: (event: WindowMouseEvent) => {
            // slider drag release
            if (!isPressedRef.current) return;
            isPressedRef.current = false;

            if (getState().dragging) {
                setState({ dragging: false });
                // stopClick();
                // snap to grid if click or drag release
                snapToGridAnimation();
            }
        },
        onMove: (event: WindowMouseEvent) => {
            // slider drag
            if (
                !progressBarRef.current ||
                !sliderBarRef.current ||
                !isPressedRef.current
            )
                return;

            let clientX: number;
            if (event instanceof MouseEvent) {
                clientX = event.clientX;
            } else if (event instanceof TouchEvent) {
                clientX = event.touches[0].clientX;
            } else {
                return;
            }

            // drag slider
            if (!getState().dragging) {
                setState({ dragging: true });
            } else {
                repositionSlider(clientX);
            }
        },
        onDoubleClick: (event: ReactMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { display, fretboard } = appStore.getComputedState();
            const notes = getFretboardNotes(fretboard);
            let isEmpty = !notes.some((note) => note === SELECTED);
            // set display to inversion menu when double clicking
            if (!isEmpty && display !== "change-inversion")
                appStore.dispatch.setDisplay("change-inversion");
        },
    });

    return (
        <FlexRow width="100%" height="100%">
            <ProgressBar
                id="progress-bar"
                ref={progressBarRef}
                {...conatinerTouchHandlers}
            >
                <SliderBar
                    className="slider-bar"
                    ref={sliderBarRef}
                    left={`${left}px`}
                    height="44px"
                    width="44px"
                    {...sliderTouchHandlers}
                />
                {visibleFretboards.map((_, i) => {
                    return (
                        <Title
                            key={`fretboard-${i}`}
                            appStore={appStore}
                            audioStore={audioStore}
                            fretboardIndex={i}
                        />
                    );
                })}
            </ProgressBar>
        </FlexRow>
    );
};
