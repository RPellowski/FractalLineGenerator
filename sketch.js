var radius = 5;
var gradius;
var gen = [];
var gen2canv = []; // gen to canvas
var canv2gen = []; // canvas to gen

// see https://stackoverflow.com/questions/10892267/html5-canvas-transformation-algorithm-finding-object-coordinates-after-applyin
// but http://www.johndcook.com/blog/2010/01/19/dont-invert-that-matrix/
function calculateMatrices(x1, y1, x2, y2, x0, y0, sx = 1, sy = 1) {
  hyp = sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
  opp = y2 - y1;
  adj = x2 - x1;
  as = opp / hyp;
  ac = adj / hyp;
  dx = x1 - x0;
  dy = y1 - y0;

  gen2canv = [
    [hyp * sx * ac, hyp * as, dx],
    [hyp * -as, hyp * sy * ac, dy],
    [0, 0, 1],
  ];

  canv2gen = [
    [(sx * ac) / hyp, as / hyp, (-dx * sx * ac - dy * as) / hyp],
    [-as / hyp, (sy * ac) / hyp, (dx * as - dy * sy * ac) / hyp],
    [0, 0, 1],
  ];
}

// Taks a point in the form [x,y,1], returns a translated point in the same form
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

function setup() {
  createCanvas(800, 400);
  gen.push([0, 0]);
  gen.push([0.33, 0]);
  gen.push([0.45, 0.4]);
  gen.push([0.466, 0]);
  gen.push([1, 0]);
  calculateMatrices(420, height / 2, width - 20, height / 2, 0, 1, 1, -1);
  [[x1, y1], [x2, y2]] = xlat(
    [
      [0, 0],
      [0, radius],
    ],
    canv2gen
  );
  gradius = sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

var mp = false;
var md = false;
var mdnode = 0;
var mm = false;
var oldx = 0;
var oldy = 0;

// see https://en.wikipedia.org/wiki/Linear_equation#General_(or_standard)_form
// see https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
function ldistance(x1, y1, x2, y2, x0, y0) {
  a = y1 - y2;
  b = x2 - x1;
  c = x1 * y2 - x2 * y1;
  if (a == 0 && b == 0) {
    return width;
  }
  num = a * x0 + b * y0 + c;
  den = a * a + b * b;
  x = (b * (b * x0 - a * y0) - a * c) / den;
  y = (a * (-b * x0 + a * y0) - b * c) / den;
  return [abs(num) / sqrt(den), x, y];
}

function pdistance(x1, y1, x2, y2) {
  return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function getpoint(x0, y0) {
  var isclose = false;
  var isnode = false;
  var inode = 0;
  var isfixed = false;
  var x = x0;
  var y = y0;
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

function draw() {
  background(220);
  mx = mouseX;
  my = mouseY;
  [[gx, gy]] = xlat([[mx, my]], canv2gen);
  //text("gx " + gx + " gy " + gy, 10, height - 40);
  if (md && mdnode != 0) {
    // TODO: prevent assignment to same coordinates as neighbors
    gen[mdnode][0] = gx;
    gen[mdnode][1] = gy;
  }

  for (i = 1; i < gen.length; i++) {
    [[x1, y1], [x2, y2]] = xlat(
      [
        [gen[i - 1][0], gen[i - 1][1]],
        [gen[i][0], gen[i][1]],
      ],
      gen2canv
    );
    line(x1, y1, x2, y2);
  }

  var [isclose, isnode, inode, isfixed, x, y] = getpoint(gx, gy);
  [[cx, cy]] = xlat([[x, y]], gen2canv);

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
      [[x, y]] = xlat([[gen[i][0], gen[i][1]]], gen2canv);
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
    [[gx, gy]] = xlat([[mouseX, mouseY]], canv2gen);
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
    [[gx, gy]] = xlat([[mouseX, mouseY]], canv2gen);
    var [isclose, isnode, inode, isfixed, x, y] = getpoint(gx, gy);
    if (isnode && !isfixed) {
      mdnode = inode;
    } else {
      mdnode = 0;
    }
  }
}
