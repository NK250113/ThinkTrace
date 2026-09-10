export function getTextColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? 'white' : 'black';
}

export function setAccentTextColor() {
    const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color')
    .trim();
    document.documentElement.style.setProperty('--color-accent-text', getTextColor(bgColor));
    return bgColor;
}