import React, { useRef, useEffect, useState, useCallback } from "react";
import { Store, AnyReducersType, StateType, useStateRef } from "../../store";
import {} from "../../utils";
import {} from "../../types";
import { ContainerDiv } from "./style";

// Component
interface Props {
    store: Store<StateType, AnyReducersType<StateType>>;
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
