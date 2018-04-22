//objet minion
function Minion(x,y,speed){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 50;
	this.width = 50;
	this.speed = speed;
	this.maxHp = 2;
	this.hp = 2;
	this.dmg = 1;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
			this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			// Mode poursuite
			if(!this.isHit){
				// X
				this.x += this.dirx*this.speed;
					if(this.dirx > 0){ //Est à gauche du joueur
						this.checkCollideRight();}
					if(this.dirx < 0){ //Est à droite du joueur
						this.checkCollideLeft();}
				// Y
				this.y += this.diry*this.speed;
					if(this.diry > 0){ //Est au dessus du joueur
						this.checkCollideDown();}
					if(this.diry < 0){ //Est en dessous du joueur
						this.checkCollideUp();}
				uiData.draw(this.dirx,this.diry);
				}
			// Mode "bump" (a été touché)
			if(this.isHit){
				this.x -= this.dirx*(Player.attackSpeed);
					if(this.dirx < 0){ //Est à gauche du joueur
						this.checkCollideRight();}
					if(this.dirx > 0){ //Est à droite du joueur
						this.checkCollideLeft();}
						
				this.y -= this.diry*(Player.attackSpeed);
					if(this.diry < 0){ //Est au dessus du joueur
						this.checkCollideDown();}
					if(this.diry > 0){ //Est en dessous du joueur
						this.checkCollideUp();}
				}
		}
	}
	this.draw = function(context){  //Affichage
		//Si le minion est vivant
		if(this.alive){
			if(!this.isHit){
				var opac = (this.maxHp-this.hp)/this.maxHp;
				context.drawImage(imageTool.minion, this.x, this.y, this.width, this.height);
				context.save();
				context.globalAlpha = opac;
				context.drawImage(imageTool.minionDamaged, this.x, this.y, this.width, this.height);
				context.restore();				}
			if(this.isHit){
				var opac = (this.maxHp-this.hp)/this.maxHp;
				context.drawImage(imageTool.minion, this.x, this.y, this.width, this.height);
				context.save();
				context.globalAlpha = opac;
				context.drawImage(imageTool.minionDamaged, this.x, this.y, this.width, this.height);
				context.restore();
				context.save();
				context.globalAlpha = 0.7;
				context.drawImage(imageTool.hit, this.x, this.y, this.width, this.height);
				context.restore();}
		}
	}
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0){
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp == 0){
			createItem(this.x,this.y);
			this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 80){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollideUp = function(){ //calcul de collision Up
		for(var i=0;i<collideMaps.length;i++){
			if(this.y < collideMaps[i].y + collideMaps[i].height && this.y + this.height > collideMaps[i].y && this.x + this.width  > collideMaps[i].x && this.x < collideMaps[i].x + collideMaps[i].width ){
			this.y = collideMaps[i].y+collideMaps[i].height;}}}
			
	this.checkCollideDown = function(){ //calcul de collision S
		for(var i=0;i<collideMaps.length;i++){
			if(this.y < collideMaps[i].y + collideMaps[i].height && this.y + this.height > collideMaps[i].y && this.x + this.width  > collideMaps[i].x && this.x < collideMaps[i].x + collideMaps[i].width ){
			this.y = collideMaps[i].y-this.height;}}}
			
	this.checkCollideLeft = function(){ //calcul de collision W
		for(var i=0;i<collideMaps.length;i++){
			if(this.y < collideMaps[i].y + collideMaps[i].height && this.y + this.height > collideMaps[i].y && this.x + this.width  > collideMaps[i].x && this.x < collideMaps[i].x + collideMaps[i].width ){
			this.x = collideMaps[i].x+collideMaps[i].width;}}}
			
	this.checkCollideRight = function(){ //calcul de collision S
		for(var i=0;i<collideMaps.length;i++){
			if(this.y < collideMaps[i].y + collideMaps[i].height && this.y + this.height > collideMaps[i].y && this.x + this.width  > collideMaps[i].x && this.x < collideMaps[i].x + collideMaps[i].width ){
			this.x = collideMaps[i].x-this.width;}}}
}


//objet tower
function Tower(x,y){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 64;
	this.width = 64;
	this.maxHp = 2;
	this.hp = 2;
	this.dmg = 1;
	this.fireRate = 700;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
		}
	};
	this.draw = function(context){  //Affichage
		//Si le minion est vivant
		if(this.alive){
			if(!this.isHit){
				var opac = (this.maxHp-this.hp)/this.maxHp;
				context.drawImage(imageTool.tower, this.x, this.y, this.width, this.height);
				context.save();
				context.globalAlpha = opac;
				context.drawImage(imageTool.towerDamaged, this.x, this.y, this.width, this.height);
				context.restore();				}
			if(this.isHit){
				var opac = (this.maxHp-this.hp)/this.maxHp;
				context.drawImage(imageTool.tower, this.x, this.y, this.width, this.height);
				context.save();
				context.globalAlpha = opac;
				context.drawImage(imageTool.towerDamaged, this.x, this.y, this.width, this.height);
				context.restore();
				context.save();
				context.globalAlpha = 0.7;
				context.drawImage(imageTool.hit, this.x, this.y, this.width, this.height);
				context.restore();}
		}
	};
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0){
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp == 0){createItem(this.x,this.y); this.alive = false;}
		}
	};
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 120){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
}


//Tower attack
function towerFire(dir,mov){
	var bulx = 0;
	var buly = 0;
	if(dir == mov){	var range = Player.range*(1+Player.speed/15);	var speed = Player.attackSpeed+Player.speed;	}
	else {var range = Player.range; var speed = Player.attackSpeed;}
	
	var fireNow = Date.now();
	if( fireNow - towerLastFire > Player.fireRate){
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
		towerLastFire = Date.now();
	}
}

//projectile
function towerBullet(side,speed,range,bulx,buly,dmg){
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
		if(this.alive && this.side == "right"){			
			this.targetx = this.inix + this.range;
			if(this.x < this.targetx) this.x += this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "left"){			
			this.targetx = this.inix - this.range;
			if(this.x > this.targetx) this.x -= this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "up"){
			this.targety = this.iniy - this.range;
			if(this.y > this.targety) this.y -= this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "down"){			
			this.targety = this.iniy + this.range;
			if(this.y < this.targety) this.y += this.speed;
			else this.alive = false;}
	};
	this.draw = function(context){  //Affichage
		if(this.alive) context.drawImage(imageTool.towerBullet, this.x, this.y, this.width, this.height);
	};
	this.clear = function(){
		this.range = 0;
		this.x = 0;
		this.y = 0;
		this.height = 0;
		this.width = 0;
		this.speed = 0;
		this.dmg = 0;
		this.alive = false;
	};
}