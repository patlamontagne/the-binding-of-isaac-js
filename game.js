// Compatibilité browser
 var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;
var recursiveAnim = function() {
    mainloop();
	animFrame( recursiveAnim );
};

// Start le mainloop
animFrame( recursiveAnim );

// Loop du jeu
function mainloop(){
    updateGame();
    drawGame();
}
function updateGame(){
	updatePlayer();
}
function drawGame(){
	drawPlayer();
}
function updatePlayer(){
	var headMove;
	//Déplacement
	if(keyD){
		Player.PosX += Player.Speed;}
	if(keyS){
		Player.PosY += Player.Speed;}
	if(keyA){
		Player.PosX -= Player.Speed;}
	if(keyW){
		Player.PosY -= Player.Speed;}
	//Limites déplacement
	if(Player.PosX >= canvas.width-Player.Width){Player.PosX = canvas.width-Player.Width;}
	if(Player.PosY >= canvas.height-Player.Height){Player.PosY = canvas.height-Player.Height;}
	if(Player.PosX <= 0){Player.PosX = 0;}
	if(Player.PosY <= 0){Player.PosY = 0;}
	//Direction tête
	if(!keyDown || !keyLeft || !keyUp || !keyRight){headDirection = Player.HeadDown;}
	if(keyLeft){headDirection = Player.HeadLeft;}
	if(keyUp){headDirection = Player.HeadUp;}
	if(keyRight){headDirection = Player.HeadRight;}
	if(keyDown){headDirection = Player.HeadDown;}
	imagePlayer.src = headDirection;
}
function drawPlayer(){
	var canvas = getEl("canvas");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(imagePlayer, Player.PosX, Player.PosY, Player.Width, Player.Height);
}

//Objet joueur
var Player = {
	PosX : 300,		//Gauche
	PosY : 300, 	//Haut
	Height: 40,
	Width: 40,
	Speed : 5,
	HeadDown: "img/player.png",
	HeadLeft: "img/player1.png",
	HeadUp: "img/player2.png",
	HeadRight: "img/player3.png"
};

//Image joueur
var imagePlayer = new Image();
var headDirection = Player.HeadDown;
imagePlayer.src = headDirection;

// Initiation du canvas
window.onload = function() {
    var canvas = getEl("canvas");
    var ctx = canvas.getContext('2d');
	canvas.width = 600;
	canvas.height = 400;
	mainloop();
}

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