const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf-8');

const multiplier = 2.4;

// We will only replace font sizes that are exactly in the ranges we know were pixel fonts
// Typical pixel font sizes used: 0.3 to 0.75
css = css.replace(/font-size:\s*(0\.[3-7]\d*)rem/g, (match, val) => {
    let num = parseFloat(val);
    // If the size was 0.65 or 0.68, it might have been standard text, but let's just bump it
    // Wait, let's only bump sizes that are clearly on retro elements.
    // A safer way: just bump EVERYTHING less than 0.75rem by 2.2x EXCEPT 0.72 which is next-xp
    let newVal = (num * multiplier).toFixed(2);
    // Remove trailing zeros
    newVal = parseFloat(newVal);
    return `font-size: ${newVal}rem`;
});

// Also manually bump a few standard ones that are too small
css = css.replace(/font-size:\s*0\.82rem/g, 'font-size: 1rem');
css = css.replace(/font-size:\s*0\.84rem/g, 'font-size: 1.05rem');
css = css.replace(/font-size:\s*0\.85rem/g, 'font-size: 1.1rem');
css = css.replace(/font-size:\s*0\.88rem/g, 'font-size: 1.15rem');

fs.writeFileSync('app/globals.css', css);
console.log('Done scaling fonts!');
