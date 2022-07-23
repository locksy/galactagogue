'use strict';

var BASELINES = {
  hue: [0, 360],
  sat: [0.1, 1],
  lum: [0.2, 0.9]
};

var HUE = {
  orange: [20, 47],
  yellow: [47, 74],
  green: [74, 168],
  cyan: [168, 201],
  blue: [201, 251],
  violet: [251, 280],
  magenta: [280, 355],
  red: [355, 380],
  warm: [281, 441],
  cool: [81, 281],
  random: [0, 360]
};

var SATURATION = {
  neutral: [0.1, 0.2],
  pale: [0.2, 0.4],
  muted: [0.4, 0.7],
  rich: [0.7, 1]
};

var LUMINOSITY = {
  dark: [0.2, 0.4],
  midtone: [0.4, 0.7],
  light: [0.7, 0.9]
};

var DESCRIPTOR = {
  deep: {
    sat: [0.6, 1],
    lum: [0, 0.4]
  },
  bold: {
    sat: [0.8, 1],
    lum: [0.3, 0.6]
  },
  bright: {
    sat: [0.7, 1],
    lum: [0.5, 0.75]
  },
  vibrant: {
    sat: [0.9, 1],
    lum: [0.6, 0.8]
  },
  dull: {
    sat: [0.2, 0.6],
    lum: [0.6, 0.3]
  },
  pastel: {
    sat: [0.6, 1],
    lum: [0.75, 1]
  },
  neon: {
    sat: [0.95, 1],
    lum: [0.5, 0.7]
  },
  black: {
    lum: [0, 0.2],
    sat: [0, 0.1]
  },
  gray: {
    lum: [0.2, 0.9],
    sat: [0, 0.1]
  },
  white: {
    lum: [0.95, 1],
    sat: [0, 0.1]
  },
};

var buildTermList = function() {
  var fullObject = Object.assign({}, HUE);
  var terms = [];
  fullObject = Object.assign(fullObject, SATURATION);
  fullObject = Object.assign(fullObject, LUMINOSITY);
  fullObject = Object.assign(fullObject, DESCRIPTOR);
  for(var prop in fullObject) {
    terms.push(prop);
  }
  return terms;
};

var TERMS = buildTermList();

var hue2rgb = function(p, q, t) {
  if (t < 0) {t += 1;}
  if (t > 1) {t -= 1;}
  if (t < 1/6) {return p + (q - p) * 6 * t;}
  if (t < 1/2) {return q;}
  if (t < 2/3) {return p + (q - p) * (2/3 - t) * 6;}
  return p;
};

var randomFloat = function(min, max) {
  return Math.random() * (max - min) + min;
};

var matchToProperty = function(descriptors, type, baseline) {
  for(let prop in type) {
    if(descriptors instanceof Array) {
      for(let word of descriptors) {
        if (word === prop) {
          return type[prop];
        }
      }
    }
    else {
      if (descriptors === prop) {
        return type[prop];
      }
    }
  }
  return baseline;
};

var isValidTerm = function(word) {
  for(let term of TERMS) {
    if(word === term) {
      return true;
    }
  }
  return false;
};

var containsValidTerms = function(query) {
  var descriptors = query.includes(' ') ? query.split(' ') : query;
  if(descriptors instanceof Array) {
    var results = [];
    for(let descriptor of descriptors) {
      results.push(isValidTerm(descriptor));
    }
    for(let result of results) {
      if(!result) {
        return false;
      }
    }
    return true;
  }
  else {
    return isValidTerm(query);
  }
};

var translateQueryString = function(query) {
  var descriptors = query.includes(' ') ? query.split(' ') : query;
  var subType = matchToProperty(descriptors, DESCRIPTOR, false);
  var result = {
    hue: matchToProperty(descriptors, HUE, BASELINES.hue),
    sat: subType ? subType.sat : matchToProperty(descriptors, SATURATION, BASELINES.sat),
    lum: subType ? subType.lum : matchToProperty(descriptors, LUMINOSITY, BASELINES.lum)
  };
  return result;
};

var handleQuery = function(query) {
  if(query) {
    if(query.exactMatch || query.namedColor) {
      return query;
    }
    else if(containsValidTerms(query)) {
      return translateQueryString(query);
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
};

var Khroma = {
  generate: function(format, query) {
    let range = handleQuery(query);
    if(query && !range) {
      return false;
    }
    else {
      range = range || BASELINES;
      const h = query && query.exactMatch ? query.hue : Math.round(randomFloat(...range.hue))/360;
      const s = query && query.exactMatch ? query.sat : randomFloat(...range.sat);
      const l = query && query.exactMatch ? query.lum : randomFloat(...range.lum);
      const result = format === 'hsl' ? [h, s, l] : Khroma.convert('hsl', format)([h, s, l]);
      return result;
    }
  },
  adjust: function(rgb, delta) {
    var lab = Khroma.convert('rgb', 'lab')(rgb);
    lab[0] += delta*50;
    var result =  Khroma.convert('lab', 'rgb')(lab).map((n) => {
      return Math.round(n);
    });
    return result;
  },
  classify: function(rgb) {
    var hsl = Khroma.convert('rgb', 'hsl')(rgb);
    var roundHsl = hsl[0].toFixed(3);
    hsl[0] = roundHsl <= 0.056 ? hsl[0] + 1 : hsl[0];
    var color = {
      hue: Math.round(hsl[0]*360),
      sat: hsl[1],
      lum: hsl[2]
    };
    var getType = function(value, type) {
      var result;
      for(var prop in type) {
        var inRange = value.toFixed(2) >= type[prop][0] && value.toFixed(2) <= type[prop][1];
        if(inRange) {
          result = prop;
          return result;
        }
      }
      console.log('got one');
      return `${value} unknown`;
    };
    return {
      hue: getType(color.hue, HUE),
      sat: getType(color.sat, SATURATION),
      lum: getType(color.lum, LUMINOSITY)
    };
  },
  convert: function(from, to) {
    switch(from) {
      case 'hex':
        if(to === 'rgb') {
          return function(hex){
            hex = hex.replace('#','');
            var r = parseInt(hex.substring(0,2), 16);
            var g = parseInt(hex.substring(2,4), 16);
            var b = parseInt(hex.substring(4,6), 16);
            return [r, g, b];
          };
        }
        else {
          return function(hex) {
            return Khroma.convert('rgb', to)(Khroma.convert('hex', 'rgb')(hex));
          };
        }
        break;
      case 'hsl':
        if(to === 'rgb') {
          return function(hsl) {
            var h = hsl[0];
            var s = hsl[1];
            var l = hsl[2];
            var r, g, b;

            if (s === 0) {
              r = g = b = l;
            }
            else {
              var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              var p = 2 * l - q;

              r = hue2rgb(p, q, h + 1/3);
              g = hue2rgb(p, q, h);
              b = hue2rgb(p, q, h - 1/3);
            }

            return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];
          };
        }
        else {
          return function(hsl) {
            return Khroma.convert('rgb', to)(Khroma.convert('hsl', 'rgb')(hsl));
          };
        }
        break;
      case 'lab':
        if(to === 'rgb') {
          return function(lab){
            var y = (lab[0] + 16) / 116,
                x = lab[1] / 500 + y,
                z = y - lab[2] / 200,
                r, g, b;

            x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
            y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
            z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

            r = x *  3.2406 + y * -1.5372 + z * -0.4986;
            g = x * -0.9689 + y *  1.8758 + z *  0.0415;
            b = x *  0.0557 + y * -0.2040 + z *  1.0570;

            r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
            g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
            b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

            return [Math.max(0, Math.min(1, r)) * 255,
                    Math.max(0, Math.min(1, g)) * 255,
                    Math.max(0, Math.min(1, b)) * 255];
          };
        }
        else {
          return function(lab) {
            return Khroma.convert('rgb', to)(Khroma.convert('lab', 'rgb')(lab));
          };
        }
        break;
      case 'hsv':
        if(to === 'rgb') {
          return function(hsv) {
            var r, g, b;
            var h = hsv[0];
            var s = hsv[1];
            var v = hsv[2];
            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i % 6) {
              case 0: r = v, g = t, b = p; break;
              case 1: r = q, g = v, b = p; break;
              case 2: r = p, g = v, b = t; break;
              case 3: r = p, g = q, b = v; break;
              case 4: r = t, g = p, b = v; break;
              case 5: r = v, g = p, b = q; break;
            }

            return [ r * 255, g * 255, b * 255 ];
          };
        }
        else {
          return function(hsv) {
            return Khroma.convert('rgb', to)(Khroma.convert('hsv', 'rgb')(hsv));
          };
        }
        break;
      case 'frgb':
        if(to === 'rgb') {
          return function(rgb) {
            var compressed = rgb.map((n) => {
              return Math.round(n*255);
            }, 0);
            return compressed;
          };
        }
        break;
      case 'rgb':
        switch(to) {
          case 'hex':
            return function(rgb) {
              return ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
            };
          case 'frgb':
            return function(rgb) {
              var compressed = rgb.map((n) => {
                return (n/255);
              }, 0);
              return compressed;
            };
          case 'hsl':
            return function(rgb) {
              var r = rgb[0]/255;
              var g = rgb[1]/255;
              var b = rgb[2]/255;

              var max = Math.max(r, g, b), min = Math.min(r, g, b);
              var h, s, l = (max + min) / 2;

              if (max === min) {
                h = s = 0;
              }
              else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                  case g: h = (b - r) / d + 2; break;
                  case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
              }
              return [h, s, l];
            };
          case 'yuv':
            return function(rgb) {
              var y = rgb[0] *  0.299000 + rgb[1] *  0.587000 + rgb[2] *  0.114000;
              var u = rgb[0] * -0.168736 + rgb[1] * -0.331264 + rgb[2] *  0.500000 + 128;
              var v = rgb[0] *  0.500000 + rgb[1] * -0.418688 + rgb[2] * -0.081312 + 128;
              return [y, u, v];
            };
          case 'lab':
            return function(rgb){
              var r = rgb[0]/255,
                  g = rgb[1]/255,
                  b = rgb[2]/255,
                  x, y, z;

              r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
              g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
              b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

              x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
              y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
              z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

              x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
              y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
              z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

              return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
            };
          case 'hsv':
            return function(rgb) {
              var r = rgb[0]/255;
              var g = rgb[1]/255;
              var b = rgb[2]/255;

              var max = Math.max(r, g, b), min = Math.min(r, g, b);
              var h, s, v = max;

              var d = max - min;
              s = max === 0 ? 0 : d / max;

              if (max === min) {
                h = 0; // achromatic
              } else {
                switch (max) {
                  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                  case g: h = (b - r) / d + 2; break;
                  case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
              }

              return [ h, s, v ];
            };
        }
    }
  }
};
