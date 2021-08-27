import React, { useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import {
    StateType,
    Store,
    ActionTypes,
    useActiveStoreRef,
    // useDragging
} from "../store";
import { Fretboard } from "./fretboard";
import {
    PositionControls,
    HighlightControls,
    SliderControls,
} from "./controls";
import { ChordInput } from "./input";
import { Slider } from "./slider";
import { Title } from "./title";
import {
    FRETBOARD_WIDTH,
    STRING_SIZE,
    SAFETY_AREA_HEIGHT,
    FRETBOARD_MARGIN_HEIGHT,
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
    margin: ${FRETBOARD_MARGIN_HEIGHT}px 0;
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
    const [getShowInput, setShowInput] = useActiveStoreRef(store, "showInput");
    const fretboardContainerRef = useRef(null);
    const scrollToFretRef = useRef(0);
    // const [onDragStart, onDragEnd] = useDragging(store);

    useEffect(() => {
        const destroy = store.addListener(({ isDragging, scrollToFret }) => {
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

        return () => {
            destroy();
        };
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

    const gutterHeight = windowHeight * 0.15 - FRETBOARD_MARGIN_HEIGHT;
    const mainHeight = windowHeight * 0.7 - 2 * SAFETY_AREA_HEIGHT;
    const fretboardHeight = mainHeight;

    return (
        <ContainerDiv
            // onMouseDown={onDragStart}
            // onTouchStart={onDragEnd}
            height={windowHeight}
            width={windowWidth}
        >
            <FlexContainerDiv
                height={gutterHeight}
                marginTop={SAFETY_AREA_HEIGHT}
                marginBottom={0}
            >
                <FlexRow>
                    <div style={{ flex: 1 }}>
                        <Title store={store} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <Slider store={store} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <SliderControls store={store} />
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
                        <HighlightControls store={store} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <PositionControls store={store} />
                    </div>
                </FlexRow>
            </FlexContainerDiv>
        </ContainerDiv>
    );
};
