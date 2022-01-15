import React, { useEffect } from "react";
import { AppStore, getComputedAppState, useStateRef } from "../../store";
import { DisplayTypes } from "../../types";
import { getName, darkGrey } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { FlexRow } from "../Common";
import {
    TitleContainerDiv,
    EmptyTitleContainerDiv,
    CurrentFretboardMarker,
} from "./style";

// Component
interface Props {
    appStore: AppStore;
    fretboardIndex: number;
}

const defaultName = {
    rootIdx: -1,
    rootName: "",
    chordName: "",
    foundChordName: "",
};

export const Title: React.FC<Props> = ({ appStore, fretboardIndex }) => {
    const { progression, currentVisibleFretboardIndex, visibleFretboards } =
        appStore.getComputedState();
    const fretboard = visibleFretboards[fretboardIndex];
    // const fretboard = progression.fretboards[fretboardIndex];
    const [getState, setState] = useStateRef(() => ({
        name: fretboard
            ? getName(fretboard, progression.label)[0]
            : defaultName,
        isCurrentFretboard: fretboardIndex === currentVisibleFretboardIndex,
    }));
    const { name, isCurrentFretboard } = getState();
    const { rootName, chordName } = name;

    useEffect(() => {
        return appStore.addListener((newState) => {
            const {
                progression,
                currentVisibleFretboardIndex,
                visibleFretboards,
            } = getComputedAppState(newState);
            const fretboard = visibleFretboards[fretboardIndex];
            // const fretboard = progression.fretboards[fretboardIndex];
            const name = fretboard
                ? getName(fretboard, progression.label)[0]
                : defaultName;
            const isCurrentFretboard =
                fretboardIndex === currentVisibleFretboardIndex;

            if (
                getState().name !== name ||
                getState().isCurrentFretboard !== isCurrentFretboard
            )
                setState({ name, isCurrentFretboard });
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
        const { currentFretboardIndex, visibleFretboards } =
            appStore.getComputedState();
        if (currentFretboardIndex !== fretboardIndex) {
            if (currentFretboardIndex < visibleFretboards.length)
                appStore.switchFretboardAnimation(
                    currentFretboardIndex,
                    fretboardIndex
                );
        } else {
            let display: DisplayTypes =
                appStore.state.display === "input" ? "normal" : "input";
            appStore.dispatch.setDisplay(display);
        }
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <CurrentFretboardMarker
                markerColor={isCurrentFretboard ? darkGrey : "transparent"}
            />
            {fretboard ? (
                <FlexRow height="calc(100% - 12px)">
                    <ChordSymbol
                        rootName={rootName}
                        chordName={chordName}
                        fontSize={fontSize}
                    />
                </FlexRow>
            ) : (
                <EmptyTitleContainerDiv />
            )}
        </TitleContainerDiv>
    );
};
