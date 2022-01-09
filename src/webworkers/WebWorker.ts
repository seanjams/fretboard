export default (code: () => void) => {
    const codeString = code.toString();
    const blob = new Blob([`(${codeString})()`]);
    return new Worker(URL.createObjectURL(blob));
};
