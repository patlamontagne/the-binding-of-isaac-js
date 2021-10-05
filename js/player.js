//Objet joueur
var Player = {
	x : 100, y : 100,
	posx : 0, posy : 0,
	diffx : 0, diffy : 0,
	lastx : 0, lasty : 0,
	height: 42,	width: 36,
	accelx : 0, accely : 0, 
	friction : 0.4,
	speed : 2.8, speedBoost:0, 
	range : 400, rangeBoost:0, 
	fireRate: 350,	fireRateBoost:0,
	attackSpeed: 8, bulletSpeedBoost:1,
	damage : 1,	dmgBoost:0,	dmgMult:1, 
	bombDmg :15, bombMult :1, 
	hp : 3,	maxhp: 3, //HP : Vie restante, MAXHP : Vie totale
	soul : 0, //"Armure"
	gold : 5, keys : 1, bombs : 1, //Pickups
	bombPosed : Date.now(), 
	head: imageTool.playerDown, 
	orientation :"down", //Orientation de la tête
	blink : 0, //Clignotement quand damagé
	isShooting: false, //Animation de tir
	isLooting: false, //Animation de loot
	textShowing: false, //Description d'item
	itemHolding : "", //L'item qui est looté
	itemHoldingName : "", //Le nom de l'item qui est looté
	itemHoldingDesc : "", //La description de l'item qui est looté
	lootTimer : 0, //Timer de l'animation
	currentMoving : "", //Direction selon WASD
	alive: true, 
	canGetDamage: true, 
	isBumped: false, 
	isSlowed: Date.now(),
	uiUpdated: Date.now(),
	lastDamaged : Date.now(), damagedNow : Date.now(), lastFire : Date.now(), eyeSwitch : 1,
	isNumberOne: false, isToothPicks: false, isWiggle: false, Halo: false, smallRock: false, wireCoatHanger: false,
	isSpeedBall: false, jesusJuice: false, lipstick: false, innerEye: false, Growth: false, lessThanThree: false,
	skeletonKey: false, belt: false,
	TreasureMap:false, TheCompass: false,
	update: function(){
		//Gestion de vie
		if(this.hp <= 0 && this.soul ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
		else if(this.hp > 12) this.hp = 12; //Maximum de 12 HP pleines, peut avoir plus de maxhp pour les sacrifier
		if(!this.alive) gameOver = true; //Détection de fin de jeu
		
		//Gestion de minimap
		if(this.TreasureMap) showMap("Treasure Map"); //Montre les pièces
		if(this.TheCompass) showMap("The Compass"); //Montre les icones de pièces spéciales
		Game.isVisited = true;
		Game.isVisible = true;
		
		//Positionnement bidimensionnel (X: 0-14, Y: 0-8)
		this.posx = Math.round((this.x+this.width)/64);
		this.posy = Math.round((this.y+this.height)/64);
		
		//Déplacement
		this.lastx = this.x;
		this.lasty = this.y;
		
		//State de Ralentissement (spider web, glue shots)
		if(Date.now() - this.isSlowed < 300){ 
			this.accelx = this.accelx*2/3;this.accely = this.accely*2/3;}
			
		//State pour l'animation de loot
		if(Date.now() - this.lootTimer > 600){
			this.isLooting = false;}
		if(this.isLooting) this.textShowing = true;
		if(Date.now() - this.lootTimer > 3000){
			this.textShowing = false;}
			
			
		//State pour l'animation de tir
		if( Date.now() - this.lastFire < this.fireRate/2){
			Player.isShooting = true;}
		else Player.isShooting = false;
		
		//State pour l'invulnérabilité temporaire
		if( Date.now() - this.lastDamaged > 700){
			this.canGetDamage = true;}	//compare le temps actuel avec le temps du dernier dégat
		else this.canGetDamage = false;
		
		//BOMBE
		if(Date.now() - this.bombPosed > 250){
			if((keyShift || keyE) && this.bombs >0){
				this.bombs--;
				Game.Bombs.push(new Bomb("normal",this.x,this.y+15));
				this.bombPosed = Date.now();}}
				
		//Calcul des boosts
		this.speed  = 2.8 + this.speedBoost;
			if(this.speed > 6) this.speed = 6; //Speed cap
		this.damage = (1 + this.dmgBoost) * this.dmgMult;
			if(this.damage > 3.25) this.damage = 3.25; //Dmg cap
		this.bombDmg = 15 * this.bombMult;
			if(this.bombDmg > 20) this.bombDmg = 20; //Dmg cap
		this.range = 400 + this.rangeBoost;
		this.fireRate = 350 - this.fireRateBoost;
			if(this.fireRate < 100) this.fireRate = 100; //Firerate cap
		this.attackSpeed = 8 * this.bulletSpeedBoost; //bonus max de 3
			if(this.attackSpeed > 11) this.attackSpeed = 11; //Bulletspeed cap
			
		//this.attackSpeed = 1.5; //DEBUG
		
		//Vitesse diagonale fix	
		if((keyW || keyS) && (keyA || keyD)) this.speed = this.speed*2/3; 
		
		//Orientation du mouvement
		this.currentMoving = "";
		if(!this.isLooting && !isPaused && !gameOver){
		if(keyW){
			if(this.accely > 0-this.speed){this.accely -= this.friction;}
			else if(this.accely < 0-this.speed){this.accely += this.friction;}
			this.currentMoving = "up";}				
		else if(keyS){
			if(this.accely < this.speed){this.accely += this.friction;}
			else if(this.accely > this.speed){this.accely -= this.friction;}
			this.currentMoving = "down";}
		if(keyA){
			if(this.accelx > 0-this.speed){this.accelx -= this.friction;}
			else if(this.accelx < 0-this.speed){this.accelx += this.friction;}
			this.currentMoving = "left";}
		else if(keyD){
			if(this.accelx < this.speed){this.accelx += this.friction;}
			else if(this.accelx > this.speed){this.accelx -= this.friction;}
			this.currentMoving = "right";}}
			
		//Décélération, si les deux touches d'une meme dimension sont relachées ou enfoncées(elles s'annulent)
		if(this.isLooting){
			if(this.accely != 0){this.accely -= this.accely/7;}
			if(this.accelx != 0){this.accelx -= this.accelx/7;}	}
			
		if(!keyS && !keyW){if(this.accely != 0){this.accely  -= this.accely/7;}} 
		if(keyS && keyW){if(this.accely != 0){this.accely  -= this.accely/7;}}
		if(!keyD && !keyA ){if(this.accelx != 0){this.accelx -= this.accelx/7;}}
		if(keyA && keyD){if(this.accelx != 0){this.accelx -= this.accelx/7;}}
	
			//Accélération X
		this.x += this.accelx*2;
		
		if(this.accelx*2 > 0){ 
			detectCollision(Game.collideMaps);
			this.checkCollide(Game.collideMaps,"right");
			this.checkCollide(Game.wallMaps,"right");
			this.checkCollide(Game.overSprites,"right");
			this.checkCollide(Game.holeMaps,"right");
			this.checkCollide(Game.Doors,"right");}
		if(this.accelx*2 < 0){ 
			detectCollision(Game.collideMaps);
			this.checkCollide(Game.collideMaps,"left");
			this.checkCollide(Game.wallMaps,"left");
			this.checkCollide(Game.overSprites,"left");
			this.checkCollide(Game.holeMaps,"left");
			this.checkCollide(Game.Doors,"left");}
		//Accélération Y
		this.y += this.accely*2;
		
		if(this.accely*2 > 0){ 
			detectCollision(Game.collideMaps);
			this.checkCollide(Game.collideMaps,"down");
			this.checkCollide(Game.wallMaps,"down");
			this.checkCollide(Game.overSprites,"down");
			this.checkCollide(Game.holeMaps,"down");
			this.checkCollide(Game.Doors,"down");}
		if(this.accely*2 < 0){ 
			detectCollision(Game.collideMaps);
			this.checkCollide(Game.collideMaps,"up");
			this.checkCollide(Game.wallMaps,"up");
			this.checkCollide(Game.overSprites,"up");
			this.checkCollide(Game.holeMaps,"up");
			this.checkCollide(Game.Doors,"up");}
		
		//Vérifications
		itemCollision(Game.Items);
		itemCollision(Game.shop);
		detectCollision(Game.traps);
		detectCollision(Game.Minions);
		detectCollision(Game.Towers);	
		detectCollision(Game.Bosses);	
		
		this.diffx = this.x-this.lastx;
		this.diffy = this.y-this.lasty;
		
		//PORTES 
		if(this.x <= 32){changeRoom("left");} // Salle gauche
		if(this.x >= canvas.width -(32+this.width/2)){changeRoom("right");} //Salle droite
		if(this.y <= 32){changeRoom("up");} // Salle haut
		if(this.y >= canvas.height -(32+this.height/2)){changeRoom("down");} //Salle bas
	},
	drawBody : function(context){
	
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.save();
		context.globalAlpha = 0.15;
		context.drawImage(imageTool.shadow, this.x-8, this.y+16, this.width+16, this.height);
		context.restore();
			
		if(this.alive && !isPaused && !isChanging){
			if(!this.canGetDamage){ // Joueur invincible
					if(this.blink >= 15)this.blink =0;
					else if(this.blink > 0 && this.blink <=7){
						context.save();
						context.globalAlpha = 0;}
			}
					
			//Joueur LOOT
			if(this.isLooting){
				Animations[3].update(Player.x-10,Player.y-32);
				Animations[3].draw(context);
				context.drawImage(this.itemHolding, this.x-21, this.y-84, 80, 80);}
			
			//Animations déplacement
			else if(keyD){Animations[1].draw(context);}
			else if(keyA){Animations[2].draw(context);}
			else if(keyW || keyS){Animations[0].draw(context);}
			//Corps idle
			else context.drawImage(imageTool.bodyIdle,this.x-2, this.y+12, 40, 40);
			context.restore();	}
			else context.drawImage(imageTool.bodyIdle,this.x-2, this.y+12, 40, 40);
			
			if(this.lessThanThree){
				if(keyA)Animations[4].update(Player.x+3,Player.y+10);
				else if(keyD)Animations[4].update(Player.x+9,Player.y+10);
				else Animations[4].update(Player.x+6,Player.y+10);
				Animations[4].draw(context);}
			else if(this.belt){
				context.drawImage(imageTool.belt,this.x+3, this.y+32, 28, 17);
			}
	},
	drawHead : function(context){
		if(!this.isLooting){
			//Joueur invulnérable (a recu du damage)
			if(this.alive && !this.canGetDamage){
				if(this.blink > 15)this.blink =0;
				else if(this.blink > 0 && this.blink <=7){
					context.save();
					context.globalAlpha = 0;}
				this.blink++;}

			//Direction attaque
				if(!gameOver){
					if(keyLeft){this.orientation = "left"; this.playerFire();}
					else if(keyUp){this.orientation = "up"; this.playerFire();}
					else if(keyRight){this.orientation = "right"; this.playerFire();}
					else if(keyDown){this.orientation = "down"; this.playerFire();}
				}
			
			if((keyUp || keyDown || keyLeft || keyRight) && this.isNumberOne && !this.innerEye) this.isShooting = true;
					
			//SMALLROCK		
			if(this.smallRock && this.orientation == "left"){
				if(this.isShooting) context.drawImage(imageTool.smallrockback, this.x-14, this.y-22, 62, 55);
				else context.drawImage(imageTool.smallrockback, this.x-14, this.y-25, 62, 55);
			}
			else if(this.smallRock && this.orientation == "up"){
				if(this.isShooting) context.drawImage(imageTool.smallrockright, this.x-14, this.y-22, 62, 55);
				else context.drawImage(imageTool.smallrockright, this.x-14, this.y-25, 62, 55);}
			
			//Tete
			context.drawImage(this.head, this.x-14, this.y-22, 64, 55); 
			
			//De face
			if(this.orientation == "down"){
				if(this.innerEye){
					if(this.isShooting) this.head = imageTool.innerfronts;
					else this.head = imageTool.innerfront;}
				else if(this.isNumberOne){
					if(this.isShooting) this.head = imageTool.nofronts;
					else this.head = imageTool.nofront;}
				else if(this.isSpeedBall){
					if(this.isShooting) this.head = imageTool.speedfronts;
					else this.head = imageTool.speedfront;}
				else{
					if(this.isShooting) this.head = imageTool.playerDownS;
					else this.head = imageTool.playerDown;}
				//GROWTH HORMONES
				if(this.Growth){
					if(this.isShooting) context.drawImage(imageTool.ghormonesfront, this.x-14, this.y-20, 62, 55);
					else context.drawImage(imageTool.ghormonesfront, this.x-14, this.y-26, 62, 60); }
				//JESUS JUICE
				if(this.jesusJuice && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.jesusjuicefront, this.x-14, this.y-13, 62, 45);
					else context.drawImage(imageTool.jesusjuicefront, this.x-14, this.y-22, 62, 55); }
				//MOMS LIPSTICK
				if(this.lipstick && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.lipstickfront, this.x-14, this.y-13, 62, 45);
					else context.drawImage(imageTool.lipstickfront, this.x-14, this.y-22, 62, 55); }
				//WIRE COAT HANGER
				if(this.wireCoatHanger){
					if(this.isShooting) context.drawImage(imageTool.wirefront, this.x-20, this.y-36, 70, 60);
					else context.drawImage(imageTool.wirefront, this.x-20, this.y-41, 70, 60); }
				//SMALLROCK
				if(this.smallRock){
					if(this.isShooting) context.drawImage(imageTool.smallrockfront, this.x-14, this.y-25, 62, 55);
					else context.drawImage(imageTool.smallrockfront, this.x-14, this.y-29, 62, 55);}
				//TOOTHPICKS
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksfront, this.x-16, this.y-12, 68, 42);
					else context.drawImage(imageTool.toothpicksfront, this.x-14, this.y-22, 64, 55); }
				if(this.skeletonKey){
					if(this.isShooting) context.drawImage(imageTool.skeyfront, this.x+10, this.y-9, 16, 14);
					else context.drawImage(imageTool.skeyfront, this.x+10, this.y-16, 16, 16); 
				}
			}
			
			//De dos
			else if(this.orientation == "up"){
				if(this.isShooting) this.head = imageTool.playerUpS;
				else this.head = imageTool.playerUp;
				//GROWTH HORMONES
				if(this.Growth){
					if(this.isShooting) context.drawImage(imageTool.ghormonesback, this.x-14, this.y-22, 62, 55);
					else context.drawImage(imageTool.ghormonesback, this.x-14, this.y-28, 62, 60); 	}
				//WIRE COAT HANGER
				if(this.wireCoatHanger){
					if(this.isShooting) context.drawImage(imageTool.wireback, this.x-16, this.y-36, 70, 60);
					else context.drawImage(imageTool.wireback, this.x-16, this.y-41, 70, 60); }
				if(this.isSpeedBall){
					if(this.isShooting) context.drawImage(imageTool.speedballback, this.x-16, this.y-24, 70, 60);
					else context.drawImage(imageTool.speedballback, this.x-16, this.y-27, 70, 60); }
			}
			
			//Gauche	
			else if(this.orientation == "left"){
				if(this.innerEye){
					if(this.isShooting) this.head = imageTool.innerlefts;
					else this.head = imageTool.innerleft;}
				else if(this.isNumberOne){
					if(this.isShooting) this.head = imageTool.nolefts;
					else this.head = imageTool.noleft;}
				else if(this.isSpeedBall){
					if(this.isShooting) this.head = imageTool.speedlefts;
					else this.head = imageTool.speedleft;}
				else{
					if(this.isShooting) this.head = imageTool.playerLeftS;
					else this.head = imageTool.playerLeft;}
					
				//GROWTH HORMONES
				if(this.Growth){
					if(this.isShooting) context.drawImage(imageTool.ghormonesleft, this.x-14, this.y-22, 62, 55);
					else context.drawImage(imageTool.ghormonesleft, this.x-14, this.y-28, 62, 60); }
				//JESUS JUICE
				if(this.jesusJuice && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.jesusjuiceleft, this.x-14, this.y-13, 62, 45);
					else context.drawImage(imageTool.jesusjuiceleft, this.x-14, this.y-22, 62, 55); }
				//MOMS LIPSTICK
				if(this.lipstick && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.lipstickleft, this.x-16, this.y-13, 62, 45);
					else context.drawImage(imageTool.lipstickleft, this.x-16, this.y-22, 62, 55); }
				//WIRE COAT HANGER
				if(this.wireCoatHanger){
					if(this.isShooting) context.drawImage(imageTool.wireleft, this.x-17, this.y-36, 70, 60);
					else context.drawImage(imageTool.wireleft, this.x-17, this.y-41, 70, 60); }
				//TOOTHPICKS
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksside, this.x-2, this.y-12, 30, 45); 
					else context.drawImage(imageTool.toothpicksside, this.x-2, this.y-20, 25, 55); }
			}
			
			
			
			//Droite
			else if(this.orientation == "right"){
				if(this.innerEye){
					if(this.isShooting) this.head = imageTool.innerrights;
					else this.head = imageTool.innerright;}
				else if(this.isNumberOne){
					if(this.isShooting) this.head = imageTool.norights;
					else this.head = imageTool.noright;}
				else if(this.isSpeedBall){
					if(this.isShooting) this.head = imageTool.speedrights;
					else this.head = imageTool.speedright;}
				else{
					if(this.isShooting) this.head = imageTool.playerRightS;
					else this.head = imageTool.playerRight;}
					
				//GROWTH HORMONES
				if(this.Growth){
					if(this.isShooting) context.drawImage(imageTool.ghormonesright, this.x-14, this.y-22, 62, 55);
					else context.drawImage(imageTool.ghormonesright, this.x-14, this.y-28, 62, 60); }
				//JESUS JUICE
				if(this.jesusJuice && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.jesusjuiceright, this.x-10, this.y-13, 62, 45);
					else context.drawImage(imageTool.jesusjuiceright, this.x-10, this.y-22, 62, 55); }
				//MOMSLIPSTICK
				if(this.lipstick && !this.isNumberOne){
					if(this.isShooting) context.drawImage(imageTool.lipstickright, this.x-10, this.y-13, 62, 45);
					else context.drawImage(imageTool.lipstickright, this.x-10, this.y-22, 62, 55); }
				//WIRE COAT HANGER
				if(this.wireCoatHanger){
					if(this.isShooting) context.drawImage(imageTool.wireright, this.x-16, this.y-36, 70, 60);
					else context.drawImage(imageTool.wireright, this.x-16, this.y-41, 70, 60); }
				//SMALLROCK
				if(this.smallRock){
					if(this.isShooting) context.drawImage(imageTool.smallrockright, this.x-10, this.y-21, 62, 55);
					else context.drawImage(imageTool.smallrockright, this.x-10, this.y-24, 62, 55);}
				//TOOTHPICKS
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksside, this.x+12, this.y-12, 30, 45); 
					else context.drawImage(imageTool.toothpicksside, this.x+12, this.y-20, 25, 55); }}
			
			//Remettre la tête de face après un timer
			if( Date.now() - this.lastFire > 700) this.orientation = "down";
			
			//Détail fixe
			if (this.Halo){
				if(this.isShooting) context.drawImage(imageTool.thehalo, this.x-21, this.y-77, 80, 80);
				else context.drawImage(imageTool.thehalo, this.x-21, this.y-80, 80, 80);}//Objet flottant #2
						context.restore();	
		}				
	},
	drawUI : function(context,uicontext){
		//Interface
		if(Date.now() - this.uiUpdated > 200){ // Draw à toutes les x millisecondes
			uicontext.clearRect(0,0,uicanvas.width,uicanvas.height);
			uicontext.drawImage(imageTool.ui,0,0,uicanvas.width,uicanvas.height);
			//LifeBar
			var half = this.hp%1;
			var halfarmor = this.soul%1;
			var intHp = this.hp - half;
			var intArmor = this.soul - halfarmor;
			var diffHp = this.maxhp - (this.hp+half);
			var ox = 695;
			var oy = 24;
			var width = 38;
			var height = 30;
			var pool = 0;
			var row = 0;
			var col = 0;
			for(var h = 0; h < intHp; h++){
				if(pool > 29) {row = 5*height; col = 30*width;}
				else if(pool > 23) {row = 4*height; col = 24*width;}
				else if(pool > 17) {row = 3*height; col = 18*width;}
				else if(pool > 11) {row = 2*height; col = 12*width;}
				else if(pool > 5) {row = 1*height; col = 6*width;}
				uicontext.drawImage(imageTool.fullhp,(pool*width)+ox-col,oy+row,width,height); pool++;}
			if(half !=0){
				if(pool > 29) {row = 5*height; col = 30*width;}
				else if(pool > 23) {row = 4*height; col = 24*width;}
				else if(pool > 17) {row = 3*height; col = 18*width;}
				else if(pool > 11) {row = 2*height; col = 12*width;}
				else if(pool > 5) {row = 1*height; col = 6*width;}
				uicontext.drawImage(imageTool.halfHp,(pool*width)+ox-col,oy+row,width,height); pool++;}
			for(var d = 0; d < diffHp; d++){
				if(pool > 29) {row = 5*height; col = 30*width;}
				else if(pool > 23) {row = 4*height; col = 24*width;}
				else if(pool > 17) {row = 3*height; col = 18*width;}
				else if(pool > 11) {row = 2*height; col = 12*width;}
				else if(pool > 5) {row = 1*height; col = 6*width;}
				uicontext.drawImage(imageTool.emptyHp,(pool*width)+ox-col,oy+row,width,height); pool++;}
			for(var a = 0; a < intArmor; a++){
				if(pool > 29) {row = 5*height; col = 30*width;}
				else if(pool > 23) {row = 4*height; col = 24*width;}
				else if(pool > 17) {row = 3*height; col = 18*width;}
				else if(pool > 11) {row = 2*height; col = 12*width;}
				else if(pool > 5) {row = 1*height; col = 6*width;}
				uicontext.drawImage(imageTool.ap,(pool*width)+ox-col,oy+row,width,height); pool++;}
			if(halfarmor !=0){
				if(pool > 29) {row = 5*height; col = 30*width;}
				else if(pool > 23) {row = 4*height; col = 24*width;}
				else if(pool > 17) {row = 3*height; col = 18*width;}
				else if(pool > 11) {row = 2*height; col = 12*width;}
				else if(pool > 5) {row = 1*height; col = 6*width;}
				uicontext.drawImage(imageTool.halfAp,(pool*width)+ox-col,oy+row,width,height); pool++;}
			// Gold, Keys, Bombs
			uicontext.font = "14pt wendy";
			uicontext.fillStyle = 'white';
			var zgold ="";
			var zbomb = "";
			var zkey = "";
			if(this.gold < 10) zgold = "0";
			if(this.bombs < 10) zbomb = "0";
			if(this.keys < 10) zkey = "0";
			uicontext.fillText(zgold+this.gold,422,36);
			uicontext.fillText(zbomb+this.bombs,422,68.5);
			uicontext.fillText(zkey+this.keys,422,101);
			// Fps Counter
			/*uicontext.font = "15pt wendy";
			uicontext.fillStyle = 'white';
			var fpsOut = (1000/frameTime).toFixed() + " FPS";
			uicontext.fillText(fpsOut, uicanvas.width-50,18);*/
			
			if(!editorMode){
			//Minimap
			var top = 7;
			var left = 10;
			for(var y=0; y < currentFloor.length; y++){
				for(var x=0; x < currentFloor[y].length; x++){
					if(currentFloor[y][x].isCurrent && currentFloor[y][x].type != "Secret" ){ uicontext.drawImage(imageTool.current,(x*42)+left,(y*17)+top, 44, 21);}
					else if(currentFloor[y][x].exists && currentFloor[y][x].isVisited && currentFloor[y][x].type != "Secret" ){ uicontext.drawImage(imageTool.visited,(x*42)+left,(y*17)+top, 44, 21);}
					else if(currentFloor[y][x].exists && currentFloor[y][x].isVisible && currentFloor[y][x].type != "Secret" ){ uicontext.drawImage(imageTool.unvisited,(x*42)+left,(y*17)+top, 44, 21);}
				}
			}
			for(var y=0; y < currentFloor.length; y++){
				for(var x=0; x < currentFloor[y].length; x++){			
					if(currentFloor[y][x].exists && currentFloor[y][x].iconVisible && currentFloor[y][x].type =="Boss"){ uicontext.drawImage(imageTool.boss,(x*42)+left,(y*17)+top-8, 44, 32);}
					else if(currentFloor[y][x].exists && currentFloor[y][x].iconVisible && currentFloor[y][x].type =="Treasure"){ uicontext.drawImage(imageTool.treasure,(x*42)+left,(y*17)+top-8, 44, 32);}
					else if(currentFloor[y][x].exists && currentFloor[y][x].iconVisible && currentFloor[y][x].type =="Shop"){ uicontext.drawImage(imageTool.shop,(x*42)+left+10,(y*17)+top-4, 26, 28);}else if(currentFloor[y][x].exists && currentFloor[y][x].iconVisible && currentFloor[y][x].type =="Sacrifice"){ uicontext.drawImage(imageTool.sacrifice,(x*42)+left+10,(y*17)+top-4, 26, 28);}
					else if(currentFloor[y][x].exists && currentFloor[y][x].iconVisible && currentFloor[y][x].type =="Cursed"){ uicontext.drawImage(imageTool.cursed,(x*42)+left+10,(y*17)+top-4, 26, 28);}
					else if(currentFloor[y][x].exists && (currentFloor[y][x].isVisible || currentFloor[y][x].isVisible) && currentFloor[y][x].type == "Secret" ){ uicontext.drawImage(imageTool.secret,(x*42)+left,(y*17)+top-4, 44, 26);}
					
					if(currentFloor[y][x].exists && currentFloor[y][x].chestPresent){ uicontext.drawImage(imageTool.minichest,(x*42)+left+16,(y*17)+top+3, 14, 14);}
					if(currentFloor[y][x].exists && currentFloor[y][x].hpPresent){ uicontext.drawImage(imageTool.minihp,(x*42)+left+16,(y*17)+top+3, 14, 14);}
					if(currentFloor[y][x].exists && currentFloor[y][x].coinPresent){ uicontext.drawImage(imageTool.minicoin,(x*42)+left+16,(y*17)+top+3, 14, 14);}
					if(currentFloor[y][x].exists && currentFloor[y][x].keyPresent){ uicontext.drawImage(imageTool.minikey,(x*42)+left+5,(y*17)+top+3, 14, 14);}
					if(currentFloor[y][x].exists && currentFloor[y][x].bombPresent){ uicontext.drawImage(imageTool.minibomb,(x*42)+left+26,(y*17)+top+3, 14, 14);}
				}
			}
			}
			
			//TIMER
			this.uiUpdated = Date.now();
		}
	},
	playLoot : function(item){
			this.itemHolding = item.img
			this.itemHoldingName = item.type;
			this.itemHoldingDesc = item.desc;
			this.isLooting = true;
			this.lootTimer = Date.now();
	},
	getDamage : function(dmg,enemyx,enemyy){
		this.enemyx = enemyx;
		this.enemyy = enemyy;
		if(this.alive){ //Si vivant
		
			if(dmg > 0){ 
				
				this.damagedNow = Date.now(); //Moment ou le dégat est pris
				if( this.damagedNow - this.lastDamaged > 1000){ //Si le dernier dégat date d'une seconde
					if(this.soul > 0){this.soul -= 0.5;} //retirer l'armure (soul hearts)
					else {this.hp -= dmg;}//retirer les points de vie
					//GAMEOVER
					if(this.hp <= 0 && this.soul ==0){
						this.alive=false;
						gameOverTime = Date.now();}
					//else { sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
					this.lastDamaged = Date.now(); }
			}
		}
	},
	checkCollide : function(obj,pos){ //calcul de collision
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(obj[i].type =="Chest" || obj== Game.Doors){
					obj[i].use();
				}
				if(obj[i].isColliding){
					if(pos == "up") this.y = obj[i].y+obj[i].height;
					else if(pos == "down") this.y = obj[i].y-this.height;
					else if(pos == "left") this.x = obj[i].x+obj[i].width;
					else if(pos == "right") this.x = obj[i].x-this.width;
					
					//Fix des collisions des coins
					if(pos == "up" || pos == "down"){
						if((keyW || keyS) && !keyA && !keyD){
							if(this.x + this.width/2 > obj[i].x + obj[i].width/2)this.accelx += this.friction/3;
							else if(this.x + this.width/2 < obj[i].x + obj[i].width/2)this.accelx -= this.friction/3;}}
					else if(pos == "left" || pos == "right"){
						if((keyA || keyD) && !keyS && !keyW){
							if(this.y + this.height/2 > obj[i].y + obj[i].height/2)this.accely += this.friction/3;
						else if(this.y + this.height/2 < obj[i].y + obj[i].height/2)this.accely -= this.friction/3;}}
				}
				
			}
		}
	},
	playerFire : function(){
		var bulx = 0;
		var buly = 0;
		var gapSwitch = 6;
		var numberOneY = 0; 
		
		if(Date.now() - this.lastFire > this.fireRate){
			
			//Si le joueur tire dans la direction qu'il avance, la vitesse et la portée des projectiles est décuplée
			if(this.orientation == this.currentMoving){
				var brange = this.range*(1.2);
				var bspeed = this.attackSpeed+this.speed/2;	}
			//Sinon par défault
			else {var brange = this.range; var bspeed = this.attackSpeed;}
				gameStats.bullet++;
			if(this.isNumberOne){	gapSwitch = 4;	numberOneY = 25; }
			if(this.innerEye) this.eyeSwitch =0;
					
			switch(this.orientation){
			case "left":	bulx = this.x-12;
							buly = this.y -6 +numberOneY+(gapSwitch* this.eyeSwitch);
							
							if(this.innerEye){
								if(this.isWiggle){
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx+5,buly+6,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-12,buly-2,this.accelx,this.accely,this.damage,0));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly+14,this.accelx,this.accely,this.damage,1));
								}
								else{
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx+5,buly-10,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage,1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-12,buly-5,this.accelx,this.accely,this.damage,0));}
							}
							else {
								if( this.eyeSwitch ==-1) playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));
								else  playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));}
							break;
							
							////////////	
							
			case "right": 	bulx = this.x +23;
							buly = this.y -6+numberOneY+(gapSwitch* this.eyeSwitch);
							
							if(this.innerEye){
								if(this.isWiggle){
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-5,buly+6,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx+12,buly-2,this.accelx,this.accely,this.damage,0));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly+14,this.accelx,this.accely,this.damage,1));
								
								}
								else{
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-5,buly-10,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage,1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx+12,buly-5,this.accelx,this.accely,this.damage,0));}
							}
							else {
								if( this.eyeSwitch ==-1) playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));
								else  playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));}
							break;
							
							////////////	
							
			case "up":		bulx = this.x +4+(gapSwitch* this.eyeSwitch);
							buly = this.y -22+numberOneY;
							
							if(this.innerEye){
								bulx+=6;
								if(this.isWiggle){
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-6,buly,this.accelx,this.accely,this.damage,-1));
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-2,buly,this.accelx,this.accely,this.damage,1));
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-8,buly-12,this.accelx,this.accely,this.damage,0));
								}
								else{
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-18,buly,this.accelx,this.accely,this.damage,-1));
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx+6,buly,this.accelx,this.accely,this.damage,1));
									playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx-6,buly-12,this.accelx,this.accely,this.damage,0));}
							}
							else playerBulletsBack.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));
							break;
							
							////////////	
							
			case "down": 	bulx = this.x +4+(gapSwitch* this.eyeSwitch);
							buly = this.y +3+numberOneY;
							
							if(this.innerEye){
								bulx+=6;
								if(this.isWiggle){
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-6,buly,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-2,buly,this.accelx,this.accely,this.damage,1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-8,buly+12,this.accelx,this.accely,this.damage,0));
								}
								else{
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-18,buly,this.accelx,this.accely,this.damage,-1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx+6,buly,this.accelx,this.accely,this.damage,1));
									playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx-6,buly+12,this.accelx,this.accely,this.damage,0));}
							}
							else playerBullets.push(new Bullet(this.orientation,bspeed,brange,bulx,buly,this.accelx,this.accely,this.damage));
							break;
			}
			//Quel oeil tire
			if(!this.innerEye){
				if( this.eyeSwitch ==1)  this.eyeSwitch = -1;
				else this.eyeSwitch =1;}
			this.lastFire = Date.now();
			this.isShooting = false;
		}
	}
};

//projectile
function Bullet(side,speed,range,bulx,buly,accelx,accely,dmg,type){
	this.side = side;
	this.range = range;
	this.inix = bulx;
	this.iniy = buly;
	this.x = this.inix;
	this.y = this.iniy;
	this.dirx = 0;
	this.diry = 0;
	this.angle = 0;
	this.targetx = 0;
	this.targetx = 0;
	this.height = 27;
	this.width = 27;
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
			bulletCollision(playerBulletsBack, Game.Doors);
			bulletCollision(playerBullets, Game.Doors);			
			
			if(this.side == "up"){
				//WIGGLE SANS TRIPLE SHOT
				if(Player.isWiggle && !Player.innerEye){
					if(this.angle < 90) this.angle+=0.2;
					else this.angle =0;
					this.dirx = Math.cos(this.angle)/2;
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
					this.targety = this.iniy - this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
					
				//WIGGLE AVEC TRIPLE SHOT
				else if(Player.isWiggle && Player.innerEye){
					if(type !=0){
						if(type ==-1) {
							if(this.angle < 90) this.angle+=0.15;
							else this.angle =0;}
						if(type ==1) {
							if(this.angle > 0) this.angle-=0.15;
							else this.angle =90;}
						this.dirx = Math.cos(this.angle)/2;}
					else this.dirx = 0;
					
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
					this.targety = this.iniy - this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;
				
				}
				//NORMAL
				else{
					//TRIPLE SHOT
					if (Player.innerEye) this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50 +type*30);
					else this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
					
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
					this.targety = this.iniy - this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
			}
					
			else if(this.side == "down"){
				//WIGGLE SANS TRIPLE SHOT
				if(Player.isWiggle && !Player.innerEye){
					if(this.angle < 90) this.angle+=0.2;
					else this.angle =0;
					this.dirx = Math.cos(this.angle)/2;
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
					this.targety = this.iniy + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
					
				//WIGGLE AVEC TRIPLE SHOT
				else if(Player.isWiggle && Player.innerEye){
					if(type !=0){
						if(type ==-1) {
							if(this.angle < 90) this.angle+=0.15;
							else this.angle =0;}
						if(type ==1) {
							if(this.angle > 0) this.angle-=0.15;
							else this.angle =90;}
						this.dirx = Math.cos(this.angle)/2;}
					else this.dirx = 0;
					
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
					this.targety = this.iniy + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
				
				//NORMAL
				else{
					//TRIPLE SHOT
					if (Player.innerEye) this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50 +type*30);
					else this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
					
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
					this.targety = this.iniy + this.range;			
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
			}
				
			else if(this.side == "right"){
				//WIGGLE SANS TRIPLE SHOT
				if(Player.isWiggle && !Player.innerEye){
					if(this.angle < 90) this.angle+=0.2;
					else this.angle =0;
					this.diry = Math.sin(this.angle)*1/3;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
					this.targetx = this.inix + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
					
				//WIGGLE AVEC TRIPLE SHOT
				else if(Player.isWiggle && Player.innerEye){
					if(type !=0){
						if(type ==-1) {
							if(this.angle < 90) this.angle+=0.15;
							else this.angle =0;}
						if(type ==1) {
							if(this.angle > 90) this.angle-=0.15;
							else this.angle =180;}
						this.diry = Math.sin(this.angle)/2;}
					else this.diry = 0;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
					this.targetx = this.inix + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
				
				//NORMAL
				else{
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
					//TRIPLE SHOT
					if (Player.innerEye) this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50 + type*30);		
					else this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50);
					
					this.targetx = this.inix + this.range;					
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
			
			}
				
			else if(this.side == "left"){
				//WIGGLE SANS TRIPLE SHOT
				if(Player.isWiggle && !Player.innerEye){
					if(this.angle < 90) this.angle+=0.2;
					else this.angle =0;
					this.diry = Math.sin(this.angle)*1/3;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) -this.range);
					this.targetx = this.inix - this.range;		
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x > this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
				
				//WIGGLE AVEC TRIPLE SHOT
				else if(Player.isWiggle && Player.innerEye){
					if(type !=0){
						if(type ==-1) {
							if(this.angle < 90) this.angle+=0.15;
							else this.angle =0;}
						if(type ==1) {
							if(this.angle > 90) this.angle-=0.15;
							else this.angle =180;}
						this.diry = Math.sin(this.angle)/2;}
					else this.diry = 0;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) -this.range);
					this.targetx = this.inix - this.range;		
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x > this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
					
				//NORMAL
				else{
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) -this.range);
					//TRIPLE SHOT
					if (Player.innerEye) this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50 + type*30);		
					else this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50);	
					
					this.targetx = this.inix - this.range;							
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.x > this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
			}
		}	
	}
	
	this.draw = function(context){  //Affichage
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.alive){
			
		if(Player.isNumberOne){
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+10, this.width, this.height);
			context.restore();
			context.drawImage(imageTool.bulletNumberOne, this.x, this.y, this.width, this.height);}
		else {
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x, this.y+30, this.width, this.height);
			context.restore();
			if(Player.isToothPicks)context.drawImage(imageTool.enemyBullet, this.x, this.y, this.width, this.height);
			else context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);}}
	}
	this.clear = function(){
		this.dmg = 0;
		this.alive = false;
	}
}

function detectCollision(obj){
	var safeGap = 0;
	for(var i=0;i<obj.length;i++){
		if (Player.x < obj[i].x + obj[i].width-safeGap  && Player.x + Player.width-safeGap  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height-safeGap && Player.y + Player.height-safeGap > obj[i].y) {
				if(obj == Game.Minions || obj == Game.Towers || obj == Game.Bosses){
					if(Player.canGetDamage) Player.getDamage(obj[i].dmg, obj[i].x, obj[i].y);}
			    else if(obj[i].type =="fireplace"  ||  obj[i].type =="hellfireplace"){
					if(!obj[i].isDestroyed && obj[i].isColliding) obj[i].use(Player);
				}
				else if(obj == Game.traps && !obj[i].isDestroyed) obj[i].use(Player); }}
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
	if((obj == Game.collideMaps) || (obj == Game.Doors) || (obj == Game.wallMaps)) safeGap = 12;
	for(var i=0;i<projectile.length;i++){
		// Enemies
		for(var j=0;j<obj.length;j++){
			if (projectile[i].x < obj[j].x + (obj[j].width-safeGap)  && projectile[i].x + (projectile[i].width-safeGap)  > obj[j].x &&
			projectile[i].y < obj[j].y + (obj[j].height-safeGap) && projectile[i].y + (projectile[i].height-safeGap) > obj[j].y) {
				if((obj == Game.Minions) || (obj == Game.Towers) || (obj == Game.Bosses) ){
					gameStats.hit++;
					obj[j].getDamage(projectile[i].dmg);
					projectile[i].clear();
					/*sounds.impact.currentTime = 0;
					sounds.impact.play();*/
					}
				else if((obj == Game.wallMaps) || (obj == Game.collideMaps)){
					if(obj[j].isColliding){
						/*sounds.impact.currentTime = 0;
						sounds.impact.play();*/
						if(obj[j].type == "poop" || obj[j].type == "tnt" || obj[j].type == "hellfireplace" || obj[j].type == "fireplace"){
							obj[j].state+=projectile[i].dmg;
							updatingBackground = true;}
						projectile[i].clear();}}
					}}}
}

/*
checkCollide : function(obj,pos){ //calcul de collision hitbox ronde
		for(var i=0;i<obj.length;i++){
			
			var diffx = (this.x + this.width/2) - (obj[i].x + obj[i].width/2);
			var diffy = (this.y + this.height/2) - (obj[i].y + obj[i].height/2);
			var hyp = Math.sqrt(diffx*diffx + diffy*diffy);
			
			if(hyp <=45 ){
				if(obj[i].type =="Chest" || obj== Game.Doors){	obj[i].use();	}
				if(obj[i].isColliding){return false;}
			}
		}
	},
*/
console.log('player.js loaded');