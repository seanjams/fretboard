import {
    SHARP_NAMES,
    FLAT_NAMES,
    DEFAULT_NOTESWITCH,
    DEFAULT_STRINGSWITCH,
    STANDARD_TUNING,
    STRING_SIZE,
    SHAPES,
} from "./consts";
import {
    NoteTypes,
    LabelTypes,
    NoteSwitchType,
    StringSwitchType,
    numString,
    ChordTypes,
} from "../types";
import { isEqual } from "lodash";

export function copy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

export function mod(a: numString, m: number): number {
    return ((+a % m) + m) % m;
}

export const getNotes = (noteIndices: number[]) => {
    const notes = Array<boolean>(12).fill(false);
    noteIndices.forEach((index) => {
        index = mod(index, 12);
        notes[index] = true;
    });
    return notes;
};

export const rotate = (arr: any[], times: number = 1) => {
    let rotated = copy(arr);
    for (let i = 0; i < times; i++) {
        rotated = rotated.slice(1).concat(rotated[0]);
    }

    return rotated;
};

export class NoteUtil {
    base: number;
    constructor(base: number) {
        this.base = mod(base, 12);
    }

    getName(label: LabelTypes): NoteTypes {
        if (label === "sharp") {
            return SHARP_NAMES[this.base];
        } else if (label === "flat") {
            return FLAT_NAMES[this.base];
        }
    }
}

export interface FretboardUtilType {
    notes: NoteSwitchType;
    strings: StringSwitchType;
    rootIdx?: number;
    chordName?: ChordTypes;
    visible?: boolean;
}

export class FretboardUtil implements FretboardUtilType {
    notes: NoteSwitchType;
    strings: StringSwitchType;
    rootIdx?: number;
    chordName?: ChordTypes;
    visible?: boolean;

    constructor(
        notes: NoteSwitchType | null = { ...DEFAULT_NOTESWITCH },
        strings: StringSwitchType | null = { ...DEFAULT_STRINGSWITCH },
        rootIdx: number | null = null,
        chordName: ChordTypes | null = null,
        visible: boolean = true
    ) {
        this.notes = notes;
        this.strings = strings;
        this.visible = visible;
        if (rootIdx !== null) this.rootIdx = rootIdx;
        if (chordName !== null) this.chordName = chordName;
        if (
            !rootIdx &&
            !chordName &&
            Object.values(this.notes).some((val) => val)
        )
            this.setName("flat");
    }

    // gets whether index of note is "on" or "off" in this fretboard
    get(index: numString): boolean {
        return !!this.notes[mod(+index, 12)];
    }

    // sets whether index of note is "on" or "off" in this fretboard
    set(index: numString, active: boolean): boolean {
        if (!active) this.clearFrets(mod(+index, 12));
        return (this.notes[mod(+index, 12)] = active);
    }

    // toggles whether index of note is "on" or "off" in this fretboard
    toggle(index: number): boolean {
        return this.set(index, !this.get(index));
    }

    // gets whether stringIndex at fretValue is highlighted or not for this fretboard
    getFret(stringIndex: numString, fretValue: numString): boolean {
        return !!this.strings[mod(+stringIndex, 6)][+fretValue];
    }

    // sets whether stringIndex at fretValue is highlighted or not for this fretboard
    setFret(
        stringIndex: numString,
        fretValue: numString,
        active: boolean
    ): boolean {
        if (active) this.set(fretValue, active);
        return (this.strings[mod(+stringIndex, 6)][+fretValue] = active);
    }

    // toggles whether stringIndex at fretValue is highlighted or not for this fretboard
    toggleFret(stringIndex: number, fretValue: number): boolean {
        return this.setFret(
            stringIndex,
            fretValue,
            !this.getFret(stringIndex, fretValue)
        );
    }

    clearFrets(index: number): void {
        for (let i in this.strings) {
            for (let j in this.strings[i]) {
                if (this.getFret(i, j) && mod(j, 12) == index) {
                    this.setFret(i, j, false);
                }
            }
        }
    }

    list(): number[] {
        const result: number[] = [];
        Object.keys(this.notes).forEach((note, i) => {
            if (this.notes[+note]) {
                result.push(i);
            }
        });
        return result;
    }

    listString(stringIndex: number): number[] {
        return Object.keys(this.strings[mod(stringIndex, 6)])
            .map((key) => +key)
            .sort((a: number, b: number) => a - b);
    }

    _getIncrement(value: number, inc: number, scale: number[]): number {
        if (inc === 0) return value;

        const currentDelta = value - mod(value, 12);
        const currentIndex = scale.indexOf(mod(value, 12));
        if (currentIndex < 0) return value;

        const nextIndex = mod(currentIndex + inc, scale.length);
        const nextDelta = 12 * Math.floor((currentIndex + inc) / scale.length);
        return currentDelta + scale[nextIndex] + nextDelta;
    }

    _getVerticalIntervalIncrement(scale: number[], inc: number): number {
        let min = 12;
        let minStep: number;

        for (let scaleStep = 1; scaleStep < scale.length; scaleStep++) {
            // get average interval between different scale steps
            let average = 0;
            for (let i = 0; i < scale.length; i++) {
                const interval = mod(
                    scale[mod(i + scaleStep, scale.length)] - scale[i],
                    12
                );
                average += interval;
            }
            average = Math.abs(average / scale.length);

            // Get distance from most "vertical" possible interval, the perfect 4th
            const averageVerticalDelta = Math.abs(average - 5);
            if (averageVerticalDelta < min) {
                min = averageVerticalDelta;
                minStep = scaleStep;
            }
        }

        return (inc < 0 ? -1 : 1) * minStep;
    }

    incrementPosition(inc: number, vertical: boolean): boolean {
        const turnOff: [numString, numString][] = [];
        const turnOn: [numString, numString][] = [];

        const scale: number[] = Object.keys(this.notes)
            .map((key) => +key)
            .filter((key) => this.notes[key]);
        let verticalIntervalIncrement = vertical
            ? this._getVerticalIntervalIncrement(scale, inc)
            : 0;

        let valid = true;

        loop1: for (let stringIndex in this.strings) {
            const newStringIndex: number = vertical
                ? +stringIndex + inc
                : +stringIndex;
            for (let fretValue in this.strings[stringIndex]) {
                if (!this.getFret(stringIndex, fretValue)) continue;
                let newValue: number;
                let conditions: boolean[];
                if (vertical) {
                    // get most vertical interval step, find new note value, and apply to next string
                    newValue = this._getIncrement(
                        +fretValue,
                        verticalIntervalIncrement,
                        scale
                    );
                    conditions = [
                        newStringIndex < 0,
                        newStringIndex >= this.strings.length,
                        newValue < STANDARD_TUNING[newStringIndex],
                        newValue >=
                            STANDARD_TUNING[newStringIndex] + STRING_SIZE,
                    ];
                } else {
                    // find new note value, and apply to same string
                    newValue = this._getIncrement(+fretValue, inc, scale);
                    conditions = [
                        newValue === +fretValue,
                        newValue < STANDARD_TUNING[stringIndex],
                        newValue >= STANDARD_TUNING[stringIndex] + STRING_SIZE,
                    ];
                }

                if (conditions.some((_) => _)) {
                    valid = false;
                    break loop1;
                }

                turnOff.push([stringIndex, fretValue]);
                turnOn.push([newStringIndex, newValue]);
            }
        }

        if (valid) {
            for (let change of turnOff) {
                this.setFret(change[0], change[1], false);
            }

            for (let change of turnOn) {
                this.setFret(change[0], change[1], true);
            }
        }

        return valid && !!turnOff.length && !!turnOn.length;
    }

    getScrollToFret() {
        // look at highlighted frets on fretboard and get median
        const highlightedFrets = [];
        for (let stringIndex in this.strings) {
            for (let fretValue in this.strings[stringIndex]) {
                if (this.strings[stringIndex][fretValue]) {
                    const highlightedFret =
                        +fretValue - STANDARD_TUNING[stringIndex];
                    highlightedFrets.push(highlightedFret);
                }
            }
        }

        highlightedFrets.sort();
        const minFret = highlightedFrets[0];
        const maxFret = highlightedFrets[highlightedFrets.length - 1];
        return (maxFret + minFret) / 2;
    }

    setName(label: LabelTypes) {
        const chords = Object.keys(SHAPES) as Array<ChordTypes>;
        let rootIdx;
        let rootName: NoteTypes;
        let chordName: ChordTypes;

        loop1: for (let i = 0; i < chords.length; i++) {
            let chordShape = getNotes(SHAPES[chords[i]]);
            let temp = Array(12)
                .fill(false)
                .map((_, i) => this.notes[i]);
            for (let j = 0; j < chordShape.length; j++) {
                if (isEqual(temp, chordShape)) {
                    rootIdx = j;
                    chordName = chords[i];
                    break loop1;
                } else {
                    temp = rotate(temp);
                }
            }
        }

        this.rootIdx = rootIdx;
        this.chordName = chordName;

        return this.getName(label);
    }

    getName(label: LabelTypes) {
        if (
            typeof this.rootIdx === "undefined" ||
            typeof this.chordName === "undefined"
        ) {
            const result = [];
            for (let i = 0; i < 12; i++) {
                if (this.notes[i]) {
                    let note = new NoteUtil(i);
                    result.push(note.getName(label));
                }
            }
            return result.join(", ");
        }

        let rootName;
        if (label === "sharp") {
            rootName = SHARP_NAMES[this.rootIdx];
        } else if (label === "flat") {
            rootName = FLAT_NAMES[this.rootIdx];
        }

        return `${rootName}~~${this.chordName}`;
    }

    copy(): FretboardUtil {
        return new FretboardUtil(
            copy(this.notes),
            copy(this.strings),
            this.rootIdx,
            this.chordName,
            this.visible
        );
    }

    toJSON(): FretboardUtilType {
        return {
            notes: copy(this.notes),
            strings: copy(this.strings),
            rootIdx: this.rootIdx,
            chordName: this.chordName,
            visible: this.visible,
        };
    }
}
