import React, { useEffect } from "react";
import {
    useStateRef,
    AppStore,
    AudioStore,
    getComputedAppState,
} from "../../store";
import { COLORS, getFretboardDimensions, shouldUpdate, SP } from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div, FlexRow } from "../Common";
import {
    AudioControls,
    DrawerControls,
    HighlightControls,
    PositionControls,
    SettingsControls,
} from "../Controls";
import { ChordInput } from "../ChordInput";
import { InversionSelector } from "../InversionSelector";
import { ProgressionSelector } from "../ProgressionSelector";
import { Slider } from "../Slider";
import { ContainerDiv, DrawerContainer, GutterDiv } from "./style";
import { BottomDrawer, TopDrawer } from "../Drawer";

interface DashboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Dashboard: React.FC<DashboardProps> = ({
    appStore,
    audioStore,
}) => {
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef(() => derivedState);
    const { display, backgroundColor } = getState();
    const fretboardDimensions = getFretboardDimensions();
    const { maxFretboardHeight } = fretboardDimensions;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { display, currentVisibleFretboardIndex } =
            getComputedAppState(appState);
        return {
            display,
            backgroundColor: COLORS[currentVisibleFretboardIndex][1],
        };
    }

    useEffect(
        () =>
            appStore.addListener((appState) => {
                const derivedState = deriveStateFromAppState(appState);
                if (shouldUpdate(getState(), derivedState))
                    setState(derivedState);
            }),
        []
    );

    return (
        <ContainerDiv backgroundColor={backgroundColor}>
            <GutterDiv {...fretboardDimensions} isTop={true}>
                <Slider appStore={appStore} audioStore={audioStore} />
            </GutterDiv>
            <Div height={`${maxFretboardHeight}px`}>
                <TopDrawer appStore={appStore}>
                    <DrawerContainer isTop={true}>
                        {display === "change-inversion" ? (
                            <InversionSelector
                                appStore={appStore}
                                audioStore={audioStore}
                            />
                        ) : null}
                    </DrawerContainer>
                </TopDrawer>
                <Fretboard appStore={appStore} audioStore={audioStore} />
                <BottomDrawer appStore={appStore}>
                    <DrawerContainer isTop={false}>
                        {display === "change-chord" ? (
                            <ChordInput
                                appStore={appStore}
                                audioStore={audioStore}
                            />
                        ) : display === "settings" ? (
                            <SettingsControls
                                appStore={appStore}
                                audioStore={audioStore}
                            />
                        ) : display === "change-progression" ? (
                            <ProgressionSelector
                                appStore={appStore}
                                audioStore={audioStore}
                            />
                        ) : null}
                    </DrawerContainer>
                </BottomDrawer>
            </Div>
            <GutterDiv {...fretboardDimensions} isTop={false}>
                <FlexRow width="100%">
                    <Div flexShrink={1}>
                        <DrawerControls appStore={appStore} />
                    </Div>
                    <FlexRow
                        flexGrow={1}
                        justifyContent="flex-start"
                        marginLeft={`${SP[2]}px`}
                        marginRight={`${SP[2]}px`}
                    >
                        <HighlightControls appStore={appStore} />
                    </FlexRow>
                    <FlexRow
                        flexGrow={1}
                        justifyContent="flex-end"
                        marginLeft={`${SP[2]}px`}
                        marginRight={`${SP[2]}px`}
                    >
                        <AudioControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </FlexRow>
                    <Div flexShrink={1}>
                        <PositionControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </Div>
                </FlexRow>
            </GutterDiv>
        </ContainerDiv>
    );
};
