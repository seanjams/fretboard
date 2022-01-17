import React from "react";
import { AppStore, AudioStore } from "../../store";
import { FretboardSettingsControls } from "../Controls";

// Component
interface FretboardSettingsProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const FretboardSettings: React.FC<FretboardSettingsProps> = ({
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
