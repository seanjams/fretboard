import React, { useEffect } from "react";
import { useStateRef, AppStore } from "../../store";
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
    store: AppStore;
}

export const PositionControls: React.FC<Props> = ({ store }) => {
    const onArrowPress = (dir: ArrowTypes) => () => {
        const { invert, leftHand } = store.state;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const up = (dir === "ArrowDown" && highEBottom) || dir === "ArrowUp";
        const down = (dir === "ArrowUp" && highEBottom) || dir === "ArrowDown";
        const right = (dir === "ArrowLeft" && invert) || dir === "ArrowRight";
        const left = (dir === "ArrowRight" && invert) || dir === "ArrowLeft";

        if (up) {
            store.dispatch.incrementPositionY();
        } else if (down) {
            store.dispatch.decrementPositionY();
        } else if (right) {
            store.dispatch.incrementPositionX();
        } else if (left) {
            store.dispatch.decrementPositionX();
        }
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
    const [getState, setState] = useStateRef(() => ({
        status: store.state.status,
    }));
    const { status } = getState();

    useEffect(() => {
        return store.addListener(({ status }) => {
            if (getState().status !== status) setState({ status });
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
