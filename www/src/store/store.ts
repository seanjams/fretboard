export class Store<S> {
    constructor(
        public state: S,
        public reducers?: {
            [key in string]: (...args: any[]) => S;
        }
    ) {
        this.reducers = {};
        if (!reducers) return;
        Object.keys(reducers).forEach((key) => {
            this.reducers[key] = (...args: any[]) => {
                // console.log(`Running Reducer: ${key}`);
                // console.log(`oldState:`, this.state);
                this.state = reducers[key](this.state, ...args);
                // console.log(`newState:`, this.state);
                this.emit();
                return this.state;
            };
        });
    }

    public setState = (nextState: S) => {
        this.state = nextState;
        this.emit();
    };

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
