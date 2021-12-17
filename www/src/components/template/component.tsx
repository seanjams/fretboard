import React, { useEffect } from "react";
import { AppStore, useStateRef } from "../../store";
import { ContainerDiv } from "./style";

// Component
interface Props {
    store: AppStore;
}

export const Template: React.FC<Props> = ({ store }) => {
    const [getState, setState] = useStateRef({
        // custom state for component
        message: "hello",
    });
    const { message } = getState();

    useEffect(() => {
        return store.addListener((newState) => {});
    }, []);

    return <ContainerDiv>{message}</ContainerDiv>;
};
