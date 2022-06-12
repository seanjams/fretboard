import React from "react";
import { icons } from "../../assets/icons/icons";
import { AppStore } from "../../store";
import { IconButton } from "../Buttons";
import { FlexRow } from "../Common";
import { CloseButton, ContainerDiv, ContentDiv } from "./style";

// Instructions
interface Props {
    appStore: AppStore;
}

export const Modal: React.FC<Props> = ({ appStore, children }) => {
    return (
        <ContainerDiv>
            <FlexRow width="100%" height="100%">
                <ContentDiv>{children}</ContentDiv>
                <CloseButton>
                    <IconButton
                        onClick={() => appStore.dispatch.setDisplay("normal")}
                        iconHeight={16}
                        iconWidth={16}
                        buttonHeight={30}
                        buttonWidth={30}
                        isCircular={true}
                    >
                        {icons.cross}
                    </IconButton>
                </CloseButton>
            </FlexRow>
        </ContainerDiv>
    );
};
