import React from "react";
import { AppStore, AudioStore } from "../../store";
import { FretboardSettingsControls } from "../Controls";

// Component
interface Props {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const FretboardSettings: React.FC<Props> = ({
    audioStore,
    appStore,
}) => {
    return (
        <FretboardSettingsControls
            appStore={appStore}
            audioStore={audioStore}
        />
    );
};
