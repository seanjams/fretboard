import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { AppStore, AudioStore, SliderStore, useStateRef } from "../../store";
import { FretboardSettingsControls } from "../controls";
import { getFretboardDimensions } from "../../utils";
import { ContainerDiv, AnimationWrapper } from "./style";

// Component
interface Props {
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const FretboardSettings: React.FC<Props> = ({
    audioStore,
    sliderStore,
    store,
}) => {
    const [getState, setState] = useStateRef(() => ({
        // custom state for component
        showSettings: store.state.showSettings,
    }));
    const { showSettings } = getState();

    useEffect(() => {
        return store.addListener(({ showSettings }) => {
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
                <ContainerDiv
                    className="settings-form"
                    height={`${maxInputHeight}px`}
                >
                    <FretboardSettingsControls
                        store={store}
                        audioStore={audioStore}
                    />
                </ContainerDiv>
            </CSSTransition>
        </AnimationWrapper>
    );
};
