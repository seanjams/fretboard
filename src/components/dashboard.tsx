import React, { useRef, useEffect } from "react";
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

    useEffect(
        () =>
            store.addListener(({ isDragging }) => {
                isDraggingRef.current = isDragging;
            }),
        []
    );

    function onMouseOver(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();

        if (isDraggingRef.current && !e.buttons) {
            store.setKey("isDragging", false);
        } else if (!isDraggingRef.current && e.buttons) {
            store.setKey("isDragging", true);
        }
    }

    return (
        <div onMouseOver={onMouseOver}>
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
