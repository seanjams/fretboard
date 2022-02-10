function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
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
    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
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
