/*
  slider css: //https://codepen.io/jonnaru/pen/JjXyKYM
  http://www.blooberry.com/indexdot/css/propindex/all.htm
  https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
  
  TODO:
  Refine references
  Fix css
  rename ldistance lineDistance
  rename pdistance pointDistance
  rename genLine editorLine
  add more presets
  add more lines, rotated
  move gx,gy. only show if within the editor
  rename canvasd
  allow canvasd to determine all dimensions
  rename getpoint to getEditorPointInfo
  rename drawline (drawFractal?)
  show fractal dimension
  add randomness w/slider
  group functionality in source code
  remove oldx,oldy 
  limit number of segments
*/

var canvasd = [600, 600];
var radio;
var controlsX = 10;
var controlsY = canvasd[1] - 200 + 25;
var sliders = [
  [1, 60, 6, controlsX, controlsY, 100, "Recursion Depth"],
  [1, 20, 15, controlsX, controlsY + 20, 100, "Minimum Segment"],
  [1, 8, 1, controlsX, controlsY + 40, 100, "Sides"],
];

var gen;
var genIndex = "Koch";
var genLine = [250, 500, 590, 500];
var generators = {
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
    3,
  ],
  Briar: [
    [
      [0, 0],
      [0.3, 0],
      [0.333, 0.4],
      [0.366, 0],
      [1, 0],
    ],
    16,
    5,
    1,
  ],
  // Cacti
  // Kanagawa:
  Scorpion: [
    [
      [0, 0],
      [0, 0.01],
      [0.07, 0.24],
      [0.14, 0.38],
      [0.11, -0.14],
      [0.22, -0.15],
      [0.59, -0.09],
      [0.4, -0.17],
      [0.52, -0.18],
      [0.64, -0.17],
      [0.68, -0.09],
      [0.89, -0.19],
      [0.79, -0.08],
      [1, 0],
    ],
    16,
    20,
    1,
  ],
  what: [
    [
      [0, 0],
      [0.18, 0.03],
      [0.27, 0.17],
      [0.29, 0.49],
      [0.35, 0.17],
      [0.49, 0.02],
      [0.66, -0.1],
      [1, 0],
    ],
    6,
    20,
    1,
  ],
  mushroom: [
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
    20,
    1,
  ],
  lineup: [
    [
      [0, 0],
      [0.12, 0.02],
      [0.28, -0.02],
      [0.36, 0.29],
      [0.42, 0.42],
      [0.51, 0.31],
      [0.5, 0.15],
      [0.32, -0.03],
      [1, 0],
    ],
    6,
    20,
    1,
  ],
  dragons: [
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
    6,
    20,
    1,
  ],
  // porcupine: [[[0.07,-0.08],[ 0.60,0.08],[ 0.05,0.04],[ 0.81,0.24 ],[0.59,0],[1,0]],6,20,1],
  fern: [
    [
      [0, 0],
      [0.68, 0.13],
      [0.5, 0.32],
      [0.82, 0.13],
      [0.5, 0],
      [1, 0],
    ],
    20,
    20,
    1,
  ],
  easter: [
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
    6,
    20,
    1,
  ],
  tiara: [
    [
      [0, 0],
      [0.62, -0.16],
      [0.34, 0.02],
      [0.5, 0.16],
      [0.66, 0.02],
      [0.38, -0.16],
      [1, 0],
    ],
    8,
    20,
    1,
  ],
  windmills: [
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
    20,
    1,
  ],
  castle: [
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
    6,
    20,
    1,
  ],
  mandelbrot: [
    [
      [0, 0],
      [0.14, -0.06],
      [0.5, 0.12],
      [0.6, 0.29],
      [0.5, 0],
      [0.4, 0.29],
      [0.5, 0.12],
      [0.86, -0.06],
      [1, 0],
    ],
    6,
    20,
    1,
  ],
  //circle: [[[0,0],[.10,0],[ 0,0.05],[ 1,-0.05],[ 0.90,0],[1,0]],60,20,1],
  honeycomb: [
    [
      [0, 0],
      [0.25, 0.25],
      [0.75, 0.26],
      [0.25, 0.26],
      [0.75, 0.25],
      [1, 0],
    ],
    10,
    20,
    1,
  ],
  ring: [
    [
      [0, 0],
      [0.3, -0.15],
      [0.75, 0.25],
      [0.25, 0.25],
      [0.7, -0.15],
      [1, 0],
    ],
    10,
    20,
    1,
  ],
  menger: [
    [
      [0, 0],
      [0.5, 0],
      [0.25, 0.29],
      [0.75, 0.29],
      [0.5, 0],
      [1, 0],
    ],
    10,
    20,
    1,
  ],
  Custom: [
    [
      [0, 0],
      [1, 0],
    ],
    6,
    5,
    2,
  ],
};

var maxDepth = 0;
var minSeg = 0;
var sides = 0;
var lines = 0;

var radius = 7;
var gradius;
var gen = []; // set of generator points
var gen2canv = []; // gen to canvas
var edit2canv = []; // editor to canvas
var canv2edit = []; // canvas to editor

var mp = false;
var md = false;
var mdnode = 0;
var mm = false;
var oldx = 0;
var oldy = 0;

// see https://stackoverflow.com/questions/7486085/copy-array-by-value
let clone = (arr) =>
  Array.from(arr, (item) => (Array.isArray(item) ? clone(item) : item));

// see https://stackoverflow.com/questions/10892267/html5-canvas-transformation-algorithm-finding-object-coordinates-after-applyin
// but http://www.johndcook.com/blog/2010/01/19/dont-invert-that-matrix/
function calculateMatrices(hyp, x1, y1, x2, y2, x0, y0, sx = 1, sy = 1) {
  //hyp = sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
  let opp = y2 - y1;
  let adj = x2 - x1;
  let as = opp / hyp;
  let ac = adj / hyp;
  let dx = x1 - x0;
  let dy = y1 - y0;

  edit2canv = [
    [hyp * sx * ac, hyp * as, dx],
    [hyp * -as, hyp * sy * ac, dy],
    [0, 0, 1],
  ];

  canv2edit = [
    [(sx * ac) / hyp, as / hyp, (-dx * sx * ac - dy * as) / hyp],
    [-as / hyp, (sy * ac) / hyp, (dx * as - dy * sy * ac) / hyp],
    [0, 0, 1],
  ];
}

// Takes a point in the form [x,y,1], returns a translated point in the same form
function dot(pt, arr) {
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

// Takes an array of points [[x, y], ...], returns a translated array of points
function xlat(pts, arr) {
  let a = [];
  for (pt of pts) {
    a.push(dot([pt[0], pt[1], 1], arr));
  }
  return a;
}

// see https://en.wikipedia.org/wiki/Linear_equation#General_(or_standard)_form
// see https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
function ldistance(x1, y1, x2, y2, x0, y0) {
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

function pdistance(x1, y1, x2, y2) {
  return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function getpoint(x0, y0) {
  let isclose = false;
  let isnode = false;
  let inode = 0;
  let isfixed = false;
  let x = x0;
  let y = y0;
  for (let i = 0; i < gen.length; i++) {
    if (pdistance(gen[i][0], gen[i][1], x0, y0) <= gradius) {
      isclose = true;
      isnode = true;
      inode = i;
      if (i == 0 || i == gen.length - 1) {
        isfixed = true;
      }
      x = gen[i][0];
      y = gen[i][1];
      break;
    }
  }
  if (!isclose) {
    for (let i = 1; i < gen.length; i++) {
      x1 = gen[i - 1][0];
      y1 = gen[i - 1][1];
      x2 = gen[i][0];
      y2 = gen[i][1];
      [d, xn, yn] = ldistance(x1, y1, x2, y2, x0, y0);
      if (d <= gradius) {
        if (
          ((xn >= x1 && xn <= x2) || (xn >= x2 && xn <= x1)) &&
          ((yn >= y1 && yn <= y2) || (yn >= y2 && yn <= y1))
        ) {
          isclose = true;
          inode = i;
          x = xn;
          y = yn;
          break;
        }
      }
    }
  }
  return [isclose, isnode, inode, isfixed, x, y];
}

function fracture(hyp, x1, y1, x2, y2, x0 = 0, y0 = 0, sx = 1, sy = 1) {
  //hyp = sqrt(hyp);//(y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
  let opp = y2 - y1;
  let adj = x2 - x1;
  let as = opp / hyp;
  let ac = adj / hyp;
  let dx = x1 - x0;
  let dy = y1 - y0;

  let gen2canv = [
    [hyp * sx * ac, hyp * -as, dx],
    [hyp * as, hyp * sy * ac, dy],
    [0, 0, 1],
  ];

  let v = [];
  for (const p of gen) {
    xp = [p[0], p[1], 1];
    xp = dot(xp, gen2canv);
    v.push([xp[0], xp[1]]);
  }
  return v;
}

function drawline(dep, x1, y1, x2, y2) {
  const dist = pdistance(x1, y1, x2, y2);
  const d = dep + 1;
  if (d > maxDepth || dist < radius) {
    if (lines++ < 100000) {
      line(x1, height - y1, x2, height - y2);
    }
  } else {
    const l = fracture(dist, x1, y1, x2, y2);
    for (let i = 1; i < l.length; i++) {
      drawline(d, l[i - 1][0], l[i - 1][1], l[i][0], l[i][1]);
    }
  }
}

function getUserInput() {
  let g = radio.value();
  if (g != genIndex) {
    if (genIndex == "Custom") {
      // save current settings to custom if we are changing to a preset
      generators["Custom"] = [clone(gen), maxDepth, minSeg, sides];
    }
    gen = clone(generators[g][0]);
    maxDepth = generators[g][1];
    minSeg = generators[g][2];
    sides = generators[g][3];
    sliders[0][7].value(maxDepth);
    sliders[1][7].value(minSeg);
    sliders[2][7].value(sides);
    genIndex = g;
  }
  maxDepth = sliders[0][7].value();
  minSeg = sliders[1][7].value();
  sides = sliders[2][7].value();
}

function drawEditor() {
  let mx = mouseX;
  let my = mouseY;
  let gx;
  let gy;
  let x1;
  let y1;
  let x2;
  let y2;
  [[gx, gy]] = xlat([[mx, my]], canv2edit);
  text(
    "gx " + gx.toFixed(2) + " gy " + gy.toFixed(2),
    controlsX + 10,
    controlsY + 75
  );
  if (md && mdnode != 0) {
    // TODO: prevent assignment to same coordinates as neighbors
    gen[mdnode][0] = gx;
    gen[mdnode][1] = gy;
  }

  for (let i = 1; i < gen.length; i++) {
    [[x1, y1], [x2, y2]] = xlat(
      [
        [gen[i - 1][0], gen[i - 1][1]],
        [gen[i][0], gen[i][1]],
      ],
      edit2canv
    );
    line(x1, y1, x2, y2);
  }

  var [isclose, isnode, inode, isfixed, x, y] = getpoint(gx, gy);
  [[cx, cy]] = xlat([[x, y]], edit2canv);

  if (mp) {
    //text("mouse pressed", 10, height - 10);
    if (mx != oldx || my != oldy) {
      //text("mouse dragged", 10, height - 20);
      oldx = mx;
      oldy = my;
    }
  }

  if (isclose) {
    fill("black");
    for (i = 0; i < gen.length; i++) {
      [[x, y]] = xlat([[gen[i][0], gen[i][1]]], edit2canv);
      circle(x, y, radius);
    }
    if (isnode) {
      fill("red");
    } else {
      fill("white");
    }
    circle(cx, cy, radius);
    fill("black");
  }
}

function mousePressed() {
  if (!md && !mp) {
    mp = true;
    [[gx, gy]] = xlat([[mouseX, mouseY]], canv2edit);
    var [isclose, isnode, inode, isfixed, x, y] = getpoint(gx, gy);
    if (isclose && !isnode) {
      gen.splice(inode, 0, [x, y]);
    } else if (isnode && !isfixed && keyIsDown(SHIFT)) {
      gen.splice(inode, 1);
    }
  }
}

function mouseReleased() {
  mp = false;
  md = false;
  mdnode = 0;
}

function mouseDragged() {
  if (!md) {
    md = true;
    [[gx, gy]] = xlat([[mouseX, mouseY]], canv2edit);
    var [isclose, isnode, inode, isfixed, x, y] = getpoint(gx, gy);
    if (isnode && !isfixed) {
      mdnode = inode;
    } else {
      mdnode = 0;
    }
  }
}

function setupEditor() {
  let x1 = genLine[0];
  let y1 = genLine[1];
  let x2 = genLine[2];
  let y2 = genLine[3];
  let hyp = pdistance(x1, y1, x2, y2);
  calculateMatrices(hyp, x1, y1, x2, y2, 0, 1, 1, -1);
  [[x1, y1], [x2, y2]] = xlat(
    [
      [0, 0],
      [0, radius],
    ],
    canv2edit
  );
  gradius = pdistance(x1, y1, x2, y2);
}

function setup() {
  createCanvas(canvasd[0], canvasd[1]);
  for (s of sliders) {
    x = createSlider(s[0], s[1], s[2]);
    x.position(s[3], s[4]);
    x.size(s[5]);
    x.class("slider");
    s.push(x); // last element is the slider object
  }
  radio = createRadio();
  radio.position(controlsX, 10);
  for (let key in generators) {
    radio.option(key);
  }
  radio.style("width", width - 20 + "px");
  radio.style("font-size", "12px");
  radio.style("font-family", "Arial, Helvetica, sans-serif");
  radio.selected(genIndex);
  gen = clone(generators[genIndex][0]);
  setupEditor();
}

function draw() {
  getUserInput();
  background(192);
  for (s of sliders) {
    text(s[7].value(), s[3] + s[5] + 10, s[4] + 12);
    text(s[6], s[3] + s[5] + 35, s[4] + 12);
  }
  drawEditor();
  lines = 0;
  drawline(1, 50, 300, 550, 300);
  text(lines, 10, height - 10);
}
