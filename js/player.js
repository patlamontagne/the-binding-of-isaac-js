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
				this.y -= this.diry*(Player.attackSpeed);
			}
			if(!this.isHit){
				this.x +=0;
				this.y +=0;
			}
	}
	this.draw = function(context){
		if(this.alive){
			var img;
			if(this.type == 1){img = imageTool.coin;}
			if(this.type == 2){img = imageTool.health;}
			if(this.type == 3){img = imageTool.maxHealth;}
			context.drawImage(img, this.x, this.y, this.width, this.height);
		}
	}
	this.use = function(){
		if(this.type == 1){Player.gold++;this.alive=false;}
		if(this.type == 2){if(Player.hp < Player.maxhp){Player.hp++;this.alive=false;}}
		if(this.type == 3){if(Player.maxhp < Player.lifebar){Player.maxhp++;this.alive=false;}}
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
		if( this.now - this.lastDamaged < 40){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
}

function createItem(x,y){
	var drop = getRand(100,1);
	var type = 1;
	if(drop >= 1 && drop<= 25){type = 2;}
	if(drop > 25 && drop<= 50){type = 3;}
	
	Items[ItemCounter] = new Item(x+20,y+20,type);
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
	speed : 4,
	friction: 0.5,
	damage : 1,
	range : 400,
	fireRate: 600,
	attackSpeed: 8,
	hp : 2,	// Vie (actuelle)
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
		//Déplacement
		if(this.alive){
			itemCollision();
			detectCollision(Minions);
			this.checkDamage();
			var currentMoving = "";
				if(keyW){
					this.y -= this.speed;
					this.head = imageTool.playerUp;
					currentMoving = "up";
					detectCollision(Towers);
					this.checkCollideW(collideMaps);
					this.checkCollideW(Towers);}				
				if(keyS){
					this.y += this.speed;
					this.head = imageTool.playerDown;
					currentMoving = "down";
					detectCollision(Towers);
					this.checkCollideS(collideMaps);
					this.checkCollideS(Towers);}
				
				if(keyA){					
					this.x -= this.speed;
					this.head = imageTool.playerLeft;
					currentMoving = "left";
					detectCollision(Towers);
					this.checkCollideA(collideMaps);
					this.checkCollideA(Towers);}
				if(keyD){
					this.x += this.speed;
					this.head = imageTool.playerRight;
					currentMoving = "right";
					detectCollision(Towers);
					this.checkCollideD(collideMaps);
					this.checkCollideD(Towers);}
			
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
		}
	},
	draw : function(context,statContext){
		if(this.alive){
			if(this.canGetDamage){
				context.drawImage(this.head, this.x, this.y, this.width, this.height);}
			if(!this.canGetDamage){
				context.drawImage(this.head, this.x, this.y, this.width, this.height);
				context.drawImage(imageTool.noDamage, this.x-10, this.y-10, 70, 70);
			}
		}
		if(!this.alive) context.drawImage(imageTool.playerDead, this.x, this.y, this.width, this.height);
		
		//LifeBar
		var diffHp = this.maxhp - this.hp;
		var pool = 0;
		for(var h = 0; h < this.hp; h++){
			statContext.drawImage(imageTool.hp,(pool*39)+10,5,44,32);
			pool++;
		}
		for(var d = 0; d < diffHp; d++){
			statContext.drawImage(imageTool.emptyHp,(pool*39)+10,8,39,27);
			pool++;
		}
	},
	getDamage : function(dmg){
		if(this.alive && this.hp > 0){ //Si vivant
			this.damagedNow = Date.now(); //Moment ou le dégat est pris
			if( this.damagedNow - this.lastDamaged > 1000){ //Si le dernier dégat date d'une seconde
				this.hp -= dmg;//retirer les points de vie
				this.lastDamaged = Date.now();
				} 
		}
		else if(this.hp ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
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
	if(dir == mov){	var range = Player.range*(1+Player.speed/15);	var speed = Player.attackSpeed+Player.speed;	}
	else {var range = Player.range; var speed = Player.attackSpeed;}
	
	var fireNow = Date.now();
	if( fireNow - lastFire > Player.fireRate){
		switch(dir){
			case "left":	bulx = Player.x-9;
							buly = Player.y + (Player.height/2)-9;
							playerBullets.push(new Bullet("left",speed,range,bulx,buly,Player.damage));
							break;
			case "up":		bulx = Player.x + (Player.width/2)-9;
							buly = Player.y-9;
							playerBullets.push(new Bullet("up",speed,range,bulx,buly,Player.damage));
							break;
			case "right": 	bulx = Player.x + (Player.width/2)+18;
							buly = Player.y + (Player.height/2)-9;
							playerBullets.push(new Bullet("right",speed,range,bulx,buly,Player.damage));
							break;
			case "down": 	bulx = Player.x + (Player.width/2)-9;
							buly = Player.y + (Player.height/2)+18;
							playerBullets.push(new Bullet("down",speed,range,bulx,buly,Player.damage));
							break;
		}
		lastFire = Date.now();
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
	this.height = 18;
	this.width = 18;
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
		if(this.alive) context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);
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


function bulletCollision(obj){
	for(var i=0;i<playerBullets.length;i++){
		// Enemies
		for(var j=0;j<obj.length;j++){
			if (playerBullets[i].x < obj[j].x + obj[j].width-6  && playerBullets[i].x + (playerBullets[i].width-6)  > obj[j].x &&
			playerBullets[i].y < obj[j].y + obj[j].height-6 && playerBullets[i].y + (playerBullets[i].height-6) > obj[j].y) {
				obj[j].getDamage(playerBullets[i].dmg);
				playerBullets[i].clear();
				}
		}
		// Collision map
		for(var m=0; m<collideMaps.length;m++){
			if (playerBullets[i].x < collideMaps[m].x + collideMaps[m].width-14  && playerBullets[i].x + (playerBullets[i].width-14)  > collideMaps[m].x &&
			playerBullets[i].y < collideMaps[m].y + collideMaps[m].height-14 && playerBullets[i].y + (playerBullets[i].height-14) > collideMaps[m].y) {
				playerBullets[i].clear();}
		}
	}
}
