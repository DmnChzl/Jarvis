/**
 * @method rgbGuard
 * @param {string} str Input Text
 * @returns {number[]} Red, Green, Blue
 */
export const rgbGuard = (str: string): [number, number, number] => {
  const regExp = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
  const matches = str.match(regExp);

  if (!matches) {
    throw new Error('Invalid RGB Format! Expected: rgb(66,133,244)');
  }

  const red = parseInt(matches[1]);
  const green = parseInt(matches[2]);
  const blue = parseInt(matches[3]);

  if (red > 255 || green > 255 || blue > 255) {
    throw new Error('Invalid RGB Value! Expected: 0 <= value <= 255');
  }

  return [red, green, blue];
};

export const rgbToHex = (str: string): string => {
  try {
    const [red, green, blue] = rgbGuard(str);
    return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).substring(1).toUpperCase()}`;
  } catch (err) {
    console.warn((err as Error).message);
    return str;
  }
};

export const hexToRgb = (str: string): string => {
  const regExp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const matches = str.match(regExp);

  if (!matches) {
    console.warn('Invalid HEX Format! Expected: #4285F4');
    return str;
  }

  const red = parseInt(matches[1], 16);
  const green = parseInt(matches[2], 16);
  const blue = parseInt(matches[3], 16);

  return `rgb(${red},${green},${blue})`;
};

export const rgbToHsl = (str: string): string => {
  try {
    let [red, green, blue] = rgbGuard(str);

    red /= 255;
    green /= 255;
    blue /= 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let hue = 0;
    let sat, lum;

    lum = (max + min) / 2;

    if (max === min) {
      hue = sat = 0; // Zero Hue / Saturation (Gray)
    } else {
      const diff = max - min;
      sat = lum > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case red:
          hue = (green - blue) / diff + (green < blue ? 6 : 0);
          break;
        case green:
          hue = (blue - red) / diff + 2;
          break;
        case blue:
          hue = (red - green) / diff + 4;
          break;
      }

      hue *= 60;
    }

    hue = Math.round(hue);
    sat = Math.round(sat * 100);
    lum = Math.round(lum * 100);

    return `hsl(${hue},${sat}%,${lum}%)`;
  } catch (err) {
    console.warn((err as Error).message);
    return str;
  }
};

/**
 * @method hslGuard
 * @param {string} str Input Text
 * @returns {number[]} Hue, Saturation, Lightness
 */
export const hslGuard = (str: string): [number, number, number] => {
  const regExp = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const matches = str.match(regExp);

  if (!matches) {
    throw new Error('Invalid HSL Format! Expected: hsl(217,89%,61%)');
  }

  const hue = parseInt(matches[1]);
  let saturation = parseInt(matches[2]);
  let lightness = parseInt(matches[3]);

  if (hue < 0 || hue > 360) {
    throw new Error('Invalid Hue Value! Expected: 0 <= value <= 360');
  }
  if (saturation < 0 || saturation > 100) {
    throw new Error('Invalid Saturation Value! Expected: 0% <= value <= 100%');
  }
  if (lightness < 0 || lightness > 100) {
    throw new Error('Invalid Lightness Value! Expected: 0% <= value <= 100%');
  }

  return [hue, saturation, lightness];
};

export const hslToRgb = (str: string): string => {
  try {
    let [hue, saturation, lightness] = hslGuard(str);

    saturation /= 100;
    lightness /= 100;

    // ? Chroma represents the intensity of the color.
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    // ? Intermediate value used to adjust the mixture of red, green, and blue based on the hue.
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    // ? Offset that adjusts the RGB values to include the effect of brightness.
    const m = lightness - c / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (hue >= 0 && hue < 60) {
      red = c;
      green = x;
      blue = 0;
    } else if (hue >= 60 && hue < 120) {
      red = x;
      green = c;
      blue = 0;
    } else if (hue >= 120 && hue < 180) {
      red = 0;
      green = c;
      blue = x;
    } else if (hue >= 180 && hue < 240) {
      red = 0;
      green = x;
      blue = c;
    } else if (hue >= 240 && hue < 300) {
      red = x;
      green = 0;
      blue = c;
    } else if (hue >= 300 && hue < 360) {
      red = c;
      green = 0;
      blue = x;
    }

    red = Math.round((red + m) * 255);
    green = Math.round((green + m) * 255);
    blue = Math.round((blue + m) * 255);

    return `rgb(${red},${green},${blue})`;
  } catch (err) {
    console.warn((err as Error).message);
    return str;
  }
};

export const rgbToHwb = (str: string): string => {
  try {
    let [red, green, blue] = rgbGuard(str);

    red /= 255;
    green /= 255;
    blue /= 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let hue;

    if (max === min) {
      hue = 0; // Zero Hue (Gray)
    } else if (max === red) {
      hue = ((green - blue) / (max - min)) * 60;
    } else if (max === green) {
      hue = ((blue - red) / (max - min)) * 60 + 120;
    } else {
      hue = ((red - green) / (max - min)) * 60 + 240;
    }

    if (hue < 0) hue += 360;

    const whiteness = min * 100;
    const blackness = (1 - max) * 100;

    return `hwb(${Math.round(hue)},${Math.round(whiteness)}%,${Math.round(blackness)}%)`;
  } catch (err) {
    console.warn((err as Error).message);
    return str;
  }
};

/**
 * @method hwbGuard
 * @param {string} str Input Text
 * @returns {number[]} Hue, Whiteness, Blackness
 */
const hwbGuard = (str: string): [number, number, number] => {
  const regExp = /^hwb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const matches = str.match(regExp);

  if (!matches) {
    throw new Error('Invalid HWB Format! Expected: hwb(217,26%,4%)');
  }

  const hue = parseInt(matches[1]);
  let whiteness = parseInt(matches[2]);
  let blackness = parseInt(matches[3]);

  if (hue < 0 || hue > 360) {
    throw new Error('Invalid Hue Value! Expected: 0 <= value <= 360');
  }
  if (whiteness < 0 || whiteness > 100) {
    throw new Error('Invalid Whiteness Value! Expected: 0% <= value <= 100%');
  }
  if (blackness < 0 || blackness > 100) {
    throw new Error('Invalid Blackness Value! Expected: 0% <= value <= 100%');
  }

  return [hue, whiteness, blackness];
};

export const hwbToRgb = (str: string): string => {
  try {
    let [hue, whiteness, blackness] = hwbGuard(str);

    whiteness /= 100;
    blackness /= 100;

    const ratio = whiteness + blackness;
    if (ratio > 1) {
      whiteness /= ratio;
      blackness /= ratio;
    }

    // ? Chroma represents the intensity of the color.
    const c = 1 - whiteness - blackness;
    // ? Intermediate value used to adjust the mixture of red, green, and blue based on the hue.
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));

    let red = 0;
    let green = 0;
    let blue = 0;

    if (hue >= 0 && hue < 60) {
      red = c;
      green = x;
      blue = 0;
    } else if (hue >= 60 && hue < 120) {
      red = x;
      green = c;
      blue = 0;
    } else if (hue >= 120 && hue < 180) {
      red = 0;
      green = c;
      blue = x;
    } else if (hue >= 180 && hue < 240) {
      red = 0;
      green = x;
      blue = c;
    } else if (hue >= 240 && hue < 300) {
      red = x;
      green = 0;
      blue = c;
    } else if (hue >= 300 && hue < 360) {
      red = c;
      green = 0;
      blue = x;
    }

    red = Math.round((red + whiteness) * 255);
    green = Math.round((green + whiteness) * 255);
    blue = Math.round((blue + whiteness) * 255);

    return `rgb(${red},${green},${blue})`;
  } catch (err) {
    console.warn((err as Error).message);
    return str;
  }
};
