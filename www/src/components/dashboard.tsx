import React, { useRef, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes } from "../store";
import { Fretboard } from "./fretboard";
import { Controls } from "./controls";
import { Slider } from "./slider";
import { FRETBOARD_WIDTH, STRING_SIZE } from "../utils";

// CSS
interface CSSProps {
    width?: number;
}

const ContainerDiv = styled.div<CSSProps>`
    width: 100vw;
    overflow-x: auto;
    font-family: Arial;
`;

const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: space-evenly;
    padding: 10px 0;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Dashboard: React.FC<Props> = ({ store }) => {
    const fretboardContainerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const scrollToFretRef = useRef(0);

    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useEffect(() => {
        store.addListener(({ isDragging, scrollToFret }) => {
            isDraggingRef.current = isDragging;
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

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        store.setKey("isDragging", false);
    }, []);

    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        store.setKey("isDragging", true);
    };

    return (
        <div onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
            <ContainerDiv ref={fretboardContainerRef}>
                <Fretboard store={store} />
            </ContainerDiv>
            <ContainerDiv>
                <FlexRow>
                    <div style={{ flexGrow: 1 }}>
                        <Slider store={store} />
                    </div>
                    <div style={{ flexShrink: 1 }}>
                        <Controls store={store} />
                    </div>
                </FlexRow>
            </ContainerDiv>
        </div>
    );
};
