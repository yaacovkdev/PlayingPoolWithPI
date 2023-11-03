let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight-100;
let cnv;
let Wall = {
  height: windowHeight,
  width: 200,
  color: 'rgba(0,0,0,1)',
}

let square1 = new Square(1,0);
//                                    v - Change this value n to get n+1 the digit of PI.
let square2 = new Square(Math.pow(100,9), -10);

let collision = 0;

let end_cond = false;

function fillWall(){
  push();
  fill(color(Wall.color));
  stroke(255);
  strokeWeight(2);
  rect(0,0,Wall.width,Wall.height);
  pop();
}

function initEnv(){
  square1.x = 300+Wall.width;
  square2.x = 700+Wall.width;

  combined_M = square1.mass + square2.mass;
}

function fillSquares(){
  push();
  fill(color(0));
  stroke(255);
  strokeWeight(2);
  textAlign(CENTER);

  //square1
  rect(square1.rx, windowHeight-square1.height, square1.width, square1.height);
  fill(color(255));
  text(square1.mass+' KG', square1.rx+square1.width/2, windowHeight-square1.height/2);
  fill(color(0));
  //square2
  rect(square2.rx, windowHeight-square2.height, square2.width, square2.height);
  fill(color(255));
  text(square2.mass+' KG', square2.rx+square2.width/2, windowHeight-square1.height/2);
  fill(color(0));
  pop();
}

function collisionText(){
  push();
  fill(color(255));
  strokeWeight(2);
  textSize(100);
  textAlign(CENTER);
  text(`${collision} collisions`, windowWidth/2, windowHeight/2);
  pop();
}

function endText(){
  push();
  fill(color('rgb(255,220,0)'));
  noStroke();
  textSize(100);
  textAlign(CENTER);
  text(`NO MORE COLLISIONS`, windowWidth/2, windowHeight/2+130);
  pop();
}

function textManager(){
  collisionText();
  if(end_cond){
    endText();
  }
}

function endRender(){
  if(square1.x < square2.x && square1.v >= 0 && square2.v >= 0 
    && square1.v <= square2.v){
      //in this version of p5.js noLoop() runs the frame one last time. 
      //May need different exectution order in the future
      end_cond = true;
      window.clearInterval(end_event);
      noLoop();
    }
}

function elasticV(m1, m2, v1, v2){
  //Found formulas on here
  //https://www.khanacademy.org/science/physics/linear-momentum/elastic-and-inelastic-collisions/a/what-are-elastic-and-inelastic-collisions
  var v1n = (m1 - m2) / (m1+m2) * v1 + (2 * m2) / (m1+m2) * v2;
  var v2n = (2 * m1) / (m1+m2) * v1 + (m2 - m1) / (m1+m2) * v2;
  return [v1n, v2n];
}

//the core mathematics behind this program
function updateSquares(){
  square1.x += square1.v;
  square2.x += square2.v;
  
  //some physics here ig
  //TODO: leave half a pixel for square 2 to be away from square 1,
  if(square1.x+square1.width >= square2.x){
    square1.x = square2.x-square1.width;
    square2.x = square1.x+square1.width;

    //Found formulas on here
    //https://www.khanacademy.org/science/physics/linear-momentum/elastic-and-inelastic-collisions/a/what-are-elastic-and-inelastic-collisions

    var velocities = elasticV(square1.mass, square2.mass, square1.v, square2.v);
    square1.v = velocities[0];
    square2.v = velocities[1];
    collision++;
  }

  //square1 hit the wall.
  if(square1.x <= Wall.width){
    square1.x = Wall.width;
    square1.v *= -1;
    collision++;
  }
}

//stripped down version of function to only do the barebones computations for when there is no visible collisions.
function optimizedUpdateSquares(){
  //square1.x stays at the wall while square2 is needed to calculate it's new position to end the functions execution
  square2.x += square2.v;

  var velocities = elasticV(square1.mass, square2.mass, square1.v, square2.v);
  square1.v = velocities[0] * -1; //because square1 also always hits the wall.
  square2.v = velocities[1];

  collision+=2;
}

function updateManager(){
  //negative while loops are supposed be faster than for loops
  var i = 50000000; //you can play with this variable to suit your hardware power.
  while(--i && square2.x <= Wall.width + square1.width){
    optimizedUpdateSquares();
  }

  updateSquares();

  //this keeps logical square2 morphing into a wall but visually behind square1.
  square2.rx = square2.x;
  //optimized for slightly faster timings
  square1.rx = square1.x;
  
  //fixes position of rendered square 2.
  if(square2.x <= Wall.width + square1.width){
    square2.rx = Wall.width + square1.width;
  }
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('mainDiv');
  cnv.id('mainCanvas');
  frameRate(60);
  initEnv();
}
  
function draw() {
  background(0);
  fillWall();
  updateManager();
  fillSquares();
  textManager();
}

window.onresize = function(){
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight-100;
  resizeCanvas(windowWidth, windowHeight);
  Wall.height = windowHeight;
}

let end_event = window.setInterval(endRender, 10000);