import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
} from "../../store";
import { FretboardNameType } from "../../types";
import {
    DEFAULT_FRETBOARD_NAME,
    darkGrey,
    COLORS,
    shouldUpdate,
} from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { FlexRow } from "../Common";
import {
    TitleContainerDiv,
    EmptyTitleContainerDiv,
    CurrentFretboardMarker,
    titleFontSize,
    TitleButton,
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
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef<TitleState>(() => derivedState);
    const { name, isCurrentFretboard } = getState();
    const { rootName, chordName } = name;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex, visibleFretboards } =
            getComputedAppState(appState);
        const fretboard = visibleFretboards[fretboardIndex];
        const name = fretboard
            ? fretboard.names.filter((name) => name.isSelected)[0]
            : DEFAULT_FRETBOARD_NAME();
        const isCurrentFretboard =
            fretboardIndex === currentVisibleFretboardIndex;
        return {
            name,
            isCurrentFretboard,
        };
    }

    useEffect(
        () =>
            appStore.addListener((newState) => {
                const derivedState = deriveStateFromAppState(newState);
                if (shouldUpdate(getState(), derivedState))
                    setState(derivedState);
            }),
        []
    );

    // fix these parameters, used to make font size dynamic for longer names

    // x = 39, s = 13
    // x = 18, s = 28

    // y - 13 = (-15 / 21) ( x - 39)
    // y -12x + 481

    const getFontSize = () => {
        const { name } = getState();
        let { chordName } = name;
        // remove pesky comma's
        chordName = chordName.split(",").join("");

        const x0 = 8; // length of word needed to trigger shrink
        const y0 = titleFontSize; // font size for short words
        const x1 = 25; // length of word needed to max shrink
        const y1 = 11; // font size for long words
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
            <TitleButton
                isPressed={isCurrentFretboard}
                backgroundColor={COLORS[fretboardIndex][0]}
            >
                {chordName ? (
                    <FlexRow height="100%">
                        <ChordSymbol
                            rootName={rootName}
                            chordName={chordName}
                            fontSize={getFontSize()}
                        />
                    </FlexRow>
                ) : (
                    <FlexRow height="100%">
                        <EmptyTitleContainerDiv>+</EmptyTitleContainerDiv>
                    </FlexRow>
                )}
            </TitleButton>
        </TitleContainerDiv>
    );
};
