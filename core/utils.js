// core utils.js
export function normalizeString(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

export function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

export function drawXMarks(ctx, xSprite, count) {
    const size = 500;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const gap = size + 40;
    const positions = [...Array(count)].map(
        (_, i) => centerX + (i - (count - 1) / 2) * gap - size / 2
    );
    positions.forEach((x) =>
        ctx.drawImage(xSprite, x, centerY - size / 2, size, size)
    );
}

export function gradualVolumeFade() {
    const targetVolume = 0.1;
    const duration = 20000;
    const steps = 60;
    let step = 0;
    const volumeStep = (music.volume - targetVolume) / steps;

    const interval = setInterval(() => {
        step++;
        music.volume = Math.max(targetVolume, music.volume - volumeStep);
        if (step >= steps) clearInterval(interval);
    }, duration / steps);
}
