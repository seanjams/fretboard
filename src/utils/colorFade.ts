function normalizeRgb(hexOrRgb: string) {
    let result;
    let base;
    if (hexOrRgb.startsWith("rgb")) {
        result = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i.exec(hexOrRgb);
        base = 10;
    } else {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexOrRgb);
        base = 16;
    }

    return result && base
        ? {
              r: parseInt(result[1], base),
              g: parseInt(result[2], base),
              b: parseInt(result[3], base),
          }
        : null;
}

function lerp(a: number, b: number, u: number) {
    return (1 - u) * a + u * b;
}

export function colorFade(
    startHex: string,
    endHex: string,
    percentage: number
) {
    const start = normalizeRgb(startHex);
    const end = normalizeRgb(endHex);
    if (!start || !end) return null;

    const r = Math.floor(lerp(start.r, end.r, percentage));
    const g = Math.floor(lerp(start.g, end.g, percentage));
    const b = Math.floor(lerp(start.b, end.b, percentage));
    return `rgb(${r},${g},${b})`;
}

// test:

// let p = 0;
// const interval = setInterval(() => {
//     if (p >= 1) clearInterval(interval);

//     console.log(fade("#FF9A41", "#C1BFB5", p));
//     p += 0.05;
// }, 100);
