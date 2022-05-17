import React, { useEffect, useRef } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useDerivedState,
} from "../../store";
import { COLORS, getFretboardDimensions, SP } from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div, FlexRow } from "../Common";
import {
    AudioControls,
    DrawerControls,
    HighlightControls,
    InstructionsControls,
    PositionControls,
    SettingsControls,
} from "../Controls";
import { ChordInput } from "../ChordInput";
import { BottomDrawer, TopDrawer } from "../Drawer";
import { Instructions } from "../Instructions";
import { InversionSelector } from "../InversionSelector";
import { ProgressionSelector } from "../ProgressionSelector";
import { Slider } from "../Slider";
import { ContainerDiv, DrawerContainer, GutterDiv } from "./style";

interface DashboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Dashboard: React.FC<DashboardProps> = ({
    appStore,
    audioStore,
}) => {
    const { currentVisibleFretboardIndex } = appStore.getComputedState();
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { display } = getState();
    const fretboardDimensions = getFretboardDimensions();
    const { maxFretboardHeight } = fretboardDimensions;
    const containerRef = useRef<HTMLDivElement>(null);
    const backgroundColor = COLORS[currentVisibleFretboardIndex][0];
    const backgroundColorRef = useRef(backgroundColor);

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { display } = getComputedAppState(appState);
        return {
            display,
        };
    }

    useEffect(() => {
        return appStore.addListener((appState) => {
            const { currentVisibleFretboardIndex } =
                getComputedAppState(appState);
            const backgroundColor = COLORS[currentVisibleFretboardIndex][0];
            if (backgroundColor !== backgroundColorRef.current) {
                backgroundColorRef.current = backgroundColor;
                if (containerRef.current) {
                    containerRef.current.style.backgroundColor =
                        backgroundColor;
                }
            }
        });
    }, []);

    return (
        <ContainerDiv ref={containerRef} backgroundColor={backgroundColor}>
            <GutterDiv {...fretboardDimensions} isTop={true}>
                <Slider appStore={appStore} audioStore={audioStore} />
            </GutterDiv>
            <Div height={`${maxFretboardHeight}px`}>
                {display === "instructions" && (
                    <Instructions appStore={appStore} />
                )}
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
                        <InstructionsControls appStore={appStore} />
                        <AudioControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </FlexRow>
                    <Div flexShrink={1}>
                        <PositionControls appStore={appStore} />
                    </Div>
                </FlexRow>
            </GutterDiv>
        </ContainerDiv>
    );
};
