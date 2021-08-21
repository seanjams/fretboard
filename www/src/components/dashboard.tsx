import React, { useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { StateType, Store, ActionTypes, useStoreRef } from "../store";
import { Fretboard } from "./fretboard";
import { BottomControls, TopControls } from "./controls";
import { ChordInput } from "./input";
import { Slider } from "./slider";
import { Title } from "./title";
import {
    FRETBOARD_WIDTH,
    STRING_SIZE,
    LEGEND_HEIGHT,
    SAFETY_AREA_HEIGHT,
} from "../utils";
import { isMobile } from "react-device-detect";

// CSS
interface CSSProps {
    width?: number;
    height?: number;
    marginTop?: number;
    marginBottom?: number;
}

const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `${props.width}px`,
        height: `${props.height}px`,
    },
}))<CSSProps>`
    font-family: Arial;
    overflow: hidden;
    width: 100vw;
`;

const FlexContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
        marginTop: props.marginTop ? `${props.marginTop}px` : 0,
        marginBottom: props.marginBottom ? `${props.marginBottom}px` : 0,
    },
}))<CSSProps>``;

const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
    },
}))<CSSProps>`
    overflow-x: auto;
`;

const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: space-evenly;
    padding: 0 ${SAFETY_AREA_HEIGHT}px;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Dashboard: React.FC<Props> = ({ store }) => {
    // const isDraggingRef = useRef(false);
    // const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const [getShowInput, setShowInput] = useStoreRef(store, "showInput");
    const fretboardContainerRef = useRef(null);
    const scrollToFretRef = useRef(0);

    useEffect(() => {
        store.addListener(({ isDragging, scrollToFret }) => {
            // isDraggingRef.current = isDragging;
            if (scrollToFret !== scrollToFretRef.current) {
                const fretXPosition =
                    (FRETBOARD_WIDTH * scrollToFret) / STRING_SIZE;
                const halfContainerWidth =
                    fretboardContainerRef.current.offsetWidth / 2;

                fretboardContainerRef.current.scrollTo({
                    top: 0,
                    left: fretXPosition - halfContainerWidth,
                    behavior: "smooth",
                });
                scrollToFretRef.current = scrollToFret;
            }
        });
    }, []);

    // hack fix for mobile dimensions
    let windowWidth;
    let windowHeight;
    if (isMobile) {
        windowWidth = Math.max(screen.width, screen.height);
        windowHeight = Math.min(screen.width, screen.height);
    } else {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    }

    const gutterHeight = windowHeight * 0.12;
    const mainHeight = windowHeight * 0.76 - 2 * SAFETY_AREA_HEIGHT;
    const fretboardHeight = mainHeight - 2 * LEGEND_HEIGHT;

    // useEffect(() => {
    //     window.addEventListener("mouseup", onMouseUp);
    //     window.addEventListener("touchend", onMouseUp);
    //     return () => {
    //         window.removeEventListener("mouseup", onMouseUp);
    //         window.removeEventListener("touchend", onMouseUp);
    //     };
    // }, []);

    // const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
    //     event.preventDefault();
    //     if (timeoutRef.current) clearTimeout(timeoutRef.current);
    //     if (isDraggingRef.current) store.setKey("isDragging", false);
    // }, []);

    // const onMouseDown = (
    //     event:
    //         | React.MouseEvent<HTMLDivElement, MouseEvent>
    //         | React.TouchEvent<HTMLDivElement>
    // ) => {
    //     event.preventDefault();
    //     timeoutRef.current = setTimeout(
    //         () => store.setKey("isDragging", true),
    //         300
    //     );
    // };

    return (
        <ContainerDiv
            // onMouseDown={onMouseDown}
            // onTouchStart={onMouseDown}
            height={windowHeight}
            width={windowWidth}
        >
            <FlexContainerDiv
                height={gutterHeight}
                marginTop={SAFETY_AREA_HEIGHT}
                marginBottom={0}
            >
                <FlexRow>
                    <div style={{ flexGrow: 1 }}>
                        <Title store={store} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <TopControls store={store} />
                    </div>
                </FlexRow>
            </FlexContainerDiv>
            <CSSTransition
                in={getShowInput()}
                timeout={300}
                classNames="input-grow"
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                <ChordInput store={store} />
            </CSSTransition>
            <OverflowContainerDiv
                height={mainHeight}
                ref={fretboardContainerRef}
            >
                <Fretboard fretboardHeight={fretboardHeight} store={store} />
            </OverflowContainerDiv>
            <FlexContainerDiv
                height={gutterHeight}
                marginTop={0}
                marginBottom={SAFETY_AREA_HEIGHT}
            >
                <FlexRow>
                    <div style={{ flexGrow: 1 }}>
                        <Slider store={store} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <BottomControls store={store} />
                    </div>
                </FlexRow>
            </FlexContainerDiv>
        </ContainerDiv>
    );
};
