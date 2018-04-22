//objet minion
function Minion(x,y,hp){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 32;
	this.width = 32;
	this.speed = 1;
	this.maxHp = hp;
	this.hp = hp;
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
			this.dirx = (Player.x) - (this.x - this.width/2);
			this.diry = (Player.y) - (this.y - this.height/2);
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
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+10, this.width, this.height);
			context.restore();
			
			if(!this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.minion, this.x, this.y, this.width, this.height);}
			if(this.isHit){
				context.drawImage(imageTool.minionHit, this.x, this.y, this.width, this.height);}
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
			if(this.hp <= 0){
			sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
			createItem(this.x+5,this.y+5);
			this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 120){ //compare le temps actuel avec le temps du dernier dégat
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

//objet fly
function Fly(x,y,hp){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 22;
	this.width = 22;
	this.speed = 2;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 1;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le fly est vivant
		if(this.alive){
			this.checkDamage();
			this.dirx = (Player.x) - (this.x - this.width/2);
			this.diry = (Player.y) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			// Mode poursuite
			if(!this.isHit){
				// X
				this.x += this.dirx*this.speed;
				// Y
				this.y += this.diry*this.speed;
				}
			// Mode "bump" (a été touché)
			if(this.isHit){
				this.x -= this.dirx*(Player.attackSpeed+1);
						
				this.y -= this.diry*(Player.attackSpeed+1);
				}
		}
	}
	this.draw = function(context){  //Affichage
		//Si vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+30, this.width, this.height);
			context.restore();
			
			if(!this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.fly, this.x, this.y, this.width, this.height);}
			if(this.isHit){
				context.drawImage(imageTool.flyHit, this.x, this.y, this.width, this.height);}
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
			if(this.hp <= 0){
			sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
			createItem(this.x,this.y+5);
			this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 160){ //compare le temps actuel avec le temps du dernier dégat
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
function Tower(x,y,hp){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 64;
	this.width = 64;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 1;
	this.fireRate =2000;
	this.attackSpeed= 1.5;
	this.range = 1000;
	this.alive = true;
	this.now = Date.now();
	this.lastFire = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
				this.attack();			
		}
	}
	this.draw = function(context){  //Affichage
		//Si vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y, this.width+5, this.height+10);
			context.restore();
			if(!this.isHit){
				context.drawImage(imageTool.tower, this.x, this.y-5, this.width+6, this.height+6);}
			if(this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.towerHit, this.x, this.y-5, this.width+6, this.height+6);}
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
			if(this.hp <= 0){createItem(this.x,this.y);sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play(); this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 120){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.attack = function(){ 
		this.now = Date.now();
		if( this.now - this.lastFire > this.fireRate){ //compare le temps actuel avec le temps de la derniere attaque
			
			this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
			towerFire(this.x,this.y,this.dirx,this.diry,this.range,this.dmg,this.attackSpeed);
			this.lastFire = Date.now();
			}
	}
}


//Tower attack
function towerFire(x,y,dirx,diry,range,dmg,speed){
	var bulx = x;
	var buly = y;
		//up
		towerBullets[towerBulletsCounter] = new towerBullet("up",speed,range,bulx+24,buly+24,dirx,diry,dmg);
		towerBulletsCounter++;
	
}

//projectile
function towerBullet(side,speed,range,bulx,buly,dirx,diry,dmg){
	this.side = side;
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = dirx;
	this.diry = diry;
	this.height = 22;
	this.width = 22;
	this.dmg = dmg;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		towerBulletCollision();
			
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			
			
			/* TETE CHERCHEUSE (tout mettre dans update bullet)
			this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			*/
		// X
		this.x -= this.dirx*-this.speed;
		// Y
		this.y -= this.diry*-this.speed;
			
		/* LIGNE DROITE	
		if(this.alive && this.side == "right"){			
			this.dirx = this.inix + this.range;
			if(this.x < this.dirx) this.x += this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "left"){			
			this.dirx = this.inix - this.range;
			if(this.x > this.dirx) this.x -= this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "up"){
			this.diry = this.iniy - this.range;
			if(this.y > this.diry) this.y -= this.speed;
			else this.alive = false;}
		if(this.alive && this.side == "down"){			
			this.diry = this.iniy + this.range;
			if(this.y < this.diry) this.y += this.speed;
			else this.alive = false;} */
	}
	this.draw = function(context){  //Affichage
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+20, this.width, this.height);
			context.restore();
		if(this.alive) context.drawImage(imageTool.towerBullet, this.x, this.y, this.width, this.height);
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

function towerBulletCollision(){
	for(var i=0;i<towerBullets.length;i++){
		// Player
		if (towerBullets[i].x < Player.x + Player.width-6  && towerBullets[i].x + (towerBullets[i].width-6)  > Player.x &&
		towerBullets[i].y < Player.y + Player.height-6 && towerBullets[i].y + (towerBullets[i].height-6) > Player.y) {
			Player.getDamage(towerBullets[i].dmg);
			towerBullets[i].clear();
			towerBulletsCounter--;
		}
		// Collision map
		for(var m=0; m<collideMaps.length;m++){
			if (towerBullets[i].x < collideMaps[m].x + collideMaps[m].width-14  && towerBullets[i].x + (towerBullets[i].width-14)  > collideMaps[m].x &&
			towerBullets[i].y < collideMaps[m].y + collideMaps[m].height-14 && towerBullets[i].y + (towerBullets[i].height-14) > collideMaps[m].y) {
			towerBullets[i].clear();
			towerBulletsCounter--;}
		}
		if(!towerBullets[i].alive) towerBullets.splice(i,1);
	}
}