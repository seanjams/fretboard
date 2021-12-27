import { Howl } from "howler";
import { StringSwitchType } from "../types";
import {
    STANDARD_TUNING,
    mod,
    FLAT_NAMES,
    STRING_SIZE,
    HIGHLIGHTED,
} from "../utils";
import { Store } from "./store";

import String_0_E from "../assets/audio/String_0_E.json";
import String_1_A from "../assets/audio/String_1_A.json";
import String_2_D from "../assets/audio/String_2_D.json";
import String_3_G from "../assets/audio/String_3_G.json";
import String_4_B from "../assets/audio/String_4_B.json";
import String_5_E from "../assets/audio/String_5_E.json";

import SOUND_STRING_0_E_OGG from "../assets/audio/String_0_E.ogg";
import SOUND_STRING_0_E_MP3 from "../assets/audio/String_0_E.mp3";
import SOUND_STRING_1_A_OGG from "../assets/audio/String_1_A.ogg";
import SOUND_STRING_1_A_MP3 from "../assets/audio/String_1_A.mp3";
import SOUND_STRING_2_D_OGG from "../assets/audio/String_2_D.ogg";
import SOUND_STRING_2_D_MP3 from "../assets/audio/String_2_D.mp3";
import SOUND_STRING_3_G_OGG from "../assets/audio/String_3_G.ogg";
import SOUND_STRING_3_G_MP3 from "../assets/audio/String_3_G.mp3";
import SOUND_STRING_4_B_OGG from "../assets/audio/String_4_B.ogg";
import SOUND_STRING_4_B_MP3 from "../assets/audio/String_4_B.mp3";
import SOUND_STRING_5_E_OGG from "../assets/audio/String_5_E.ogg";
import SOUND_STRING_5_E_MP3 from "../assets/audio/String_5_E.mp3";

// Types
export interface AudioStateType {
    stringSounds: Howl[];
    isLoaded: boolean;
}

// Reducers
export const audioReducers = {
    playNote(
        state: AudioStateType,
        stringIndex: number,
        fretIndex: number
    ): AudioStateType {
        const noteName =
            FLAT_NAMES[mod(STANDARD_TUNING[stringIndex] + fretIndex, 12)];
        const fretKey = `${stringIndex}_${fretIndex}_${noteName.replace(
            "♭",
            "b"
        )}`;
        const stringSound = state.stringSounds[stringIndex];

        if (stringSound) {
            stringSound.stop();
            stringSound.play(fretKey);
        }
        return state;
    },

    strumChord(
        state: AudioStateType,
        fretboard: StringSwitchType
    ): AudioStateType {
        // figure out which notes are highlighted on each string
        // get the rightmost value
        // play chord with very small delay between notes
        let chordSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretIndex = -1;
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED) fretIndex = i;
            }
            if (fretIndex >= 0) chordSounds.push([+stringIndex, fretIndex]);
        }

        if (chordSounds.length) {
            let playCount = 0;
            let STRUM_DELAY = 70;
            let interval = setInterval(() => {
                const [stringIndex, fretIndex] = chordSounds[playCount];
                this.playNote(state, stringIndex, fretIndex);
                playCount++;
                if (playCount >= chordSounds.length) clearInterval(interval);
            }, STRUM_DELAY);
        }

        return state;
    },

    arpeggiateChord(
        state: AudioStateType,
        fretboard: StringSwitchType
    ): AudioStateType {
        // figure out which notes are highlighted on each string
        // construct notes to be played forward and backwards
        // play chord with medium delay between notes
        let arpeggioSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED)
                    arpeggioSounds.push([+stringIndex, i]);
            }
        }

        arpeggioSounds = arpeggioSounds.concat(
            arpeggioSounds.slice(0, -1).reverse()
        );

        let playCount = 0;
        let STRUM_DELAY = 200;
        let interval = setInterval(() => {
            const [stringIndex, fretIndex] = arpeggioSounds[playCount];
            this.playNote(state, stringIndex, fretIndex);
            playCount++;
            if (playCount >= arpeggioSounds.length) clearInterval(interval);
        }, STRUM_DELAY);

        return state;
    },
};

// Store
export class AudioStore extends Store<AudioStateType, typeof audioReducers> {
    constructor() {
        super(DEFAULT_AUDIO_STATE(), audioReducers);
    }
}

// Default State

export function DEFAULT_AUDIO_STATE(): AudioStateType {
    // const names = [];
    // for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    //     for (let i = 0; i < STRING_SIZE; i++) {
    //         const name = FLAT_NAMES[mod(i + STANDARD_TUNING[stringIndex], 12)];
    //         names.push(`${stringIndex}_${i}_${name}.ogg`);
    //     }
    // }

    const stringJson = {
        String_0_E,
        String_1_A,
        String_2_D,
        String_3_G,
        String_4_B,
        String_5_E,
    };

    const soundUrls: {
        [key in keyof typeof stringJson]: [string, string];
    } = {
        String_0_E: [SOUND_STRING_0_E_OGG, SOUND_STRING_0_E_MP3],
        String_1_A: [SOUND_STRING_1_A_OGG, SOUND_STRING_1_A_MP3],
        String_2_D: [SOUND_STRING_2_D_OGG, SOUND_STRING_2_D_MP3],
        String_3_G: [SOUND_STRING_3_G_OGG, SOUND_STRING_3_G_MP3],
        String_4_B: [SOUND_STRING_4_B_OGG, SOUND_STRING_4_B_MP3],
        String_5_E: [SOUND_STRING_5_E_OGG, SOUND_STRING_5_E_MP3],
    };

    function createHowl(name: keyof typeof stringJson): Howl {
        const sprite = stringJson[name].sprite as {
            [name: string]: [number, number];
        };
        const urls = soundUrls[name];

        return new Howl({
            src: urls,
            autoplay: false,
            loop: false,
            volume: 0.1,
            preload: true,
            sprite: sprite,
            // onplay: function () {
            //     console.log("Playing!", name);
            // },
            // onplayerror: function (e, code) {
            //     console.log("Play Error", name, e, code);
            // },
            // onend: function () {
            //     console.log("Finished!", name);
            // },
            // onload: function () {
            //     console.log("Loaded!", name);
            // },
            // onloaderror: function (e, code) {
            //     console.log("Load Error", name, e, code);
            // },
        });
    }

    return {
        stringSounds: [
            createHowl("String_0_E"),
            createHowl("String_1_A"),
            createHowl("String_2_D"),
            createHowl("String_3_G"),
            createHowl("String_4_B"),
            createHowl("String_5_E"),
        ],
        isLoaded: false,
    };
}
