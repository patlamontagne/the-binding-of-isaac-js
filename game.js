// Compatibilité browser
 var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;
			
//Initialisation
function gameInit(){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	Level.draw(context);
	keyboardEvent();
	minionInit(3);
	fpsCounter();
	animFrame(recursiveAnim);
}

var isPaused = true;
var lastPaused = Date.now();
// Pause
function gameIsPaused(){
	if(keyPause && (Date.now() - lastPaused > 200)){
		if(isPaused) isPaused = false;
		else isPaused = true;
	lastPaused = Date.now();}
	return isPaused;
}

function pauseScreen(context){
	context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);
}

// Loop du jeu
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
function mainloop(){
	if( !gameIsPaused() ){
		//ifplayeralive
		for(var i=0;i<Minions.length;i++){
			Minions[i].update();
		}
		for(var j=0;j<playerBullets.length;j++){
			playerBullets[j].update();
			if( !playerBullets[j].alive ) playerBullets.splice(j,1);
		}
		Player.update();
		detectCollision();
	}
	drawGame();
	//fps calcul
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}
//fps
function fpsCounter(){
	var fpsOut = getEl("fps");
	setInterval(function(){
	fpsOut.innerHTML = (1000/frameTime).toFixed() + " FPS";
	},1000);
}

function drawGame(){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	
	if( !gameIsPaused() ){
		context.clearRect(0,0,canvas.width,canvas.height);
		Level.draw(context);
		uiData.draw();
		for(var i=0;i<Minions.length;i++){
			Minions[i].draw(context);
		}
		for(var j=0;j<playerBullets.length;j++){
			playerBullets[j].draw(context);
		}
		
		Player.draw(context);
	}
	else pauseScreen(context);
}

var Level = {
	map: [
		["M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","M"],
		["M","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","M"],
		["M","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","M"],
		["M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M","M"]
	],
	draw: function(context){
		for(var i=0,y=0; i< this.map.length; i++,y+=32){
			for(var j=0,x=0; j< this.map[i].length; j++,x+=32){ 
				if(this.map[i][j] == " ") context.drawImage(imageTool.ground, x, y, 32, 32);
				if(this.map[i][j] == "M") context.drawImage(imageTool.block, x, y, 32, 32);
				if(this.map[i][j] == "C") context.drawImage(imageTool.trail, x, y, 32, 32);
				if(this.map[i][j] == "T") context.drawImage(imageTool.trailTop, x, y, 32, 32);
				if(this.map[i][j] == "B") context.drawImage(imageTool.trailBottom, x, y, 32, 32);
			}
		}
	}
};

//Object d'images
var imageTool = new function() {
	this.pauseScreen = new Image();
	this.playerDown = new Image();
	this.playerLeft = new Image();
	this.playerUp = new Image();
	this.playerRight = new Image();
	this.playerBullet = new Image();
	this.minion = new Image();
	this.minionBullet = new Image();
	this.ground = new Image();
	this.block = new Image();
	this.trail = new Image();
	this.trailTop = new Image();
	this.trailBottom = new Image();
	//Préchargement
	var numImages = 13;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {gameInit();}}
	this.pauseScreen.onload = function() {imageLoaded();}
	this.playerDown.onload = function() {imageLoaded();}
	this.playerLeft.onload = function() {imageLoaded();}
	this.playerUp.onload = function() {imageLoaded();}
	this.playerRight.onload = function() {imageLoaded();}
	this.playerBullet.onload = function() {imageLoaded();}
	this.minion.onload = function() {imageLoaded();}
	this.minionBullet.onload = function() {imageLoaded();}
	this.ground.onload = function() {imageLoaded();}
	this.block.onload = function() {imageLoaded();}
	this.trail.onload = function() {imageLoaded();}
	this.trailTop.onload = function() {imageLoaded();}
	this.trailBottom.onload = function() {imageLoaded();}
	//Sources
	this.pauseScreen.src = "img/pause.png";
	this.playerDown.src = "img/player.png";
	this.playerLeft.src = "img/player1.png";
	this.playerUp.src = "img/player2.png";
	this.playerRight.src = "img/player3.png";
	this.playerBullet.src = "img/playerbullet.png";
	this.minion.src = "img/minion.png";
	this.minionBullet.src = "img/minionbullet.png";
	this.ground.src = "img/ground.png";
	this.block.src = "img/block.png";
	this.trail.src = "img/trail.png";
	this.trailTop.src = "img/trailtop.png";
	this.trailBottom.src = "img/trailbottom.png";
}

function collisionMapW(){
	if(Player.y <= 32) return true;
	else return false;
}
function collisionMapS(){
	if(Player.y+Player.height >= 448)	return true;
	else return false;
}
function collisionMapA(){
	if(Player.x <= 32) return true;
	else return false;
}
function collisionMapD(){
	if(Player.x+Player.width >= 768)	return true;
	else return false;
}


//Objet joueur
var Player = {
	x : 100,//Gauche
	y : 225,//Haut
	height: 32,
	width: 32,
	speed : 4,
	damage : 1,
	range : 250,
	fireRate: 500,
	hp : 3,
	gold : 0,
	head: imageTool.playerRight, //Orientation de la tête
	update: function(){
		//Déplacement
		var currentMoving = "";
		if( !collisionMapW() ){
			if(keyW){
				this.y -= this.speed;
				this.head = imageTool.playerUp;
				currentMoving = "up";}}
		if( !collisionMapS() ){
			if(keyS){
				this.y += this.speed;
				this.head = imageTool.playerDown;
				currentMoving = "down";}}
		if( !collisionMapA() ){
			if(keyA){
				this.x -= this.speed;
				this.head = imageTool.playerLeft;
				currentMoving = "left";}}
		if( !collisionMapD() ){
			if(keyD){
				this.x += this.speed;
				this.head = imageTool.playerRight;
				currentMoving = "right";}}
		
		//Limites du canvas
		if(this.x >= canvas.width){this.x = canvas.width;} 	// droit
		if(this.y >= canvas.height){this.y = canvas.height;}// bas
		if(this.x <= 0){this.x = 0;} // gauche
		if(this.y <= 0){this.y = 0;} // haut
		
		//Direction tête
		if(keyLeft){
			this.head = imageTool.playerLeft;playerFire("left",currentMoving);}
		if(keyUp){
			this.head = imageTool.playerUp;playerFire("up",currentMoving);}
		if(keyRight){
			this.head = imageTool.playerRight;playerFire("right",currentMoving);}
		if(keyDown){
			this.head = imageTool.playerDown;playerFire("down",currentMoving);}
	},
	draw: function(context){
		context.drawImage(this.head, this.x, this.y, this.width, this.height);
	}
};

var playerBullets = [];
var lastFire = Date.now();
function playerFire(dir,mov){
	var bulx = 0;
	var buly = 0;
	if(dir == mov){	var range = Player.range*2;	var speed = 7+Player.speed;	}
	else {var range = Player.range; var speed = 7;}
	
	var fireNow = Date.now();
	if( fireNow - lastFire > Player.fireRate){
		switch(dir){
			case "left":	bulx = Player.x;
							buly = Player.y + (Player.height/2)-8;
							playerBullets.push(new Bullet("left",speed,range,bulx,buly,Player.damage));
							break;
			case "up":		bulx = Player.x + (Player.width/2)-8;
							buly = Player.y;
							playerBullets.push(new Bullet("up",speed,range,bulx,buly,Player.damage));
							break;
			case "right": 	bulx = Player.x + Player.width/2;
							buly = Player.y + (Player.height/2)-8;
							playerBullets.push(new Bullet("right",speed,range,bulx,buly,Player.damage));
							break;
			case "down": 	bulx = Player.x + (Player.width/2)-8;
							buly = Player.y + Player.height/2;
							playerBullets.push(new Bullet("down",speed,range,bulx,buly,Player.damage));
							break;
		}
		lastFire = Date.now();
	}
}

function Bullet(side,speed,range,bulx,buly,dmg){
	this.side = side;
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.targetx = 0;
	this.targety = 0;
	this.height = 16;
	this.width = 16;
	this.dmg = dmg;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive && this.side == "right"){			
			this.targetx = this.inix + this.range;
			if(this.x < this.targetx) this.x += this.speed;
			else this.alive = false;
		}
		if(this.alive && this.side == "left"){			
			this.targetx = this.inix - this.range;
			if(this.x > this.targetx) this.x -= this.speed;
			else this.alive = false;
		}
		if(this.alive && this.side == "up"){
			this.targety = this.iniy - this.range;
			if(this.y > this.targety) this.y -= this.speed;
			else this.alive = false;
		}
		if(this.alive && this.side == "down"){			
			this.targety = this.iniy + this.range;
			if(this.y < this.targety) this.y += this.speed;
			else this.alive = false;
		}
	};
	this.draw = function(context){  //Affichage
		if(this.alive) context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);
	};
}

//Création des ennemis
var Minions = [];
function minionInit(number){
	for(i=0;i<number;i++){
		var randX = getRand(550,140);
		var randY = getRand(330,65);
		var randSpeed = getRand(5,1)/3;
		Minions[i] = new Minion(randX,randY,randSpeed);
	}
}

//objet minion
function Minion(x,y,speed){
	this.x = x;
	this.y = y;
	this.height = 32;
	this.width = 32;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			var dirX = (Player.x - Player.width/2) - (this.x - this.width/2);
			var dirY = (Player.y - Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(dirX*dirX + dirY*dirY);
			dirX = dirX/hyp;
			dirY = dirY/hyp;
			this.x += dirX*this.speed;
			this.y += dirY*this.speed;
		}
	};
	this.draw = function(context){  //Affichage
		//Si le minion est vivant
		if(this.alive) context.drawImage(imageTool.minion, this.x, this.y, this.width, this.height);
	};
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}

var uiData = {
	score : 0,
	draw : function(){
		getEl("score").innerHTML = this.score;
	}
};

function detectCollision(){
	var safeGap = 6;
	for(i=0;i<Minions.length;i++){
		if (Player.x < Minions[i].x + Minions[i].width-safeGap  && Player.x + Player.width-safeGap  > Minions[i].x &&
			Player.y < Minions[i].y + Minions[i].height-safeGap && Player.y + Player.height-safeGap > Minions[i].y) {
			Minions[i].clear();
			uiData.score++;}
	}
}

var recursiveAnim = function() {
    mainloop();
	animFrame( recursiveAnim );
};

function keyboardEvent(){
	//Gestion des touches du clavier
	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);
}

var keyW = false, keyA = false, keyS = false, keyD = false;
var keyLeft = false, keyUp = false, keyRight = false, keyDown = false;
var keyPause = false;

function onKeyDown(event){
	var keyCode = event.keyCode;
	switch(keyCode){
		case 37: keyLeft = true; break;		// Left arrow
		case 38: keyUp = true; break;		// up arrow
		case 39: keyRight = true; break; 	// right arrow
		case 40: keyDown = true; break; 	// down arrow
		case 68: keyD = true; break; 		//d
		case 83: keyS = true; break; 		//s
		case 65: keyA = true; break; 		//a
		case 87: keyW = true; break;		//w
		case 13: keyPause = true; break;	//enter
	}
}
function onKeyUp(event){
	var keyCode = event.keyCode
	switch(keyCode){
		case 37: keyLeft = false; break; 	// Left arrow
		case 38: keyUp = false; break; 		// up arrow
		case 39: keyRight = false; break; 	// right arrow
		case 40: keyDown = false; break; 	// down arrow
		case 68: keyD = false; break; 		//d
		case 83: keyS = false; break;		//s
		case 65: keyA = false; break; 		//a
		case 87: keyW = false; break; 		//w
		case 13: keyPause = false; break; 	//enter
	}
}

function getRand(nbPos,nbDep){ return Math.floor(Math.random()*nbPos + nbDep);}
function getEl(id){ return document.getElementById(id);}