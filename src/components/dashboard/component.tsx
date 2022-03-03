import React, { useEffect } from "react";
import { useStateRef, AppStore, AudioStore } from "../../store";
import { SAFETY_AREA_MARGIN, getFretboardDimensions, SP } from "../../utils";
import { Fretboard } from "../Fretboard";
import { Div } from "../Common";
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
import { ContainerDiv } from "./style";
import { BottomDrawer, TopDrawer } from "../Drawer";

interface DashboardProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Dashboard: React.FC<DashboardProps> = ({
    appStore,
    audioStore,
}) => {
    const [getState, setState] = useStateRef(() => ({
        orientation: "portrait-primary",
        display: appStore.state.display,
    }));

    const { display } = getState();
    const { gutterHeight, maxFretboardHeight } = getFretboardDimensions();

    useEffect(
        () =>
            appStore.addListener(({ display }) => {
                if (getState().display !== display) setState({ display });
            }),

        []
    );

    return (
        <ContainerDiv>
            <Div
                height={`${gutterHeight}px`}
                marginTop={`${SAFETY_AREA_MARGIN}px`}
                marginBottom={0}
                paddingLeft={`${SP[7]}px`}
                paddingRight={`${SP[7]}px`}
                verticalAlign="top"
            >
                <Slider appStore={appStore} audioStore={audioStore} />
            </Div>
            <Div height={`${maxFretboardHeight}px`}>
                <TopDrawer appStore={appStore}>
                    {display === "change-inversion" ? (
                        <InversionSelector
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    ) : null}
                </TopDrawer>
                <Fretboard appStore={appStore} audioStore={audioStore} />
                <BottomDrawer appStore={appStore}>
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
                </BottomDrawer>
            </Div>
            <Div
                height={`${gutterHeight}px`}
                marginTop="0px"
                marginBottom={`${SAFETY_AREA_MARGIN}px`}
                verticalAlign="bottom"
            >
                <Div
                    display="flex"
                    justifyContent="space-evenly"
                    alignItems="start"
                    padding={`0 ${SAFETY_AREA_MARGIN}px`}
                >
                    <Div flexShrink={1}>
                        <HighlightControls appStore={appStore} />
                    </Div>
                    <Div
                        flexGrow={1}
                        marginLeft={`${SP[4]}px`}
                        marginRight={`${SP[4]}px`}
                    >
                        <AudioControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </Div>
                    <Div
                        flexGrow={1}
                        display="flex"
                        justifyContent="flex-end"
                        marginLeft={`${SP[4]}px`}
                        marginRight={`${SP[4]}px`}
                    >
                        <DrawerControls appStore={appStore} />
                    </Div>
                    <Div flexShrink={1}>
                        <PositionControls
                            appStore={appStore}
                            audioStore={audioStore}
                        />
                    </Div>
                </Div>
            </Div>
        </ContainerDiv>
    );
};
