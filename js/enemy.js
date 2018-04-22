//objet spider
function Spider(x,y,hp,type,sleeping){
	this.type = type;
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.posx = Math.round((this.x)/64);
	this.posy = Math.round((this.y)/64);
	this.height = 22;
	this.width = 33;
	this.speed = 6;
	this.accel =0;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.direction = getRand(360,0);
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.lastAng = Date.now();
	this.lastFrameTime = Date.now();
	this.updateTime = 45;
	this.frame = 0;
	this.maxFrame = 0;
	this.isHit = false;
	this.isMoving = true;
	this.isSleeping = sleeping;
	this.wasSleeping = this.isSleeping;
	this.sx = x;
	this.sy = y;
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
		this.isSleeping = this.wasSleeping;
	}
	this.move= function(){
			
		// Mode "bump" (a été touché)
		if(this.isHit){
			this.dirx = (Player.x- Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y- Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			
			this.x -= this.dirx*(this.accel+Player.attackSpeed/4);
			if(this.dirx < 0){
				this.checkCollide(Game.collideMaps,"right");	this.checkCollide(Game.holeMaps,"right");
				this.checkCollide(Game.wallMaps,"right");	this.checkCollide(Game.Doors,"right");
				this.checkCollide(Game.traps,"right");	
				}
			else if(this.dirx > 0){
				this.checkCollide(Game.collideMaps,"left");	this.checkCollide(Game.holeMaps,"left");
				this.checkCollide(Game.wallMaps,"left");this.checkCollide(Game.Doors,"left");
				this.checkCollide(Game.traps,"left");	
				}
			this.y -= this.diry*(this.accel+Player.attackSpeed/4);
			if(this.diry < 0){ 
				this.checkCollide(Game.collideMaps,"down");	this.checkCollide(Game.holeMaps,"down");
				this.checkCollide(Game.wallMaps,"down");this.checkCollide(Game.Doors,"down");
				this.checkCollide(Game.traps,"down");	
				}
			else if(this.diry >0){ 
				this.checkCollide(Game.collideMaps,"up");	this.checkCollide(Game.holeMaps,"up");
				this.checkCollide(Game.wallMaps,"up");	this.checkCollide(Game.Doors,"up");
				this.checkCollide(Game.traps,"up");	
				}
			}
		else{
			this.x += this.dirx*this.accel;
			if(this.dirx > 0){ 
				this.checkCollide(Game.collideMaps,"right");this.checkCollide(Game.holeMaps,"right");
				this.checkCollide(Game.wallMaps,"right");this.checkCollide(Game.Doors,"right");
				this.checkCollide(Game.traps,"right");	
				}
			else if(this.dirx < 0){ 
				this.checkCollide(Game.collideMaps,"left");	this.checkCollide(Game.holeMaps,"left");
				this.checkCollide(Game.wallMaps,"left");this.checkCollide(Game.Doors,"left");
				this.checkCollide(Game.traps,"left");	
				}
				
			this.y += this.diry*this.accel;
			if(this.diry > 0){ 
				this.checkCollide(Game.collideMaps,"down");	this.checkCollide(Game.holeMaps,"down");
				this.checkCollide(Game.wallMaps,"down");this.checkCollide(Game.Doors,"down");
				this.checkCollide(Game.traps,"down");	
				}
			else if(this.diry <0){ 
				this.checkCollide(Game.collideMaps,"up");this.checkCollide(Game.holeMaps,"up");
				this.checkCollide(Game.wallMaps,"up");this.checkCollide(Game.Doors,"up");
				this.checkCollide(Game.traps,"up");	
				}}
	}
	this.update = function(){	//Calcul
		this.posx = Math.round((this.x)/64);
		this.posy = Math.round((this.y)/64);
		this.checkDamage();
		//Animations mouvement
		this.maxFrame = 3;
		if(Date.now() - this.lastFrameTime > this.updateTime){
			this.frame++;
			if (this.frame > this.maxFrame) this.frame = 0;
			this.lastFrameTime=Date.now();}
		
		if(Date.now() - this.lastAng > getRand(500,800)){
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
		
		if( !this.isSleeping && !this.isHit && (Date.now() - this.lastAng < 600)) this.isMoving = true;
		else this.isMoving = false;
							
		if(this.isMoving){	if(this.accel < this.speed) this.accel += 0.5;}
		else if(this.isHit){
		
		if(this.accel > 0) this.accel -= this.accel/10;}
		else if(!this.isMoving) {if(this.accel > 0) this.accel -= this.accel/10;}
		
			this.move();
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
					context.drawImage(imageTool.spiderButtHit,this.x-5,this.y-5,this.width*1.3,this.height*1.3);
					context.drawImage(imageTool.spiderHit,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(this.isMoving){
					context.drawImage(imageTool.spiderButt,this.x+2,this.y-9,28,26);
					context.drawImage(imageTool.spiderMoveAnim,this.frame*75,0,75,50,this.x-5,this.y-5,this.width*1.3,this.height*1.3);}
				else if(!this.isMoving){
					context.drawImage(imageTool.spiderButt,this.x+2,this.y-7,28,26);
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
					for(var s = 0; s < 2; s++){
						bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
						Game.Minions.push(new Spider(this.x+getRand(20,0),this.y+getRand(20,0),1+floorCount*2/3,"spider",false));
					}
				}
				bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+5,this.y+5,"basic");
				this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		if( Date.now()- this.lastDamaged < 150){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
			if(obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace"){ this.getDamage(obj[i].dmg);}
				if(obj[i].isColliding){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}	}}}
}

//objet fly
function Fly(x,y,hp,type,immune, bossfollow){
	this.type = type; //Black Fly, Attack Fly, Pooter
	this.x = x;
	this.y = y;
	this.anim = new Animation(3,this.x,this.y,50,50,30,imageTool.flyAnim,0,0,5/4);
	this.swarmAnim = new Animation(3,this.x,this.y,50,50,30,imageTool.flyAnim,0,0,1);
	this.pooterL = new Animation(1,this.x,this.y,80,80,30,imageTool.pooterLeft,-4,-4,1);
	this.pooterR = new Animation(1,this.x,this.y,80,80,30,imageTool.pooterRight,-4,-4,1);
	this.dirx = 0;
	this.diry = 0;
	this.lastdirx = this.dirx;
	this.lastdiry = this.diry;
	this.height = 22;
	this.width = 22;
	this.speed = 2;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.fireRate = 1100;
	this.attackSpeed= 4;
	this.lastFire = Date.now();
	this.range = 1200;
	this.angle = getRand(360,0);
	this.alive = true;
	this.rand = getRand(2000,250);
	this.spawn = Date.now();
	this.lastAng = Date.now() - 3000;
	this.lastDamaged = Date.now();
	this.animNow = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.imgsrc = imageTool.fly;
	this.bossfollow = bossfollow;
	this.isReleasing = false;
	this.isImmune = immune;
	this.isHit = false;
	this.radiusrand = getRand(40,80);
	this.sx = x;
	this.sy = y;
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
	}
	this.update = function(){	//Calcul
	this.anim.update(this.x,this.y);
	this.swarmAnim.update(this.x,this.y);
		//Si le fly est vivant
		if(this.alive){
			if(Date.now() - this.spawn > 300) this.isImmune = false;
			this.checkDamage();
			var speedRand =0;

			
				// POOTER
				if(this.type =="Pooter"){
					this.height = 32;
					this.width = 32;
					this.speed = 0.5;
					
						this.dirx = (Player.x) - (this.x - this.width/2);
						this.diry = (Player.y) - (this.y - this.height/2);
						var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
						this.dirx = this.dirx/hyp;
						this.diry = this.diry/hyp;
						
						this.pooterL.update(this.x,this.y);
						this.pooterR.update(this.x,this.y);
						
						if(hyp <=400)this.attack();
						
					if(!this.bossfollow){	
						if(!this.isReleasing && this.now - this.lastAng > 500){this.angle = getRand(360,0);this.lastAng = Date.now();}
						this.diry = Math.sin(this.angle);
						this.dirx = Math.cos(this.angle);
					}
					
						
					if(this.isReleasing && this.now - this.lastAng > 75){
						this.isReleasing = false;
					}
				}
				//BLACK FLY 
				else if(this.type =="Black"){
					this.height = 20;
					this.width = 20;
					this.dmg = 0;
					this.speed = 1;
					speedRand = getRand(3,-1);
					if(this.angle < 360) this.angle+=0.03;
					else this.angle =0;
					this.diry = Math.sin(this.angle);
					this.dirx = Math.cos(this.angle);}
				//ATTACK FLY
				else if(this.type =="Attack"){
					this.height = 26;
					this.width = 26;
					this.dmg = 0.5;
					speedRand = getRand(3,-1);
				}
				else if(this.type =="Swarm"){
					this.height = 22;
					this.width = 22;
					this.dmg = 0.5;
					speedRand = getRand(3,-1);
					if(this.isReleasing && this.now - this.lastAng > 75){
						this.isReleasing = false;
					}
				}
				
				if( (this.type =="Swarm" || this.type =="Attack") && !this.isReleasing && this.now - this.lastAng > this.rand){
					this.dirx = (Player.x) - (this.x - this.width/2);
					this.diry = (Player.y) - (this.y - this.height/2);
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					this.rand = getRand(2000,250);
					this.speed = getRand(2,2);
					this.lastAng = Date.now();}				

			if(this.bossfollow){
				if(this.angle < 360) this.angle+=(getRand(4,1)/200);
				else this.angle =0;
				
				this.x = (Game.Bosses[0].x + Game.Bosses[0].width/2 -12) + Math.sin(this.angle)*this.radiusrand ;
				this.y = (Game.Bosses[0].y + Game.Bosses[0].height/2 -12) + Math.cos(this.angle)*this.radiusrand ;
			}
			else{
			// Mode déplacement
				// Mode "bump" (a été touché)
				if(this.isHit){
					this.dirx = (Player.x) - (this.x - this.width/2);
					this.diry = (Player.y) - (this.y - this.height/2);
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					this.speed =3;
					this.x -= this.dirx*this.speed+speedRand;
						if(this.dirx > 0){ 
							this.checkCollide(Game.wallMaps,"right");
							this.checkCollide(Game.Doors,"right");}
						if(this.dirx < 0){ 
							this.checkCollide(Game.wallMaps,"left");
							this.checkCollide(Game.Doors,"left");}
						// Y
					this.y -= this.diry*this.speed+speedRand;
						if(this.diry > 0){ 
							this.checkCollide(Game.wallMaps,"down");
							this.checkCollide(Game.Doors,"down");}
						if(this.diry < 0){ 
							this.checkCollide(Game.wallMaps,"up");
							this.checkCollide(Game.Doors,"up");}		
					}
				else{
					this.x += this.dirx*this.speed+speedRand;
							if(this.dirx > 0){ 
								this.checkCollide(Game.wallMaps,"right");
								this.checkCollide(Game.Doors,"right");}
							if(this.dirx < 0){ 
								this.checkCollide(Game.wallMaps,"left");
								this.checkCollide(Game.Doors,"left");}
							// Y
					this.y += this.diry*this.speed+speedRand;
							if(this.diry > 0){ 
								this.checkCollide(Game.wallMaps,"down");
								this.checkCollide(Game.Doors,"down");}
							if(this.diry < 0){ 
								this.checkCollide(Game.wallMaps,"up");
								this.checkCollide(Game.Doors,"up");}}			
			}
				
			if(this.x < 65) this.x = 65;
			else if(this.x  > canvas.width -(65 +this.width)) this.x = canvas.width -(65 +this.width);
			if(this.y < 65) this.y = 65;
			else if(this.y  > canvas.height -(65 +this.height)) this.y = canvas.height -(65 +this.height);
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
			
			if(Date.now() - this.animNow > 20){
				if(this.imgsrc==imageTool.fly) this.imgsrc = imageTool.fly1;
				else this.imgsrc=imageTool.fly;
				this.animNow = Date.now();}
				
			
			if(!this.isHit){
				if(this.type =="Attack")this.anim.draw(context);
				else if(this.type =="Swarm") this.swarmAnim.draw(context);
				else if(this.type =="Black") context.drawImage(this.imgsrc, this.x, this.y, this.width, this.height);
				else if(this.type =="Pooter"){
					if(this.x <= Player.x) this.pooterR.draw(context);
					else if(this.x > Player.x) this.pooterL.draw(context);
				}
			}
				
			if(this.isHit){	context.drawImage(imageTool.flyHit, this.x, this.y, this.width, this.height);}
		}
	}
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.attack = function(){ 
		if( Date.now() - this.lastFire > this.fireRate){ //compare le temps actuel avec le temps de la derniere attaque
			Game.enemyBullets.push(new enemyBullet(this.attackSpeed,this.range,this.x+5,this.y+22,this.dirx,this.diry,0.5,20));
			bleed(2,this.x+18,this.y+18,this.y+20,this.height,this.width,-50,-50,1/2);
			this.lastFire = Date.now();	}
	}
	this.getDamage = function(dmg){
		if(!this.isImmune && this.alive && this.hp > 0){
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				if(this.bossfollow) Game.Bosses[0].swarm--;
				bleed(1,this.x,this.y-10,this.y+30,this.height,this.width,-40,-40,1/2);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x,this.y+5,"basic");
				this.alive = false;}}
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
				if(obj[i].isColliding){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
	}
	this.dukeRelease = function(bx,by){
		this.bossfollow = false;
		this.isReleasing = true;
		Game.Bosses[0].swarm--;
		this.dirx = (Player.x +getRand(150,-75)) - (this.x - this.width/2);
		this.diry = (Player.y +getRand(150,-75)) - (this.y - this.height/2);
		var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
		this.dirx =this.dirx/hyp;
		this.diry =this.diry/hyp;
		this.speed =3;
		this.lastAng = Date.now();
	}
}

//objet zombie
function Zombie(x,y,hp){
	this.x = x;
	this.y = y;
	this.posx = Math.round((this.x)/64);
	this.posy = Math.round((this.y)/64);
	this.lastx = this.x;
	this.lasty = this.y;
	this.suicideCount = 0;
	this.animR = new Animation(9,this.x,this.y,100,80,50,imageTool.eBodyRight,-9,3,1);
	this.animL = new Animation(9,this.x,this.y,100,80,50,imageTool.eBodyLeft,-5,3,1);
	this.dirx = 0;
	this.diry = 0;
	this.lastdirx = this.dirx;
	this.lastdiry = this.diry;
	this.height = 40;
	this.width = 40;
	this.speed = 1.5;
	this.accel = 0;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0;
	this.attackSpeed = 5;
	this.range = 500;
	this.angle = getRand(360,0);
	this.angle2 = this.angle;
	this.wasRandom = false;
	this.alive = true;
	this.rand = getRand(2000,250);
	this.hyp = 0;
	this.lastAng = Date.now() - 3000;
	this.lastDamaged = Date.now();
	this.animNow = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.imgsrc = imageTool.fly;
	this.isHit = false;
	this.isMoving = false;
	this.canSuicide = true;
	this.sx = x;
	this.sy = y;
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
	}
	this.move= function(){
		// X
		this.x -= this.dirx*this.accel;
		if(this.dirx < 0){ 
			this.checkCollide(Game.collideMaps,"right");
			this.checkCollide(Game.holeMaps,"right");
			this.checkCollide(Game.wallMaps,"right");
			this.checkCollide(Game.Doors,"right");}
		if(this.dirx > 0){ 
			this.checkCollide(Game.collideMaps,"left");
			this.checkCollide(Game.holeMaps,"left");
			this.checkCollide(Game.wallMaps,"left");
			this.checkCollide(Game.Doors,"left");}
		// Y
		this.y -= this.diry*this.accel;
		if(this.diry < 0){ 
			this.checkCollide(Game.collideMaps,"down");
			this.checkCollide(Game.holeMaps,"down");
			this.checkCollide(Game.wallMaps,"down");
			this.checkCollide(Game.Doors,"down");}
		if(this.diry > 0){ 
			this.checkCollide(Game.collideMaps,"up");
			this.checkCollide(Game.holeMaps,"up");
			this.checkCollide(Game.wallMaps,"up");
			this.checkCollide(Game.Doors,"up");}
	}
	this.update = function(){
		
			if(Math.abs(this.lastx - this.x) < 0.02 && Math.abs(this.lasty - this.y) < 0.02) this.suicideCount++;
			if( this.suicideCount > 1000) this.suicide();
	
			this.checkDamage();
			this.animR.update(this.x,this.y);
			this.animL.update(this.x,this.y);
			
			this.posx = Math.round((this.x)/64);
			this.posy = Math.round((this.y)/64);
			
			this.dirx = (Player.x-Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y-Player.height/2) - (this.y - this.height/2);
			this.hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/this.hyp;
			this.diry = this.diry/this.hyp;
			
			if(Date.now() - this.lastAng > 1500){
				this.angle = getRand(360,0);
				this.lastAng = Date.now();}
				
			if(this.hyp <= 320 && Date.now() - this.lastAng < 1250){
				this.speed = 2;
				if(this.accel < this.speed) this.accel += 0.2;
				this.wasRandom = false;
				this.isMoving = true;}				
			else if(this.hyp > 320 && Date.now() - this.lastAng > 750){
				this.speed = 1.5;
				if(this.accel < this.speed) this.accel += 0.2;
				this.angle2 = this.angle;
				this.diry = Math.sin(this.angle2);
				this.dirx = Math.cos(this.angle2);
				this.wasRandom = true;
				this.isMoving = true;}
			else {	if(this.accel > 0) this.accel -= this.accel/15;
				if(this.wasRandom){
					this.diry = Math.sin(this.angle2);
					this.dirx = Math.cos(this.angle2);}
				this.isMoving = false;	}
			
			this.move();
				
			if(this.isHit){
				this.dirx = (Player.x) - (this.x - this.width/2);
				this.diry = (Player.y) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				this.x -= this.dirx*(Player.attackSpeed/2);
					if(this.dirx < 0){ 
						if(this.checkCollide(Game.collideMaps,"right") ||
						this.checkCollide(Game.traps,"right") ||
						this.checkCollide(Game.holeMaps,"right") ||
						this.checkCollide(Game.wallMaps,"right") ||
						this.checkCollide(Game.Doors,"right")){this.dirx = -this.dirx;}}
					if(this.dirx > 0){ 
						if(this.checkCollide(Game.collideMaps,"left") ||
						this.checkCollide(Game.traps,"left") ||
						this.checkCollide(Game.holeMaps,"left") ||
						this.checkCollide(Game.wallMaps,"left") ||
						this.checkCollide(Game.Doors,"left")){this.dirx = -this.dirx;}}
				this.y -= this.diry*(Player.attackSpeed);
					if(this.diry < 0){ 
						if(this.checkCollide(Game.collideMaps,"down") ||
						this.checkCollide(Game.traps,"down") ||
						this.checkCollide(Game.holeMaps,"down") ||
						this.checkCollide(Game.wallMaps,"down") ||
						this.checkCollide(Game.Doors,"down")){this.diry = -this.diry;}}
					if(this.diry > 0){ 
						if(this.checkCollide(Game.collideMaps,"up") ||
						this.checkCollide(Game.traps,"up") ||
						this.checkCollide(Game.holeMaps,"up") ||
						this.checkCollide(Game.wallMaps,"up") ||
						this.checkCollide(Game.Doors,"up")){this.diry = -this.diry;}}}
						
			this.lastx = this.x;
			this.lasty = this.y;
			
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-2, this.y+6, this.width, this.height);
			context.restore();
			
			if(this.isMoving){
				if(this.dirx <0) this.animR.draw(context);
				else if(this.dirx >0)  this.animL.draw(context);	 }
			else context.drawImage(imageTool.eBodyIdle, this.x-2, this.y+5, this.width, this.height-5);
			
			if(this.isHit) context.drawImage(imageTool.mulliganheadhit, this.x-16, this.y-38, 76, 70);
			else context.drawImage(imageTool.mulliganhead, this.x-16, this.y-38, 76, 70);
				
		}
	}
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.suicide = function(dmg){
		
		if(this.canSuicide){
			this.canSuicide = false;
			Game.Explosions.push(new Explosion(this.x+15,this.y+15));
			
			}
		
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0 && !this.isHit){
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				for(var a = 1; a<5; a++){
					var atty = Math.sin((a* 3.14)/2);
					var attx = Math.cos((a* 3.14)/2);
					Game.enemyBullets.push(new enemyBullet(this.attackSpeed*1.33,this.range,this.x+12,this.y-12,attx,atty,0.5,22));}
				
				var rand = getRand(2,2);
				for(var s = 0; s < rand; s++){
					var flyrand = getRand(3,1);
					
					var sy = this.posy+getRand(3,-1);
					var sx = this.posx+getRand(3,-1);
					while (Game.grid[sy][sx] !=1){
						sy = this.posy+getRand(3,-1);
						sx = this.posx+getRand(3,-1);}
						
					if(flyrand == 1) Game.Minions.push(new Fly(sx*64,sy*64,1+floorCount*2/3,"Black",true));
					else if(flyrand == 2)Game.Minions.push(new Fly(sx*64,sy*64,1+floorCount*2/3,"Attack",true));
					else if(flyrand == 3)Game.Minions.push(new Fly(sx*64,sy*64,2+floorCount*2/3,"Pooter",true));
					}
				bleed(1,this.x,this.y-10,this.y+30,this.height,this.width,-40,-40,1/2);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x,this.y+5,"basic");
				this.alive = false;}}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 160){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}	
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
			if(obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace"){ this.getDamage(obj[i].dmg);}
				if(obj[i].isColliding){
					if(pos == "up"){
						this.y = obj[i].y+obj[i].height;
						this.diry = -this.diry;
						if(this.hyp <= 320){
							if(this.dirx <0) this.dirx = -1;
							else if(this.dirx>0) this.dirx = 1;	}
						return true;
						}
					else if(pos == "down"){
						this.y = obj[i].y-this.height;
						this.diry = -this.diry;
						if(this.hyp <= 320){
							if(this.dirx <0) this.dirx = -1;
							else if(this.dirx >0) this.dirx = 1;	}
						return true;
						}
					else if(pos == "left"){
						this.x = obj[i].x+obj[i].width;
						this.dirx = -this.dirx;
						if(this.hyp <= 320){
							if(this.diry <0) this.diry = -1;
							else if(this.diry >0) this.diry = 1;	}
						return true;
						}
					else if(pos == "right"){
						this.x = obj[i].x-this.width;
						this.dirx = -this.dirx;
						if(this.hyp <= 320){
							if(this.diry <0) this.diry = -1;
							else if(this.diry >0) this.diry = 1;	}
						return true;}}}}
	}
}

//objet Clotty
function Clotty(posy,posx,x,y,hp){
	this.height = 42;
	this.width = 42;
	this.x = x;
	this.y = y;
	this.posx = posx;
	this.posy = posy;
	this.ry = posy;
	this.rx = posx;
	this.tarx = 0;
	this.tary = 0;
	this.dirx = 0;
	this.diry = 0;
	this.isArrived = false;
	this.arrivalTime = Date.now();
	this.speed = 1.5;
	this.accel = 0;
	this.animF = new Animation(6,this.x,this.y,180,150,60,imageTool.clottyfront,-23,-21,1);
	this.animR = new Animation(8,this.x,this.y,180,150,60,imageTool.clottyright,-23,-21,1);
	this.animL = new Animation(8,this.x,this.y,180,150,60,imageTool.clottyleft,-23,-21,1);
	this.animS = new Animation(5,this.x,this.y,180,150,40,imageTool.clottyattack,-23,-21,1);
	this.maxHp = hp;
	this.hp = hp;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.lastAng = Date.now();
	this.lastFrameTime = Date.now();
	this.updateTime = 45;
	this.frame = 0;
	this.maxFrame = 0;
	this.fireRate = 3000;
	this.dmg = 0.5;
	this.attackSpeed = 5;
	this.range = 800;
	this.lastFire = Date.now();
	this.isAttacking = false;
	this.canAttack = true;
	this.isHit = false;
	this.isMoving = true;
	this.sx = x; //Position Initiale
	this.sy = y; //Position initiale
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
	}
	this.move= function(){
	//Calcul mouvement	
		this.tary = this.ry*64;
		this.tarx = this.rx*64;
		this.dirx = this.tarx - (this.x - this.width/2);
		this.diry = this.tary - (this.y - this.height/2);
		this.hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
		this.dirx = this.dirx/this.hyp;
		this.diry = this.diry/this.hyp;	
		
			
		// Mode "bump" (a été touché)
		if(this.isHit){
			this.dirx = (Player.x- Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y- Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = -this.dirx/hyp;
			this.diry = -this.diry/hyp;}
			
		// X
		this.x += this.dirx*this.accel;
		if(this.dirx > 0){ 
			this.animR.update(this.x,this.y);
			this.checkCollide(Game.collideMaps,"right");
			this.checkCollide(Game.traps,"right");
			this.checkCollide(Game.holeMaps,"right");
			this.checkCollide(Game.wallMaps,"right");
			this.checkCollide(Game.Doors,"right");
			
			}
		else if(this.dirx < 0){ 
			this.animL.update(this.x,this.y);
			this.checkCollide(Game.collideMaps,"left");
			this.checkCollide(Game.traps,"left");
			this.checkCollide(Game.holeMaps,"left");
			this.checkCollide(Game.wallMaps,"left");
			this.checkCollide(Game.Doors,"left");
			}
			
		// Y
		this.y += this.diry*this.accel;
		if(this.diry > 0){ 
			this.checkCollide(Game.collideMaps,"down");
			this.checkCollide(Game.traps,"down");
			this.checkCollide(Game.holeMaps,"down");
			this.checkCollide(Game.wallMaps,"down");
			this.checkCollide(Game.Doors,"down");
			}
		else if(this.diry <0){ 
			this.checkCollide(Game.collideMaps,"up");
			this.checkCollide(Game.traps,"up");
			this.checkCollide(Game.holeMaps,"up");
			this.checkCollide(Game.wallMaps,"up");
			this.checkCollide(Game.Doors,"up");
			}
	}
	this.update = function(){	//Calcul
		this.checkDamage();
		this.attack();
		this.posx = Math.round((this.x)/64);
		this.posy = Math.round((this.y)/64);
		this.animF.update(this.x,this.y);
		
		
		if(this.isAttacking) this.animS.update(this.x,this.y);
		
		if(this.posy == this.ry && this.posx == this.rx){ this.isArrived = true;} //Si arrivé a la position
		else if(!this.isArrived && Date.now() - this.lastAng > 1500){this.isArrived = true;} //Si ca fait 1.5sec qu'il est pas arrivé à la position (debug)
		else this.isArrived = false;
		
		if(!this.isAttacking){
			if(this.isArrived && Date.now() - this.lastAng > 400){
				this.ry = this.posy+getRand(3,-1);
				this.rx = this.posx+getRand(3,-1);
				while (Game.grid[this.ry][this.rx] !=1){
					this.ry = this.posy+getRand(3,-1);
					this.rx = this.posx+getRand(3,-1);}
				this.lastAng = Date.now();}
			
			if(!this.isArrived){
				this.isMoving = true;
				if(this.accel < this.speed) this.accel += 0.2;	}
			else if(this.isHit ){if(this.accel > 0) this.accel -= this.accel/20;this.isMoving = false;}
			else {if(this.accel > 0) this.accel -= this.accel/20;this.isMoving = false;}}
	
		if(!this.isAttacking)this.move();
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.alive){
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-15, this.y, this.width+34, this.height+20);
			context.restore();
			
			if(!this.isHit){
				if(this.isAttacking) this.animS.draw(context);
				else if(this.isMoving){
					if(this.dirx > 0.1) this.animR.draw(context);
					else if(this.dirx < -0.1) this.animL.draw(context);
					else this.animF.draw(context);}
				else context.drawImage(imageTool.clotty, this.x-23,this.y-21, 90, 75);}
			
			if(this.isHit){
				if(this.dirx >= 0) context.drawImage(imageTool.clottyhitright, this.x-23, this.y-21, 90, 75);
				else if(this.dirx < 0) context.drawImage(imageTool.clottyhitleft, this.x-23, this.y-21, 90, 75);	}
		}
	}
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0 && !this.isHit){
			this.isSleeping = false;
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+5,this.y+5,"basic");
				this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 150){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
			if(obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace"){ this.getDamage(obj[i].dmg);}
				if(obj[i].isColliding){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
	}
	this.attack = function(){ 
	
		if( Date.now() - this.lastFire > this.fireRate){
			for(var a = 1; a<5; a++){
				var atty = Math.sin((a* 3.14)/2);
				var attx = Math.cos((a* 3.14)/2);
				Game.enemyBullets.push(new enemyBullet(this.attackSpeed*1.33,this.range,this.x+12,this.y-12,attx,atty,this.dmg,22));}
			this.fireRate = getRand(2300,700);
			bleed(2,this.x-5,this.y-30,this.y+20,this.height,this.width,-50,-50,3/4);
			this.lastFire = Date.now();
			}
		else if(Date.now() - this.lastFire > (this.fireRate-260)){
			this.isAttacking = true;
			this.isMoving = false;	}
		else this.isAttacking = false;
	}
	
}

//objet Maggot
function Maggot(posy,posx,x,y,hp){
	this.height = 36;
	this.width = 36;
	this.x = x;
	this.y = y;
	this.posx = posx;
	this.posy = posy;
	this.ry = posy;
	this.rx = posx;
	this.tarx = 0;
	this.tary = 0;
	this.dirx = 0;
	this.diry = 0;
	this.isArrived = false;
	this.arrivalTime = Date.now();
	this.speed = 2;
	this.accel = 0;
	this.animF = new Animation(5,this.x,this.y,100,100,60,imageTool.maggotfront,-8,-2,1);
	this.animD = new Animation(5,this.x,this.y,100,100,60,imageTool.maggotdown,-8,-2,1);
	this.animR = new Animation(7,this.x,this.y,150,100,60,imageTool.maggotright,-18,-12,1);
	this.animL = new Animation(7,this.x,this.y,150,100,60,imageTool.maggotleft,-18,-12,1);
	this.maxHp = hp;
	this.hp = hp;
	this.alive = true;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.lastAng = Date.now();
	this.orientation = 1;
	this.lastFrameTime = Date.now();
	this.updateTime = 45;
	this.frame = 0;
	this.maxFrame = 0;
	this.fireRate = 3000;
	this.dmg = 0.5;
	this.attackSpeed = 5;
	this.range = 800;
	this.lastFire = Date.now();
	this.isAttacking = false;
	this.canAttack = true;
	this.isHit = false;
	this.isMoving = true;
	this.sx = x; //Position Initiale
	this.sy = y; //Position initiale
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
	}
	this.move= function(){
	//Calcul mouvement	
		this.tary = this.ry*64;
		this.tarx = this.rx*64;
		this.dirx = this.tarx - (this.x - this.width/2);
		this.diry = this.tary - (this.y - this.height/2);
		this.hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
		this.dirx = this.dirx/this.hyp;
		this.diry = this.diry/this.hyp;	
		
		// Mode "bump" (a été touché)
		if(this.isHit){
			this.dirx = (Player.x- Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y- Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = -this.dirx/hyp;
			this.diry = -this.diry/hyp;}
		// X
		this.x += this.dirx*this.accel;
		if(this.dirx > 0){ 
			this.animR.update(this.x,this.y);
			this.checkCollide(Game.collideMaps,"right");
			this.checkCollide(Game.traps,"right");
			this.checkCollide(Game.holeMaps,"right");
			this.checkCollide(Game.wallMaps,"right");
			this.checkCollide(Game.Doors,"right");
			
			}
		else if(this.dirx < 0){ 
			this.animL.update(this.x,this.y);
			this.checkCollide(Game.collideMaps,"left");
			this.checkCollide(Game.traps,"left");
			this.checkCollide(Game.holeMaps,"left");
			this.checkCollide(Game.wallMaps,"left");
			this.checkCollide(Game.Doors,"left");
			}
			
		// Y
		this.y += this.diry*this.accel;
		if(this.diry > 0){ 
			this.checkCollide(Game.collideMaps,"down");
			this.checkCollide(Game.traps,"down");
			this.checkCollide(Game.holeMaps,"down");
			this.checkCollide(Game.wallMaps,"down");
			this.checkCollide(Game.Doors,"down");
			}
		else if(this.diry <0){ 
			this.checkCollide(Game.collideMaps,"up");
			this.checkCollide(Game.traps,"up");
			this.checkCollide(Game.holeMaps,"up");
			this.checkCollide(Game.wallMaps,"up");
			this.checkCollide(Game.Doors,"up");
			}
	}
	this.update = function(){	//Calcul
		this.checkDamage();
		//this.attack();
		this.posx = Math.round((this.x)/64);
		this.posy = Math.round((this.y)/64);
		
		if(this.posy == this.ry && this.posx == this.rx){ this.isArrived = true;} //Si arrivé a la position
		else if(!this.isArrived && Date.now() - this.lastAng > 1000){this.isArrived = true;} //Si ca fait 1.5sec qu'il est pas arrivé à la position (debug)
		else this.isArrived = false;
		
		
		if(this.isArrived && Date.now() - this.lastAng > 300){
			do{
				this.orientation = getRand(4,1);
				if(this.orientation ==1){ //BAS
					this.ry = this.posy+1;
					this.rx = this.posx;}
				else if(this.orientation ==2){ //HAUT
					this.ry = this.posy-1;
					this.rx = this.posx;}
				else if(this.orientation ==3){ //DROITE
					this.ry = this.posy;
					this.rx = this.posx+1;}
				else if(this.orientation ==4){ //GAUCHE
					this.ry = this.posy;
					this.rx = this.posx-1;}
					
					if(this.rx > 14) this.rx = 14;
					if(this.rx < 1) this.rx = 1;
					if(this.ry > 8) this.ry = 8;
					if(this.ry < 1) this.ry = 1;
			} while (Game.grid[this.ry][this.rx] !=1);
		
			this.lastAng = Date.now();}
			
			if(!this.isArrived){
				this.isMoving = true;
				if(this.accel < this.speed) this.accel += 0.2;	}
			else if(this.isHit ){if(this.accel > 0) this.accel -= this.accel/20;this.isMoving = false;}
			else {if(this.accel > 0) this.accel -= this.accel/20;this.isMoving = false;}
			
		
			
		this.move();
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.alive){
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-10, this.y-12, this.width+20, this.height+20);
			context.restore();
			
			if(!this.isHit){			
					if(this.orientation ==1){ //BAS
						this.animD.update(this.x,this.y);
						this.animD.draw(context);}
					else if(this.orientation ==2){ //HAUT
						this.animF.update(this.x,this.y);
						this.animF.draw(context);}
					else if(this.orientation ==3){ //DROITE
						this.animR.update(this.x,this.y);
						this.animR.draw(context);}	
					else if(this.orientation ==4){ //GAUCHE
						this.animL.update(this.x,this.y);
						this.animL.draw(context);}
			}
			
			if(this.isHit){
				if((this.orientation ==1) || (this.orientation ==2)) context.drawImage(imageTool.maggothitfront, this.x-8, this.y-2, 50, 50);
				else if((this.orientation ==3) || (this.orientation ==4)) context.drawImage(imageTool.maggothitside, this.x-18, this.y-12, 75, 50);	}
		}
	}
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0 && !this.isHit){
			this.isSleeping = false;
			this.hp -= dmg;
			this.lastDamaged = Date.now();
			if(this.hp <= 0){
				bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				createItem(this.x+5,this.y+5,"basic");
				this.alive = false;}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 150){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.checkCollide = function(obj,pos){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
			if(obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace"){ this.getDamage(obj[i].dmg);}
				if(obj[i].isColliding){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}
	}
	this.attack = function(){ 
		if( Date.now() - this.lastFire > this.fireRate){
			for(var a = 1; a<5; a++){
				var atty = Math.sin((a* 3.14)/2);
				var attx = Math.cos((a* 3.14)/2);
				Game.enemyBullets.push(new enemyBullet(this.attackSpeed*1.33,this.range,this.x+12,this.y-12,attx,atty,this.dmg,22));}
			this.fireRate = getRand(2300,700);
			this.lastFire = Date.now();
			}
		else if(Date.now() - this.lastFire > (this.fireRate-260)){
			this.isAttacking = true;
			this.isMoving = false;	}
		else this.isAttacking = false;
	}
	
}

//objet tower
function Tower(x,y,hp,sleeping){
	this.x = x;
	this.y = y;
	this.dirx = 0;
	this.diry = 0;
	this.height = 55;
	this.width = 64;
	this.maxHp = hp;
	this.hp = hp;
	this.dmg = 0.5;
	this.fireRate = getRand(200,800);
	this.attackSpeed= 5;
	this.lastFire = Date.now();
	this.range = 2000;
	this.alive = true;
	this.animNow = Date.now();
	this.animTime = 40;
	this.animX = 0;
	this.maxspeed = 2;
	this.speed = 0;
	this.friction = 0.4;
	this.now = Date.now();
	this.lastDamaged = Date.now();
	this.damagedNow = this.lastDamaged-2000;
	this.isHit = false;
	this.isSleeping=sleeping;
	this.wasSleeping = this.isSleeping;
	this.sx = x;
	this.sy = y;
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
		this.isSleeping = this.wasSleeping;
	}
	this.update = function(){	//Calcul
		//Si le minion est vivant
		if(this.alive){
			this.checkDamage();
			this.dirx = (Player.x - Player.width) - (this.x -this.width/3);
			this.diry = (Player.y - Player.height*2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/hyp;
			this.diry = this.diry/hyp;
			
			if(this.isHit){	
				if(this.speed < this.maxspeed) this.speed += this.friction;
			
			
				this.x -= this.dirx*this.speed;
					if(this.dirx < 0){ 
						this.checkCollide(Game.collideMaps,"right");
						this.checkCollide(Game.wallMaps,"right");
						this.checkCollide(Game.Doors,"right");}
					if(this.dirx > 0){ 
						this.checkCollide(Game.collideMaps,"left");
						this.checkCollide(Game.wallMaps,"left");
						this.checkCollide(Game.Doors,"left");}
				this.y -= this.diry*this.speed;
					if(this.diry < 0){ 
						this.checkCollide(Game.collideMaps,"down");
						this.checkCollide(Game.wallMaps,"down");
						this.checkCollide(Game.Doors,"down");}
					if(this.diry > 0){ 
						this.checkCollide(Game.collideMaps,"up");
						this.checkCollide(Game.wallMaps,"up");
						this.checkCollide(Game.Doors,"up");}
				}
			else if(this.speed > 0) this.speed -= this.speed/5;
			
			if(hyp <=330){
				this.isSleeping = false;
				this.attack();}
		}
			
	}
	this.draw = function(context){  //Affichage
		if(this.isSleeping) this.animX = 0;
		else {
			if(Date.now() - this.animNow > this.animTime){
				if(this.animX == 2) this.animX = -2;
				else this.animX = 2;
				this.animNow = Date.now();
			}
		}
		//Si vivant
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x+6, this.y+40, this.width-14, this.height-14);
			context.restore();
			if(!this.isHit){
				context.drawImage(imageTool.tower, this.x+this.animX, this.y, this.width, this.height);}
			if(this.isHit){
				//var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
				context.drawImage(imageTool.towerHit, this.x, this.y, this.width, this.height);}}
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
				createItem(this.x,this.y,"basic");
				sounds.enemyDeath.currentTime = 0;
				sounds.enemyDeath.play();
				this.alive = false;}}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 150){ //compare le temps actuel avec le temps du dernier dégat
			this.isHit = true;}
		else this.isHit = false;
	}
	this.attack = function(){ 
		this.now = Date.now();
		if( this.now - this.lastFire > this.fireRate){ //compare le temps actuel avec le temps de la derniere attaque
			bleed(2,this.x+20,this.y,this.y+20,this.height,this.width,-50,-50,2/3);
			Game.enemyBullets.push(new enemyBullet(this.attackSpeed,this.range,this.x+18,this.y+20,this.dirx,this.diry,0.5,22));
			this.lastFire = Date.now();	}
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
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}}
}

//Bosses 
function Duke(x,y,hp,version){
	this.name = "Duke of Flies";
	this.version  = version;
	this.x = x;
	this.y = y;
	this.angNow = Date.now();
	this.lastAng = Date.now();
	this.angle = 150;
	this.dirx = Math.sin(this.angle);
	this.diry = Math.cos(this.angle);
	this.swarmAnim = new Animation(6,this.x,this.y,250,250,100,imageTool.dukeSwarmAnim,-22,-22,1.1);
	this.flyAnim = new Animation(6,this.x,this.y,250,250,100,imageTool.dukeFlyAnim,-22,-22,1.1);
	this.swarmAnim2 = new Animation(6,this.x,this.y,250,250,100,imageTool.dukeSwarmAnim2,-22,-22,1.1);
	this.flyAnim2 = new Animation(6,this.x,this.y,250,250,100,imageTool.dukeFlyAnim2,-22,-22,1.1);
	this.height = 96;
	this.width = 96;
	this.speed = 2;
	this.fireRate = 700;
	this.attackSpeed = 4;
	this.range = 1000;
	this.maxHp = hp;
	this.hp = this.maxHp;
	this.dmg = 0.5;
	this.alive = true;
	this.now = Date.now();
	this.lastFire = Date.now();
	this.lastDamaged = Date.now();
	this.canGetDamage = true;
	this.isHit = false;
	this.canBePushed = true;
	this.lastPushed= Date.now();
	this.phase =1;
	this.isBerserk = false;
	this.canSpawn = false;
	this.killTimer = Date.now();
	this.killCount =0;
	this.pattern = 2;
	this.spawningSwarm = false;
	this.spawningFly = false;
	this.spawnTimer = getRand(1700,1300);
	this.swarm = 0;
	this.sx = x;
	this.sy = y;
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
		this.isSleeping = this.wasSleeping;
		this.isHit = false;
		this.hitCount = 0;
		this.isBerserk = false;
	}
	this.update = function(){	//Calcul
		
		if(this.alive){
		
			if(this.phase ==1){
				this.checkDamage();
				this.flySpawn();
				
				if( this.now - this.lastDamaged > 80){
					this.canGetDamage = true;}	//compare le temps actuel avec le temps du dernier dégat
				else this.canGetDamage = false;
				
				if((this.spawningSwarm || this.spawningFly) && Date.now() - this.lastFire > 700){
					this.flyAnim.reset();
					this.swarmAnim.reset();
					this.flyAnim2.reset();
					this.swarmAnim2.reset();
					this.spawningSwarm = false;
					this.spawningFly = false;
				}
				
				if(Date.now() - this.lastPushed < 50){
					this.dirx = (Player.x - Player.width) - (this.x -this.width/3);
					this.diry = (Player.y - Player.height*2) - (this.y - this.height/2);
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = -this.dirx/hyp;
					this.diry = -this.diry/hyp;
				}
				
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
						this.checkCollide(Game.wallMaps,"up")){this.diry = -this.diry;}}
			}
			else if (this.phase ==0){
			
				this.spawningSwarm = false;
				this.spawningFly = false;
				this.x += getRand(5,-2);
				this.y += getRand(5,-2);
				
				if(Date.now() - this.killTimer > 220){
					this.dmg = 0;
					this.killCount++;
					bleed(6,this.x+getRand(150,-50),this.y+getRand(150,-50),this.y+60,this.height,this.width,-80,-80,1.2);
					sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
					if(this.killCount >=15){
						
						Game.Minions.push(new Fly(this.x+8,this.y+8,2+floorCount*2/3,"Pooter",true));
						tempAnimations.push(new Animation(19,this.x-40,this.y-20,200,150,16,imageTool.explosion,0,0,1));
						createItem(this.x+this.width/2,this.y+this.height/2,"boss",true);
						this.alive = false;
						bossbeaten++;}
					this.killTimer = Date.now();
				}
			}
		}
	}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si le minion est vivant
		if(this.alive){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-10, this.y+60, this.width+20, this.height-20);
			context.restore();
			
			if(this.spawningSwarm){
				if(this.version==2){
					this.swarmAnim2.update(this.x,this.y);			
					this.swarmAnim2.draw(context);}
				else {
					this.swarmAnim.update(this.x,this.y);			
					this.swarmAnim.draw(context);}
			}
			else if(this.spawningFly){
				if(this.version==2){
					this.flyAnim2.update(this.x,this.y);
					this.flyAnim2.draw(context);}
				else {
					this.flyAnim.update(this.x,this.y);
					this.flyAnim.draw(context);}
				}
			else if(this.isHit)		context.drawImage(imageTool.dukehit, this.x-22, this.y-22, this.width+42, this.height+42);
			else if(this.version ==2) context.drawImage(imageTool.duke2, this.x-22, this.y-22, this.width+42, this.height+42);
			else context.drawImage(imageTool.duke, this.x-22, this.y-22, this.width+42, this.height+42);
				
			//HP BAR
			if(this.hp >=0){
			var percentLeft = (this.hp / this.maxHp)*100;
			context.drawImage(imageTool.bossBg,280,0,410,43);
				if(this.isHit) context.drawImage(imageTool.bossHpHit,316,10,(367/100)*percentLeft,27);
				else context.drawImage(imageTool.bossHp,316,10,(367/100)*percentLeft,27);
				
			context.drawImage(imageTool.bossBar,280,0,410,43);
			
			context.font = "12pt wendy";
			context.textAlign = 'right';
			context.fillStyle = 'white';
			context.drawImage(imageTool.uinote, canvas.width-240, canvas.height-30, 300, 40);
			var nameShow ="";
			if(floorCount == 3) nameShow = this.name+ " II";
			else nameShow = this.name+ " I";
			context.fillText(nameShow,canvas.width-8, canvas.height-8);
			}
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
			if(!this.isHit){
				this.hp -= dmg;
				this.lastDamaged = Date.now();
				
				if(this.canBePushed){
					this.lastPushed=Date.now();
				}
			}
				
			if(this.hp <= 0){
				this.swarm =0;
				for(var m=0; m< Game.Minions.length; m++){
					if(Game.Minions[m].bossfollow) Game.Minions[m].bossfollow=false;
				}
				this.phase =0;
			}
		}
	}
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		this.now = Date.now();
		if( this.now - this.lastDamaged < 80){	this.isHit = true;}
		else this.isHit = false;
		
		if(this.now - this.lastPushed < 1600){ this.canBePushed = false;}
		else  this.canBePushed = true;
		
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
	this.flySpawn = function(){
		if(Game.Minions.length < 11){
		
			if(Date.now() - this.lastFire > this.spawnTimer){
				//Attaque au hasard
				this.pattern = getRand(2,1);
				if(this.pattern ==1){
					this.spawningFly = true;}
				else if(this.pattern ==2){
					this.spawningSwarm = true;}
				this.canSpawn = true;
				this.spawnTimer = getRand(1300,1700);
				this.lastFire= Date.now();
			}
			else if(this.canSpawn && Date.now() - this.lastFire > 500){
				this.canSpawn = false;
				//Position du boss
				var bx = this.x - this.width/2 -12; 
				var by = this.y - this.height/2 -12;				
				if(this.pattern ==1 && this.swarm > 2){ //Spawn attack fly
					Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));
					if(this.version ==2) Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));
					if(this.version ==2 && this.hp <= this.maxHp/2) {
						Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));
						Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));}
				}
				else { //Spawn defensive swarm
					if(this.swarm > 3+this.version){ //Release le swarm si + de 5 mouches
						for(var i =0; i< Game.Minions.length; i++){
							if(Game.Minions[i].bossfollow){
								Game.Minions[i].dukeRelease(bx,by);}}} 
								
					else { //Sinon spawn plus de mouches
					var randFly = getRand(2+this.version, 3+this.version);
					if(this.version ==2 && this.hp <= this.maxHp/2) randFly+=1;
						for(var i =0; i< randFly; i++){
							if(i>6)Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),3,"Pooter",true,true));
							else Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),0.6+floorCount*2/3,"Swarm",true,true));
							this.swarm++;}}
							
				}
			}
		}	
	}
}

function Project(x,y,hp){
	this.name = "Meatspin";
	this.x = x;
	this.y = y;
	this.sx = x;
	this.sy = y;
	this.height = 108;
	this.width = 108;
	this.speed = 4;
	this.accel = 0;
	this.isMoving = false;
	this.fireRate = 1200;
	this.attackSpeed = 4;
	this.range = 2000;
	this.maxHp = hp;
	this.hp = this.maxHp;
	this.dmg = 0.5;
	this.alive = true;
	this.canGetDamage = true;
	this.isHit = false;
	this.canSpawnArm = true;
	this.canSpawnTail = true;
	this.phase = 1;
	this.killTimer = Date.now();
	this.killCount = 0;
	this.pattern = 1;
	this.patternTimer = 6000;
	this.patternChange = Date.now();
	this.angle = 150;
	this.armslength=30;
	this.directionSet= false;
	this.dirx = Math.sin(120);
	this.diry = Math.cos(120);
	this.attx = 0;
	this.atty = 0;
	this.angNow = Date.now();
	this.lastAng = Date.now();
	this.lastEye = Date.now();
	this.lastDamaged = Date.now();
	this.hardmode = false;
	this.arm1 = [];
	this.arm1.destroyed = false;
	this.arm2 = [];
	this.arm1.destroyed = false;
	this.tail = [];
	this.tail.destroyed = false;
	//METHODS
	this.reset = function (){
		this.x = this.sx;
		this.y = this.sy;
		this.hp = this.maxHp;
		this.isHit = false;
		this.isSleeping = this.wasSleeping;
		this.isHit = false;
		this.hitCount = 0;
		this.isBerserk = false;
	}
	this.update = function(){
		this.checkDamage();
		//Calcul state damage
		if( Date.now() - this.lastDamaged < 120){
			this.isHit = true;}
			else this.isHit = false;
		
		this.armslength = this.arm1.length + this.arm2.length;
		if (this.hp <= 0){
			if(this.phase ==1) this.hardmode = true;
			this.phase = 3;}
		else if(this.armslength ==0){
			this.phase = 2;}
		else this.phase = 1;
		
		//Phase 1: Tentacules
		if(this.phase ==1){
			//Changement de direction des Tentacules
			if(Date.now() - this.patternChange > this.patternTimer){
				if(this.pattern ==1) this.pattern =2;
				else this.pattern =1;
				this.attack(3);
				this.patternChange = Date.now();
				console.log('Pattern '+this.pattern);
			}
		}
		//Phase 2: Mouvement et projectiles
		else if(this.phase ==2 && this.hp != this.maxHp){
			//Kill les yeux
			if(Date.now() - this.killTimer > 500){
				var gmlength = Game.Minions.length; //Nombre de yeux
				if(gmlength > 0){
					if(Game.Minions[gmlength-1].type=="Eye"){
					Game.Minions[gmlength-1].kill();
					this.killTimer = Date.now();}}}
			//Spawn la tail
			if(this.canSpawnTail){
				var taillength = 5;
				var state = 3;
				for(var o = 0; o < taillength; o++){
					if(o > 2) state = 1;
					else if(o > 1) state = 2;
					this.tail.push(new this.Tail(40,40,state,o));	}					
				this.canSpawnTail = false;
				console.log('tail spawned');
			}
			//Lance des projectiles
			if(Date.now() - this.patternChange > this.patternTimer/3){
				this.attack(getRand(2,1));
				this.patternChange = Date.now();
				console.log('Pattern '+this.pattern);
			}
			//Détermine direction de départ
			if(!this.directionSet){
				this.directionSet= true;
				this.dirx = Math.sin(toRad(150));
				this.diry = Math.cos(toRad(150));
			}
			this.move();
		}
		//Phase 3: animation de mort
		else if(this.phase==3){
			this.x += getRand(5,-2);
			this.y += getRand(5,-2);
				
			if(Date.now() - this.killTimer > 250){
				
				var gmlength = Game.Minions.length; //Nombre de yeux
				if(gmlength > 0){
					if(Game.Minions[gmlength-1].type=="Eye") Game.Minions[gmlength-1].kill();}
				if(this.arm1.length > 0)	this.arm1[this.arm1.length-1].kill();
				if(this.arm2.length > 0)	this.arm2[this.arm2.length-1].kill();
				if(this.tail.length > 0)	this.tail[this.tail.length-1].kill();
					
				this.dmg = 0;
				this.killCount++;
				bleed(6,this.x+getRand(150,-50),this.y+getRand(150,-50),this.y+60,this.height,this.width,-80,-80,1.2);
				sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
				if(this.killCount >=20){
					tempAnimations.push(new Animation(19,this.x-40,this.y-20,200,150,16,imageTool.explosion,0,0,1));
					createItem(this.x+this.width/2,this.y+this.height/2,"boss",true);
					if(this.hardmode){
						for(var i =0; i< 3; i++){
							var randbonus = getRand(bossPool.length-1,0);
							var randloot = bossPool[randbonus];
							Game.Items.push(new Item((5+(i*2))*64,this.y+this.height/2,randloot,true));
							bossPool.splice(randbonus,1);
						}
					}
					this.alive = false;
					bossbeaten++;}
				this.killTimer = Date.now();
			}
		}
		
		//Création tentacules
		if(this.canSpawnArm){
				this.canSpawnArm = false;
				var distance = 80;
				var armlength = 15;
				var angle = 5;
				var offset = 23;
				//ARM1
				for(var o = 0; o < armlength; o++){
					var state = 1;
					if(o <= 2) state = 3;
					else if(o < armlength -3) state = 2;
					this.arm1.push(new this.Limb(40,40,120,distance+(o*offset),state,o));}
				//ARM2
				for(var o = 0; o < armlength; o++){
					var state = 1;
					if(o <= 2) state = 3;
					else if(o < armlength -3) state = 2;
					this.arm2.push(new this.Limb(40,40,300,distance+(o*offset),state,o));}
					
				this.lastEye = Date.now();
		}

		//EYE
		if(this.phase < 3 && Game.Minions.length < 4 && Date.now() - this.lastEye > (20000)){
			Game.Minions.push(new this.Eye(this.x+this.width/2-26, this.y+this.height/2+18));
			this.lastEye = Date.now();
			console.log('new Eye');
		}

		//ARM1
		for(var a = 0; a< this.arm1.length; a++){
			if(!this.arm1[a].alive){
				this.arm1.splice(a,1);
				
				if(this.arm1.length==0 && !this.arm1.destroyed){
					this.arm1.destroyed = true;
					this.hp -= this.maxHp/4;
					this.isHit = true;
					this.lastDamaged = Date.now();
				}
			}
			else {
				this.arm1[a].position = a;
				this.arm1[a].update();
			}
		}
			
		//ARM2
		for(var c = 0; c< this.arm2.length; c++){
			if(!this.arm2[c].alive){
				//Morceau mort
				this.arm2.splice(c,1);
				//Bras mort
				if(this.arm2.length==0 && !this.arm2.destroyed){
					this.arm2.destroyed = true;
					this.hp -= this.maxHp/4;
					this.isHit = true;
					this.lastDamaged = Date.now();
				}
			}
			else {
				this.arm2[c].position = c;
				this.arm2[c].update();
			}
		}
		
		//Tail
		for(var c = 0; c< this.tail.length; c++){
			
		if(!this.tail[c].alive){
				//Morceau mort
				this.tail.splice(c,1);
				//tail mort
				if(this.tail.length==0 && !this.tail.destroyed){
					this.tail.destroyed = true;
					this.hp -= this.maxHp/4;
					this.isHit = true;
					this.lastDamaged = Date.now();
				}
			}
			else {
				//this.tail[c].position = c;
				if(c==0)this.tail[c].update(this.x,this.y,this.width,this.height);
				else this.tail[c].update(this.tail[c-1].x,this.tail[c-1].y,this.tail[c-1].width,this.tail[c-1].height);
			}
		}
		
		
	}
	this.move= function(){
		if(this.accel < this.speed ) this.accel += 0.02;
		
			this.x += this.dirx*this.accel;
			if(this.dirx > 0){ 
				if(this.checkCollide(Game.wallMaps,"right") ||
				this.checkCollide(Game.Doors,"right")) this.dirx = -this.dirx;
				}
			else if(this.dirx < 0){ 
				if(this.checkCollide(Game.wallMaps,"left") ||
				this.checkCollide(Game.Doors,"left")) this.dirx = -this.dirx;
				}
				
			this.y += this.diry*this.accel;
			if(this.diry > 0){ 
				if(this.checkCollide(Game.wallMaps,"down") ||
				this.checkCollide(Game.Doors,"down")) this.diry = -this.diry;
				}
			else if(this.diry <0){ 
				if(this.checkCollide(Game.wallMaps,"up") ||
				this.checkCollide(Game.Doors,"up")) this.diry = -this.diry;
				}
		}
	this.draw = function(context){  //Affichage
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		//Si le minion est vivant
		if(this.alive){
			//OMBRE
			context.save();
			context.globalAlpha = 0.25;
			context.drawImage(imageTool.shadow, this.x-10, this.y-10, this.width+20, this.height+40);
			context.restore();
			
			//BRAS
			//1
			for(var a = 0; a< this.arm1.length; a++){
				this.arm1[this.arm1.length-1-a].draw(context);
			}
			//2
			for(var a = 0; a< this.arm2.length; a++){
				this.arm2[this.arm2.length-1-a].draw(context);
			}
			
			//TAIL
			for(var a = 0; a< this.tail.length; a++){
				this.tail[this.tail.length-1-a].draw(context);
			}
			
			//BODY
			if(this.isHit) context.drawImage(imageTool.projecthit, this.x-32, this.y-22, this.width+52, this.height+42);			
			else context.drawImage(imageTool.project, this.x-32, this.y-22, this.width+52, this.height+42);			
			//HP BAR
			if(this.hp >= 0){
			var percentLeft = (this.hp / this.maxHp)*100;
			context.drawImage(imageTool.bossBg,280,0,410,43);
				if(this.isHit) context.drawImage(imageTool.bossHpHit,316,10,(367/100)*percentLeft,27);
				else context.drawImage(imageTool.bossHp,316,10,(367/100)*percentLeft,27);
			context.drawImage(imageTool.bossBar,280,0,410,43);
			
			context.font = "17pt danielbk";
			context.textAlign = 'right';
			context.fillStyle = 'white';
			context.drawImage(imageTool.uibar, canvas.width-300, canvas.height-40, 900, 70);
			context.fillText(this.name,canvas.width-8, canvas.height-8);
			
			}
		}
	}
	this.clear = function(){	//Supprimer
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
	this.attack = function(type){
		if(type==1){
			this.attx = (Player.x +Player.width/2) - (this.x + this.width/2);
			this.atty = (Player.y +Player.height/2) - (this.y + this.height/2);
			var hyp = Math.sqrt(this.attx*this.attx + this.atty*this.atty);
			this.attx = this.attx/hyp;
			this.atty = this.atty/hyp;
			for(var i=0; i<6; i++){
				var speedsize = getRand(3,2);
				Game.enemyBullets.push(new enemyBullet(speedsize,this.range,this.x+50,this.y+15,  this.attx+(getRand(3,-1))/4  ,  this.atty+(getRand(3,-1))/4  ,0.5,40-(speedsize*4)));}
		}
		else if(type ==2){
			for(var i=0; i<6; i++){
				var dir = 60*i;
				var bdirx = Math.sin(toRad(dir));
				var bdiry = Math.cos(toRad(dir));
				Game.enemyBullets.push(new enemyBullet(4,this.range,this.x+50,this.y+15, bdirx, bdiry,0.5,30));}
		}
		else if(type ==3){
			this.attx = (Player.x +Player.width/2) - (this.x + this.width/2);
			this.atty = (Player.y +Player.height/2) - (this.y + this.height/2);
			var hyp = Math.sqrt(this.attx*this.attx + this.atty*this.atty);
			this.attx = this.attx/hyp;
			this.atty = this.atty/hyp;
			Game.enemyBullets.push(new enemyBullet(4,this.range,this.x+50,this.y+15, this.attx,this.atty,0.5,30));
		}
	}
	this.getDamage = function(dmg){
		if(this.alive && this.hp > 0){
			if(!this.isHit && this.phase == 1)this.hp -= dmg/10;
			else if(!this.isHit  && this.phase == 2)this.hp -= dmg;
			this.lastDamaged = Date.now();
		}
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
	this.checkDamage = function(){ //calcul d'invulnérabilité temporaire
		if( Date.now() - this.lastDamaged < 80){this.isHit = true;}
		else this.isHit = false;
	}
	//
	//LIMB
	this.Limb = function(width,height,angle,radius,state,position){
		this.x=0;
		this.y=0;
		this.width = width;
		this.height = height;
		this.position = position;
		this.damage = 0.5;
		this.state = state;
		this.maxhp = this.state*3;
		this.hp = this.maxhp;
		this.angle = angle;
		this.speed = 0;
		this.tarspeed =0;
		this.radius = radius;
		this.tarradius = 80+(this.position*23);
		this.variation = 0;
		this.tarvariation = this.position*5;
		this.lastDamaged = 0;
		this.canGetDamage = true;
		this.isHit = false;
		this.alive = true;
		this.update = function(){
			
			if(Game.Bosses[0].phase ==3) this.damage =0;
			
			//Vitesse selon pattern (direction) et nombre de "morceaux" de bras
			if(Game.Bosses[0].pattern ==1)this.tarspeed = 4 - Game.Bosses[0].armslength/8;
			else if(Game.Bosses[0].pattern ==2)this.tarspeed = -4 + Game.Bosses[0].armslength/8;
			
			//Calcul de vitesse
			if(this.speed != this.tarspeed ) this.speed -= (this.speed - this.tarspeed)/100;
			
			//Switch de position
			this.tarradius = 80+(this.position*23);
			this.tarvariation = this.position*(this.tarspeed*2.5);
			
			//Calcul de la courbure du bras
			if(this.variation != this.tarvariation ) this.variation -= (this.variation - this.tarvariation)/200;
			if(this.radius != this.tarradius) this.radius -= (this.radius - this.tarradius)/10;
			
			//Rotation
			if(this.angle > 0) this.angle-= this.speed;
			else this.angle =360;
			
			//Calcul state damage
			if( Date.now() - this.lastDamaged < 120){
				this.isHit = true;}
				else this.isHit = false;
			
			//Calcul d'étape des parties du bras. Si un morceau de "niveau 3" est brisée, une mouche spawn
			if (this.hp <=3) this.state = 1;
			else if (this.hp <=6){
				if(this.state ==3){
					Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));}
				this.state = 2;}

			this.x = ((Game.Bosses[0].x + Game.Bosses[0].width/2)  + (Math.sin(toRad(this.angle+this.variation))*this.radius) -this.width/2);
			this.y = ((Game.Bosses[0].y + Game.Bosses[0].height/2) + (Math.cos(toRad(this.angle+this.variation))*this.radius) -this.height/2);
				
			// Player collision
				if(this.y < Player.y + Player.height &&
					this.y + this.height > Player.y &&
					this.x + this.width  > Player.x && 
					this.x < Player.x + Player.width ){
						Player.getDamage(this.damage);}
						
			this.checkCollide(playerBullets);
			this.checkCollide(playerBulletsBack);
			this.checkCollide(Game.Explosions);
		}
		this.draw = function(context){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x+7, this.y+24, this.width-15, this.height-15);
			context.restore();
				
			if(this.state ==1){
				this.width = 30;
				this.height = 30;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb1hit,this.x-6,this.y-6,this.width*1.3,this.height*1.3);
				else context.drawImage(imageTool.projectLimb1,this.x-6,this.y-6,this.width*1.3,this.height*1.3);
			}
			
			else if(this.state ==2){
				this.width = 45;
				this.height = 45;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb2hit,this.x-4,this.y-15,this.width*1.3,this.height*1.4);
				else context.drawImage(imageTool.projectLimb2,this.x-4,this.y-15,this.width*1.3,this.height*1.4);}
			
			else if(this.state ==3){
				this.width = 60;
				this.height = 60;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb3hit,this.x-14,this.y-14,this.width*1.3,this.height*1.3);
				else context.drawImage(imageTool.projectLimb3,this.x-14,this.y-14,this.width*1.3,this.height*1.3);
			}
		}
		this.getDamage = function(dmg){
			if(this.alive && this.hp > 0){
				if(!this.isHit)this.hp -= dmg;
				this.lastDamaged = Date.now();
				if(this.hp <= 0){
					bleed(6,this.x,this.y-20,this.y+40,this.height,this.width,-80,-80,1.2);
					sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
					this.alive = false;}}
		}
		this.kill = function(){
			bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
			this.alive = false;
		}
		this.checkCollide =  function(obj){ //calcul de collision hitbox ronde
			for(var i=0;i<obj.length;i++){
				var diffx = (this.x + this.width/2) - (obj[i].x + obj[i].width/2);
				var diffy = (this.y + this.height/2) - (obj[i].y + obj[i].height/2);
				var hyp = Math.sqrt(diffx*diffx + diffy*diffy);
				
				if(hyp <= (this.width/2 + obj[i].width/2) ){
					
					if(obj == Game.Explosions){this.getDamage(Player.bombDmg/3)}
					else{
						this.getDamage(obj[i].dmg);
						obj[i].clear();}
				}
			}
		}
	}
	//FIN LIMB
	//
	//
	//TAIL
	this.Tail = function(width,height,state,pos){
		this.width = width;
		this.height = height;
		this.x=canvas.width/2 - this.width/2;
		this.y=canvas.height/2 - this.height/2;
		this.dirx=0;
		this.diry=0;
		this.position = pos;
		this.leaderpos = pos-1;
		this.damage = 0.5;
		this.state = state;
		this.maxhp = this.state*3;
		this.hp = this.maxhp;
		this.speed = 0;
		this.accel= 1;
		this.lastDamaged = 0;
		this.canGetDamage = true;
		this.isHit = false;
		this.alive = true;
		this.hyp=0;
		//leader coords
		this.lx =0;
		this.ly = 0;
		this.lw = 0;
		this.lh = 0;
		this.update = function(lx,ly,lw,lh){
			
			if(Game.Bosses[0].phase ==3) this.damage =0;
			
			this.lx = lx;
			this.ly = ly;
			this.lw = lw;
			this.lh = lh;
		
			//Calcul de direction
			this.dirx = (this.lx + this.lw/2) - (this.x + this.width/2);
			this.diry = (this.ly + this.lh/2) - (this.y + this.height/2);
			this.hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = this.dirx/this.hyp;
			this.diry = this.diry/this.hyp;
			
			//Calcul de vitesse
			if(this.hyp > (58-pos*7)) this.speed = 4;
			else this.speed =1;
			if(this.accel != this.speed ) this.accel -= (this.accel - this.speed)/10;
			
			//Mouvement
			this.x += this.dirx*this.accel;
			this.y += this.diry*this.accel;
	
			
			
			//Calcul state damage
			if( Date.now() - this.lastDamaged < 120){
				this.isHit = true;}
				else this.isHit = false;
			
			//Calcul d'étape des parties du bras. Si un morceau de "niveau 3" est brisée, une mouche spawn
			if (this.hp <=3) this.state = 1;
			else if (this.hp <=6){
				if(this.state ==3){
					Game.Minions.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*2/3,"Attack",true,false));}
				this.state = 2;}
				
			// Player collision
				if(this.y < Player.y + Player.height &&
					this.y + this.height > Player.y &&
					this.x + this.width  > Player.x && 
					this.x < Player.x + Player.width ){
						Player.getDamage(this.damage);}
						
			this.checkCollide(playerBullets);
			this.checkCollide(playerBulletsBack);
			this.checkCollide(Game.Explosions);
		}
		this.draw = function(context){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x+7, this.y+24, this.width-15, this.height-15);
			context.restore();
			
			
			
			if(this.state ==1){
				this.width = 30;
				this.height = 30;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb1hit,this.x-6,this.y-6,this.width*1.3,this.height*1.3);
				else context.drawImage(imageTool.projectLimb1,this.x-6,this.y-6,this.width*1.3,this.height*1.3);
			}
			
			else if(this.state ==2){
				this.width = 45;
				this.height = 45;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb2hit,this.x-4,this.y-15,this.width*1.3,this.height*1.4);
				else context.drawImage(imageTool.projectLimb2,this.x-4,this.y-15,this.width*1.3,this.height*1.4);}
			
			else if(this.state ==3){
				this.width = 60;
				this.height = 60;
				if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
				if(this.isHit) context.drawImage(imageTool.projectLimb3hit,this.x-14,this.y-14,this.width*1.3,this.height*1.3);
				else context.drawImage(imageTool.projectLimb3,this.x-14,this.y-14,this.width*1.3,this.height*1.3);
			}
			
			if(hitBox){
			context.strokeStyle = "white";
			context.beginPath();
			context.moveTo(this.lx+this.lw/2,this.ly+this.lh/2);
			context.lineTo(this.x+this.width/2,this.y+this.height/2);
			context.lineWidth = 8;
			context.stroke();}
		}
		this.getDamage = function(dmg){
			if(this.alive && this.hp > 0){
				if(!this.isHit)this.hp -= dmg;
				this.lastDamaged = Date.now();
				if(this.hp <= 0){
					bleed(6,this.x,this.y-20,this.y+40,this.height,this.width,-80,-80,1.2);
					sounds.enemyDeath.currentTime = 0;sounds.enemyDeath.play();
					this.alive = false;}}
		}
		this.kill = function(){
			bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
			this.alive = false;
		}
		this.checkCollide =  function(obj){ //calcul de collision hitbox ronde
			for(var i=0;i<obj.length;i++){
				var diffx = (this.x + this.width/2) - (obj[i].x + obj[i].width/2);
				var diffy = (this.y + this.height/2) - (obj[i].y + obj[i].height/2);
				var hyp = Math.sqrt(diffx*diffx + diffy*diffy);
				
				if(hyp <= (this.width/2 + obj[i].width/2) ){
					
					if(obj == Game.Explosions){this.getDamage(Player.bombDmg/3)}
					else{
						this.getDamage(obj[i].dmg);
						obj[i].clear();}
				}
			}
		}
	}
	//FIN TAIL
	//
	// EYE
	this.Eye = function(x,y){
		this.type = "Eye";
		this.x = x;
		this.y = y;
		this.width = 28;
		this.height = 28;
		this.dirx = 0;
		this.diry = 0;
		this.speed = 1;
		this.accel = 0;
		this.dmg = 0.5;
		this.alive= true;
		this.isHit = false;
		this.isMoving = false;
		this.rand = getRand(2000,250);
		this.angle = getRand(360,0);
		this.lastAng = Date.now();
		this.lastDamaged = Date.now();
		this.update = function(){
			if(Game.Bosses[0].phase ==3) this.damage =0;
			
			if( Date.now() - this.lastDamaged < 350){
				this.isHit = true;}
			else this.isHit = false;
			if(this.accel != this.speed ) this.accel -= (this.accel - this.speed)/100;
				
			this.move();
		}
		this.move= function(){
			
		// Mode "bump" (a été touché)
		if(this.isHit){
			this.dirx = (Player.x- Player.width/2) - (this.x - this.width/2);
			this.diry = (Player.y- Player.height/2) - (this.y - this.height/2);
			var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
			this.dirx = -this.dirx/hyp;
			this.diry = -this.diry/hyp;
			this.speed = 6;
			}
		else this.speed = 1;
		
			this.x += this.dirx*this.accel;
			if(this.dirx > 0){ 
				if(this.checkCollide(Game.wallMaps,"right") ||
				this.checkCollide(Game.Doors,"right")) this.dirx = -this.dirx;
				}
			else if(this.dirx < 0){ 
				if(this.checkCollide(Game.wallMaps,"left") ||
				this.checkCollide(Game.Doors,"left")) this.dirx = -this.dirx;
				}
				
			this.y += this.diry*this.accel;
			if(this.diry > 0){ 
				if(this.checkCollide(Game.wallMaps,"down") ||
				this.checkCollide(Game.Doors,"down")) this.diry = -this.diry;
				}
			else if(this.diry <0){ 
				if(this.checkCollide(Game.wallMaps,"up") ||
				this.checkCollide(Game.Doors,"up")) this.diry = -this.diry;
				}
		}
		this.kill = function(){
			bleed(2,this.x,this.y-10,this.y+20,this.height,this.width,-50,-50,2/3);
			this.alive = false;
		}
		this.getDamage = function(dmg){
			if(dmg >= 10) this.kill();
			if(!this.isHit){
				this.lastDamaged = Date.now();}
		}
		this.draw = function(context){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x+3, this.y+34, this.width-6, this.height-6);
			context.restore();
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.drawImage(imageTool.projectEye,this.x-2,this.y-2,this.width+4,this.height+4);		
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
	//FIN EYE
	//
}

//projectile
function enemyBullet(speed,range,bulx,buly,dirx,diry,dmg,size){
	this.range = range;
	this.defaultrange = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = dirx;
	this.diry = diry;
	this.height = size;
	this.width = size;
	this.dmg = dmg;
	this.fireDate = Date.now();
	this.speed = speed;
	this.alive = true;
	this.update = function(){	//Calcul
		if(this.alive){
			this.x -= this.dirx*-this.speed;
			this.y -= this.diry*-this.speed;
			enemyBulletCollisionPlayer();
			enemyBulletCollisionLevel(Game.collideMaps);
			enemyBulletCollisionLevel(Game.wallMaps);
			if(Date.now() - this.fireDate > this.range) this.alive = false;
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
			if (Game.enemyBullets[y].x < obj[m].x + obj[m].width-7  &&
			Game.enemyBullets[y].x + (Game.enemyBullets[y].width-7)  > obj[m].x &&
			Game.enemyBullets[y].y < obj[m].y + obj[m].height-7 &&
			Game.enemyBullets[y].y + (Game.enemyBullets[y].height-7) > obj[m].y) {
				if(obj[m].type =="fireplace" || obj[m].type =="hellfireplace"){}
				else if(obj[m].isColliding){
					Game.enemyBullets[y].alive = false;}}}}
}

console.log('enemy.js loaded');

var bossbeaten = 0;