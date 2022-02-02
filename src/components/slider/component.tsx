import React, { useEffect, useRef } from "react";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
    useTouchHandlers,
} from "../../store";
import {
    stopClick,
    SLIDER_RIGHT_WINDOW,
    SLIDER_LEFT_WINDOW,
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
    const isPressedCoordinatesRef = useRef([0, 0]);
    const isLongPressedRef = useRef(false);
    const isLongPressedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

    const hasMovedPastThreshold = (
        clientX: number,
        clientY: number,
        threshold: number = 0
    ) => {
        const [startingPosX, startingPosY] = isPressedCoordinatesRef.current;
        const [endingPosX, endingPosY] = [clientX, clientY];
        return (
            isPressedRef.current &&
            (endingPosX - startingPosX) ** 2 +
                (endingPosY - startingPosY) ** 2 >
                threshold ** 2
        );
    };

    const startLongPress = (
        longPressCB: () => void = () => {},
        delay = 700
    ) => {
        if (isLongPressedTimeoutRef.current)
            clearTimeout(isLongPressedTimeoutRef.current);
        isLongPressedTimeoutRef.current = setTimeout(() => {
            isLongPressedRef.current = true;
            longPressCB();
        }, delay);
        isPressedRef.current = true;
    };

    const clearLongPress = () => {
        if (isLongPressedTimeoutRef.current)
            clearTimeout(isLongPressedTimeoutRef.current);
        isLongPressedRef.current = false;
        isPressedRef.current = false;
    };

    // progress bar click
    const conatinerTouchHandlers = useTouchHandlers(
        (event: ReactMouseEvent) => {
            let clientX;
            if (event.nativeEvent instanceof MouseEvent) {
                clientX = event.nativeEvent.clientX;
            } else if (event.nativeEvent instanceof TouchEvent) {
                clientX = event.nativeEvent.touches[0].clientX;
            } else {
                return;
            }
            if (progressBarRef.current && sliderBarRef.current) {
                const { currentFretboardIndex, progression } =
                    appStore.getComputedState();
                const origin = progressBarRef.current.offsetLeft;
                const progressBarWidth = progressBarRef.current.offsetWidth;
                const toIndex = Math.floor(
                    ((clientX - origin) * progression.fretboards.length) /
                        progressBarWidth
                );
                appStore.switchFretboardAnimation(
                    currentFretboardIndex,
                    toIndex,
                    () => {
                        const { fretboard } = appStore.getComputedState();
                        audioStore.strumChord(fretboard);
                    }
                );
            }
        }
    );

    // slider down/up/move
    const sliderTouchHandlers = useTouchHandlers(
        (event: ReactMouseEvent) => {
            // slider grab
            // clicking on the slider is different than clicking somewhere on the line,
            // so stopPropagation here
            event.stopPropagation();

            let clientX: number;
            let clientY: number;
            if (event.nativeEvent instanceof MouseEvent) {
                clientX = event.nativeEvent.clientX;
                clientY = event.nativeEvent.clientY;
            } else if (event.nativeEvent instanceof TouchEvent) {
                clientX = event.nativeEvent.touches[0].clientX;
                clientY = event.nativeEvent.touches[0].clientY;
            } else {
                return;
            }
            isPressedCoordinatesRef.current = [clientX, clientY];

            // grab slider
            if (progressBarRef.current && sliderBarRef.current)
                deltaRef.current = clientX - sliderBarRef.current.offsetLeft;

            const display = appStore.state.display;
            if (display === "change-name")
                appStore.dispatch.setDisplay("normal");
            startLongPress(() => {
                if (display !== "change-name")
                    appStore.dispatch.setDisplay("change-name");
            }, 700);
        },
        (event: WindowMouseEvent) => {
            // slider drag release
            clearLongPress();
            if (getState().dragging) {
                setState({ dragging: false });
                // stopClick();
                // snap to grid if click or drag release
                snapToGridAnimation();
            }
        },
        (event: WindowMouseEvent) => {
            // slider drag
            if (!sliderBarRef.current) return;

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

            // if slider has moved far enough, we dont want to call longPress
            if (
                hasMovedPastThreshold(clientX, clientY, 50) &&
                isLongPressedTimeoutRef.current
            )
                clearTimeout(isLongPressedTimeoutRef.current);

            // drag slider
            if (isPressedRef.current && !getState().dragging) {
                setState({ dragging: true });
            } else if (
                isPressedRef.current &&
                progressBarRef.current &&
                getState().dragging
            ) {
                repositionSlider(clientX);
            }
        },
        undefined,
        { delay: 1000, threshold: 100 }
    );

    return (
        <FlexRow width="100%">
            <ProgressBar
                id="progress-bar"
                ref={progressBarRef}
                width="100%"
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
