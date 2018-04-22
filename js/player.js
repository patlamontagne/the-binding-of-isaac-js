//Item loot collision
function itemCollision(obj){
	for(var i=0;i<obj.length;i++){
		if (Player.x <obj[i].x + obj[i].width  && Player.x + Player.width  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height && Player.y + Player.height > obj[i].y) {
			if(!Player.isLooting){
				obj[i].use();}}}
}

//items
var treasurePool = ["Boom!","<3","Speed Ball","Magic Mushroom","Mom's Lipstick","The Halo","Max's Head","Number One","Tooth Picks","Wiggle Worm"];
var bossPool = ["The Belt","Wire Coat Hanger","MEAT!","Breakfast","Dessert","Dinner","Lunch","Jesus Juice"];
var secretPool = ["Pyro","Raw Liver","Mini Mushroom","Bucket of Lard"];
var chestPool = ["The Sad Onion","Rotten Meat","Wooden Spoon","The Belt","Mom's Underwear","Mom's Heels"];
var shopPool = ["The Compass","Treasure Map"];
var pickupPool = ["Key","Bomb","Heart","Soul Heart"];


/*
"Skeleton Key","Roid Rage","Growth Hormones"
*/
function Item(x,y,type,playerslide){ 
	this.x = x, this.y = y;
	this.dirx=0;
	this.diry=0;
	this.speed =0;
	this.PlayerSliding = playerslide;
	this.ExploSliding = false;
	this.explox = 0;
	this.exploy = 0;
	this.slidingTimer = 0;
	this.height = 32, this.width = 32;
	this.type = type;
	this.img = "";
	this.alive = true;
	this.update = function(){
		this.checkCollide(Player);
		this.checkCollide(Game.Explosions);
		//Player contact
		if(this.PlayerSliding){			
			this.PlayerSliding = false;
			if(Date.now() - this.slidingTimer > 100){
				this.dirx = (Player.x - Player.width/2) - (this.x - this.width/2);
				this.diry = (Player.y - Player.height/2) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = Math.round(this.dirx/hyp);
				this.diry =  Math.round(this.diry/hyp);
				this.slidingTimer = Date.now();}
			this.speed = Player.speed;}
		//Explosion contact
		else if (this.ExploSliding){			
			this.ExploSliding = false;
			if(Date.now() - this.slidingTimer > 100){
				this.dirx = (this.explox + 75) - (this.x - this.width/2);
				this.diry = (this.exploy + 60) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = Math.round(this.dirx/hyp);
				this.diry =  Math.round(this.diry/hyp);
				this.slidingTimer = Date.now();}
			this.speed = 10;}
		else if(this.speed > 0) this.speed -= this.speed/30;
		
		this.x -= this.dirx*this.speed;
		this.y -= this.diry*this.speed;
		if(this.dirx < 0){ 
				if(this.checkCollide(Game.collideMaps,"right") ||
				this.checkCollide(Game.holeMaps,"right") ||
				this.checkCollide(Game.wallMaps,"right") ||
				this.checkCollide(Game.Doors,"right")) this.dirx = -this.dirx;}	
			if(this.dirx > 0){ 
				if(this.checkCollide(Game.collideMaps,"left") ||
				this.checkCollide(Game.holeMaps,"left") ||
				this.checkCollide(Game.wallMaps,"left") ||
				this.checkCollide(Game.Doors,"left")) this.dirx = -this.dirx;}		
			if(this.diry < 0){
				if(this.checkCollide(Game.collideMaps,"down") ||
				this.checkCollide(Game.holeMaps,"down") ||
				this.checkCollide(Game.wallMaps,"down") ||
				this.checkCollide(Game.Doors,"down")) this.diry = -this.diry;}	
			if(this.diry > 0){ 
				if(this.checkCollide(Game.collideMaps,"up") ||
				this.checkCollide(Game.holeMaps,"up") ||
				this.checkCollide(Game.wallMaps,"up") ||
				this.checkCollide(Game.Doors,"up")) this.diry = -this.diry;}
		
		}
	this.draw = function(context){
		if(this.alive){
			if(this.type == "Coin") this.img = imageTool.coin;
			else if(this.type == "Nickel") this.img = imageTool.nickel;
			else if(this.type == "Dime") this.img = imageTool.dime;
			else if(this.type == "Heart") this.img = imageTool.health;
			else if(this.type == "Half Heart") this.img = imageTool.halfhealth;
			else if(this.type == "Soul Heart") this.img = imageTool.armor;
			else if(this.type == "Key") this.img = imageTool.key;
			else if(this.type == "Bomb") this.img = imageTool.bomb;
			else if(this.type == "Boom!") this.img = imageTool.boom;
			else if(this.type == "<3") this.img = imageTool.redheart;
			else if(this.type == "Breakfast") this.img = imageTool.breakfast;
			else if(this.type == "Dessert") this.img = imageTool.dessert;
			else if(this.type == "Dinner") this.img = imageTool.dinner;
			else if(this.type == "Lunch") this.img = imageTool.lunch;
			else if(this.type == "Rotten Meat") this.img = imageTool.rottenmeat;
			else if(this.type == "MEAT!") this.img = imageTool.meat;
			else if(this.type == "Bucket of Lard") this.img = imageTool.bucketoflard;
			else if(this.type == "The Belt") this.img = imageTool.thebelt;
			else if(this.type == "Roid Rage") this.img = imageTool.roidrage;
			else if(this.type == "Mini Mushroom") this.img = imageTool.minimushroom;
			else if(this.type == "Mom's Heels") this.img = imageTool.momsheels;
			else if(this.type == "Mom's Lipstick") this.img = imageTool.momslipstick;
			else if(this.type == "Mom's Underwear") this.img = imageTool.momsunderwear;		
			else if(this.type == "The Sad Onion") this.img = imageTool.thesadonion;
			else if(this.type == "The Small Rock") this.img = imageTool.thesmallrock;
			else if(this.type == "Wooden Spoon") this.img = imageTool.woodenspoon;
			else if(this.type == "Speed Ball") this.img = imageTool.speedball;
			else if(this.type == "Tooth Picks") this.img = imageTool.toothpicks;
			else if(this.type == "Skeleton Key") this.img = imageTool.skeletonkey;
			else if(this.type == "Pyro") this.img = imageTool.pyro;
			else if(this.type == "Raw Liver") this.img = imageTool.rawliver; 
			else if(this.type == "Growth Hormones") this.img = imageTool.growthhormones; 
			else if(this.type == "The Halo") this.img = imageTool.thehalo; 
			else if(this.type == "Magic Mushroom") this.img = imageTool.magicmushroom; 
			else if(this.type == "Max's Head") this.img = imageTool.maxshead; 
			else if(this.type == "Number One") this.img = imageTool.numberone; 
			else if(this.type == "Wire Coat Hanger") this.img = imageTool.wirecoathanger; 
			else if(this.type == "Jesus Juice") this.img = imageTool.jesusjuice; 
			else if(this.type == "Wiggle Worm") this.img = imageTool.wiggleworm; 
			
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-7, this.y, this.width+14, this.height);
			context.restore();
			context.drawImage(this.img, this.x-18, this.y-40, 70, 70);
		}
	}

	this.use = function(){
		//PICKUPS
		if(this.type == "Coin"){Player.gold++;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Nickel"){Player.gold+=5;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Dime"){Player.gold+=10;sounds.gold.currentTime = 0;sounds.gold.play();this.clear();}
		else if(this.type == "Heart"){if(Player.hp <12){if(Player.maxhp - Player.hp == 0.5){Player.hp += 0.5;this.clear();}else if(Player.maxhp - Player.hp >= 1){ Player.hp++;this.clear();}}}
		else if(this.type == "Half Heart"){if(Player.hp <12){if(Player.maxhp - Player.hp >= 0.5){Player.hp += 0.5;this.clear();}}}
		else if(this.type == "Soul Heart"){Player.soul++;this.clear();}
		else if(this.type == "Key"){if(Player.keys < 99){Player.keys++;this.clear();}}
		else if(this.type == "Bomb"){if(Player.bombs < 99){Player.bombs++;this.clear();}}
		//BOSS
		else if((this.type == "Breakfast") || (this.type == "Dessert") || (this.type == "Dinner") || (this.type == "Lunch") || (this.type == "Rotten Meat")){
			Player.maxhp++;Player.hp++;Player.playLoot(this.img);this.clear();}
		else if(this.type == "MEAT!"){
			Player.maxhp++;
			Player.hp++;
			Player.dmgBoost += 0.5;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "The Belt"){
			Player.speedBoost += 0.4;
			Player.playLoot(this.img);
			this.clear();}
		else if((this.type == "Mom's Heels") || (this.type == "Mom's Lipstick") || (this.type == "Mom's Underwear")){
			Player.rangeBoost += 160;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Wire Coat Hanger"){
			Player.fireRateBoost += 105;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Jesus Juice"){
			Player.rangeBoost += 90;
			Player.dmgBoost += 0.35;
			Player.playLoot(this.img);
			this.clear();}
		//TREASURE
		else if(this.type == "Skeleton Key"){
			Player.keys = 99;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Boom!"){
			if(Player.bombs < 99){
				Player.bombs+=10;
				Player.playLoot(this.img);
				this.clear();}}
		else if(this.type == "<3"){
			Player.maxhp++;
			Player.hp = Player.maxhp;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Bucket of Lard"){
			Player.maxhp += 2;
			Player.hp += 0.5;
			Player.speedBoost -= 0.2;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Growth Hormones"){
			Player.dmgBoost += 0.35;
			Player.speedBoost += 0.2;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Roid Rage"){
			Player.speedBoost += 0.2;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "The Halo"){
			Player.dmgBoost += 0.3;
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.fireRateBoost += 35;
			Player.maxhp++;
			Player.hp++;
			Player.Halo=true;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Magic Mushroom"){
			Player.dmgBoost += 0.3;
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.dmgMult += 0.5;
			Player.maxhp++;
			Player.hp = Player.maxhp;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Mini Mushroom"){
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Max's Head"){
			Player.dmgBoost += 0.3;
			Player.dmgMult += 0.3;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Wiggle Worm"){
			Player.fireRateBoost += 35;
			Player.isWiggle = true;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Number One"){
			Player.rangeBoost -= 220;
			Player.fireRateBoost += 180;
			Player.isNumberOne = true;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Speed Ball"){
			Player.speedBoost += 0.4;
			Player.bulletSpeedBoost += 1.2;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Tooth Picks"){
			Player.bulletSpeedBoost += 0.2;
			Player.isToothPicks = true;
			Player.playLoot(this.img);
			this.clear();}
		//SECRET
		else if(this.type == "Pyro"){
			Player.bombs = 99;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Raw Liver"){
			Player.maxhp+=2;
			if(Player.maxhp <= 12) Player.hp = Player.maxhp;
			Player.playLoot(this.img);
			this.clear();}
		//GOLDEN CHESTS
		else if(this.type == "The Sad Onion"){
			Player.fireRateBoost += 70;
			Player.playLoot(this.img);
			this.clear();}
		else if(this.type == "Wooden Spoon"){
			Player.speedBoost += 0.4;
			Player.playLoot(this.img);
			this.clear();}
		//OTHER
		else if(this.type == "The Small Rock"){
			Player.dmgBoost += 0.4;
			Player.fireRateBoost += 35;
			Player.speedBoost -= 0.2;
			Player.playLoot(this.img);
			this.clear();}
	}
	this.clear = function(){
		this.alive = false;
	}
	this.checkCollide = function(obj,pos){
		if(obj == Player){
			if(this.y < obj.y + obj.height &&
			this.y + this.height > obj.y &&
			this.x + this.width  > obj.x && 
			this.x < obj.x + obj.width ){
				this.PlayerSliding = true;}
		}
		else if(obj == Game.Explosions){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				this.ExploSliding = true;
				this.explox = obj[i].x;this.exploy = obj[i].y;}}
		}
		else{
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				if(obj[i].isColliding || obj[i].name == "Door"){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}}
	}
}

function loot(name,x,y,obj,slide){
	var rand = getRand(100,0); // 0 -99
	if(name =="Health"){
		if(rand >= 0 && rand <= 9)obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide)); 		// 0 - 9 (10%)
		else if(rand >= 10 && rand <= 49)obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Heart",slide)); 		// 10 - 49 (40%)
		else if(rand >= 50 && rand <= 99)obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Half Heart",slide));}	// 50 - 99 (50%)
		
	else if(name =="Money"){
		if(rand == 0)obj.Items.push(new Item(x+5,y+5,"Dime",slide)); 						// 0 (1%(
		else if(rand >= 1 &&  rand <= 5)obj.Items.push(new Item(x+5,y+5,"Nickel",slide)); 		// 1 - 5 (5%)
		else obj.Items.push(new Item(x+5,y+5,"Coin",slide));} 								// 6 - 99 (94%)
		
	else if(name=="Bomb"){obj.Items.push(new Item(x+5,y+5,"Bomb",slide));}
	
	else if(name =="Key"){obj.Items.push(new Item(x+5,y+5,"Key",slide));}
		
	else if(name =="Rock"){
		if(rand==0){ // 1%
			for(var i = 0; i<4; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Bomb",slide));}
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));	}
		else if(rand == 1){ // 2%
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Bomb",slide));}
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));}}
		else if(rand >= 3 && rand <= 7){ // 5%
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Bomb",slide));}
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));	}
		else if(rand >= 8 && rand <= 12){ // 5%
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Bomb",slide));
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));}}
		else if(rand == 2){ // 1%
			for(var i = 0; i<3; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));}}
		else if(rand >= 18 && rand <= 24){ // 7%
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));}}
		else if(rand >= 25 && rand <= 31){ // 7%
			if(!rockIsDropped){obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"The Small Rock",slide));rockIsDropped=true;}	
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));	}
		else if(rand >= 31 && rand <= 37){ // 7%
			if(!rockIsDropped){obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"The Small Rock",slide));rockIsDropped=true;}	
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));	}
		else if(rand >= 38 && rand <= 47){ // 10%
			if(!rockIsDropped){obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"The Small Rock",slide));rockIsDropped=true;}	}
		else if(rand >= 48 && rand <= 57){ // 10%
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));	}
		else if(rand >= 58 && rand <= 67){ // 10%
			for(var i = 0; i<2; i++){ obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));}}
		else if(rand >= 68 && rand <= 77){ // 10%
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Bomb",slide));	}
		else if(rand >= 78 && rand <= 87){ // 10%
			obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Key",slide));	}
		else obj.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),"Soul Heart",slide));
	}
}

function createItem(x,y,type){
// 1/1000 .. 0.1%
//BASIC DROPS 

	// MONSTRE DE BASE, 5% de chance de drop. Coins ou Coeurs
	if(type == "basic"){ 
		var rand = getRand(20,1);
		if(rand == 1){
			rand = getRand(2,1);
			if(rand ==1) loot("Health",x,y,Game);
			if(rand ==2) loot("Money",x,y,Game);}}
			
		
	//ROCK BRISABLE, TABLE DE LOOT SPÉCIFIQUE
	else if(type == "xblock") loot("Rock",x,y,Game)
	
	 //POOP, 10% de chance de drop. Coins ou Coeurs
	else if(type == "poop" || type == "fire"){
		var rand = getRand(8,1);
		if(rand == 1){
			rand = getRand(2,1);
			if(rand ==1) loot("Health",x,y,Game);
			if(rand ==2) loot("Money",x,y,Game);}}
			
	
	//BOSS KILL
	else if(type == "boss"){
		loot("Health",x,y,Game);
		loot("Health",x,y,Game);}
		
	//NORMAL ROOMS
	else if(type == "Room"){
		var rand = getRand(3,1);
		if(rand == 1){
			rand = getRand(2,1);
			if(rand ==1) loot("Health",x,y,Game);
			if(rand ==2) loot("Money",x,y,Game);}}
			
	//BOSS ROOMS 
	else if (type =="Boss"){
		var rand = getRand(bossPool.length,0);
		var bossloot = bossPool[rand];
		Game.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),bossloot));
		bossPool.splice(rand,1);
	}
	//TREASURE ROOMS 
	else if (type =="Treasure"){
		var rand = getRand(treasurePool.length,0);
		var treasureloot = treasurePool[rand];
		Game.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),treasureloot));
		treasurePool.splice(rand,1);
	}
	//SECRET ROOMS 
	else if (type =="Secret"){
		var srand = getRand(secretPool.length,0);
		var secretloot = secretPool[1];
		Game.Items.push(new Item(x+5,y+5,secretloot));
		secretPool.splice(1,1);
		
	}
	
}



//Objet joueur
var Player = {
	x : 100, y : 100,
	posx : 0, posy : 0,
	diffx : 0, diffy : 0,
	lastx : 0, lasty : 0,
	height: 42,	width: 36,
	speed : 2.8, accelx : 0, accely : 0, friction : 0.4,
	speedBoost:0, 
	damage : 1,	range : 400, fireRate: 350,	attackSpeed: 8,
	dmgBoost:0, dmgMult:1, rangeBoost:0, fireRateBoost:0, bulletSpeedBoost:1,
	bombDmg :10, bombMult :1,
	hp : 3,	maxhp: 3, //HP : Vie restante, MAXHP : Vie totale
	soul : 0,
	gold : 0, keys : 0, bombs : 1, bombPosed : Date.now(),
	head: imageTool.playerDown, //Orientation de la tête
	blink : 0,
	isShooting: false, isLooting: false,
	lootTimer : 0,
	currentMoving : "",
	itemHolding : "",
	orientation :"down",
	alive: true, canGetDamage: true, isBumped: false, isSlowed: Date.now(),
	now : Date.now(), lastDamaged : Date.now(), damagedNow : Date.now(),
	isNumberOne: false, isToothPicks: false, isWiggle: false, Halo: false, TreasureMap:false, TheCompass: false,
	update: function(){
		if(this.hp <= 0 && this.soul ==0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
		else if(this.hp > 12) this.hp = 12;
		if(!this.alive) gameOver = true;
		if(this.TreasureMap) showMap("Treasure Map");
		if(this.TheCompass) showMap("The Compass");
		Game.isVisited = true;
		Game.isVisible = true;
		this.posx = Math.round((this.x+this.width)/64);
		this.posy = Math.round((this.y+this.height)/64);
		//Déplacement
		
			this.now = Date.now();
			detectCollision(Game.traps);
			this.lastx = this.x;
			this.lasty = this.y;
			
			//State pour l'animation de loot
			if(Date.now() - this.lootTimer > 600){
			this.isLooting = false;
				this.itemHolding="";}
				
			//State pour l'animation de tir
			if( Date.now() - lastFire < this.fireRate/2){
				Player.isShooting = true;}
			else Player.isShooting = false;
				
			if( this.now - this.lastDamaged > 700){
				this.canGetDamage = true;}	//compare le temps actuel avec le temps du dernier dégat
			else this.canGetDamage = false;
			
			//Additions Boost
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
				
			if((keyW || keyS) && (keyA || keyD)) this.speed = this.speed*2/3; //Vitesse diagonale fix
			
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
				
			if(this.now - this.isSlowed < 300){ 
				this.accelx = this.accelx*3/4;this.accely = this.accely*3/4;}
			
			
			
			if(Date.now() - this.bombPosed > 250){
			if((keyShift || keyE) && this.bombs >0){
				this.bombs--;
				Game.Bombs.push(new Bomb("normal",this.x,this.y+15));
				this.bombPosed = Date.now();}}
			
				
			//Décélération
			//Si les deux touches d'une meme dimension sont relachées ou enfoncées(elles s'annulent)
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
						this.checkCollide(Game.holeMaps,"right");
						this.checkCollide(Game.Doors,"right");}
					if(this.accelx*2 < 0){ 
						detectCollision(Game.collideMaps);
						this.checkCollide(Game.collideMaps,"left");
						this.checkCollide(Game.wallMaps,"left");
						this.checkCollide(Game.holeMaps,"left");
						this.checkCollide(Game.Doors,"left");}
				//Accélération Y
				this.y += this.accely*2;
					if(this.accely*2 > 0){ 
						detectCollision(Game.collideMaps);
						this.checkCollide(Game.collideMaps,"down");
						this.checkCollide(Game.wallMaps,"down");
						this.checkCollide(Game.holeMaps,"down");
						this.checkCollide(Game.Doors,"down");}
					if(this.accely*2 < 0){ 
						detectCollision(Game.collideMaps);
						this.checkCollide(Game.collideMaps,"up");
						this.checkCollide(Game.wallMaps,"up");
						this.checkCollide(Game.holeMaps,"up");
						this.checkCollide(Game.Doors,"up");}
			
			//Vérifications
			itemCollision(Game.Items);
			itemCollision(Game.shop);
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
						context.globalAlpha = 0;}}
					
					//Joueur Normale
					if(this.isLooting){
						Animations[3].update(Player.x-10,Player.y-32);
						Animations[3].draw(context);
						context.drawImage(this.itemHolding, this.x-21, this.y-84, 80, 80);}
					else if(keyD){Animations[1].draw(context);}
					else if(keyA){Animations[2].draw(context);}
					else if(keyW || keyS){Animations[0].draw(context);}
					else context.drawImage(imageTool.bodyIdle,this.x-2, this.y+12, 40, 40);
					context.restore();	}
			else context.drawImage(imageTool.bodyIdle,this.x-2, this.y+12, 40, 40);
	},
	drawHead : function(context){
		if(!this.isLooting){
			var canvas = getEl("canvas");
			var context = canvas.getContext('2d');
				if(this.alive && !this.canGetDamage){ // Joueur invincible
					if(this.blink > 15)this.blink =0;
					else if(this.blink > 0 && this.blink <=7){
						context.save();
						context.globalAlpha = 0;}
					this.blink++;}
					//Joueur Normal
					
			context.drawImage(this.head, this.x-14, this.y-22, 64, 55); //Tete
			//Direction attaque
				if(!gameOver){
					if(keyLeft){
						playerFire("left",this.currentMoving,this.accelx,this.accely);
						this.orientation = "left";}
						
					else if(keyUp){
						playerFire("up",this.currentMoving,this.accelx,this.accely);
						this.orientation = "up";}
						
					else if(keyRight){
						playerFire("right",this.currentMoving,this.accelx,this.accely);
						this.orientation = "right";}
						
					else if(keyDown){
						playerFire("down",this.currentMoving,this.accelx,this.accely);	
						this.orientation = "down";}}
					
			
			
			if(this.orientation == "down"){
				if(this.isShooting) this.head = imageTool.playerDownS;
				else this.head = imageTool.playerDown;
				
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksfront, this.x-16, this.y-12, 68, 42);
					else context.drawImage(imageTool.toothpicksfront, this.x-14, this.y-22, 64, 55); }
				
				}
				
			
			else if(this.orientation == "up"){
				if(this.isShooting) this.head = imageTool.playerUpS;
				else this.head = imageTool.playerUp;
				}
				
			
			else if(this.orientation == "left"){
				if(this.isShooting) this.head = imageTool.playerLeftS;
				else this.head = imageTool.playerLeft;
				
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksside, this.x-2, this.y-12, 30, 45); 
					else context.drawImage(imageTool.toothpicksside, this.x-2, this.y-20, 25, 55); }
				
				}
				
			
			else if(this.orientation == "right"){
				if(this.isShooting) this.head = imageTool.playerRightS;
				else this.head = imageTool.playerRight;
				
				if(this.isToothPicks){
					if(this.isShooting) context.drawImage(imageTool.toothpicksside, this.x+12, this.y-12, 30, 45); 
					else context.drawImage(imageTool.toothpicksside, this.x+12, this.y-20, 25, 55); }
				
				}
			
			if( Date.now() - lastFire > 700) this.orientation = "down";
			
			
		
						
			
			//Détail #1
			if (this.Halo) context.drawImage(imageTool.thehalo, this.x-21, this.y-77, 80, 80);//Objet flottant #2
						context.restore();	
		}				
	},
	drawUI : function(context,uicontext){
	uicontext.drawImage(imageTool.ui,0,0,960,120);
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
			uicontext.drawImage(imageTool.hp,(pool*width)+ox-col,oy+row,width,height); pool++;}
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
		
		// Gold
		uicontext.font = "24pt wendy";
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
		
		// FPS
		uicontext.font = "15pt wendy";
		uicontext.fillStyle = 'white';
		var fpsOut = (1000/frameTime).toFixed() + " FPS";
		uicontext.fillText(fpsOut, uicanvas.width-50,18);
		
	},
	playLoot : function(item){
		if(!this.isLooting){
			this.itemHolding = item;
			this.isLooting = true;
			this.lootTimer = Date.now();}
		
	
	},
	getDamage : function(dmg,enemyx,enemyy){
		this.enemyx = enemyx;
		this.enemyy = enemyy;
		if(this.alive){ //Si vivant
		
		if(dmg > 0){ 
			
			this.damagedNow = Date.now(); //Moment ou le dégat est pris
			if( this.damagedNow - this.lastDamaged > 700){ //Si le dernier dégat date d'une seconde
				if(this.soul > 0){this.soul -= 0.5;} //retirer l'armure (soul hearts)
				else {this.hp -= dmg;}//retirer les points de vie
				//GAMEOVER
				if(this.hp <= 0 && this.soul ==0){
					this.alive=false;
					gameOverTime = Date.now();}
				else { sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
				this.lastDamaged = Date.now(); }}
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
					if(pos == "up")this.y = obj[i].y+obj[i].height;
					else if(pos == "down")this.y = obj[i].y-this.height;
					else if(pos == "left")this.x = obj[i].x+obj[i].width;
					else if(pos == "right")this.x = obj[i].x-this.width;}
				}}},
};

//Attaquer
var eyeSwitch=1;
var gapSwitch = 6;
var numberOneY = 0; 
var lastFire = Date.now();
function playerFire(dir,mov,accelx,accely){
	var bulx = 0;
	var buly = 0;
	if(dir == mov){ var range = Player.range*(1.2);	var speed = Player.attackSpeed+Player.speed/2;	}
	else {var range = Player.range; var speed = Player.attackSpeed;}

	
	if( Date.now() - lastFire > Player.fireRate){
		gameStats.bullet++;
		if(Player.isNumberOne){	gapSwitch = 4;	numberOneY = 25; }
				switch(dir){
					case "left":	bulx = Player.x-12;
									buly = Player.y -6 +numberOneY+(gapSwitch*eyeSwitch);
									if(eyeSwitch ==-1) playerBulletsBack.push(new Bullet("left",speed,range,bulx,buly,accelx,accely,Player.damage));
									else  playerBullets.push(new Bullet("left",speed,range,bulx,buly,accelx,accely,Player.damage));
									break;
					case "up":		bulx = Player.x +4+(gapSwitch*eyeSwitch);
									buly = Player.y -22+numberOneY;
									playerBulletsBack.push(new Bullet("up",speed,range,bulx,buly,accelx,accely,Player.damage));
									break;
					case "right": 	bulx = Player.x +23;
									buly = Player.y -6+numberOneY+(gapSwitch*eyeSwitch);
									if(eyeSwitch ==-1) playerBulletsBack.push(new Bullet("right",speed,range,bulx,buly,accelx,accely,Player.damage));
									else  playerBullets.push(new Bullet("right",speed,range,bulx,buly,accelx,accely,Player.damage));
									break;
					case "down": 	bulx = Player.x +4+(gapSwitch*eyeSwitch);
									buly = Player.y +3+numberOneY;
									playerBullets.push(new Bullet("down",speed,range,bulx,buly,accelx,accely,Player.damage));
									break;
				}
				lastFire = Date.now();
				if(eyeSwitch ==1) eyeSwitch = -1;
				else eyeSwitch =1;
				Player.isShooting = false;
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
			
			
			if(Game.combatMode!=0){bulletCollision(playerBulletsBack, Game.Doors);}
			if(Game.combatMode!=0){bulletCollision(playerBullets, Game.Doors);}
			
			if(this.side == "up"){
				if(Player.isWiggle){
					if(this.angle < 90) this.angle+=0.25;
					else this.angle =0;
					this.dirx = Math.cos(this.angle)/2;
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
					this.targety = this.iniy - this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
				else{
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)-this.range);
					this.targety = this.iniy - this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.y > this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
			}
				
			else if(this.side == "down"){
				if(Player.isWiggle){
					if(this.angle < 90) this.angle+=0.25;
					else this.angle =0;
					this.dirx = Math.cos(this.angle)/2;
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
					this.targety = this.iniy + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.diry = this.diry/hyp;
					if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
				else{
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) + accelx*50);
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+this.range);
					this.targety = this.iniy + this.range;			
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.y < this.targety){ this.x -= this.dirx*this.speed; this.y -= this.diry*this.speed;}
					else this.alive = false;}
			}
				
			else if(this.side == "right"){
				if(Player.isWiggle){
					if(this.angle < 90) this.angle+=0.25;
					else this.angle =0;
					this.diry = Math.sin(this.angle)*1/3;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
					this.targetx = this.inix + this.range;
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
				else{
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) +this.range);
					this.diry = (Player.y - Player.height/2) - ((Player.y - Player.width/2)+ accely*50);	
					this.targetx = this.inix + this.range;					
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					this.diry = this.diry/hyp;
					if(this.x < this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
			
			}
				
			else if(this.side == "left"){
				if(Player.isWiggle){
					if(this.angle < 90) this.angle+=0.25;
					else this.angle =0;
					this.diry = Math.sin(this.angle)*1/3;
				
					this.dirx = (Player.x - Player.width/2) - ((Player.x - Player.width/2) -this.range);
					this.targetx = this.inix - this.range;		
					var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
					this.dirx = this.dirx/hyp;
					
					if(this.x > this.targetx){this.x -= this.dirx*this.speed;this.y -= this.diry*this.speed;}
					else this.alive = false;}
				else{
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
					if(!obj[i].isDestroyed && obj[i].isColliding) Player.getDamage(obj[i].dmg);
				}
				else if(obj == Game.traps && !obj[i].isDestroyed) Player.isSlowed = Date.now(); }}
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
				if((obj == Game.Minions) || (obj == Game.Towers) || (obj == Game.Bosses)){
					gameStats.hit++;
					obj[j].getDamage(projectile[i].dmg);
					projectile[i].clear();
					sounds.impact.currentTime = 0;
					sounds.impact.play();}
				else if((obj == Game.wallMaps) || (obj == Game.collideMaps)){
					if(obj[j].isColliding){
						sounds.impact.currentTime = 0;
						sounds.impact.play();
						if(obj[j].type == "poop" || obj[j].type == "tnt" || obj[j].type == "hellfireplace" || obj[j].type == "fireplace") obj[j].state+=projectile[i].dmg;
						projectile[i].clear();}}
					}}}
}

console.log('player.js loaded');