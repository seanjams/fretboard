import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
} from "../../store";
import { FretboardNameType } from "../../types";
import { getFretboardName, darkGrey, defaultFretboardName } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { FlexRow } from "../Common";
import {
    TitleContainerDiv,
    EmptyTitleContainerDiv,
    CurrentFretboardMarker,
} from "./style";

// Component
interface TitleProps {
    appStore: AppStore;
    audioStore: AudioStore;
    fretboardIndex: number;
}

interface TitleState {
    name: FretboardNameType;
    isCurrentFretboard: boolean;
}

export const Title: React.FC<TitleProps> = ({
    appStore,
    audioStore,
    fretboardIndex,
}) => {
    const { progression, currentVisibleFretboardIndex, visibleFretboards } =
        appStore.getComputedState();
    const fretboard = visibleFretboards[fretboardIndex];
    const [getState, setState] = useStateRef<TitleState>(() => ({
        name: fretboard
            ? getFretboardName(fretboard, progression.label)[0]
            : defaultFretboardName,
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
            const name = fretboard
                ? getFretboardName(fretboard, progression.label)[0]
                : defaultFretboardName;
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

    const getFontSize = () => {
        const { name } = getState();
        const { chordName } = name;

        const x0 = 10;
        const y0 = 28;
        const x1 = 37;
        const y1 = 12;
        const buffer = 0;

        return chordName.length < x0
            ? y0
            : chordName.length > x1
            ? y1
            : ((y0 - y1 + buffer) / (x0 - x1)) * (chordName.length - x1) + y1;
    };

    return (
        <TitleContainerDiv>
            <CurrentFretboardMarker
                markerColor={isCurrentFretboard ? darkGrey : "transparent"}
            />
            {fretboard ? (
                <FlexRow height="calc(100% - 12px)">
                    <ChordSymbol
                        rootName={rootName}
                        chordName={chordName}
                        fontSize={getFontSize()}
                    />
                </FlexRow>
            ) : (
                <EmptyTitleContainerDiv />
            )}
        </TitleContainerDiv>
    );
};
