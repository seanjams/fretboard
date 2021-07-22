import React, { useRef, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes } from "../store";
import { Fretboard } from "./fretboard";
import { NavControls, BrushControls } from "./controls";
import { Slider } from "./slider";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
    width: 100vw;
    overflow-x: auto;
    font-family: Arial;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Dashboard: React.FC<Props> = ({ store }) => {
    const isDraggingRef = useRef(false);

    const [orientation, setOrientation] = useState("");

    useEffect(() => {
        if (window.screen) {
            screen.orientation.addEventListener('change', function(e){
                setOrientation(screen.orientation.type)
            });
        }

        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useEffect(
        () =>
            store.addListener(({ isDragging }) => {
                isDraggingRef.current = isDragging;
            }),
        []
    );

    const onMouseUp = useCallback((
        event:
            | MouseEvent
            | TouchEvent
    ) => {
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
            <h1>{orientation}</h1>
            <ContainerDiv>
                <NavControls store={store} />
            </ContainerDiv>
            <ContainerDiv>
                <BrushControls store={store} />
            </ContainerDiv>
            <ContainerDiv>
                <Fretboard store={store} />
            </ContainerDiv>
            <ContainerDiv>
                <Slider store={store} />
            </ContainerDiv>
        </div>
    );
};
