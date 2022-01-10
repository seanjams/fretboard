import React, { useEffect } from "react";
import { AppStore, useStateRef } from "../../store";
import { ContainerDiv } from "./style";

// Component
interface Props {
    appStore: AppStore;
}

export const Template: React.FC<Props> = ({ appStore }) => {
    const [getState, setState] = useStateRef(() => ({
        // custom state for component
        message: "hello",
    }));
    const { message } = getState();

    useEffect(() => {
        return appStore.addListener((newState) => {});
    }, []);

    return <ContainerDiv>{message}</ContainerDiv>;
};
