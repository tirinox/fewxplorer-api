function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function simpleProgression(start, end) {
    return Array(end - start + 1)
        .fill(0)
        .map((element, index) => index + start)
}

function nowTS() {
    return Math.floor((new Date()).getTime() / 1000)
}


module.exports = {
    timeout,
    simpleProgression,
    nowTS
}
