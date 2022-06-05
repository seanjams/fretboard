import React from "react";
import { AppStore, useTouchHandlers } from "../../store";
import { FlexRow } from "../Common";
import { CloseButton, ContainerDiv, ContentDiv } from "./style";

// Instructions
interface Props {
    appStore: AppStore;
}

export const Modal: React.FC<Props> = ({ appStore, children }) => {
    const closeTouchHandlers = useTouchHandlers({
        onClick: () => appStore.dispatch.setDisplay("normal"),
    });

    return (
        <ContainerDiv>
            <FlexRow width="100%" height="100%">
                <ContentDiv>{children}</ContentDiv>
                <CloseButton {...closeTouchHandlers}>&times;</CloseButton>
            </FlexRow>
        </ContainerDiv>
    );
};
