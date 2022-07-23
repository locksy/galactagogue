const $ = function(id) {
  return document.getElementById(id)
};

var genRandomNumber = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var genRandomFloat = function(min, max) {
  return Math.random() * (max - min) + min;
};

var genRandomColor = function() {
  var rgb = [];
  for(let i = 0; i < 3; i++) {
    rgb.push(genRandomNumber(0,255));
  }
  return rgb;
};

var compressRgb = function(arr) {
  var compressed = arr.map(function(n) {
    return (n/255);
  }, 0);
  return compressed;
};

var sumRgbVals = function(arr) {
  return arr.reduce(function(a, b) {
    return a + b;
  }, 0);
};

var arrayMove = function(arr, fromIndex, toIndex) {
  if (toIndex >= arr.length) {
      let k = toIndex - arr.length;
      while ((k--) + 1) {
          arr.push(undefined);
      }
  }
  arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);
  return arr; // for testing purposes
};

var isOnLightBackground = function(rgb) {
  return rgb[0] + rgb[1] + rgb[2] > 500;
};


var getBrighterColor = function(colors) {
  var sumA = sumRgbVals(colors[0]);
  var sumB = sumRgbVals(colors[1]);
  var light = sumA > sumB ? colors[0] : colors[1];
  var dark = sumB > sumA ? colors[0] : colors[1];
  return {
    lighter: light,
    darker: dark
  };
};

function getTertiaryColor(a, b) {
  var splitComp = function(x,y) {
    var greater = x > y ? x : y;
    var lesser = greater === x ? y : x;
    var split = greater - lesser > (lesser+1) - greater ? ((lesser+greater)/2) : (lesser + 1 + greater)/2;
    var result = split > 1 ? split - 1 : split;
    return result;
  };
  var hslA = Khroma.convert('rgb', 'hsl')(a);
  var hslB = Khroma.convert('rgb', 'hsl')(b);
  var h = splitComp(hslA[0], hslB[0]);
  var s = (hslA[1]+hslB[1])/2;
  var l = (hslA[2]+hslB[2])/2;
  return Khroma.convert('hsl', 'rgb')([h, s, l]);
}

var getColorName = function(color) {
  var hex = Khroma.convert('rgb', 'hex')(color);
  var result  = ntc.name(`#${hex}`);
  var colorName = result[1];
  return colorName;
};

var convertToDuoTone = function(colors, customImage) {
  var value = [];
  var sorted = getBrighterColor(colors);
  var light = customImage ? colors[0] : sorted.lighter;
  var dark = customImage ? colors[1] : sorted.darker;
  value = value.concat(
  [light[0]/256 - dark[0]/256, 0, 0, 0, dark[0]/256]);
  value = value.concat(
  [light[1]/256 - dark[1]/256, 0, 0, 0, dark[1]/256]);
  value = value.concat(
  [light[2]/256 - dark[2]/256, 0, 0, 0, dark[2]/256]);
  value = value.concat([0, 0, 0, 1, 0]);
  return value.join(' ');
};

var getAveRgb = function(a,b,convert) {
  let result = a.map(function(n, index){
    return (n + b[index])/2;
  });
  if(convert) {
    result = Khroma.convert('lab', 'rgb')(result);
    result =  result.map(function(n){
      return +n.toFixed(0);
    });
  }
  return result;
};

var rankArray = function(arr) {
  var itm, a= [], L = arr.length, o= {};
  for(var i= 0; i < L; i++){
      itm= arr[i];
      if(!itm) continue;
      if(o[itm]== undefined) o[itm]= 1;
      else ++o[itm];
  }
  for(var p in o) a[a.length]= {item: p, frequency: o[p]};
  return a.sort(function(a, b){
      return o[b.item]-o[a.item];
  });
};

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

var toHTML = function(node) {
  var temp = document.createElement('div');
  var element;
  temp.innerHTML = node;
  element = temp.childNodes[1] || temp.childNodes[0];
  temp.remove();
  return element;
};

var hasClass = function(elem, klass) {
  return (' ' + elem.className + ' ' ).indexOf( ' '+klass+' ' ) > -1;
};

var closePromo = function() {
  document.querySelector('.promo-sign-up').remove();
};

var showLoader = function(content) {
  var loader = document.querySelector('.bl-container .blackloader');
  loader.innerHTML = content || 'Generating...';
  document.querySelector('.bl-container').style.display = 'table';
};

var hideLoader = function() {
  var loader = document.querySelector('.bl-container .blackloader');
  document.querySelector('.bl-container').style.display = 'none';
};
