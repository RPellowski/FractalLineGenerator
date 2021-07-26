const max_depth = 1;
const max_length = 4;
const fact = 0.866;
const koch = true;
if (koch) {
var gen = [
  [0, 0],
  [0.333, 0],
  [0.5, -0.33 * fact],
  [0.666, 0],
  [1, 0],
];
}
else {
var gen = [
  [0, 0],
  [0.35, 0],
  [0.4, -0.4],
  [0.45, 0],
  [1, 0],
];
}
const max_hypsq = max_length * max_length;
function setup() {
  createCanvas(600, 600);
  if (koch) {
    const sx = 50;
    const sy = 150;
    const l = width - sx - sx;
    drawline(1, sx, sy, width - sx, sy);
    drawline(1, width - sx, sy, width / 2, sy + l * fact);
    drawline(1, width / 2, sy + l * fact, 50, sy);
  } else {
    drawline(1, 10, height / 2, width - 10, height / 2);
  }
}
function dot(pts, arr) {
  if (!(pts instanceof Array) || !(arr instanceof Array)) {
    return [];
  }
  let v = [];
  for (let i = 0; i < arr.length; i++) {
    s = 0;
    for (let j = 0; j < pts.length; j++) {
      s += pts[j] * arr[i][j];
    }
    v.push(s);
  }
  return v;
}
function fracture(hyp, x1, y1, x2, y2) {
  opp = y2 - y1;
  adj = x2 - x1;
  s = opp / hyp;
  c = adj / hyp;
  v = [];
  rot = [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
  trn = [
    [1, 0, x1],
    [0, 1, y1],
    [0, 0, 1],
  ];
  scl = [
    [hyp, 0, 0],
    [0, hyp, 0],
    [0, 0, 1],
  ];
  for (const p of gen) {
    xp = [p[0], p[1], 1];
    xp = dot(xp, rot);
    xp = dot(xp, scl);
    xp = dot(xp, trn);
    v.push([xp[0], xp[1]]);
  }
  return v;
}
function drawline(dep, x1, y1, x2, y2) {
  const hypsq = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
  const d = dep + 1;
  if (d > max_depth || hypsq < max_hypsq) {
    line(x1, y1, x2, y2);
  } else {
    const l = fracture(sqrt(hypsq), x1, y1, x2, y2);
    for (let i = 1; i < l.length; i++) {
      drawline(d, l[i - 1][0], l[i - 1][1], l[i][0], l[i][1]);
    }
  }
}
function draw() {
  //background(220);
  //drawline(1, 10, height/2, width - 10, height/2);
}
