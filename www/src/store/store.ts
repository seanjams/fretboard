export type AnyReducersType<S> = {
    [key: string]: (state: S, ...args: any[]) => S;
};

export class Store<S, R extends AnyReducersType<S>> {
    dispatch: {
        [key in keyof R]: (...args: any[]) => S;
    };

    constructor(public state: S, private reducers: R) {
        if (!reducers) return;
        let self = this;
        this.dispatch = {} as typeof self.dispatch;
        let key: keyof typeof reducers;
        for (key in reducers) {
            let k = key;
            this.dispatch[k] = (...args: any[]): S => {
                // console.log(`Running Reducer: ${k}`);
                // console.log(`oldState:`, this.state);
                const reducer = reducers[k];
                if (reducer) {
                    this.state = reducer.call(reducers, this.state, ...args);
                    // console.log(`newState:`, this.state);
                    this.emit();
                }
                return this.state;
            };
        }
    }

    public setState = (nextState: S) => {
        this.state = nextState;
        this.emit();
    };

    // generally should avoid this, used for slider currently
    public setKey = (key: keyof S, value: S[keyof S]) => {
        this.state[key] = value;
        this.emit();
    };

    public getState = () => {
        // maybe return json instead
        return this.state;
    };

    private listeners = new Set<(state: S) => void>();

    public addListener(fn: (state: S) => void): () => void {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
            return null;
        };
    }

    private emit() {
        this.listeners.forEach((fn) => fn(this.state));
    }
}
