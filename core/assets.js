//core/assets.js

export const assets = {
    background: loadImage("backdrop.png"),
    splash: loadImage("splashscreen.png"),
    xSprite: loadImage("x.png"),
    countdown: loadImage("countdown.png"),
};

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}
