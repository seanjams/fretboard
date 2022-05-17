import React, { useEffect } from "react";
import moment from "moment";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useDerivedState,
} from "../../store";
import { WindowMouseEvent } from "../../types";
import { COLORS, FLAT_NAMES, SHARP_NAMES, SP } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { ProgressionControls } from "../Controls";
import { Div, FlexRow } from "../Common";
import {
    EmptyOption,
    LastUpdatedTime,
    ProgressionSelectorContainer,
} from "./style";
import { ScrollSelect, ScrollSelectOption } from "../ScrollSelect";

interface ProgressionSelectorProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ProgressionSelector: React.FC<ProgressionSelectorProps> = ({
    audioStore,
    appStore,
}) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const {
        currentProgressionIndex,
        display,
        progressions,
        visibleFretboards,
    } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const {
            currentProgressionIndex,
            display,
            progressions,
            visibleFretboards,
        } = getComputedAppState(appState);
        return {
            currentProgressionIndex,
            display,
            progressions,
            visibleFretboards,
        };
    }

    // make sure items timestamped and sorted on load and unload
    useEffect(() => {
        appStore.dispatch.setProgressionTimestamps();
        return appStore.dispatch.setProgressionTimestamps;
    }, [display]);

    const getClickHandler = (event: WindowMouseEvent, i: number) => {
        event.preventDefault();
        event.stopPropagation();
        appStore.dispatch.setCurrentProgressionIndex(i);
    };

    const options = progressions.map((progression, i) => {
        const fretboards =
            i === currentProgressionIndex
                ? visibleFretboards
                : progression.fretboards;
        const progressionNames = fretboards.map(
            (fretboard) =>
                fretboard.names.find((name) => name.isSelected) ||
                fretboard.names[0]
        );

        function getNoteName(rootIdx: number) {
            return progression.label === "sharp"
                ? SHARP_NAMES[rootIdx]
                : FLAT_NAMES[rootIdx];
        }

        return (
            <ScrollSelectOption
                key={`progression-option-${i}`}
                value={`progression-option-${i}`}
            >
                <FlexRow width="100%" height="100%">
                    {progressionNames.map((name, j) => {
                        return (
                            <Div
                                width="25%"
                                margin={`0 ${SP[2]}px`}
                                key={`change-progression-name-${i}-${j}`}
                            >
                                <Div
                                    textAlign="left"
                                    fontSize="8px"
                                    position="relative"
                                    top={`-${SP[1]}px`}
                                    height={`-${SP[1]}px`}
                                    marginBottom={`-${SP[1]}px`}
                                    marginLeft={`-${SP[2]}px`}
                                >
                                    {j + 1}.
                                </Div>
                                <Div
                                    textAlign="center"
                                    padding={`0 ${SP[1]}px`}
                                    width={`calc(100% - ${2 * SP[1]}px)`}
                                    color={COLORS[j][2]}
                                >
                                    {name.chordName ? (
                                        <ChordSymbol
                                            rootName={getNoteName(name.rootIdx)}
                                            chordName={name.chordName}
                                            fontSize={12}
                                        />
                                    ) : (
                                        <Div>+</Div>
                                    )}
                                </Div>
                            </Div>
                        );
                    })}
                </FlexRow>
                <LastUpdatedTime>
                    {progression.lastUpdated
                        ? moment(progression.lastUpdated).format(
                              "M/D/YY, h:mm:ss a"
                          )
                        : "Just Now"}
                </LastUpdatedTime>
            </ScrollSelectOption>
        );
    });

    return (
        <ProgressionSelectorContainer>
            <FlexRow width="100%" height="100%">
                <FlexRow height="100%" flexGrow="1">
                    <ScrollSelect
                        onChange={getClickHandler}
                        value={`progression-option-${currentProgressionIndex}`}
                        dividers={true}
                    >
                        {options}
                    </ScrollSelect>
                </FlexRow>
                <FlexRow
                    height="100%"
                    flexShrink="1"
                    paddingLeft={`${SP[2]}px`}
                >
                    <ProgressionControls appStore={appStore} />
                </FlexRow>
            </FlexRow>
        </ProgressionSelectorContainer>
    );
};
