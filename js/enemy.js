//objet minion
function Minion(x,y,hp,type,sleeping){
	this.type = type;
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 20;
	this.width = 30;
	this.speed = 5;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.direction = getRand(360,0);
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.lastAng = Date.now();
	this.lastFrameTime = Date.now();
	this.updateTime = 35;
	this.frame = 0;
	this.maxFrame = 0;
	this.isHit = false;
	this.isMoving = true;
	this.isSleeping = sleeping;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
			this.now = Date.now();
			//Animations mouvement
			this.maxFrame = 3;
			if(this.now - this.lastFrameTime > this.updateTime){
				this.frame++;
				if (this.frame > this.maxFrame) this.frame = 0;
				this.lastFrameTime=Date.now();}
			
			if(this.type == "spider" || this.type == "buttspider"){
				this.height = 20;
				this.width = 30;
				this.speed = 5;
				if(this.now - this.lastAng > getRand(1000,1000)){
					
					this.lastAng = Date.now();
					this.dirx = (Player.x) - (this.x - this.width/2);
					this.diry = (Player.y) - (this.y - this.height/2);
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					
					if(hyp <= 300){
						this.isSleeping = false;
						this.dirx = this.dirx/hyp;
						this.diry = this.diry/hyp;}
					else{
						var angle = getRand(360,0);
						this.diry = Math.sin(angle);
						this.dirx = Math.cos(angle);}}
					
				if( !this.isSleeping && !this.isHit && (this.now - this.lastAng < 500)){
					// X
					this.x += this.dirx*this.speed;
					if(this.dirx > 0){ 
						if(this.checkCollide(Game.collideMaps,"right") ||
						this.checkCollide(Game.holeMaps,"right") ||
						this.checkCollide(Game.wallMaps,"right") ||
						this.checkCollide(Game.Doors,"right")){this.dirx = -this.dirx;}}
					if(this.dirx < 0){ 
						if(this.checkCollide(Game.collideMaps,"left") ||
						this.checkCollide(Game.holeMaps,"left") ||
						this.checkCollide(Game.wallMaps,"left") ||
						this.checkCollide(Game.Doors,"left")){this.dirx = -this.dirx;}}
					// Y
					this.y += this.diry*this.speed;
					if(this.diry > 0){ 
						if(this.checkCollide(Game.collideMaps,"down") ||
						this.checkCollide(Game.holeMaps,"down") ||
						this.checkCollide(Game.wallMaps,"down") ||
						this.checkCollide(Game.Doors,"down")){this.diry = -this.diry;}}
					if(this.diry < 0){ 
						if(this.checkCollide(Game.collideMaps,"up") ||
						this.checkCollide(Game.holeMaps,"up") ||
						this.checkCollide(Game.wallMaps,"up") ||
						this.checkCollide(Game.Doors,"up")){this.diry = -this.diry;}}
						this.isMoving = true;}
					else this.isMoving = false;
			}
			
			/*
			else if(this.type == "bigfly"){
				this.diry = Math.sin(angle);
				this.dirx = Math.cos(angle);
				// X
				this.x += this.dirx*this.speed;
				if(this.dirx > 0){ 
					if(this.checkCollide(Game.collideMaps,"right") ||
					this.checkCollide(Game.holeMaps,"right") ||
					this.checkCollide(Game.Doors,"right")){this.dirx = -this.dirx;}}
				if(this.dirx < 0){ 
					if(this.checkCollide(Game.collideMaps,"left") ||
					this.checkCollide(Game.holeMaps,"left") ||
					this.checkCollide(Game.Doors,"left")){this.dirx = -this.dirx;}}
				// Y
				this.y += this.diry*this.speed;
				if(this.diry > 0){ 
					if(this.checkCollide(Game.collideMaps,"down") ||
					this.checkCollide(Game.holeMaps,"down") ||
					this.checkCollide(Game.Doors,"down")){this.diry = -this.diry;}}
				if(this.diry < 0){ 
					if(this.checkCollide(Game.collideMaps,"up") ||
					this.checkCollide(Game.holeMaps,"up") ||
					this.checkCollide(Game.Doors,"up")){this.diry = -this.diry;}}
			} */
		
			
			// Mode "bump" (a été touché)
			if(this.isHit){
				this.dirx = (Player.x) - (this.x - this.width/2);
				this.diry = (Player.y) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				this.x -= this.dirx*(Player.attackSpeed/2);
					if(this.dirx < 0){ 
						if(this.checkCollide(Game.collideMaps,"right") ||
						this.checkCollide(Game.holeMaps,"right") ||
						this.checkCollide(Game.wallMaps,"right") ||
						this.checkCollide(Game.Doors,"right")){this.dirx = -this.dirx;}}
					if(this.dirx > 0){ 
						if(this.checkCollide(Game.collideMaps,"left") ||
						this.checkCollide(Game.holeMaps,"left") ||
						this.checkCollide(Game.wallMaps,"left") ||
						this.checkCollide(Game.Doors,"left")){this.dirx = -this.dirx;}}
				this.y -= this.diry*(Player.attackSpeed);
					if(this.diry < 0){ 
						if(this.checkCollide(Game.collideMaps,"down") ||
						this.checkCollide(Game.holeMaps,"down") ||
						this.checkCollide(Game.wallMaps,"down") ||
						this.checkCollide(Game.Doors,"down")){this.diry = -this.diry;}}
					if(this.diry > 0){ 
						if(this.checkCollide(Game.collideMaps,"up") ||
						this.checkCollide(Game.holeMaps,"up") ||
						this.checkCollide(Game.wallMaps,"up") ||
						this.checkCollide(Game.Doors,"up")){this.diry = -this.diry;}}}}
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+5, this.width, this.height);
			context.restore();
			
			if(this.type == "spider"){
				if(this.isHit){
					context.drawImage(imageTool.spiderHit,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(this.isMoving){
					context.drawImage(imageTool.spiderMoveAnim,this.frame*75,0,75,50,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(!this.isMoving){
					context.drawImage(imageTool.spiderIdleAnim,this.frame*75,0,75,50,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}}
			else if(this.type == "buttspider"){
				if(this.isHit){
					context.drawImage(imageTool.spiderButtHit,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(this.isMoving){
					context.drawImage(imageTool.spiderButt,this.x+1,this.y-9,28,26);
					context.drawImage(imageTool.spiderMoveAnim,this.frame*75,0,75,50,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(!this.isMoving){
					context.drawImage(imageTool.spiderButt,this.x+1,this.y-7,28,26);
					context.drawImage(imageTool.spiderIdleAnim,this.frame*75,0,75,50,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}}
		}
	}
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0){
			this.isSleeping = false;
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				if(this.type == "buttspider"){
					Game.Minions.push(new Minion(this.x-10,this.y-5,3,"spider",false));
					Game.Minions.push(new Minion(this.x+20,this.y+10,3,"spider",false));}
				bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+5,this.y+5,"basic");
				this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 70){ //compare le temps actuel avec le temps du dernier dégat
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
	this.speed = 2;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.alive = true;
	this.rand = getRand(2000,250);
	this.now = Date.now();
	this.lastAng = Date.now() - 3000;
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.update = function(){	//Calcul
		//Si le fly est vivant
		if(this.alive){
			this.checkDamage();
			
			if(this.now - this.lastAng > this.rand){
				this.dirx = (Player.x) - (this.x - this.width/2);
				this.diry = (Player.y) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				this.rand = getRand(2000,250);
				this.lastAng = Date.now();}
			// Mode poursuite
			this.x += this.dirx*this.speed;
					if(this.dirx > 0){ 
						if(this.checkCollide(Game.wallMaps,"right") ||
						this.checkCollide(Game.Doors,"right")){this.dirx = -this.dirx;}}
					if(this.dirx < 0){ 
						if(this.checkCollide(Game.wallMaps,"left") ||
						this.checkCollide(Game.Doors,"left")){this.dirx = -this.dirx;}}
					// Y
					this.y += this.diry*this.speed;
					if(this.diry > 0){ 
						if(this.checkCollide(Game.wallMaps,"down") ||
						this.checkCollide(Game.Doors,"down")){this.diry = -this.diry;}}
					if(this.diry < 0){ 
						if(this.checkCollide(Game.wallMaps,"up") ||
						this.checkCollide(Game.Doors,"up")){this.diry = -this.diry;}}
			// Mode "bump" (a été touché)
			if(this.isHit){
				this.x -= this.dirx*(Player.attackSpeed+1);
						
				this.y -= this.diry*(Player.attackSpeed+1);
				}
		}
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
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
				context.drawImage(imageTool.flyHit, this.x, this.y, this.width, this.height);}}
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
				createItem(this.x,this.y+5,"basic");
				this.alive = false;}}
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
				if(obj[i].isColliding){
				if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
				else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
				else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
				else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
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
	this.fireRate = getRand(1000,1000);
	this.attackSpeed= 5;
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
			this.dirx = (Player.x - Player.width*2) - (this.x - this.width/2);
			this.diry = (Player.y - Player.height*2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			
			if(hyp <=450){
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				this.attack();}
			}
	}
	this.draw = function(context){  //Affichage
		//Si vivant
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y, this.width+5, this.height+10);
			context.restore();
			if(!this.isHit){
				context.drawImage(imageTool.tower, this.x-2, this.y-3, this.width+6, this.height+6);}
			if(this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.towerHit, this.x-2, this.y-3, this.width+6, this.height+6);}}
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
				createItem(this.x,this.y,"basic");sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play(); this.alive = false;}}
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
			Game.enemyBullets.push(new enemyBullet(this.attackSpeed,this.range,this.x+24,this.y+24,this.dirx,this.diry,this.dmg));
			this.lastFire = Date.now();	}
	}
}
//projectile
function enemyBullet(speed,range,bulx,buly,dirx,diry,dmg){
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = dirx;
	this.diry = diry;
	this.height = 30;
	this.width = 30;
	this.dmg = dmg;
	this.fireDate = Date.now();
	this.now = Date.now();
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive){
			this.now = Date.now();
			this.x -= this.dirx*-this.speed;
			this.y -= this.diry*-this.speed;
			enemyBulletCollisionPlayer();
			enemyBulletCollisionLevel(Game.collideMaps);
			enemyBulletCollisionLevel(Game.wallMaps);
			
			if(this.now - this.fireDate > this.range) this.alive = false;
		}
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+20, this.width, this.height);
			context.restore();
		if(this.alive) context.drawImage(imageTool.enemyBullet, this.x, this.y, this.width, this.height);}
}
function enemyBulletCollisionPlayer(){
	for(var i=0;i<Game.enemyBullets.length;i++){
		// Player
		if (Game.enemyBullets[i].x < Player.x + Player.width-6  &&
		Game.enemyBullets[i].x + (Game.enemyBullets[i].width-6)  > Player.x &&
		Game.enemyBullets[i].y < Player.y + Player.height-6 &&
		Game.enemyBullets[i].y + (Game.enemyBullets[i].height-6) > Player.y) {
			Player.getDamage(Game.enemyBullets[i].dmg);
			Game.enemyBullets[i].alive = false;}}
}
function enemyBulletCollisionLevel(obj){
	for(var y =0;y<Game.enemyBullets.length;y++){
		// Collision map
		for(var m=0; m<obj.length;m++){
			if (Game.enemyBullets[y].x < obj[m].x + obj[m].width-14  &&
			Game.enemyBullets[y].x + (Game.enemyBullets[y].width-14)  > obj[m].x &&
			Game.enemyBullets[y].y < obj[m].y + obj[m].height-14 &&
			Game.enemyBullets[y].y + (Game.enemyBullets[y].height-14) > obj[m].y) {
			Game.enemyBullets[y].alive = false;}}}
}

//Boss
function Boss(x,y,hp){
	this.x = x;
	this.y = y;
	this.angNow = Date.now();
	this.lastAng = Date.now();
	this.angle = 150;
	this.dirx = Math.sin(this.angle);
	this.diry = Math.cos(this.angle);
	this.height = 96;
	this.width = 96;
	this.speed = 2;
	this.fireRate = 1000;
	this.attackSpeed = 6;
	this.range = 300;
	this.maxHp = hp;
	this.hp = this.maxHp;
	this.dmg = 0.5;
	this.alive = true;
	this.now = Date.now();
	this.lastFire = Date.now();
	this.lastDamaged = Date.now();
	this.isHit = false;
	this.hitCount = 0;
	this.isBerserk = false;
	this.canSpawn = true;
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
			this.attack();
			if(this.hp < this.maxHp/2) this.isBerserk = true;
			if(this.isBerserk) this.speed = 3;
			
			if(this.canSpawn){
				Game.Minions.push(new Fly(this.x+getRand(128,1),this.y+getRand(128,1),2));
				this.hitCount =0;
				this.canSpawn = false;	}
				
				this.x += this.dirx*this.speed; // X
					if(this.dirx > 0){ 
						if(this.checkCollide(Game.collideMaps,"right") ||
						this.checkCollide(Game.Doors,"right")||
						this.checkCollide(Game.wallMaps,"right")){this.dirx = -this.dirx;}}
					if(this.dirx < 0){ 
						if(this.checkCollide(Game.collideMaps,"left") ||
						this.checkCollide(Game.Doors,"left")||
						this.checkCollide(Game.wallMaps,"left")){this.dirx = -this.dirx;}}
				
				this.y += this.diry*this.speed; // Y
					if(this.diry > 0){ 
						if(this.checkCollide(Game.collideMaps,"down") ||
						this.checkCollide(Game.Doors,"down")||
						this.checkCollide(Game.wallMaps,"down")){this.diry = -this.diry;}}
					if(this.diry < 0){ 
						if(this.checkCollide(Game.collideMaps,"up") ||
						this.checkCollide(Game.Doors,"up")||
						this.checkCollide(Game.wallMaps,"up")){this.diry = -this.diry;}}}
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si le minion est vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+50, this.width, this.height);
			context.restore();
			
			if(this.isHit){
				context.drawImage(imageTool.flyBossHit, this.x-15, this.y-15, this.width+32, this.height+32);}
			if(!this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.flyBoss, this.x-15, this.y-15, this.width+32, this.height+32);}
				
			//HP BAR
			var percentLeft = (this.hp / this.maxHp)*100;
			context.drawImage(imageTool.bossBg,310,20,400,24);
			for(var h = 0; h < percentLeft; h++){context.drawImage(imageTool.bossHp,(h*3)+360,24,3,16);}}
	}
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.attack = function(){ 
		this.now = Date.now();
		if(this.isBerserk){
			if( this.now - this.lastFire > this.fireRate/4){
			
					for(var a = 0; a<6; a++){
						var atty = Math.sin(a*45);
						var attx = Math.cos(a*45);
						Game.enemyBullets.push(new enemyBullet(this.attackSpeed*1.33,this.range,this.x+30,this.y+26,attx,atty,this.dmg));}
					this.lastFire = Date.now();}}
			else{		
				if( this.now - this.lastFire > this.fireRate){
					for(var a = 0; a<6; a++){
						var atty = Math.sin(a*45);
						var attx = Math.cos(a*45);
						Game.enemyBullets.push(new enemyBullet(this.attackSpeed,this.range,this.x+30,this.y+26,attx,atty,this.dmg));}
					this.lastFire = Date.now();}}
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0){
			this.hitCount++;
			this.hp -= dmg;
			if(this.hitCount ==2)this.canSpawn = true;
			
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				bleed(6,this.x,this.y-20,this.y+40,this.height,this.width,-80,-80,1.2);
				Game.Minions.push(new Minion(this.x-15,this.y,3,"spider",false));
				Game.Minions.push(new Minion(this.x+25,this.y,3,"spider",false));
				Game.Minions.push(new Minion(this.x-15,this.y+30,6,"buttspider",false));
				Game.Minions.push(new Minion(this.x+25,this.y+30,6,"buttspider",false));
				//Game.Minions.push(new Minion(this.x+this.width,this.y,4));
				//Game.Minions.push(new Minion(this.x+this.width,this.y+this.height/2,4));
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+this.width/2,this.y+this.height/2,"boss");
				this.alive = false;}}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 80){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;
			}
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