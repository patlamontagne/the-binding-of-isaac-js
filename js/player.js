//Item loot collision
function itemCollision(){
	for(var i=0;i<Items.length;i++){
		if (Player.x < Items[i].x + Items[i].width  && Player.x + Player.width  > Items[i].x &&
			Player.y < Items[i].y + Items[i].height && Player.y + Player.height > Items[i].y) {
			Items[i].use();}
	}
}

//items
function Item(x,y,type){ // type 1 = coin, 2 = health, 3 = maxhealth...
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.type = type;
	this.height = 32;
	this.width = 32;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){
		this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
		this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
		var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
		this.dirx = this.dirx/hyp;
		this.diry = this.diry/hyp;
		// Mode "bump" (a été touché)
			this.checkDamage();
			if(this.isHit){
				this.x -= this.dirx*(Player.attackSpeed);
					if(this.dirx < 0){ //Est à gauche du joueur
						this.checkCollideRight(collideMaps);this.checkCollideRight(holeMaps);}
					if(this.dirx > 0){ //Est à droite du joueur
						this.checkCollideLeft(collideMaps);this.checkCollideLeft(holeMaps);}					
				this.y -= this.diry*(Player.attackSpeed);
					if(this.diry < 0){ //Est au dessus du joueur
						this.checkCollideDown(collideMaps);this.checkCollideDown(holeMaps);}
					if(this.diry > 0){ //Est en dessous du joueur
						this.checkCollideUp(collideMaps);this.checkCollideUp(holeMaps);}
			}
			if(!this.isHit){
				this.x +=0;
				this.y +=0;
			}
	}
	this.draw = function(context){
		if(this.alive){
			
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x+3, this.y, this.width-6, this.height-4);
			context.restore();
			var img;
			if(this.type == 1){img = imageTool.coin;}
			if(this.type == 2){img = imageTool.health;}
			if(this.type == 3){img = imageTool.maxHealth;}
			if(this.type == 4){img = imageTool.speedBoost;}
			if(this.type == 5){img = imageTool.dmgBoost;}
			if(this.type == 6){img = imageTool.rangeBoost;}
			if(this.type == 7){img = imageTool.fireRateBoost;}
			if(this.type == 8){img = imageTool.bulletSpeedBoost;}
			context.drawImage(img, this.x, this.y, this.width, this.height);
		}
	}
	this.use = function(){
		if(this.type == 1){Player.gold++;sounds.gold.currentTime = 0;sounds.gold.play();this.alive=false;}
		if(this.type == 2){if(Player.hp < Player.maxhp){Player.hp++;this.alive=false;}}
		if(this.type == 3){if(Player.maxhp < Player.lifebar){Player.maxhp++;Player.hp++;this.alive=false;}}
		if(this.type == 4){if(Player.speedBoost < 5){Player.speedBoost++;this.alive=false;}}
		if(this.type == 5){if(Player.dmgBoost < 5){Player.dmgBoost++;this.alive=false;}}
		if(this.type == 6){if(Player.rangeBoost < 5){Player.rangeBoost++;this.alive=false;}}
		if(this.type == 7){if(Player.fireRateBoost < 5){Player.fireRateBoost++;this.alive=false;}}
		if(this.type == 8){if(Player.bulletSpeedBoost < 5){Player.bulletSpeedBoost++;this.alive=false;}}
	}
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.height = 0;
		this.width = 0;
		this.alive = false;
	}
	this.getDamage = function(dmg){
		if(this.alive){this.lastDamaged = Date.now();}
		}
	this.checkDamage = function(){ //calcul réaction aux balles
		this.now = Date.now();
		if( this.now - this.lastDamaged < 60){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollideUp = function(obj){ //calcul de collision Up
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width ){
			this.y = obj[i].y+obj[i].height;}}}
			
	this.checkCollideDown = function(obj){ //calcul de collision S
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width ){
			this.y = obj[i].y-this.height;}}}
			
	this.checkCollideLeft = function(obj){ //calcul de collision W
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width ){
			this.x = obj[i].x+obj[i].width;}}}
			
	this.checkCollideRight = function(obj){ //calcul de collision S
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width ){
			this.x = obj[i].x-this.width;}}}
}

function createItem(x,y){
	var drop = getRand(100,1);
	var type = 1;
	if(drop >= 95){type = 2;}
	if(drop == 1){type = 3;}
	if(drop == 3){type = 4;}
	if(drop == 5){type = 5;}
	if(drop == 7){type = 6;}
	if(drop == 9){type = 7;}
	if(drop == 11){type = 8;}
	
	Items[ItemCounter] = new Item(x,y,type);
	ItemCounter ++;
}

//Objet joueur
var Player = {
	height: 50,
	width: 50,
	x : 100,//Gauche
	y : 100,//Haut
	velx: 0,
	vely: 0,
	speedBoost:0, 
	dmgBoost:0, 
	fireRateBoost:0,
	bulletSpeedBoost:0,
	rangeBoost:0, 
	speed : 3,
	damage : 1,
	range : 400,
	fireRate: 700,
	attackSpeed: 1,
	hp : 3,	// Vie (actuelle)
	maxhp: 3,	// Vie (pleine)
	lifebar :24, // HP boosté maximum
	gold : 0,
	head: imageTool.playerDown, //Orientation de la tête
	alive: true,
	canGetDamage: true,
	now : Date.now(),
	lastDamaged : Date.now(),
	damagedNow : this.lastDamaged-2000,
	update: function(){
		if(this.hp ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
		//Déplacement
		if(this.alive){
			//Vérifications
			itemCollision();
			detectCollision(Minions);
			this.checkDamage();
			//Orientation du mouvement
			var currentMoving = "";
			//Calcul Boost
			this.speed = 3 + this.speedBoost/2;
			this.damage = 1 + this.dmgBoost*0.4;
			this.range = 400 + this.rangeBoost*70;
			this.fireRate = 700 - this.fireRateBoost*50;
			this.attackSpeed = 3 + this.bulletSpeedBoost;
			
				if(keyW && this.y > 110 ){
					this.y -= this.speed;
					currentMoving = "up";
					detectCollision(Towers);
					this.checkCollideW(collideMaps);
					this.checkCollideW(holeMaps);
					this.checkCollideW(Towers);}				
				if(keyS && this.y < 680 - this.height){
					this.y += this.speed;
					currentMoving = "down";
					detectCollision(Towers);
					this.checkCollideS(collideMaps);
					this.checkCollideS(holeMaps);
					this.checkCollideS(Towers);}
				
				if(keyA && this.x > 90){					
					this.x -= this.speed;
					currentMoving = "left";
					detectCollision(Towers);
					this.checkCollideA(collideMaps);
					this.checkCollideA(holeMaps);
					this.checkCollideA(Towers);}
				if(keyD && this.x < 1050 - this.width){
					this.x += this.speed;
					currentMoving = "right";
					detectCollision(Towers);
					this.checkCollideD(collideMaps);
					this.checkCollideD(holeMaps);
					this.checkCollideD(Towers);}
			
			//Limites du canvas
			if(this.x >= canvas.width-this.width){this.x = canvas.width-this.width;} 	// droit
			if(this.y >= canvas.height-this.height){this.y = canvas.height-this.height;}// bas
			if(this.x <= 0){this.x = 0;} // gauche
			if(this.y <= 0){this.y = 0;} // haut
			
			//Direction tête
			if(keyLeft){
				this.head = imageTool.playerLeft;playerFire("left",currentMoving);}
			else if(keyUp){
				this.head = imageTool.playerUp;playerFire("up",currentMoving);}
			else if(keyRight){
				this.head = imageTool.playerRight;playerFire("right",currentMoving);}
			else if(keyDown){
				this.head = imageTool.playerDown;playerFire("down",currentMoving);}
			else this.head = imageTool.playerDown;
		}
	},
	draw : function(context,statContext){
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-2, this.y+10, this.width+4, this.height+4);
			context.restore();
			
			if(this.canGetDamage){ //Joueur Normal
				context.drawImage(this.head, this.x-2, this.y-2, this.width+4, this.height+4);}
			if(!this.canGetDamage){ // Joueur invincible
				context.save();
				context.globalAlpha = 0.6;
				context.drawImage(this.head, this.x-2, this.y-2, this.width+4, this.height+4);
				context.restore();
			}
		}
		if(!this.alive){ 
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-2, this.y+10, this.width+4, this.height+4);
			context.restore();
			context.drawImage(imageTool.playerDead, this.x-2, this.y-2, this.width+4, this.height+4);} //joueur mort
		
		//LifeBar
		var diffHp = this.maxhp - this.hp;
		var pool = 0;
		for(var h = 0; h < this.hp; h++){
			context.drawImage(imageTool.hp,(pool*39)+10,canvas.height-50,40,29);
			pool++;
		}
		for(var d = 0; d < diffHp; d++){
			context.drawImage(imageTool.emptyHp,(pool*39)+10,canvas.height-46,39,27);
			pool++;
		}
		/* BOOST ICONS
		statContext.drawImage(imageTool.speedBoost,10,36,32,32);
		statContext.drawImage(imageTool.dmgBoost,10,70,32,32);
		statContext.drawImage(imageTool.fireRateBoost,10,105,32,32);
		statContext.drawImage(imageTool.bulletSpeedBoost,10,135,32,32);
		statContext.drawImage(imageTool.rangeBoost,10,170,32,32);*/

		// Gold
		context.drawImage(imageTool.gold,1020,canvas.height-50,50,27);
		context.font = "21pt Impact";
		context.fillStyle = 'white';
		context.fillText(Player.gold, 1072, canvas.height-26);
		
		//Stats
		statContext.drawImage(imageTool.stats,10,0,240,120);
		// SPEED
		for(var s = 0; s < Player.speedBoost; s++){
			statContext.drawImage(imageTool.stat,(s*10)+246,8,6,13);		}
		// DMG
		for(var d = 0; d < Player.dmgBoost; d++){
			statContext.drawImage(imageTool.stat,(d*10)+246,31,6,13);		}
		// FIRERATE
		for(var f = 0; f < Player.fireRateBoost; f++){
			statContext.drawImage(imageTool.stat,(f*10)+246,54,6,13);		}
		// BULLSPEED
		for(var b = 0; b < Player.bulletSpeedBoost; b++){
			statContext.drawImage(imageTool.stat,(b*10)+246,77,6,13);		}
		// RANGE
		for(var r = 0; r < Player.rangeBoost; r++){
			statContext.drawImage(imageTool.stat,(r*10)+246,100,6,13);		}
		/*
		statContext.fillText(Player.speedBoost, 200, 65);
		statContext.fillText(Player.dmgBoost, 200, 95);
		statContext.fillText(Player.fireRateBoost, 200, 125);
		statContext.fillText(Player.bulletSpeedBoost, 200, 155);
		statContext.fillText(Player.rangeBoost, 200, 185); */
	},
	getDamage : function(dmg){
		if(this.alive && this.hp > 0){ //Si vivant
			this.damagedNow = Date.now(); //Moment ou le dégat est pris
			if( this.damagedNow - this.lastDamaged > 1000){ //Si le dernier dégat date d'une seconde
				this.hp -= dmg;//retirer les points de vie
				if(this.hp <= 0){
				sounds.playerDeath.currentTime = 0;sounds.playerDeath.play();}
				else {sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
				this.lastDamaged = Date.now();
				}
			
		}
	},
	checkDamage : function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged > 1000){ //compare le temps actuel avec le temps du dernier dégat
			this.canGetDamage = true;}
		else this.canGetDamage = false;
	},
	checkCollideW : function(obj){ //calcul de collision W
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width )
			{this.y = obj[i].y+obj[i].height;}}},
	checkCollideS : function(obj){ //calcul de collision S
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width )
			{this.y = obj[i].y-this.height;}}},
	checkCollideA : function(obj){ //calcul de collision A
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width)
			{this.x = obj[i].x+obj[i].width;}}},
	checkCollideD : function(obj){ //calcul de collision D
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height && this.y + this.height > obj[i].y && this.x + this.width  > obj[i].x && this.x < obj[i].x + obj[i].width)
			{this.x = obj[i].x-this.width;}}}
};

//Attaquer
function playerFire(dir,mov){
	var bulx = 0;
	var buly = 0;
	if(dir == mov){	var range = Player.range*(1.3);	var speed = Player.attackSpeed+Player.speed/2;	}
	else {var range = Player.range; var speed = Player.attackSpeed;}
	
	var fireNow = Date.now();
	if( fireNow - lastFire > Player.fireRate){
		switch(dir){
			case "left":	bulx = Player.x-5;
							buly = Player.y + (Player.height/2);
							playerBullets.push(new Bullet("left",speed,range,bulx,buly,Player.damage));
							break;
			case "up":		bulx = Player.x + (Player.width/2)-11;
							buly = Player.y;
							playerBullets.push(new Bullet("up",speed,range,bulx,buly,Player.damage));
							break;
			case "right": 	bulx = Player.x + (Player.width/2)+14;
							buly = Player.y + (Player.height/2);
							playerBullets.push(new Bullet("right",speed,range,bulx,buly,Player.damage));
							break;
			case "down": 	bulx = Player.x + (Player.width/2)-11;
							buly = Player.y + (Player.height/2)+18;
							playerBullets.push(new Bullet("down",speed,range,bulx,buly,Player.damage));
							break;
		}
		lastFire = Date.now();
		sounds.bullet.currentTime = 0;
		sounds.bullet.play();
	}
}

//projectile
function Bullet(side,speed,range,bulx,buly,dmg){
	this.side = side;
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.targetx = 0;
	this.targety = 0;
	this.height = 22;
	this.width = 22;
	this.dmg = dmg;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive){
		bulletCollision(Minions);
		bulletCollision(Towers);
		bulletCollision(Items);
			if(this.side == "right"){			
				this.targetx = this.inix + this.range;
				if(this.x < this.targetx) this.x += this.speed;
				else this.alive = false;}
			if(this.side == "left"){			
				this.targetx = this.inix - this.range;
				if(this.x > this.targetx) this.x -= this.speed;
				else this.alive = false;}
			if(this.side == "up"){
				this.targety = this.iniy - this.range;
				if(this.y > this.targety) this.y -= this.speed;
				else this.alive = false;}
			if(this.side == "down"){			
				this.targety = this.iniy + this.range;
				if(this.y < this.targety) this.y += this.speed;
				else this.alive = false;}	}	
	}
	this.draw = function(context){  //Affichage
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+20, this.width, this.height);
			context.restore();
		context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);}
	}
	this.clear = function(){
		this.range = 0;
		this.x = 0;
		this.y = 0;
		this.height = 0;
		this.width = 0;
		this.speed = 0;
		this.dmg = 0;
		this.alive = false;
	}
}

function detectCollision(obj){
	var safeGap = 0;
	for(var i=0;i<obj.length;i++){
		if (Player.x < obj[i].x + obj[i].width-safeGap  && Player.x + Player.width-safeGap  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height-safeGap && Player.y + Player.height-safeGap > obj[i].y) {
			Player.getDamage(obj[i].dmg);}
	}
}

function holeCollision(obj){
	var safeGap = 0;
	for(var i=0;i<obj.length;i++){
		if (Player.x < obj[i].x + obj[i].width-safeGap  && Player.x + Player.width-safeGap  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height-safeGap && Player.y + Player.height-safeGap > obj[i].y) {
			Player.getDamage(obj[i].dmg);}
	}
}

function bulletCollision(obj){
	for(var i=0;i<playerBullets.length;i++){
		// Enemies
		for(var j=0;j<obj.length;j++){
			if (playerBullets[i].x < obj[j].x + obj[j].width-1  && playerBullets[i].x + (playerBullets[i].width-1)  > obj[j].x &&
			playerBullets[i].y < obj[j].y + obj[j].height-1 && playerBullets[i].y + (playerBullets[i].height-1) > obj[j].y) {
				obj[j].getDamage(playerBullets[i].dmg);
				sounds.impact.currentTime = 0;
				sounds.impact.play();
				playerBullets[i].clear();
				}
		}
		// Collision map
		for(var m=0; m<collideMaps.length;m++){
			if (playerBullets[i].x < collideMaps[m].x + collideMaps[m].width-5  && playerBullets[i].x + (playerBullets[i].width-5)  > collideMaps[m].x &&
			playerBullets[i].y < collideMaps[m].y + collideMaps[m].height-5 && playerBullets[i].y + (playerBullets[i].height-5) > collideMaps[m].y) {
				sounds.impact.currentTime = 0;
				sounds.impact.play();
				playerBullets[i].clear();
				}
		}
	}
}
