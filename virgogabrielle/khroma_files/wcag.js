'use strict';

var checkContrast = function(a, b) {
  let result;
  let contrastratio;
  var color = b;
  var bgcolor = a;

  var L1 = getL(color);
  var L2 = getL(bgcolor);

  if (L1 !== false && L2 !== false) {
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    contrastratio = (Math.round(ratio * 100) / 100);
    if (ratio >= 3) {
      result = 'AA Large';
    } else {
      result = 'Fail';
    }
    if (ratio >= 4.5) {
      result = 'AA';
    }
    if (ratio >= 7) {
      result = 'AAA';
    }
  } else {
    result = '?';
    contrastratio = '?';
  }

  return {
    rating: result,
    ratio: contrastratio
  };
};

var getL = function(color) {
	let _update;
  if (color.length == 3) {
    var R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
    var G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
    var B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
    _update = true;
  } else if (color.length == 6) {
    var R = getsRGB(color.substring(0, 2));
    var G = getsRGB(color.substring(2, 4));
    var B = getsRGB(color.substring(4, 6));
    _update = true;
  } else {
    _update = false;
  }
  if (_update === true) {
    var L = (0.2126 * R + 0.7152 * G + 0.0722 * B);
    return L;
  } else {
    return false;
  }

};

var getsRGB = function(color) {
  color = getRGB(color);
  if (color !== false) {
    color = color / 255;
    color = (color <= 0.03928) ? color / 12.92 : Math.pow(((color + 0.055) / 1.055), 2.4);
    return color;
  } else {
    return false;
  }
};

var getRGB = function(color) {
  try {
    var color = parseInt(color, 16);
  } catch (err) {
    var color = false;
  }
  return color;
};

var FindRGB = function(q1, q2, hue) {
  if (hue > 360) {
    hue = hue - 360;
  }
  if (hue < 0) {
    hue = hue + 360;
  }
  if (hue < 60) {
    return (q1 + (q2 - q1) * hue / 60);
  } else if (hue < 180) {
    return (q2);
  } else if (hue < 240) {
    return (q1 + (q2 - q1) * (240 - hue) / 60);
  } else {
    return (q1);
  }
};
