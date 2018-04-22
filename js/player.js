//Item loot collision
function itemCollision(){
	for(var i=0;i<Gamelevel.Items.length;i++){
		if (Player.x < Gamelevel.Items[i].x + Gamelevel.Items[i].width  && Player.x + Player.width  > Gamelevel.Items[i].x &&
			Player.y < Gamelevel.Items[i].y + Gamelevel.Items[i].height && Player.y + Player.height > Gamelevel.Items[i].y) {
			Gamelevel.Items[i].use();}
	}
}

//items
function Item(x,y,type){ 
	this.x = x, this.y = y;
	this.height = 32, this.width = 32;
	this.type = type;
	this.alive = true;
	this.update = function(){}
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
		if(this.type == 2){if(Player.maxhp - Player.hp == 0.5){Player.hp+= 0.5;this.alive=false;}
							else if(Player.maxhp - Player.hp >= 1){ Player.hp++;this.alive=false;}}
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
}

function createItem(x,y){
	var drop = getRand(100,1);
	if(drop >= 99){Gamelevel.Items.push(new Item(x,y,1));}
	if(drop <= 1){Gamelevel.Items.push(new Item(x,y,2));}
}

//Objet joueur

var Player = {
	x : 100, y : 100,
	height: 50,	width: 40,
	speed : 2.5, accelx : 0, accely : 0, friction : 0.4,
	speedBoost:0, 
	damage : 1,	range : 400, fireRate: 350,	attackSpeed: 8,
	dmgBoost:0, rangeBoost:0, fireRateBoost:0, bulletSpeedBoost:0,
	hp : 15,	maxhp: 15, lifebar :15, //HP : Vie restante, MAXHP : Vie totale, LIFEBAR : Maximum de vie possible
	gold : 0,
	head: imageTool.playerDown, //Orientation de la tête
	alive: true, canGetDamage: true, isBumped: false,
	now : Date.now(), lastDamaged : Date.now(), damagedNow : Date.now(),
	update: function(){
		if(this.hp ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
		//Déplacement
		if(this.alive){
			
			//Additions Boost
			this.speed  = 2.5 + this.speedBoost/2;
			this.damage = 1 + this.dmgBoost*0.4;
			this.range = 400 + this.rangeBoost*70;
			this.fireRate = 350 - this.fireRateBoost*50;
			this.attackSpeed = 8 + this.bulletSpeedBoost;
			if((keyW || keyS) && (keyA || keyD)) this.speed = this.speed/2; //Vitesse diagonale
			
			//Orientation du mouvement
			var currentMoving = "";
			if(keyW){ if(this.accely > 0-this.speed){this.accely -= this.friction;}
				currentMoving = "up";}				
			if(keyS){ if(this.accely < this.speed){this.accely += this.friction;}
				currentMoving = "down";}
			if(keyA){ if(this.accelx > 0-this.speed){this.accelx -= this.friction;}
				currentMoving = "left";}
			if(keyD){ if(this.accelx < this.speed){this.accelx += this.friction;}
				currentMoving = "right";}
			
			//Direction attaque
			if(keyLeft){
				this.head = imageTool.playerLeft;playerFire("left",currentMoving,this.accelx,this.accely);}
			else if(keyUp){
				this.head = imageTool.playerUp;playerFire("up",currentMoving,this.accelx,this.accely);}
			else if(keyRight){
				this.head = imageTool.playerRight;playerFire("right",currentMoving,this.accelx,this.accely);}
			else if(keyDown){
				this.head = imageTool.playerDown;playerFire("down",currentMoving,this.accelx,this.accely);}
			else this.head = imageTool.playerDown;	}
				
			//Décélération
			//Si les deux touches d'une meme dimension sont relachées ou enfoncées(elles s'annulent)
			if(!keyS && !keyW){if(this.accely != 0){this.accely  -= this.accely/7;}} 
			if(keyS && keyW){if(this.accely != 0){this.accely  -= this.accely/7;}}
			if(!keyD && !keyA ){if(this.accelx != 0){this.accelx -= this.accelx/7;}}
			if(keyA && keyD){if(this.accelx != 0){this.accelx -= this.accelx/7;}}
		
				//Accélération X
				this.x += this.accelx*2;	
					if(this.accelx*2 > 0){ 
						this.checkCollide(Gamelevel.collideMaps,"right");
						this.checkCollide(Gamelevel.holeMaps,"right");
						if(Gamelevel.combatMode!=0){this.checkCollide(Gamelevel.Doors,"right");}
						}
					if(this.accelx*2 < 0){ 
						this.checkCollide(Gamelevel.collideMaps,"left");
						this.checkCollide(Gamelevel.holeMaps,"left");
						if(Gamelevel.combatMode!=0){this.checkCollide(Gamelevel.Doors,"left");}
						}
				//Accélération Y
				this.y += this.accely*2;
					if(this.accely*2 > 0){ 
						this.checkCollide(Gamelevel.collideMaps,"down");
						this.checkCollide(Gamelevel.holeMaps,"down");}
					if(this.accely*2 < 0){ 
						this.checkCollide(Gamelevel.collideMaps,"up");
						this.checkCollide(Gamelevel.holeMaps,"up");}
			
			//Vérifications
			itemCollision();
			detectCollision(Gamelevel.Minions);
			detectCollision(Gamelevel.Towers);
			detectCollision(Gamelevel.Bosses);
			this.checkDamage();	
			
			//PORTES 
			if(this.x <= 0){this.changeLevel("left");} // Salle précédente
			if(this.x >= canvas.width -this.width){this.changeLevel("right");} //Salle suivante
		
			
	},
	
	drawBody : function(context){
			//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-8, this.y+10, this.width+16, this.height);
			context.restore();
			
		if(this.alive){
			if(this.canGetDamage){ //Joueur Normale
				if(keyD){Animations[1].draw(context);}
				else if(keyA){Animations[2].draw(context);}
				else if(keyW || keyS){Animations[0].draw(context);}
				else context.drawImage(imageTool.bodyIdle,this.x, this.y+12, 40, 40);}
			if(!this.canGetDamage){ // Joueur invincible
				context.save();
				context.globalAlpha = 0.6;
				if(keyW || keyS){Animations[0].draw(context);}
				else if(keyD){Animations[1].draw(context);}
				else if(keyA){Animations[2].draw(context);}
				else context.drawImage(imageTool.bodyIdle,this.x, this.y+12, 40, 40);
				context.restore();	}		}
				
		if(!this.alive){ //joueur mort		
			context.drawImage(imageTool.bodyIdle,this.x, this.y+12, 40, 40);}
	},
	
	drawHead : function(context){
		if(this.alive){
			if(this.canGetDamage){ //Joueur Normal
				context.drawImage(this.head, this.x-12, this.y-22, 64, 55);}
			if(!this.canGetDamage){ // Joueur invincible
				context.save();
				context.globalAlpha = 0.6;
				context.drawImage(this.head, this.x-12, this.y-22, 64, 55);
				context.restore();}	}
				
		if(!this.alive){
			context.drawImage(imageTool.playerDead, this.x-12, this.y-22, 64, 55);} //joueur mort		
	},
	
	drawUI : function(context){
		//LifeBar
		var half = this.hp%1;
		var intHp = this.hp - half;
		var diffHp = this.maxhp - (this.hp+half);
		var pool = 0;
		context.drawImage(imageTool.hpbg,-311+(this.maxhp*17),20,400,24); //15 HP = 0-60
		for(var h = 0; h < intHp; h++){context.drawImage(imageTool.hp,(pool*17)+24,24,18,16); pool++;}
		if(half !=0){context.drawImage(imageTool.halfHp,(pool*17)+24,24,18,16); pool++;}
		for(var d = 0; d < diffHp; d++){ context.drawImage(imageTool.emptyHp,(pool*17)+24,24,18,16); pool++;}
		
		// Gold
		context.drawImage(imageTool.goldbg,canvas.width-100,20,400,24);
		context.drawImage(imageTool.gold,canvas.width-45,25,14,14);
		context.font = "18pt Wendy";
		context.fillStyle = 'black';
		context.fillText(Player.gold, canvas.width-27,38);
		
		//
		context.font = "15pt Wendy";
		context.fillStyle = 'white';
		var fpsOut = (1000/frameTime).toFixed() + " FPS";
		context.fillText(fpsOut, canvas.width-50,canvas.height-8);

		if(gameIsPaused()){
		var gap = 300;
			context.drawImage(imageTool.stats,220,300,240,120); //Stats		
			for(var s = 0; s < Player.speedBoost; s++){	context.drawImage(imageTool.stat,(s*10)+456,8+gap,6,13); } //SPEED
			for(var d = 0; d < Player.dmgBoost; d++){ context.drawImage(imageTool.stat,(d*10)+456,31+gap,6,13); } //DMG
			for(var f = 0; f < Player.fireRateBoost; f++){ context.drawImage(imageTool.stat,(f*10)+456,54+gap,6,13); } //FIRERATE
			for(var b = 0; b < Player.bulletSpeedBoost; b++){ context.drawImage(imageTool.stat,(b*10)+456,77+gap,6,13); } //BULLSPEED
			for(var r = 0; r < Player.rangeBoost; r++){	context.drawImage(imageTool.stat,(r*10)+456,100+gap,6,13); } //RANGE
		}
	},
	getDamage : function(dmg,enemyx,enemyy){
		this.enemyx = enemyx;
		this.enemyy = enemyy;
		if(this.alive && this.hp > 0){ //Si vivant
			this.damagedNow = Date.now(); //Moment ou le dégat est pris
			if( this.damagedNow - this.lastDamaged > 1000){ //Si le dernier dégat date d'une seconde
				this.hp -= dmg;//retirer les points de vie
				if(this.hp <= 0){ sounds.playerDeath.currentTime = 0;sounds.playerDeath.play();}
				else { sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
				this.lastDamaged = Date.now(); }
		}
	},
	checkDamage : function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged > 1000){this.canGetDamage = true;}	//compare le temps actuel avec le temps du dernier dégat
		else this.canGetDamage = false;
	},
	checkCollide : function(obj,pos){ //calcul de collision Up
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(pos == "up")this.y = obj[i].y+obj[i].height;
				else if(pos == "down")this.y = obj[i].y-this.height;
				else if(pos == "left")this.x = obj[i].x+obj[i].width;
				else if(pos == "right")this.x = obj[i].x-this.width;}}},
	changeLevel : function(side){
		var ox = 0;
		if(side == "left") {currentLevel--; ox = canvas.width - 128;}
		else if(side == "right") {currentLevel++; ox = 128;}
		Gamelevel = Dungeon[currentLevel];
		this.x = ox;
		this.y = this.y; }
};

//Attaquer
var eyeSwitch=1;
function playerFire(dir,mov,accelx,accely){
	var bulx = 0;
	var buly = 0;
	if(dir == mov){ var range = Player.range*(1.2);	var speed = Player.attackSpeed+Player.speed/2;	}
	else {
	var range = Player.range; var speed = Player.attackSpeed;}
	
	var fireNow = Date.now();
	if( fireNow - lastFire > Player.fireRate){
		switch(dir){
			case "left":	bulx = Player.x-10;
							buly = Player.y +(5*eyeSwitch);
							if(eyeSwitch ==-1) playerBulletsBack.push(new Bullet("left",speed,range,bulx,buly,accelx,accely,Player.damage));
							else  playerBullets.push(new Bullet("left",speed,range,bulx,buly,accelx,accely,Player.damage));
							break;
			case "up":		bulx = Player.x +8+(8*eyeSwitch);
							buly = Player.y -20;
							playerBulletsBack.push(new Bullet("up",speed,range,bulx,buly,accelx,accely,Player.damage));
							break;
			case "right": 	bulx = Player.x +25;
							buly = Player.y +(5*eyeSwitch);
							if(eyeSwitch ==-1) playerBulletsBack.push(new Bullet("right",speed,range,bulx,buly,accelx,accely,Player.damage));
							else  playerBullets.push(new Bullet("right",speed,range,bulx,buly,accelx,accely,Player.damage));
							break;
			case "down": 	bulx = Player.x +8+(8*eyeSwitch);
							buly = Player.y +5 ;
							playerBullets.push(new Bullet("down",speed,range,bulx,buly,accelx,accely,Player.damage));
							break;
		}
		lastFire = Date.now();
		if(eyeSwitch ==1) eyeSwitch = -1;
		else eyeSwitch =1;
		sounds.bullet.currentTime = 0;
		sounds.bullet.play();
	}
}

//projectile
function Bullet(side,speed,range,bulx,buly,accelx,accely,dmg){
	this.side = side;
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = 0;
	this.diry = 0;
	this.targetx = 0;
	this.targetx = 0;
	this.height = 26;
	this.width = 26;
	this.dmg = dmg;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive){
		bulletCollision(playerBulletsBack, Gamelevel.Bosses);
		bulletCollision(playerBullets, Gamelevel.Bosses);
		bulletCollision(playerBulletsBack, Gamelevel.Minions);
		bulletCollision(playerBullets, Gamelevel.Minions);
		bulletCollision(playerBulletsBack, Gamelevel.Towers);
		bulletCollision(playerBullets, Gamelevel.Towers);
		bulletCollision(playerBulletsBack, Gamelevel.collideMaps);
		bulletCollision(playerBullets, Gamelevel.collideMaps);
		
		if(Gamelevel.combatMode!=0){bulletCollision(playerBulletsBack, Gamelevel.Doors);}
		if(Gamelevel.combatMode!=0){bulletCollision(playerBullets, Gamelevel.Doors);}
		
		if(this.side == "up"){
			this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
			this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
			this.targety = this.iniy - this.range;
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
			else this.alive = false;}
			
		else if(this.side == "down"){
			this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
			this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
			this.targety = this.iniy + this.range;			
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
			else this.alive = false;}
			
		else if(this.side == "right"){
			this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
			this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50);	
			this.targetx = this.inix + this.range;					
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
			else this.alive = false;}
			
		else if(this.side == "left"){
			this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) -this.range);
			this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50);		
			this.targetx = this.inix - this.range;							
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			if(this.x > this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
			else this.alive = false;}
		
		
		/*
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
				else this.alive = false;}*/
		}	
	}
	
	this.draw = function(context){  //Affichage
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+30, this.width, this.height);
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
				if(obj == Gamelevel.Minions || obj == Gamelevel.Towers || obj == Gamelevel.Bosses) Player.getDamage(obj[i].dmg, obj[i].x, obj[i].y);
				else if(obj == Gamelevel.Doors) obj[i].use(); }
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

function bulletCollision(projectile,obj){
	var safeGap = 0;
	if((obj == Gamelevel.collideMaps) || (obj == Gamelevel.Doors)) safeGap = 10;
	for(var i=0;i<projectile.length;i++){
		// Enemies
		for(var j=0;j<obj.length;j++){
			if (projectile[i].x < obj[j].x + (obj[j].width-safeGap)  && projectile[i].x + (projectile[i].width-safeGap)  > obj[j].x &&
			projectile[i].y < obj[j].y + (obj[j].height-safeGap) && projectile[i].y + (projectile[i].height-safeGap) > obj[j].y) {
				if((obj == Gamelevel.Minions) || (obj == Gamelevel.Towers) || (obj == Gamelevel.Bosses)) obj[j].getDamage(projectile[i].dmg);
				sounds.impact.currentTime = 0;
				sounds.impact.play();
				projectile[i].clear();
				}
		}
	}
}
