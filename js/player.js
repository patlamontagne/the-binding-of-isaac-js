//Item loot collision
function itemCollision(){
	for(var i=0;i<Game.Items.length;i++){
		if (Player.x < Game.Items[i].x + Game.Items[i].width  && Player.x + Player.width  > Game.Items[i].x &&
			Player.y < Game.Items[i].y + Game.Items[i].height && Player.y + Player.height > Game.Items[i].y) {
			Game.Items[i].use();}}
}

//items
var normalPool = ["Boom!","<3","Breakfast","Dessert","Dinner","Lunch","Rotten Meat","MEAT!","Bucket of Lard","The Belt","Roid Rage","Mini Mushroom","Mom's Heels","Mom's Lipstick","Mom's Underwear","The Sad Onion","The Small Rock","Wooden Spoon","Speed Ball","Tooth Picks"];
var rarePool = ["Skeleton Key","Pyro","Raw liver","Growth Hormones","The Halo","Magic Mushroom","Max's Head","Number One","Wire Coat Hanger","Jesus Juice"];
function Item(x,y,type){ 
	this.x = x, this.y = y;
	this.height = 32, this.width = 32;
	this.type = type;
	this.alive = true;
	this.update = function(){}
	this.draw = function(context){
		if(this.alive){
			var img;
			if(this.type == "Coin") img = imageTool.coin;
			else if(this.type == "Nickel") img = imageTool.nickel;
			else if(this.type == "Dime") img = imageTool.dime;
			else if(this.type == "Heart") img = imageTool.health;
			else if(this.type == "Half Heart") img = imageTool.halfhealth;
			else if(this.type == "Key") img = imageTool.key;
			else if(this.type == "Bomb") img = imageTool.bomb;
			else if(this.type == "Boom!") img = imageTool.boom;
			else if(this.type == "<3") img = imageTool.redheart;
			else if(this.type == "Breakfast") img = imageTool.breakfast;
			else if(this.type == "Dessert") img = imageTool.dessert;
			else if(this.type == "Dinner") img = imageTool.dinner;
			else if(this.type == "Lunch") img = imageTool.lunch;
			else if(this.type == "Rotten Meat") img = imageTool.rottenmeat;
			else if(this.type == "MEAT!") img = imageTool.meat;
			else if(this.type == "Bucket of Lard") img = imageTool.bucketoflard;
			else if(this.type == "The Belt") img = imageTool.thebelt;
			else if(this.type == "Roid Rage") img = imageTool.roidrage;
			else if(this.type == "Mini Mushroom") img = imageTool.minimushroom;
			else if(this.type == "Mom's Heels") img = imageTool.momsheels;
			else if(this.type == "Mom's Lipstick") img = imageTool.momslipstick;
			else if(this.type == "Mom's Underwear") img = imageTool.momsunderwear;		
			else if(this.type == "The Sad Onion") img = imageTool.thesadonion;
			else if(this.type == "The Small Rock") img = imageTool.thesmallrock;
			else if(this.type == "Wooden Spoon") img = imageTool.woodenspoon;
			else if(this.type == "Speed Ball") img = imageTool.speedball;
			else if(this.type == "Tooth Picks") img = imageTool.toothpicks;
			else if(this.type == "Skeleton Key") img = imageTool.skeletonkey; //
			else if(this.type == "Pyro") img = imageTool.pyro; //
			else if(this.type == "Raw Liver") img = imageTool.rawliver; //
			else if(this.type == "Growth Hormones") img = imageTool.growthhormones; //
			else if(this.type == "The Halo") img = imageTool.thehalo; //
			else if(this.type == "Magic Mushroom") img = imageTool.magicmushroom; //
			else if(this.type == "Max's Head") img = imageTool.maxshead; //
			else if(this.type == "Number One") img = imageTool.numberone; //
			else if(this.type == "Wire Coat Hanger") img = imageTool.wirecoathanger; //
			else if(this.type == "Jesus Juice") img = imageTool.jesusjuice; //
			
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-7, this.y, this.width+14, this.height);
			context.restore();
			context.drawImage(img, this.x-18, this.y-40, 70, 70);
		}
	}
	this.use = function(){
		// Speed en bonds de 0.2
		// 1 Dmg = 0.2, 0.35
		// 1 range = 35,70,140
		// 1 firerate = 35,70
		if(this.type == "Coin"){Player.gold++;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Nickel"){Player.gold+=5;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Dime"){Player.gold+=10;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Heart"){if(Player.maxhp - Player.hp == 0.5){Player.hp += 0.5;this.clear();}else if(Player.maxhp - Player.hp >= 1){ Player.hp++;this.clear();}}
		else if(this.type == "Half Heart"){if(Player.maxhp - Player.hp >= 0.5){Player.hp += 0.5;this.clear();}}
		else if(this.type == "Key"){if(Player.keys < 99){Player.keys++;this.clear();}}
		else if(this.type == "Skeleton Key"){Player.keys = 99;this.clear();}
		else if(this.type == "Bomb"){if(Player.bombs < 99){Player.bombs++;this.clear();}}
		else if(this.type == "Boom!"){if(Player.bombs < 99){Player.bombs+=10;this.clear();}}
		else if(this.type == "Pyro"){Player.bombs = 99;this.clear();}
		else if(this.type == "<3"){Player.maxhp++;Player.hp = Player.maxhp;this.clear();}
		else if(this.type == "Raw Liver"){Player.maxhp+=2;Player.hp = Player.maxhp;this.clear();}
		else if((this.type == "Breakfast") || (this.type == "Dessert") || (this.type == "Dinner") || (this.type == "Lunch") || (this.type == "Rotten Meat")){Player.maxhp++;Player.hp++;this.clear();}
		else if(this.type == "MEAT!"){Player.maxhp++;Player.hp++;Player.dmgBoost += 0.5;this.clear();}
		else if(this.type == "Bucket of Lard"){Player.maxhp += 2;Player.hp += 0.5;Player.speedBoost -= 0.4;this.clear();}
		else if(this.type == "The Belt"){Player.speedBoost += 0.4;this.clear();}
		else if(this.type == "Growth Hormones"){Player.dmgBoost += 0.35;Player.speedBoost += 0.4;this.clear();}
		else if(this.type == "Roid Rage"){Player.speedBoost += 0.4;this.clear();}
		else if(this.type == "The Halo"){Player.dmgBoost += 0.3;Player.speedBoost += 0.4;Player.rangeBoost += 70;Player.fireRateBoost += 35;Player.maxhp++;Player.hp++;this.clear();}
		else if(this.type == "Magic Mushroom"){Player.dmgBoost += 0.3;Player.speedBoost += 0.4;Player.rangeBoost += 70;Player.dmgMult += 0.5;Player.hp = Player.maxhp;this.clear();}
		else if(this.type == "Mini Mushroom"){Player.speedBoost += 0.4;Player.rangeBoost += 70;this.clear();}
		else if(this.type == "Max's Head"){Player.dmgBoost += 0.35;Player.dmgMult += 0.5;this.clear();}
		else if((this.type == "Mom's Heels") || (this.type == "Mom's Lipstick") || (this.type == "Mom's Underwear")){Player.rangeBoost += 120;this.clear();}
		else if(this.type == "Number One"){Player.rangeBoost -= 240;Player.fireRateBoost += 200;this.clear();} //Note : changer les larmes en jaune et lancer du centre (Player.isNumberOne)
		else if(this.type == "The Sad Onion"){Player.fireRateBoost += 70;this.clear();}
		else if(this.type == "The Small Rock"){Player.dmgBoost += 0.2;Player.fireRateBoost += 35;Player.speedBoost -= 0.4;this.clear();}
		else if(this.type == "Wire Coat Hanger"){Player.fireRateBoost += 105;this.clear();}
		else if(this.type == "Wooden Spoon"){Player.speedBoost += 0.8;this.clear();}
		else if(this.type == "Jesus Juice"){Player.rangeBoost += 70;Player.dmgBoost += 0.35;this.clear();}
		else if(this.type == "Speed Ball"){Player.speedBoost += 0.4;Player.bulletSpeedBoost += 1.2;this.clear();}
		else if(this.type == "Tooth Picks"){Player.fireRateBoost += 85;this.clear();} //Red tears
		
		
		
	}
	this.clear = function(){
		this.alive = false;
	}
}

function createItem(x,y,type){
	//BASIC DROPS
	if(type == "basic"){
		var drop = getRand(100,1);
			if(drop <= 15){
				var choice = getRand(20,1);
				if(choice <= 5) Game.Items.push(new Item(x,y,"Half Heart"));
				else if (choice == 6) Game.Items.push(new Item(x,y,"Heart"));
				else if (choice >= 16){ //COIN DROP
					drop = getRand(100,1);
					if(drop == 1) 			Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Dime"));
					else if(drop >= 76)		Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Nickel"));
					else 					Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Coin"));}
			}
		}
	//POOP DROPS
	else if(type == "poop"){
		var drop = getRand(100,1);
			if(drop <= 40){
				var choice = getRand(20,1);
				if(choice <= 5) Game.Items.push(new Item(x,y,"Half Heart"));
				else if (choice == 6) Game.Items.push(new Item(x,y,"Heart"));
				else if (choice >= 16){ //COIN DROP
					drop = getRand(100,1);
					if(drop == 1) 			Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Dime"));
					else if(drop >= 76)		Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Nickel"));
					else 					Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Coin"));}
			}
		}
	//BOSS
	else if(type == "boss"){
		var choice = getRand(20,1);
		if(choice <= 10)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Half Heart"));
		else if (choice >= 15)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Heart"));
		else{ //COIN DROP
					drop = getRand(100,1);
					if(drop == 1)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Dime"));
					else if(drop >= 76)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Nickel"));
					else Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Coin"));}
	
		var drop = getRand(100,1);
			if(drop <= 50){
				choice = getRand(20,1);
				if(choice <= 10)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Half Heart"));
				else if (choice >= 15)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Heart"));
				else{ //COIN DROP
					drop = getRand(100,1);
					if(drop == 1)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Dime"));
					else if(drop >= 76)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Nickel"));
					else Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Coin"));}}
				
		drop = getRand(100,1);
			if(drop <= 25){
				choice = getRand(20,1);
				if(choice <= 10)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Half Heart"));
				else if (choice >= 15)Game.Items.push(new Item(x+getRand(20,-10),y+getRand(20,-10),"Heart"));
				else { //COIN DROP
					drop = getRand(100,1);
					if(drop == 1)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Dime"));
					else if(drop >= 76)Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Nickel"));
					else Game.Items.push(new Item( x + getRand(20,-10), y + getRand(20,-10) ,"Coin"));}}}
	//NORMAL ROOMS
	else if(type == "normal room"){
		var drop = getRand(100,1);
			if(drop <= 35){
				var choice = getRand(20,1);
				if(choice <= 4)Game.Items.push(new Item(x,y,"Half Heart"));
				else if (choice >= 5 && choice <= 8)Game.Items.push(new Item(x,y,"Heart"));
				else if (choice >= 16)Game.Items.push(new Item(x,y,"Key"));
				else { //COIN DROP
					drop = getRand(100,1);
					if(drop == 1)Game.Items.push(new Item(x,y,"Dime"));
					else if(drop >= 76)Game.Items.push(new Item(x,y,"Nickel"));
					else Game.Items.push(new Item(x,y,"Coin"));}
			}
		}
	
}

//Objet joueur
var Player = {
	x : 100, y : 100,
	height: 36,	width: 36,
	speed : 2.8, accelx : 0, accely : 0, friction : 0.4,
	speedBoost:0, 
	damage : 1,	range : 400, fireRate: 400,	attackSpeed: 8,
	dmgBoost:0, dmgMult:1, rangeBoost:0, fireRateBoost:0, bulletSpeedBoost:0,
	hp : 3,	maxhp: 3, //HP : Vie restante, MAXHP : Vie totale
	gold : 0, keys : 0, bombs : 1,
	head: imageTool.playerDown, //Orientation de la tête
	alive: true, canGetDamage: true, isBumped: false, isSlowed: Date.now(),
	now : Date.now(), lastDamaged : Date.now(), damagedNow : Date.now(),
	update: function(){
		if(this.hp ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
		//Déplacement
		if(this.alive){
			this.now = Date.now();
			detectCollision(Game.traps);
			
			//Additions Boost
			this.speed  = 2.8 + this.speedBoost;
				if(this.speed > 6) this.speed = 6; //Speed cap
			this.damage = (1 + this.dmgBoost) * this.dmgMult;
				if(this.damage > 3.25) this.damage = 3.25; //Dmg cap
			this.range = 400 + this.rangeBoost;
			this.fireRate = 400 - this.fireRateBoost;
				if(this.fireRate < 120) this.fireRate = 150; //Firerate cap
			this.attackSpeed = 8 + this.bulletSpeedBoost; //bonus max de 3
				if(this.attackSpeed > 11) this.attackSpeed = 11; //Bulletspeed cap
				
			if((keyW || keyS) && (keyA || keyD)) this.speed = this.speed*2/3; //Vitesse diagonale fix
			
			//Orientation du mouvement
			var currentMoving = "";
			if(keyW){
				if(this.accely > 0-this.speed){this.accely -= this.friction;}
				else if(this.accely < 0-this.speed){this.accely += this.friction;}
				currentMoving = "up";}				
			if(keyS){
				if(this.accely < this.speed){this.accely += this.friction;}
				else if(this.accely > this.speed){this.accely -= this.friction;}
				currentMoving = "down";}
			if(keyA){
				if(this.accelx > 0-this.speed){this.accelx -= this.friction;}
				else if(this.accelx < 0-this.speed){this.accelx += this.friction;}
				currentMoving = "left";}
			if(keyD){
				if(this.accelx < this.speed){this.accelx += this.friction;}
				else if(this.accelx > this.speed){this.accelx -= this.friction;}
				currentMoving = "right";}
				
			if(this.now - this.isSlowed < 300){ 
				this.accelx = this.accelx*3/4;this.accely = this.accely*3/4;}
			
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
						this.checkCollide(Game.collideMaps,"right");
						this.checkCollide(Game.wallMaps,"right");
						this.checkCollide(Game.holeMaps,"right");
						this.checkCollide(Game.Doors,"right");}
					if(this.accelx*2 < 0){ 
						this.checkCollide(Game.collideMaps,"left");
						this.checkCollide(Game.wallMaps,"left");
						this.checkCollide(Game.holeMaps,"left");
						this.checkCollide(Game.Doors,"left");}
				//Accélération Y
				this.y += this.accely*2;
					if(this.accely*2 > 0){ 
						this.checkCollide(Game.collideMaps,"down");
						this.checkCollide(Game.wallMaps,"down");
						this.checkCollide(Game.holeMaps,"down");
						this.checkCollide(Game.Doors,"down");}
					if(this.accely*2 < 0){ 
						this.checkCollide(Game.collideMaps,"up");
						this.checkCollide(Game.wallMaps,"up");
						this.checkCollide(Game.holeMaps,"up");
						this.checkCollide(Game.Doors,"up");}
			
			//Vérifications
			itemCollision();
			detectCollision(Game.Minions);
			detectCollision(Game.Towers);	
			detectCollision(Game.Bosses);	
			this.checkDamage();	
			//PORTES 
			if(this.x <= 0){changeRoom("left");} // Salle gauche
			if(this.x >= canvas.width -this.width/2){changeRoom("right");} //Salle droite
			if(this.y <= 0){changeRoom("up");} // Salle haut
			if(this.y >= canvas.height -this.height/2){changeRoom("down");} //Salle bas
	},
	
	drawBody : function(context){
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-8, this.y+10, this.width+16, this.height);
			context.restore();
			
		if(this.alive){
			if(!this.canGetDamage){ // Joueur invincible
					context.save();
					context.globalAlpha = 0.5;}
					
					//Joueur Normale
					if(keyD){Animations[1].draw(context);}
					else if(keyA){Animations[2].draw(context);}
					else if(keyW || keyS){Animations[0].draw(context);}
					else context.drawImage(imageTool.bodyIdle,this.x-2, this.y+2, 40, 40);
					context.restore();	}
		if(!this.alive){ //joueur mort		
			context.drawImage(imageTool.bodyIdle,this.x, this.y+2, 40, 40);}
	},
	drawHead : function(context){
		if(this.alive){
			if(!this.canGetDamage){ // Joueur invincible
						context.save();
						context.globalAlpha = 0.5;}
					//Joueur Normal
					context.drawImage(this.head, this.x-14, this.y-32, 64, 55);}
					context.restore();	
	},
	drawUI : function(context,uicontext){
	
		//LifeBar
		var half = this.hp%1;
		var intHp = this.hp - half;
		var diffHp = this.maxhp - (this.hp+half);
		var pool = 0;
		for(var h = 0; h < intHp; h++){
			uicontext.drawImage(imageTool.hp,(pool*17)+12,8,18,16); pool++;}
		if(half !=0){
			uicontext.drawImage(imageTool.halfHp,(pool*17)+12,8,18,16); pool++;}
		for(var d = 0; d < diffHp; d++){
			uicontext.drawImage(imageTool.emptyHp,(pool*17)+12,8,18,16); pool++;}
		
		// Gold
		uicontext.drawImage(imageTool.gold,uicanvas.width-38,22,14,14);
		uicontext.drawImage(imageTool.bombs,uicanvas.width-38,46,14,20);
		uicontext.drawImage(imageTool.keys,uicanvas.width-37,76,14,20);
		uicontext.font = "17pt Wendy";
		uicontext.fillStyle = 'black';
		uicontext.fillText(this.gold, uicanvas.width-21,35);
		uicontext.fillText(this.bombs, uicanvas.width-21,64);
		uicontext.fillText(this.keys, uicanvas.width-21,91);
		
		// FPS
		context.font = "15pt Wendy";
		context.fillStyle = 'white';
		var fpsOut = (1000/frameTime).toFixed() + " FPS";
		context.fillText(fpsOut, canvas.width-50,canvas.height-8);
		/*
		if(gameIsPaused()){
		var gap = 300;
			context.drawImage(imageTool.stats,220,300,240,120); //Stats		
			for(var s = 0; s < Player.speedBoost; s++){	context.drawImage(imageTool.stat,(s*10)+456,8+gap,6,13); } //SPEED
			for(var d = 0; d < Player.dmgBoost; d++){ context.drawImage(imageTool.stat,(d*10)+456,31+gap,6,13); } //DMG
			for(var f = 0; f < Player.fireRateBoost; f++){ context.drawImage(imageTool.stat,(f*10)+456,54+gap,6,13); } //FIRERATE
			for(var r = 0; r < Player.rangeBoost; r++){	context.drawImage(imageTool.stat,(r*10)+456,100+gap,6,13); } //RANGE
		}*/
	},
	getDamage : function(dmg,enemyx,enemyy){
		this.enemyx = enemyx;
		this.enemyy = enemyy;
		if(this.alive && this.hp > 0){ //Si vivant
			this.damagedNow = Date.now(); //Moment ou le dégat est pris
			if( this.damagedNow - this.lastDamaged > 500){ //Si le dernier dégat date d'une seconde
				this.hp -= dmg;//retirer les points de vie
				//GAMEOVER
				if(this.hp <= 0){					
					sounds.playerDeath.currentTime = 0;
					sounds.playerDeath.play();
					document.location.href = "";}
				else { sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
				this.lastDamaged = Date.now(); }
		}
	},
	checkDamage : function(){ //calcul d'invulnérabilité temporaire
		if( this.now - this.lastDamaged > 1000){this.canGetDamage = true;}	//compare le temps actuel avec le temps du dernier dégat
		else this.canGetDamage = false;
	},
	checkCollide : function(obj,pos){ //calcul de collision Up
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(obj[i].isColliding){
					if(pos == "up")this.y = obj[i].y+obj[i].height;
					else if(pos == "down")this.y = obj[i].y-this.height;
					else if(pos == "left")this.x = obj[i].x+obj[i].width;
					else if(pos == "right")this.x = obj[i].x-this.width;}}}},
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
		bulletCollision(playerBulletsBack, Game.Bosses);
		bulletCollision(playerBullets, Game.Bosses);
		bulletCollision(playerBulletsBack, Game.Minions);
		bulletCollision(playerBullets, Game.Minions);
		bulletCollision(playerBulletsBack, Game.Towers);
		bulletCollision(playerBullets, Game.Towers);
		bulletCollision(playerBulletsBack, Game.collideMaps);
		bulletCollision(playerBullets, Game.collideMaps);
		bulletCollision(playerBulletsBack, Game.wallMaps);
		bulletCollision(playerBullets, Game.wallMaps);
		
		if(Game.combatMode!=0){bulletCollision(playerBulletsBack, Game.Doors);}
		if(Game.combatMode!=0){bulletCollision(playerBullets, Game.Doors);}
		
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
		}	
	}
	
	this.draw = function(context){  //Affichage
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+30, this.width, this.height);
			context.restore();
		context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);}
	}
	this.clear = function(){
		this.alive = false;
	}
}

function detectCollision(obj){
	var safeGap = 0;
	for(var i=0;i<obj.length;i++){
		if (Player.x < obj[i].x + obj[i].width-safeGap  && Player.x + Player.width-safeGap  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height-safeGap && Player.y + Player.height-safeGap > obj[i].y) {
				if(obj == Game.Minions || obj == Game.Towers || obj == Game.Bosses) Player.getDamage(obj[i].dmg, obj[i].x, obj[i].y);
				else if(obj == Game.traps) Player.isSlowed = Date.now(); }}
}

function holeCollision(obj){
	var safeGap = 0;
	for(var i=0;i<obj.length;i++){
		if (Player.x < obj[i].x + obj[i].width-safeGap  && Player.x + Player.width-safeGap  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height-safeGap && Player.y + Player.height-safeGap > obj[i].y) {
			Player.getDamage(obj[i].dmg);}}
}

function bulletCollision(projectile,obj){
	var safeGap = 0;
	if((obj == Game.collideMaps) || (obj == Game.Doors) || (obj == Game.wallMaps)) safeGap = 10;
	for(var i=0;i<projectile.length;i++){
		// Enemies
		for(var j=0;j<obj.length;j++){
			if (projectile[i].x < obj[j].x + (obj[j].width-safeGap)  && projectile[i].x + (projectile[i].width-safeGap)  > obj[j].x &&
			projectile[i].y < obj[j].y + (obj[j].height-safeGap) && projectile[i].y + (projectile[i].height-safeGap) > obj[j].y) {
				if((obj == Game.Minions) || (obj == Game.Towers) || (obj == Game.Bosses)){
					projectile[i].clear();
					obj[j].getDamage(projectile[i].dmg);
					sounds.impact.currentTime = 0;
					sounds.impact.play();}
				else if((obj == Game.wallMaps) || (obj == Game.collideMaps)){
					if(obj[j].isColliding){
						sounds.impact.currentTime = 0;
						sounds.impact.play();
						projectile[i].clear();
						if(obj[j].type == "poop") obj[j].state++;}}
					}}}
}
