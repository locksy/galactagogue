// width and height of window
const WIDTH = window.innerWidth, 
      HEIGHT = window.innerHeight;

// maximum number of points visible per frame
var numOfPoints = 200;    

// arrays for storing point radius and position data
var pointsX, pointsY, pointsRadius;

// current angle to draw points from
var angle = 0;

// colors to cycle through
var colors = [
  "white"
];

// currently assigned color
var currentColorIndex;

window.onload = function(e) {

    // canvas setup
    var canvas = document.getElementById("canvas");
    var c = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // initial setup
    init(c);
    
    // main logic loop
    var loop = function() {
        update();
        render(c);
        window.requestAnimationFrame(loop, canvas);
    }
    window.requestAnimationFrame(loop, canvas);
}

function init(c) {

  // initialize point data arrays
  pointsX = new Array(numOfPoints);
  pointsY = new Array(numOfPoints);
  pointsRadius = new Array(numOfPoints);

  // initialize color
  currentColorIndex = 0;

}

function update() {

  // update angle
  angle += Math.PI * 4 / numOfPoints;
  if (angle > Math.PI * 2) {
    angle -= Math.PI * 2;
  }

  // update color
  if (currentColorIndex < colors.length - 1) {
    currentColorIndex++;
  } else {
    currentColorIndex = 0;
  }

  // update positions of points
  for (var i = 0; i < numOfPoints; i++) {

    // calculate distance from center of screen
    var distance = Math.pow(Math.sqrt(WIDTH * WIDTH + HEIGHT * HEIGHT), i / numOfPoints);

    // calculate and assign calculated values
    pointsX[i] = WIDTH / 2 + Math.cos(angle - (i + 1) / numOfPoints * Math.PI * 2) * distance;
    pointsY[i] = HEIGHT / 2 + Math.sin(angle - (i + 1) / numOfPoints * Math.PI * 2) * distance;
    pointsRadius[i] = distance / numOfPoints * 2;

  }
}

function render(c) {

  // screen fade out effect
  c.fillStyle = "black";
  c.globalAlpha = 0.05;
  c.fillRect(0, 0, WIDTH, HEIGHT);
  c.globalAlpha = 1;

  // draw points at their current positions
  for (var i = 0; i < numOfPoints; i++) {

    // only draw points that are visible in the window
    if (
      (pointsX[i] >= -pointsRadius[i] && pointsX[i] <= WIDTH + pointsRadius[i]) && 
      (pointsY[i] >= -pointsRadius[i] && pointsY[i] <= HEIGHT + pointsRadius[i])
    ) {

      // draw single point
      c.fillStyle = colors[currentColorIndex];
      c.beginPath();
      c.arc(pointsX[i], pointsY[i], pointsRadius[i], 0, 2 * Math.PI);
      c.fill();
      c.closePath();
  
    }
  }
}

// function for generating rgba() string
function rgb(r, g, b) {
  return "rgba(" + [r, g, b].join(",") + ",1)";
}