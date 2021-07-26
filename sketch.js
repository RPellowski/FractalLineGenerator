/*
  Interactive fractal generator
  Inspired by "The Fractal Geometry of Nature" by Mandelbrot
  
  Algorithm:
    Replace each segment of a line with a smaller copy of the line.
    Recursion stops on reaching any of these conditions
      Maximum recursion depth
      Minimum segment length
      Maximum number of line segments drawn

  Implementation details
    Reconcile canvas y-direction to standard y-axis convention
    Recursive algorithm for fractals
    Calculate distance from a line and closest point on it
      (used with the interactive editor)
    Use mouse events (pressed, dragging) for editing generator points
       move (mouse drag)
       add (mouse click when not on a node)
       delete (SHIFT mouse click)
    Perform Rotation/Translation/Scaling with matrix
      (two for editing and one for drawing each fractal line)
*/

// Fixed variables
var canvasDimensions = [600, 600];
var canvasMargin = 30;
var maxLines = 80000;
var radius = 7;
var fractalLine = [
  canvasMargin,
  canvasDimensions[1] / 2,
  canvasDimensions[0] - canvasMargin,
  canvasDimensions[1] / 2,
];

// Adjustable parameters (using slider controls)
var maxDepth = 1;
var minSeg = 1;

// Editor parameters
var editorLine = [
  canvasDimensions[0] / 2,
  canvasDimensions[1] - 150,
  canvasDimensions[0] - canvasMargin - 30,
  canvasDimensions[1] - 150,
];
var editor2canvas = []; // editor to canvas transform matrix
var canvas2editor = []; // canvas to editor transform matrix
var generatorRadius;
var isMouseDragging = false;
var isMousePressed = false;
var draggedNode = 0;

// Control variables (Radio / Sliders / Text)
var controlsX = 20;
var controlsY = canvasDimensions[1] - 150;
var radio;
var sliders = [
  [1, 60, 6, controlsX, controlsY, 100, "Recursion Depth"],
  [1, 20, 15, controlsX, controlsY + 20, 100, "Minimum Segment"],
];
var xylines = [controlsX + 10, controlsY + 65]; // for text display

// Graphic visualizer variables
var generator = []; // set of generator points in use
var lines = 0;
var generatorIndex = "Koch";
var generators = {
  // Preset examples
  Koch: [
    [
      [0, 0],
      [0.333, 0],
      [0.5, (0.333 * 1.732) / 2],
      [0.666, 0],
      [1, 0],
    ],
    20,
    5,
  ],
  Plate57: [
    [
      [0, 0],
      [0.3, 0],
      [0.325, 0.45],
      [0.35, 0],
      [1, 0],
    ],
    16,
    10,
  ],
  Fern: [
    [
      [0, 0],
      [0.68, 0.13],
      [0.5, 0.32],
      [0.82, 0.13],
      [0.5, 0],
      [1, 0],
    ],
    20,
    8,
  ],
  Dragons: [
    [
      [0, 0],
      [0.11, 0.15],
      [0.2, 0.28],
      [0.35, 0.41],
      [0.29, 0.14],
      [0.27, 0.01],
      [0.4, -0.05],
      [0.44, -0.05],
      [1, 0],
    ],
    20,
    10,
  ],
  Easter: [
    [
      [0, 0],
      [0.24, -0.07],
      [0.59, -0.09],
      [0.5, 0.27],
      [0.38, 0.24],
      [0.36, 0.12],
      [0.39, -0.07],
      [1, 0],
    ],
    20,
    20,
  ],
  Mushroom: [
    [
      [0, 0],
      [-0.05, -0.19],
      [0.23, -0.2],
      [0.39, 0.35],
      [0.72, -0.24],
      [0.81, -0.08],
      [1, 0],
    ],
    20,
    10,
  ],
  Windmills: [
    [
      [0, 0],
      [0, -0.05],
      [0.45, -0.04],
      [0.44, -0.02],
      [0.47, 0.48],
      [0.41, -0.02],
      [0.69, 0.02],
      [0.93, 0.02],
      [1, 0],
    ],
    20,
    10,
  ],
  Castle: [
    [
      [0, 0],
      [0, -0.15],
      [0.33, -0.15],
      [0.33, 0.05],
      [0.66, 0.05],
      [0.66, -0.15],
      [1, -0.15],
      [1, 0],
    ],
    20,
    10,
  ],
  QofH: [
    [
      [0, 0],
      [0.3, -0.15],
      [0.75, 0.25],
      [0.25, 0.25],
      [0.7, -0.15],
      [1, 0],
    ],
    20,
    10,
  ],
  Sierpinski: [
    [
      [0, 0],
      [0.5, 0],
      [0.25, 0.433],
      [0.75, 0.433],
      [0.5, 0],
      [1, 0],
    ],
    20,
    7,
  ],
  Custom: [
    [
      [0, 0],
      [1, 0],
    ],
    20,
    20,
  ],
};

// Helper function for copying arrays
// Ref: https://stackoverflow.com/questions/7486085/copy-array-by-value
let clone = (arr) =>
  Array.from(arr, (item) => (Array.isArray(item) ? clone(item) : item));

// Called once, by editor setup
// Ref: https://stackoverflow.com/questions/10892267/html5-canvas-transformation-algorithm-finding-object-coordinates-after-applyin
// Ref: http://www.johndcook.com/blog/2010/01/19/dont-invert-that-matrix/
function calculateMatrices(hyp, x1, y1, x2, y2, x0, y0, sx = 1, sy = 1) {
  let opp = y2 - y1;
  let adj = x2 - x1;
  let as = opp / hyp;
  let ac = adj / hyp;
  let dx = x1 - x0;
  let dy = y1 - y0;

  editor2canvas = [
    [hyp * sx * ac, hyp * as, dx],
    [hyp * -as, hyp * sy * ac, dy],
    [0, 0, 1],
  ];

  canvas2editor = [
    [(sx * ac) / hyp, as / hyp, (-dx * sx * ac - dy * as) / hyp],
    [-as / hyp, (sy * ac) / hyp, (dx * as - dy * sy * ac) / hyp],
    [0, 0, 1],
  ];
}

// Take a point in the form [x,y,1], return a transformed point in the same form
function matMul(pt, arr) {
  if (!(pt instanceof Array) || !(arr instanceof Array)) {
    return [];
  }
  let p = [];
  for (let i = 0; i < arr.length; i++) {
    s = 0;
    for (let j = 0; j < pt.length; j++) {
      s += pt[j] * arr[i][j];
    }
    p.push(s);
  }
  return p;
}

// Take an array of points [[x, y], ...], return a transformed array of points
function transform(pts, arr) {
  let x, y;
  let a = [];
  for (const pt of pts) {
    [x, y, _] = matMul([pt[0], pt[1], 1], arr);
    a.push([x, y]);
  }
  return a;
}

// Return the distance to a line and the closest point on that line
// Ref: https://en.wikipedia.org/wiki/Linear_equation#General_(or_standard)_form
// Ref: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
function lineDistance(x1, y1, x2, y2, x0, y0) {
  let a = y1 - y2;
  let b = x2 - x1;
  let c = x1 * y2 - x2 * y1;
  if (a == 0 && b == 0) {
    return width;
  }
  let num = a * x0 + b * y0 + c;
  let den = a * a + b * b;
  let x = (b * (b * x0 - a * y0) - a * c) / den;
  let y = (a * (-b * x0 + a * y0) - b * c) / den;
  return [abs(num) / sqrt(den), x, y];
}

// Return the distance between two points
function pointDistance(x1, y1, x2, y2) {
  return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Perform a set of calculations based on the mouse position
// Find the closest node or closest point on a line between two closest nodes
function getEditorPointInfo(x0, y0) {
  let isClose = false;
  let isNode = false;
  let iNode = 0;
  let isFixed = false;
  let x = x0;
  let y = y0;
  for (let i = 0; i < generator.length; i++) {
    if (
      pointDistance(generator[i][0], generator[i][1], x0, y0) <= generatorRadius
    ) {
      isClose = true;
      isNode = true;
      iNode = i;
      if (i == 0 || i == generator.length - 1) {
        isFixed = true;
      }
      x = generator[i][0];
      y = generator[i][1];
      break;
    }
  }
  if (!isClose) {
    // Check if mouse is close to a line segment between two nodes
    let x1, y1, x2, y2, d, xn, yn;
    for (let i = 1; i < generator.length; i++) {
      x1 = generator[i - 1][0];
      y1 = generator[i - 1][1];
      x2 = generator[i][0];
      y2 = generator[i][1];
      [d, xn, yn] = lineDistance(x1, y1, x2, y2, x0, y0);
      if (d <= generatorRadius) {
        // Fix issue when mouse can't land on a horizontal or vertical segment
        const epsilon = 1e-3;
        if (abs(xn - x1) < epsilon) {
          xn = x1;
        }
        if (abs(yn - y1) < epsilon) {
          yn = y1;
        }
        if (
          ((xn >= x1 && xn <= x2) || (xn >= x2 && xn <= x1)) &&
          ((yn >= y1 && yn <= y2) || (yn >= y2 && yn <= y1))
        ) {
          isClose = true;
          iNode = i;
          x = xn;
          y = yn;
          break;
        }
      }
    }
  }
  return [isClose, isNode, iNode, isFixed, x, y];
}

// Called by drawFractal, which is recursing on every line segment
// Calculation intensive code path- generates a new matrix for every line segment
function fracture(hyp, x1, y1, x2, y2, x0 = 0, y0 = 0, sx = 1, sy = 1) {
  let opp = y2 - y1;
  let adj = x2 - x1;
  let as = opp / hyp;
  let ac = adj / hyp;
  let dx = x1 - x0;
  let dy = y1 - y0;

  let generator2canvas = [
    [hyp * sx * ac, hyp * -as, dx],
    [hyp * as, hyp * sy * ac, dy],
    [0, 0, 1],
  ];

  let v = [];
  let xp;
  for (const p of generator) {
    xp = [p[0], p[1], 1];
    xp = matMul(xp, generator2canvas);
    v.push([xp[0], xp[1]]);
  }
  return v;
}

function drawFractal(depth, x1, y1, x2, y2) {
  if (lines >= maxLines) {
    return;
  }
  const d = depth + 1;
  const distance = pointDistance(x1, y1, x2, y2);
  if (d > maxDepth || distance < minSeg) {
    // Reconcile to the canvas in the y direction
    line(x1, height - y1, x2, height - y2);
    lines++;
  } else {
    const l = fracture(distance, x1, y1, x2, y2);
    for (let i = 1; i < l.length; i++) {
      drawFractal(d, l[i - 1][0], l[i - 1][1], l[i][0], l[i][1]);
    }
  }
}

function readAndDrawControls() {
  // Read
  let g = radio.value();
  if (g != generatorIndex) {
    if (generatorIndex == "Custom") {
      // Save current settings to custom if we are changing to a preset
      generators["Custom"] = [clone(generator), maxDepth, minSeg];
    }
    generator = clone(generators[g][0]);
    maxDepth = generators[g][1];
    minSeg = generators[g][2];
    sliders[0][7].value(maxDepth);
    sliders[1][7].value(minSeg);
    generatorIndex = g;
  }
  maxDepth = sliders[0][7].value();
  minSeg = sliders[1][7].value();

  // Draw
  for (const s of sliders) {
    text(s[7].value(), s[3] + s[5] + 10, s[4] + 12);
    text(s[6], s[3] + s[5] + 35, s[4] + 12);
  }
}

function readAndDrawEditor() {
  let gx, gy, x1, y1, x2, y2;
  [[gx, gy]] = transform([[mouseX, mouseY]], canvas2editor);
  text(
    "x " + gx.toFixed(2) + " y " + gy.toFixed(2) + " lines " + lines,
    xylines[0],
    xylines[1]
  );

  if (isMouseDragging && draggedNode != 0) {
    // TODO: prevent assignment to same coordinates as neighbors
    generator[draggedNode][0] = gx;
    generator[draggedNode][1] = gy;
  }

  // Draw generator lines
  for (let i = 1; i < generator.length; i++) {
    [[x1, y1], [x2, y2]] = transform(
      [
        [generator[i - 1][0], generator[i - 1][1]],
        [generator[i][0], generator[i][1]],
      ],
      editor2canvas
    );
    line(x1, y1, x2, y2);
  }

  var [isClose, isNode, iNode, isFixed, x, y] = getEditorPointInfo(gx, gy);
  [[cx, cy]] = transform([[x, y]], editor2canvas);

  // Draw generator nodes
  if (isClose) {
    push();
    fill("black");
    // Draw all nodes on editor
    for (i = 0; i < generator.length; i++) {
      [[x, y]] = transform([[generator[i][0], generator[i][1]]], editor2canvas);
      circle(x, y, radius);
    }
    // Draw node we are editing
    if (isNode) {
      if (isMousePressed) {
        stroke("white");
      }
      fill("red");
    } else {
      fill("white");
    }
    circle(cx, cy, radius);
    fill("black");
    pop();
  }
}

function mousePressed() {
  if (!isMouseDragging && !isMousePressed) {
    let gx, gy;
    isMousePressed = true;
    [[gx, gy]] = transform([[mouseX, mouseY]], canvas2editor);
    var [isClose, isNode, iNode, isFixed, x, y] = getEditorPointInfo(gx, gy);
    if (isClose && !isNode) {
      // Add a new node
      generator.splice(iNode, 0, [x, y]);
    } else if (isNode && keyIsDown(SHIFT) && !isFixed) {
      // Remove a node (unless fixed endpoint)
      generator.splice(iNode, 1);
    }
  }
}

function mouseReleased() {
  isMousePressed = false;
  isMouseDragging = false;
  draggedNode = 0;
}

function mouseDragged() {
  if (!isMouseDragging) {
    let gx, gy;
    isMouseDragging = true;
    [[gx, gy]] = transform([[mouseX, mouseY]], canvas2editor);
    var [isClose, isNode, iNode, isFixed, x, y] = getEditorPointInfo(gx, gy);
    if (isNode && !isFixed) {
      draggedNode = iNode;
    } else {
      draggedNode = 0;
    }
  }
}

// Called once, from setup
function setupControls() {
  for (let s of sliders) {
    let x = createSlider(s[0], s[1], s[2]);
    x.position(s[3], s[4]);
    x.size(s[5]);
    s.push(x); // save the slider object as the last element
  }
  radio = createRadio();
  radio.position(controlsX, 10);
  for (let key in generators) {
    radio.option(key);
  }
  radio.style("width", width - 80 + "px");
  radio.style("font-size", "12px");
  radio.style("font-family", "Arial, Helvetica, sans-serif");
  radio.selected(generatorIndex);
}

// Called once, from setup
function setupEditor() {
  let x1 = editorLine[0];
  let y1 = editorLine[1];
  let x2 = editorLine[2];
  let y2 = editorLine[3];
  let hyp = pointDistance(x1, y1, x2, y2);
  // The editor line is never rotated; do a reflection on y by negating the scale factor
  calculateMatrices(hyp, x1, y1, x2, y2, 0, 1, 1, -1);
  [[x1, y1], [x2, y2]] = transform(
    [
      [0, 0],
      [0, radius],
    ],
    canvas2editor
  );
  generatorRadius = pointDistance(x1, y1, x2, y2);
  generator = clone(generators[generatorIndex][0]);
}

function setup() {
  createCanvas(canvasDimensions[0], canvasDimensions[1]);
  setupControls();
  setupEditor();
}

function draw() {
  background(192);
  readAndDrawControls();
  readAndDrawEditor();
  lines = 0;
  drawFractal(
    1,
    fractalLine[0],
    fractalLine[1],
    fractalLine[2],
    fractalLine[3]
  );
}
