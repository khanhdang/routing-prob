
var nodes = [];
var dim_x = 2;
var dim_y = 2;
var fimage,fimage2;
var P = 0.7;
var P_sol = 0.05;
var record_P = [];
var real_P = 0;
var button;
var input;
var buttonP, buttonX, buttonS, buttonRes;
var values;
var Nloops = 200;
var arrival = [];
var arrival_rate;
var statArr = [];
var statP = [];


function setup() {
  createCanvas(400,420);
  //nodes = new NodeX[dim_x][dim_y];
  fimage = loadImage("./assests/failed_link.png");
  fimage2 = loadImage("./assests/failed_link90.png");
  resetSketch();
  
  button = createButton("run 1 test");
  button.mousePressed(resetSketch);
  button.position(340,400);
  
  input = createInput();
  input.position(0,400);
  buttonP = createButton("set P");
  buttonP.position(180,400);
  buttonP.mousePressed(setP);
  
  buttonP = createButton("reset stat");
  buttonP.position(240,400);
  buttonP.mousePressed(resetStat);
  
  inputL = createInput();
  inputL.position(0,430);
  buttonL = createButton("set Loop");
  buttonL.position(180,430);
  buttonL.mousePressed(setL);
  
  inputRes = createInput();
  inputRes.position(0,460);
  buttonRes = createButton("set P resolution");
  buttonRes.position(180,460);
  buttonRes.mousePressed(setRes);
  
  buttonX = createButton("run the test");
  buttonX.mousePressed(runTest);
  buttonX.position(0,490);
  
  buttonS = createButton("save to text");
  buttonS.mousePressed(saveText);
  buttonS.position(90,490);
}
function saveText() {
  var content = "";
  for (var i = 0; i < statArr.length; i++) {
    content += statP[i] + "\t" + statArr[i] + "\n";
  }
  uri = "data:application/octet-stream," + encodeURIComponent(content);
  location.href = uri;

}
function runTest(){
  statP = [];
  statArr = [];
  for (P=0;P<=1.0; P=P+P_sol){
    arrival = [];
    arrival_rate = 0;
    record_P = [];
    
    for (var z=0; z<Nloops; z++){
      resetSketch();
    }
    console.log("Real healthy prob: "+real_P);
    var successes = 0;
    for (var i = 0; i < arrival.length; i++){
      if (arrival[i] == "done")
        successes++;
    }
    arrival_rate = successes/arrival.length;
    console.log("Sucessful rate: "+arrival_rate);
    statP.push(real_P);
    statArr.push(arrival_rate);
  }
}

function resetStat(){
  P = 0.7;
  record_P =[];
}

function setL(){
  Nloops = inputL.value();
  console.log("You set to run "+Nloops+" loops.");
  inputL.value('');
  for (var z=0; z<Nloops; z++){
    resetSketch();
  }
}

function setRes() {
  P_sol = inputRes.value();
}

function setP() {
  P = input.value();
  console.log("You just set P="+P);
  input.value('');
}

function resetSketch(){
  for (var i=0; i<dim_x;i++) {
    nodes[i] = [];
    for (var j=0; j<dim_y; j++) {
      nodes[i][j] = new NodeX();
      nodes[i][j].x = 100+i*200;
      nodes[i][j].y = 100+j*200;
      if (i<dim_x-1) {
        nodes[i][j].link_x =getLinkstatus(P);
        record_P.push(nodes[i][j].link_x);
      } else 
        nodes[i][j].link_x = false;
      if (j<dim_y-1) {
        nodes[i][j].link_y =getLinkstatus(P);
        record_P.push(nodes[i][j].link_y);
      } else
        nodes[i][j].link_y = false;
        
      if (i===0 && j===0)
        nodes[i][j].packet = true;
      else
        nodes[i][j].packet = false;
    }
  }
  var total_true = 0;
  for (i=0; i < record_P.length; i++){
    if (record_P[i])
      total_true++;
  }
  real_P = total_true/record_P.length;
  var success;
  success = NetworkRoute();
  arrival.push(success);
}
function draw() {
  background(250);
  noStroke();
  fill(244);
  rect(0,0,400,400);
  //noStroke();
  fill(0);
  text("Healthy probability: P="+P+"| real P="+real_P, 0, 10);

  text("Resolution of P="+P_sol+"| # loops="+Nloops, 0, 30);

  for (var i=0; i<dim_x;i++) {
    for (var j=0; j<dim_y; j++) {
      strokeWeight(5);
      if (i<dim_x-1){
        if (nodes[i][j].link_x) {
          stroke(160,160,0);
          line(nodes[i][j].x,nodes[i][j].y,nodes[i+1][j].x,nodes[i+1][j].y);
          
        } else {
          stroke(160,0,0);  
          line(nodes[i][j].x,nodes[i][j].y,nodes[i+1][j].x,nodes[i+1][j].y);
          image(fimage, nodes[i][j].x+90, nodes[i][j].y-15, 20, 30);

        }
        
      }
      if (j<dim_y-1){
        if (nodes[i][j].link_y) {
          stroke(160,160,0);
          line(nodes[i][j].x,nodes[i][j].y,nodes[i][j+1].x,nodes[i][j+1].y);
          //image(fimage, 190, 90, 20, 20);

        } else {
          stroke(160,0,0);  
          line(nodes[i][j].x,nodes[i][j].y,nodes[i][j+1].x,nodes[i][j+1].y);
          image(fimage2, nodes[i][j].x-15, nodes[i][j].y+90, 30, 20);

        }
       
        
      }
    }
  }
  
  for (i=0; i<dim_x;i++) {
    for (j=0; j<dim_y; j++) {
      nodes[i][j].display();
      //console.log(i+","+j+"--"+nodes[i][j].route(2,2));
    }
  }
  
  
}

function NetworkRoute(){
  var route_res;
  for ( i=0; i<dim_x;i++) {
    for (j=0; j<dim_y; j++) {
      nodes[i][j].display();
      //console.log(i+","+j+"--"+nodes[i][j].route(2,2));
      route_res = nodes[i][j].route(i,j,1,1);
      switch (route_res) {
        case "none":
          break;
        case "drop":
          //nodes[i][j].packet = false;
          nodes[i][j].pcolor = color(255,0,1);
          //console.log("("+i+","+j+"): drop");
          return "drop";
        case "done":
          nodes[i][j].pcolor = color(1,1,255);
          //nodes[i][j].packet = false;
          //console.log("("+i+","+j+"): done");
          return "done";
        case "x":
          //nodes[i][j].packet = false;
          nodes[i+1][j].packet = true;
          //console.log("("+i+","+j+"): x");
          break;
        case "y":
          //nodes[i][j].packet = false;
          nodes[i][j+1].packet = true;
          //console.log("("+i+","+j+"): y");
          break;
        default:
          break;
      }
      
    }
  }
}

function NodeX(){
  this.x = 10;
  this.y = 10;
  this.diameter = 30;
  this.link_x = true;
  this.link_y = false;
  
  this.packet = true;
  this.psize = 15;
  this.pcolor = color(40,255,150);
  
  this.display = function(){
    fill(150, 189, 100);
    stroke(10);
    strokeWeight(1);
    noStroke();
    ellipse(this.x, this.y, this.diameter, this.diameter);

    if (this.packet) {
      fill(this.pcolor);
      rect(this.x-(this.psize/2),this.y-(this.psize/2), this.psize, this.psize);
    }
  }
  
  this.route = function(curr_x, curr_y, addr_x, addr_y){
    //console.log(addr_x+"--"+addr_y);
    //console.log(this.x+"--"+this.y);
    if (this.packet) {
      if (curr_x == addr_x && curr_y == addr_y)
        return "done";
      else if (this.link_x)
        return "x";
      else if (this.link_y)
        return "y";
      else
        return "drop";
    } else {
      return "none";
    }
  }
}


function getLinkstatus(p_link) {
  var maximum = 100;
  var minimum = 1;
  var thres = p_link*maximum;
  var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  if (randomnumber > thres)
    return false;
  else
    return true;
  
}