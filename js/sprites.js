//Object d'images
var imageTool = new function() {
	this.background = new Image();
	this.pauseScreen = new Image();
	this.hp = new Image();
	this.emptyHp = new Image();
	this.hit = new Image();
	this.noDamage = new Image();
	this.playerDead = new Image();
	this.playerDown = new Image();
	this.playerLeft = new Image();
	this.playerUp = new Image();
	this.playerRight = new Image();
	this.playerBullet = new Image();
	this.minion = new Image();
	this.minionDamaged = new Image();
	this.tower = new Image();
	this.towerDamaged = new Image();
	this.block = new Image();
	this.coin = new Image();
	this.health = new Image();
	this.maxHealth = new Image();
	//Préchargement
	var numImages = 20;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {gameInit();}}
	this.background.onload = function() {imageLoaded();}
	this.pauseScreen.onload = function() {imageLoaded();}
	this.hp.onload = function() {imageLoaded();}
	this.emptyHp.onload = function() {imageLoaded();}
	this.hit.onload = function() {imageLoaded();}
	this.noDamage.onload = function() {imageLoaded();}
	this.playerDead.onload = function() {imageLoaded();}
	this.playerDown.onload = function() {imageLoaded();}
	this.playerLeft.onload = function() {imageLoaded();}
	this.playerUp.onload = function() {imageLoaded();}
	this.playerRight.onload = function() {imageLoaded();}
	this.playerBullet.onload = function() {imageLoaded();}
	this.minion.onload = function() {imageLoaded();}
	this.minionDamaged.onload = function() {imageLoaded();}
	this.tower.onload = function() {imageLoaded();}
	this.towerDamaged.onload = function() {imageLoaded();}
	this.block.onload = function() {imageLoaded();}
	this.coin.onload = function() {imageLoaded();}
	this.health.onload = function() {imageLoaded();}
	this.maxHealth.onload = function() {imageLoaded();}
	//Sources
	this.background.src = "img/bg.png";
	this.pauseScreen.src = "img/pause.png";
	this.hp.src = "img/hp.png";
	this.emptyHp.src = "img/emptyHp.png";
	this.hit.src = "img/hit.png";
	this.noDamage.src = "img/nodamage.png";
	this.playerDead.src = "img/playerdead.png";
	this.playerDown.src = "img/player.png";
	this.playerLeft.src = "img/player1.png";
	this.playerUp.src = "img/player2.png";
	this.playerRight.src = "img/player3.png";
	this.playerBullet.src = "img/bullet.png";
	this.minion.src = "img/minion.png";
	this.minionDamaged.src = "img/miniondamaged.png";
	this.tower.src = "img/tower.png";
	this.towerDamaged.src = "img/towerdamaged.png";
	this.block.src = "img/block.png";
	this.coin.src = "img/coin.png";
	this.health.src = "img/health.png";
	this.maxHealth.src = "img/maxhealth.png";
}