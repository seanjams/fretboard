import {
    LabelTypes,
    StatusTypes,
    DragStatusTypes,
    FretboardType,
    FretboardDiffType,
} from "../../types";
import {
    HIGHLIGHTED,
    SELECTED,
    NOT_SELECTED,
    SHARP_NAMES,
    FLAT_NAMES,
    colorFade,
    gold,
    fretThemeGrey,
} from "../../utils";

export function getTopMargin(diameter: number) {
    // As circles resize, this top margin keeps them centered
    return `calc(50% - ${diameter / 2}px)`;
}

export function inRange(value: number, leftBound: number, rightBound: number) {
    return value >= leftBound && value <= rightBound;
}

export function isWithinBoundary(
    boundary: DOMRect,
    clientX: number,
    clientY: number,
    threshold: number = 0
) {
    const { top, left, bottom, right } = boundary;
    return (
        clientX <= right + threshold &&
        clientX >= left - threshold &&
        clientY <= bottom + threshold &&
        clientY >= top - threshold
    );
}

export function getBackgroundColor(
    fretStatus: number,
    playProgress: number,
    colors: string[]
) {
    const progress = Math.min(Math.max(0, playProgress), 1);
    const primaryColor = colors[1] || "#FABF26";
    const playingColor = colors[0] || gold;
    const isSelected = fretStatus !== NOT_SELECTED;
    const isHighlighted = fretStatus === HIGHLIGHTED;
    const secondaryColor = fretThemeGrey;

    return isHighlighted
        ? colorFade(playingColor, primaryColor, progress) || primaryColor
        : isSelected
        ? secondaryColor
        : "transparent";
}

export function getFretStatus(
    fretboard: FretboardType,
    stringIndex: number,
    fretIndex: number | undefined
) {
    return fretIndex !== undefined && fretboard
        ? fretboard.strings[stringIndex][fretIndex]
        : NOT_SELECTED;
}

export function getDiffFretIndex(
    diff: FretboardDiffType,
    stringIndex: number,
    fretIndex: number | undefined
) {
    if (
        !diff ||
        fretIndex === undefined ||
        diff[stringIndex][fretIndex] === undefined
    )
        return undefined;
    const diffSteps = diff[stringIndex][fretIndex].slide;
    return Math.abs(diffSteps) < 9999 ? fretIndex + diffSteps : undefined;
}

export function getDiffEmptyFill(
    diff: FretboardDiffType,
    stringIndex: number,
    fretIndex: number,
    fill = false
) {
    if (!diff || !diff[stringIndex][fretIndex]) return false;

    return fill
        ? diff[stringIndex][fretIndex].slide >= 9999
        : diff[stringIndex][fretIndex].slide <= -9999;
}

export function getFretName(fretValue: number, label: LabelTypes) {
    return label === "sharp" ? SHARP_NAMES[fretValue] : FLAT_NAMES[fretValue];
}

export function getHighlightedModeNextStatus(
    fromStatus: StatusTypes,
    fromDragStatus: DragStatusTypes,
    isDragging: boolean
): [StatusTypes, DragStatusTypes] {
    // click NOT_SELECTED => HIGHLIGHTED
    // click HIGHLIGHTED => SELECTED
    // click SELECTED => HIGHLIGHTED

    // hold NOT_SELECTED => HIGHLIGHTED, drag should highlight any note it touches
    // dragStatus = on, all notes
    // hold SELECTED => HIGHLIGHTED, drag should only highlight selected notes
    // dragStatus = on, selected notes only
    // hold HIGHLIGHTED => SELECTED, drag should only turn off highlighted notes
    // dragStatus = off, highlighted notes only
    let toStatus = fromStatus;
    let toDragStatus = fromDragStatus;
    if (isDragging) {
        // user is dragging over this fret in highlighted mode
        if (fromDragStatus === "on-selected") {
            if (fromStatus === SELECTED) toStatus = HIGHLIGHTED;
        } else if (fromDragStatus === "off-selected") {
            if (fromStatus === HIGHLIGHTED) toStatus = SELECTED;
        } else if (fromDragStatus === "on-all") {
            toStatus = HIGHLIGHTED;
        } else if (fromDragStatus === "off-all") {
            toStatus = SELECTED;
        }
    } else {
        // user is clicking on this fret in highlighted mode
        toStatus = fromStatus === HIGHLIGHTED ? SELECTED : HIGHLIGHTED;
        toDragStatus =
            fromStatus === NOT_SELECTED
                ? "on-all"
                : fromStatus === SELECTED
                ? "on-selected"
                : "off-selected";
    }

    return [toStatus, toDragStatus];
}

export function getSelectedModeNextStatus(
    fromStatus: StatusTypes,
    fromDragStatus: DragStatusTypes,
    isDragging: boolean
): [StatusTypes, DragStatusTypes] {
    // click NOT_SELECTED => SELECTED
    // click HIGHLIGHTED => NOT_SELECTED
    // click SELECTED => NOT_SELECTED

    // hold NOT_SELECTED => SELECTED, drag should select any note it touches
    // hold SELECTED => NOT_SELECTED, drag should deselect any note it touches
    // hold HIGHLIGHTED => NOT_SELECTED, drag should deselect any note it touches
    let toStatus = fromStatus;
    let toDragStatus = fromDragStatus;
    if (isDragging) {
        // user is dragging over this fret in selected mode
        if (fromDragStatus === "on-all" || fromDragStatus === "on-selected") {
            toStatus = SELECTED;
        } else if (
            fromDragStatus === "off-all" ||
            fromDragStatus === "off-selected"
        ) {
            toStatus = NOT_SELECTED;
        }
    } else {
        // user is clicking on this fret in selected mode
        toStatus = fromStatus ? NOT_SELECTED : SELECTED;
        toDragStatus = fromStatus ? "on-all" : "off-all";
    }

    return [toStatus, toDragStatus];
}
