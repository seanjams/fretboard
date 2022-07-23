import React, { useRef } from "react";
import { AppStore, AudioStore, useDerivedState } from "../../store";
import { getFretboardDimensions, SP } from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div, FlexRow } from "../Common";
import {
    AudioControls,
    ClearControls,
    DrawerControls,
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
import { Modal } from "../Modal";

interface DashboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Dashboard: React.FC<DashboardProps> = ({
    appStore,
    audioStore,
}) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { display } = getState();
    const fretboardDimensions = getFretboardDimensions();
    const { maxFretboardHeight } = fretboardDimensions;
    const containerRef = useRef<HTMLDivElement>(null);

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { display } = appState;
        return {
            display,
        };
    }

    return (
        <ContainerDiv ref={containerRef}>
            <GutterDiv {...fretboardDimensions} isTop={true}>
                <Slider appStore={appStore} audioStore={audioStore} />
            </GutterDiv>
            <Div height={`${maxFretboardHeight}px`}>
                {display === "instructions" && (
                    <Modal appStore={appStore}>
                        <Instructions appStore={appStore} />
                    </Modal>
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
                        <ClearControls appStore={appStore} />
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
                        <PositionControls appStore={appStore} />
                    </Div>
                </FlexRow>
            </GutterDiv>
        </ContainerDiv>
    );
};
