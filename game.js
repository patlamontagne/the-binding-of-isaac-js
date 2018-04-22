// Compatibilité browser
 var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;


// Loop du jeu
function mainloop(){
	Player.Update();
	Player.Draw();
}

// Initiation du canvas
window.onload = function() {
    var canvas = getEl("canvas");
    var ctx = canvas.getContext('2d');
	canvas.width = 800;
	canvas.height = 500;
	ctx.clearRect(0,0,canvas.width,canvas.height);
}

var imageTool = new function() {
	this.Background = new Image();
	this.PlayerDown = new Image();
	this.PlayerLeft = new Image();
	this.PlayerUp = new Image();
	this.PlayerRight = new Image();
	this.PlayerBullet = new Image();
	this.Minion = new Image();
	this.MinionBullet = new Image();
	
	// S'assure que les images on chargé avant de lancer le jeu
	var numImages = 8;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {animFrame(recursiveAnim);}
	}
	this.Background.onload = function() {imageLoaded();}
	this.PlayerDown.onload = function() {imageLoaded();}
	this.PlayerLeft.onload = function() {imageLoaded();}
	this.PlayerUp.onload = function() {imageLoaded();}
	this.PlayerRight.onload = function() {imageLoaded();}
	this.PlayerBullet.onload = function() {imageLoaded();}
	this.Minion.onload = function() {imageLoaded();}
	this.MinionBullet.onload = function() {imageLoaded();}
	// Sources des images
	this.Background.src = "img/bg.png";
	this.PlayerDown.src = "img/player.png";
	this.PlayerLeft.src = "img/player1.png";
	this.PlayerUp.src = "img/player2.png";
	this.PlayerRight.src = "img/player3.png";
	this.PlayerBullet.src = "img/playerbullet.png";
	this.Minion.src = "img/minion.png";
	this.MinionBullet.src = "img/minionbullet.png";
}


//Objet joueur
var Player = {
	PosX : 20,		//Gauche
	PosY : 225, 	//Haut
	Height: 40,
	Width: 40,
	Speed : 5,
	HeadDown: "img/player.png",
	HeadLeft: "img/player1.png",
	HeadUp: "img/player2.png",
	HeadRight: "img/player3.png",
	Update: function(){
		//Déplacement
		if(keyW){this.PosY -= this.Speed;headDirection = this.HeadUp;}
		if(keyS){this.PosY += this.Speed;headDirection = this.HeadDown;}
		if(keyA){this.PosX -= this.Speed;headDirection = this.HeadLeft;}
		if(keyD){this.PosX += this.Speed;headDirection = this.HeadRight;}
		//Limites déplacement
		if(this.PosX >= canvas.width-this.Width){this.PosX = canvas.width-this.Width;}
		if(this.PosY >= canvas.height-this.Height){this.PosY = canvas.height-this.Height;}
		if(this.PosX <= 0){this.PosX = 0;}
		if(this.PosY <= 0){this.PosY = 0;}
		//Direction tête
		if(keyLeft){headDirection = this.HeadLeft;}
		if(keyUp){headDirection = this.HeadUp;}
		if(keyRight){headDirection = this.HeadRight;}
		if(keyDown){headDirection = this.HeadDown;}
		imagePlayer.src = headDirection;
	},
	Draw: function(){
		var canvas = getEl("canvas");
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(imagePlayer, this.PosX, this.PosY, this.Width, this.Height);
	}
};

//Image joueur
var imagePlayer = new Image();
var headDirection = Player.HeadRight;
imagePlayer.src = headDirection;

//objet minion
function Minion(PosX,PosY,Height,Width,Speed,Image){
	this.PosX = PosX;
	this.PosY = PosY;
	this.Height = Height;
	this.Width = Width;
	this.Speed = Speed;
	this.Image = Image;
	this.Update = function(){
		if(this.PosX >= canvas.width-this.Width){this.PosX = canvas.width-this.Width;}
		if(this.PosY >= canvas.height-this.Height){this.PosY = canvas.height-this.Height;}
		if(this.PosX <= 0){this.PosX = 0;}
		if(this.PosY <= 0){this.PosY = 0;}
	};
	this.Draw = function(){
		var canvas = getEl("canvas");
		var ctx = canvas.getContext('2d');
	};
}

var recursiveAnim = function() {
    mainloop();
	animFrame( recursiveAnim );
};

//Gestion des touches du clavier
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;

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
	}
}

function getEl(id) { return document.getElementById(id);}

/* 
var NOM = new Image();
NOM.src = "img/image.ext";
ctx.drawImage(NOM, X(gauche), Y(bas), LARGEUR*, HAUTEUR*);
*/
/*
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 50);
ctx.strokeStyle = 'red';
ctx.strokeRect(75, 75, 50, 50);
*/