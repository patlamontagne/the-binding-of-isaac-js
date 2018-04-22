// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "img/bg.png";

// Player images
var playerReady = false;
var playerImage = new Image();
var playerImage1 = new Image();
var playerImage2 = new Image();
var playerImage3 = new Image();
playerReady.onload = function () {
	playerReady = true;
};
playerImage.src = "img/player.png";
playerImage1.src = "img/player1.png";
playerImage2.src = "img/player2.png";
playerImage3.src = "img/player3.png";