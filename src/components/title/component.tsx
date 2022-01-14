import React, { useEffect } from "react";
import { AppStore, getComputedAppState, useStateRef } from "../../store";
import { getName } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { TitleContainerDiv } from "./style";

// Component
interface Props {
    appStore: AppStore;
}

export const Title: React.FC<Props> = ({ appStore }) => {
    const { fretboard, progression } = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        name: getName(fretboard, progression.label)[0],
    }));
    const { name } = getState();
    const { rootName, chordName } = name;

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { fretboard, progression } = getComputedAppState(newState);
            const name = getName(fretboard, progression.label)[0];
            if (getState().name !== name) setState({ name });
        });
    }, []);

    // fix these parameters, used to make font size dynamic for longer names

    // x = 39, s = 13
    // x = 18, s = 28

    // y - 13 = (-15 / 21) ( x - 39)
    // y -12x + 481

    const x0 = 10;
    const y0 = 28;
    const x1 = 37;
    const y1 = 12;
    const buffer = 0;

    const fontSize =
        chordName.length < x0
            ? y0
            : chordName.length > x1
            ? y1
            : ((y0 - y1 + buffer) / (x0 - x1)) * (chordName.length - x1) + y1;

    const onClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        // event.preventDefault();
        return appStore.dispatch.setShowInput(!appStore.state.showInput);
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol
                rootName={rootName}
                chordName={chordName}
                fontSize={fontSize}
            />
        </TitleContainerDiv>
    );
};
