import { useEffect, useState, useRef, useCallback } from "react";

export class Store<T, A> {
    constructor(
        public state: T,
        public reducer: (state: T, action: A) => T = (state) => state
    ) {}

    public setState = (nextState: T) => {
        // console.log("setState", nextState);
        this.state = nextState;
        this.emit();
    };

    public getState = () => {
        return this.state;
    };

    public setPartialState = (partialState: Partial<T>) => {
        // console.log("setPartialState", partialState);
        for (let key in partialState) {
            this.state[key] = partialState[key];
        }
        this.emit();
    };

    public setKey = (key: keyof T, value: any) => {
        // console.log("setKey", key, value);
        this.state[key] = value;
        this.emit();
    };

    public setNestedListKey<W, Key extends keyof W>(
        listField: keyof T,
        listIndex: number,
        key: Key,
        value: W[Key]
    ) {
        const list = this.state[listField] as unknown as W[];
        if (!(list instanceof Array)) return;
        const prop = list[listIndex];
        prop[key] = value;
        this.emit();
    }

    private listeners = new Set<(state: T) => void>();

    public addListener(fn: (state: T) => void) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    private emit() {
        this.listeners.forEach((fn) => fn(this.state));
    }

    public dispatch = (action: A) => {
        if (!this.reducer) return;
        // console.log("dispatch", action);
        const nextState = this.reducer(this.state, action);
        this.state = nextState;
        this.emit();
    };
}
