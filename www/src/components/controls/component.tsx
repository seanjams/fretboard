import React, { useRef, useEffect, useState, useCallback } from "react";
import { AnyReducersType, Store, useStateRef, StateType } from "../../store";
import { ArrowTypes } from "../../types";
import { COLORS, HIGHLIGHTED, SELECTED, BRUSH_MODES } from "../../utils";
import { CircleControlsContainer, Label } from "./style";
import { CircleIconButton, HighlightButton } from "../buttons";
import PlusIcon from "../../assets/icons/plus.png";
import MinusIcon from "../../assets/icons/minus.png";
import LeftIcon from "../../assets/icons/left-arrow.png";
import DownIcon from "../../assets/icons/down-arrow.png";
import UpIcon from "../../assets/icons/up-arrow.png";
import RightIcon from "../../assets/icons/right-arrow.png";
import ClearIcon from "../../assets/icons/clear.png";

const [secondaryColor, primaryColor] = COLORS[0];

interface Props {
    store: Store<StateType, AnyReducersType<StateType>>;
}

export const PositionControls: React.FC<Props> = ({ store }) => {
    const onArrowPress = (direction: ArrowTypes) => () => {
        const { invert, leftHand } = store.state;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const keyMap: { [key in ArrowTypes]: () => StateType } = {
            ArrowUp: highEBottom
                ? store.dispatch.decrementPositionY
                : store.dispatch.incrementPositionY,
            ArrowDown: highEBottom
                ? store.dispatch.incrementPositionY
                : store.dispatch.decrementPositionY,
            ArrowRight: invert
                ? store.dispatch.decrementPositionX
                : store.dispatch.incrementPositionX,
            ArrowLeft: invert
                ? store.dispatch.incrementPositionX
                : store.dispatch.decrementPositionX,
        };
        if (keyMap[direction]) keyMap[direction]();
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowLeft")}
                    imageSrc={LeftIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowDown")}
                    imageSrc={DownIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowUp")}
                    imageSrc={UpIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowRight")}
                    imageSrc={RightIcon}
                />
                <Label>{""}</Label>
            </div>
        </CircleControlsContainer>
    );
};

export const HighlightControls: React.FC<Props> = ({ store }) => {
    const [getState, setState] = useStateRef({
        status: store.state.status,
    });
    const { status } = getState();

    useEffect(() => {
        return store.addListener(({ status }) => {
            if (getState().status !== status)
                setState((prevState) => ({
                    ...prevState,
                    status,
                }));
        });
    }, []);

    const onStatusChange = () => {
        const { status } = getState();
        store.dispatch.setStatus(
            status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClearNotes = () => {
        store.dispatch.clear();
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton onClick={onClearNotes} imageSrc={ClearIcon} />
                <Label>{""}</Label>
            </div>
            <div>
                <HighlightButton
                    highlighted={status === HIGHLIGHTED}
                    onClick={onStatusChange}
                />
                <Label>
                    {status === HIGHLIGHTED && BRUSH_MODES[HIGHLIGHTED]}
                </Label>
            </div>
        </CircleControlsContainer>
    );
};

export const SliderControls: React.FC<Props> = ({ store }) => {
    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={store.dispatch.addFretboard}
                    imageSrc={PlusIcon}
                />
            </div>
            <div>
                <CircleIconButton
                    onClick={store.dispatch.removeFretboard}
                    imageSrc={MinusIcon}
                />
            </div>
        </CircleControlsContainer>
    );
};
