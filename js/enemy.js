//objet minion
function Minion(x,y,hp){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 32;
	this.width = 32;
	this.speed = 4;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.lastAng = Date.now();
	this.angNow = Date.now();
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
				
			this.checkDamage();
			this.angNow = Date.now();
			if( !this.isHit && (this.angNow - this.lastAng > 700)){
			var angle = getRand(360,0);
			this.diry = Math.sin(angle);
			this.dirx = Math.cos(angle);
			this.lastAng = Date.now();}
			
		
			if(!this.isHit){
				// X
				this.x += this.dirx*this.speed;
					if(this.dirx > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"right") ||
						this.checkCollide(Gamelevel.holeMaps,"right") ||
						this.checkCollide(Gamelevel.Doors,"right")){this.dirx = -this.dirx;}
						}
					if(this.dirx < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"left") ||
						this.checkCollide(Gamelevel.holeMaps,"left") ||
						this.checkCollide(Gamelevel.Doors,"left")){this.dirx = -this.dirx;}
						}
				// Y
				this.y += this.diry*this.speed;
					if(this.diry > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"down") ||
						this.checkCollide(Gamelevel.holeMaps,"down") ||
						this.checkCollide(Gamelevel.Doors,"down")){this.diry = -this.diry;}
						}
					if(this.diry < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"up") ||
						this.checkCollide(Gamelevel.holeMaps,"up") ||
						this.checkCollide(Gamelevel.Doors,"up")){this.diry = -this.diry;}
						}
				}
			// Mode "bump" (a été touché)
			if(this.isHit){
				this.dirx = (Player.x) - (this.x - this.width/2);
				this.diry = (Player.y) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				this.x -= this.dirx*(Player.attackSpeed);
					if(this.dirx < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"right") ||
						this.checkCollide(Gamelevel.holeMaps,"right") ||
						this.checkCollide(Gamelevel.Doors,"right")){this.dirx = -this.dirx;}
						}
					if(this.dirx > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"left") ||
						this.checkCollide(Gamelevel.holeMaps,"left") ||
						this.checkCollide(Gamelevel.Doors,"left")){this.dirx = -this.dirx;}
						}
						
				this.y -= this.diry*(Player.attackSpeed);
					if(this.diry < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"down") ||
						this.checkCollide(Gamelevel.holeMaps,"down") ||
						this.checkCollide(Gamelevel.Doors,"down")){this.diry = -this.diry;}
						}
					if(this.diry > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"up") ||
						this.checkCollide(Gamelevel.holeMaps,"up") ||
						this.checkCollide(Gamelevel.Doors,"up")){this.diry = -this.diry;}
						}
			}
		}
	}
	this.draw = function(context){  //Affichage
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si le minion est vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+10, this.width, this.height);
			context.restore();
			
			if(!this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.minion, this.x-3, this.y-3, this.width+6, this.height+6);}
			if(this.isHit){
				context.drawImage(imageTool.minionHit, this.x-3, this.y-3, this.width+6, this.height+6);}
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
			
			bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
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
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
				else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
				else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
				else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
}

//objet fly
function Fly(x,y,hp){
	this.x = x;
	this.y = y;
	this.anim =0;
	this.dirx = 0;
	this.diry = 0;
	this.height = 22;
	this.width = 22;
	this.speed = 3;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
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
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
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
			bleed(1,this.x,this.y-10,this.y+30,this.height,this.width,-40,-40,1/2);
			sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
			createItem(this.x,this.y+5);
			this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 80){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
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
	this.dmg = 0.5;
	this.fireRate = getRand(2000,750);
	this.attackSpeed= 4;
	this.range = 1000;
	this.alive = true;
	this.now = Date.now() ;
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
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
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
			if(this.hp <= 0){
				bleed(3,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,4/5);
				createItem(this.x,this.y);sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play(); this.alive = false;}
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
			Gamelevel.towerBullets.push(new towerBullet(this.attackSpeed,this.range,this.x+24,this.y+24,this.dirx,this.diry,this.dmg));
			this.lastFire = Date.now();	}
		
	}
}
//projectile
function towerBullet(speed,range,bulx,buly,dirx,diry,dmg){
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = dirx;
	this.diry = diry;
	this.height = 24;
	this.width = 24;
	this.dmg = dmg;
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive){
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			// X
			this.x -= this.dirx*-this.speed;
			// Y
			this.y -= this.diry*-this.speed;
			/* TETE CHERCHEUSE (tout mettre dans update bullet)
			this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			*/
		
		
		towerBulletCollisionPlayer();
		towerBulletCollisionLevel();
		}
			
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
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+20, this.width, this.height);
			context.restore();
		if(this.alive) context.drawImage(imageTool.towerBullet, this.x, this.y, this.width, this.height);
	}
}
function towerBulletCollisionPlayer(){
	for(var i=0;i<Gamelevel.towerBullets.length;i++){
		// Player
		if (Gamelevel.towerBullets[i].x < Player.x + Player.width-6  &&
		Gamelevel.towerBullets[i].x + (Gamelevel.towerBullets[i].width-6)  > Player.x &&
		Gamelevel.towerBullets[i].y < Player.y + Player.height-6 &&
		Gamelevel.towerBullets[i].y + (Gamelevel.towerBullets[i].height-6) > Player.y) {
			Player.getDamage(Gamelevel.towerBullets[i].dmg);
			Gamelevel.towerBullets[i].alive = false;}
	}
}
function towerBulletCollisionLevel(){
	for(var y =0;y<Gamelevel.towerBullets.length;y++){
		// Collision map
		for(var m=0; m<Gamelevel.collideMaps.length;m++){
			if (Gamelevel.towerBullets[y].x < Gamelevel.collideMaps[m].x + Gamelevel.collideMaps[m].width-14  &&
			Gamelevel.towerBullets[y].x + (Gamelevel.towerBullets[y].width-14)  > Gamelevel.collideMaps[m].x &&
			Gamelevel.towerBullets[y].y < Gamelevel.collideMaps[m].y + Gamelevel.collideMaps[m].height-14 &&
			Gamelevel.towerBullets[y].y + (Gamelevel.towerBullets[y].height-14) > Gamelevel.collideMaps[m].y) {
			Gamelevel.towerBullets[y].alive = false;}
		}
	}
}

//Boss
function Boss(x,y,hp){
	this.x = x;
	this.y = y;
	this.angNow = Date.now();
	this.lastAng = Date.now();
	this.angle = 100;
	this.dirx = Math.sin(this.angle);
	this.diry = Math.cos(this.angle);
	this.height = 96;
	this.width = 96;
	this.speed = 5;
	this.maxHp = hp;
	this.hp = this.maxHp;
	this.dmg = 0.5;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.isHit = false;
	this.canSpawn = true;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.angNow = Date.now();
			if( !this.isHit && (this.angNow - this.lastAng > 4000)){
			angle = getRand(360,0);
			this.diry = Math.sin(angle);
			this.dirx = Math.cos(angle);
			this.lastAng = Date.now();}
			this.checkDamage();
			
			if(this.canSpawn){
				Gamelevel.Minions.push(new Fly(this.x+getRand(128,1),this.y+getRand(128,1),2));
				this.canSpawn = false;
			}
			
			
				// X
				this.x += this.dirx*this.speed;
					if(this.dirx > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"right") ||
						this.checkCollide(Gamelevel.Doors,"right")){this.dirx = -this.dirx;}
						}
					if(this.dirx < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"left") ||
						this.checkCollide(Gamelevel.Doors,"left")){this.dirx = -this.dirx;}
						}
				// Y
				this.y += this.diry*this.speed;
					if(this.diry > 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"down") ||
						this.checkCollide(Gamelevel.Doors,"down")){this.diry = -this.diry;}
						}
					if(this.diry < 0){ 
						if(this.checkCollide(Gamelevel.collideMaps,"up") ||
						this.checkCollide(Gamelevel.Doors,"up")){this.diry = -this.diry;}
						}
				
		}
	}
	this.draw = function(context){  //Affichage
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si le minion est vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+50, this.width, this.height);
			context.restore();
			
			if(this.isHit){
				context.drawImage(imageTool.flyBossHit, this.x-19, this.y-19, this.width+32, this.height+32);}
			if(!this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.flyBoss, this.x-16, this.y-16, this.width+32, this.height+32);}
				
				
			//HP BAR
			var percentLeft = (this.hp / this.maxHp)*100;
			context.drawImage(imageTool.bossBg,310,20,400,24);
			for(var h = 0; h < percentLeft; h++){context.drawImage(imageTool.bossHp,(h*3)+360,24,3,16);}
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
			this.canSpawn = true;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				bleed(6,this.x,this.y-20,this.y+40,this.height,this.width,-80,-80,1.2);
				
				Gamelevel.Minions.push(new Minion(this.x,this.y,4));
				Gamelevel.Minions.push(new Minion(this.x,this.y+this.height/2,4));
				Gamelevel.Minions.push(new Minion(this.x+this.width,this.y,4));
				Gamelevel.Minions.push(new Minion(this.x+this.width,this.y+this.height/2,4));
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+this.width/2,this.y+this.height/2);
				this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 80){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
				else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
				else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
				else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
}