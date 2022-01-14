import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { AppStore, AudioStore, SliderStore, useStateRef } from "../../store";
import { FlexRow } from "../Common";
import { FretboardSettingsControls } from "../Controls";
import { darkGrey, getFretboardDimensions } from "../../utils";
import { AnimationWrapper } from "./style";

// Component
interface Props {
    appStore: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const FretboardSettings: React.FC<Props> = ({
    audioStore,
    sliderStore,
    appStore,
}) => {
    const [getState, setState] = useStateRef(() => ({
        // custom state for component
        showSettings: appStore.state.showSettings,
    }));
    const { showSettings } = getState();

    useEffect(() => {
        return appStore.addListener(({ showSettings }) => {
            if (getState().showSettings !== showSettings)
                setState({ showSettings });
        });
    }, []);

    const { minInputHeight, maxInputHeight } = getFretboardDimensions();

    return (
        <AnimationWrapper
            minInputHeight={minInputHeight}
            maxInputHeight={maxInputHeight}
        >
            <CSSTransition
                in={showSettings}
                timeout={{ enter: 300, exit: 150 }}
                classNames="settings-grow"
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                <FlexRow
                    className="settings-form"
                    height={`${maxInputHeight}px`}
                    width="100%"
                    color={darkGrey}
                >
                    <FretboardSettingsControls
                        appStore={appStore}
                        audioStore={audioStore}
                    />
                </FlexRow>
            </CSSTransition>
        </AnimationWrapper>
    );
};
