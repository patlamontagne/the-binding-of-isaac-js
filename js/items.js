//Item loot collision
function itemCollision(obj){
	for(var i=0;i<obj.length;i++){
		if (Player.x <obj[i].x + obj[i].width  && Player.x + Player.width  > obj[i].x &&
			Player.y < obj[i].y + obj[i].height && Player.y + Player.height > obj[i].y) {
			if(!Player.isLooting){
				obj[i].use();}}}
}

//items
var treasurePool = ["Boom!","<3","Speed Ball","Magic Mushroom","The Halo","Max's Head","Number One","Tooth Picks","Wiggle Worm","The Inner Eye"];
var bossPool = ["Wooden Spoon","The Belt","Wire Coat Hanger","MEAT!","Dessert","Dinner","Lunch","Jesus Juice","Mom's Underwear"];
var secretPool = ["Pyro","Skeleton Key","Raw Liver","Mini Mushroom","Bucket of Lard"];
var sacriPool = ["The Sad Onion","Rotten Meat","Breakfast","Mom's Heels"];
var chestPool = ["Mom's Lipstick","Roid Rage","Growth Hormones"];
var shopPool = ["The Compass","Treasure Map"];
var pickupPool = ["Key","Bomb","Heart","Soul Heart","Half Heart"];


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
	this.spawnTime = Date.now();
	this.desc = " ";
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
			if(this.type == "Coin") {this.img = imageTool.coin;}
			else if(this.type == "Nickel") { this.img = imageTool.nickel;}
			else if(this.type == "Dime")  {this.img = imageTool.dime;}
			else if(this.type == "Heart")  {this.img = imageTool.health;}
			else if(this.type == "Half Heart") { this.img = imageTool.halfhealth;}
			else if(this.type == "Soul Heart")  {this.img = imageTool.armor;}
			else if(this.type == "Key")  {this.img = imageTool.key;}
			else if(this.type == "Bomb") { this.img = imageTool.bomb;}
			else if(this.type == "Boom!")  {this.img = imageTool.boom;this.desc = "Bombs!";}
			else if(this.type == "<3") { this.img = imageTool.redheart;this.desc = "HP up!";}
			else if(this.type == "Breakfast") { this.img = imageTool.breakfast;this.desc = "HP up!";}
			else if(this.type == "Dessert")  {this.img = imageTool.dessert;this.desc = "HP up!";}
			else if(this.type == "Dinner") { this.img = imageTool.dinner;this.desc = "HP up!";}
			else if(this.type == "Lunch")  {this.img = imageTool.lunch;this.desc = "HP up!";}
			else if(this.type == "Rotten Meat")  {this.img = imageTool.rottenmeat;this.desc = "HP up!";}
			else if(this.type == "MEAT!") { this.img = imageTool.meat;this.desc = "DMG & HP up!";}
			else if(this.type == "Bucket of Lard") { this.img = imageTool.bucketoflard;this.desc = "SPEED & HP up!";}
			else if(this.type == "The Belt")  {this.img = imageTool.thebelt;this.desc = "SPEED up!";}
			else if(this.type == "Roid Rage")  {this.img = imageTool.roidrage;this.desc = "SPEED up!";}
			else if(this.type == "Mini Mushroom") { this.img = imageTool.minimushroom;this.desc = "SPEED & RANGE up!";}
			else if(this.type == "Mom's Heels")  {this.img = imageTool.momsheels;this.desc = "RANGE up!";}
			else if(this.type == "Mom's Lipstick")  {this.img = imageTool.momslipstick;this.desc = "RANGE up!";}
			else if(this.type == "Mom's Underwear") { this.img = imageTool.momsunderwear;this.desc = "RANGE up!";}
			else if(this.type == "The Inner Eye")  {this.img = imageTool.theinnereye;this.desc = "Triple Shot";}
			else if(this.type == "The Sad Onion")  {this.img = imageTool.thesadonion;this.desc = "TEARS up!";}
			else if(this.type == "The Small Rock")  {this.img = imageTool.thesmallrock;this.desc = "TEARS up & SPEED down!";}
			else if(this.type == "Wooden Spoon") { this.img = imageTool.woodenspoon;this.desc = "SPEED up!";}
			else if(this.type == "Speed Ball") { this.img = imageTool.speedball;this.desc = "SPEED up!";}
			else if(this.type == "Tooth Picks") { this.img = imageTool.toothpicks;this.desc = "TEAR SPEED up!";}
			else if(this.type == "Skeleton Key")  {this.img = imageTool.skeletonkey;this.desc = "Keys!";}
			else if(this.type == "Pyro")  {this.img = imageTool.pyro;this.desc = "BOMBS!!!";}
			else if(this.type == "Raw Liver")  {this.img = imageTool.rawliver; this.desc = "HP up!";}
			else if(this.type == "Growth Hormones") { this.img = imageTool.growthhormones; this.desc = "DMG & SPEED up!";}
			else if(this.type == "The Halo") { this.img = imageTool.thehalo; this.desc = "ALL STATS up!";}
			else if(this.type == "Magic Mushroom")  {this.img = imageTool.magicmushroom; this.desc = "ALL STATS up!";}
			else if(this.type == "Max's Head")  {this.img = imageTool.maxshead;this.desc = "DMG up!";}
			else if(this.type == "Number One")  {this.img = imageTool.numberone; this.desc = "TEARS up & RANGE down!";}
			else if(this.type == "Wire Coat Hanger") {this.img = imageTool.wirecoathanger; this.desc = "TEARS up!";}
			else if(this.type == "Jesus Juice") { this.img = imageTool.jesusjuice; this.desc = "DMG & RANGE up!";}
			else if(this.type == "Wiggle Worm") { this.img = imageTool.wiggleworm; this.desc = "Ssssss!";}
			
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			context.save();
			context.globalAlpha = 0.15;
			context.drawImage(imageTool.shadow, this.x-7, this.y, this.width+14, this.height);
			context.restore();
			context.drawImage(this.img, this.x-18, this.y-40, 70, 70);
		}
	}
	this.use = function(){
	if(Date.now() - this.spawnTime > 400){
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
			Player.maxhp++;Player.hp++;Player.playLoot(this);this.clear();}
		else if(this.type == "MEAT!"){
			Player.maxhp++;
			Player.hp++;
			Player.dmgBoost += 0.5;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "The Belt"){
			Player.speedBoost += 0.4;
			Player.belt = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "The Inner Eye"){
			Player.fireRateBoost -= 370;
			Player.bulletSpeedBoost -= 0.3;
			Player.innerEye = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Mom's Heels" || this.type == "Mom's Underwear"){
			Player.rangeBoost += 160;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Mom's Lipstick"){
			Player.rangeBoost += 160;
			Player.playLoot(this);
			Player.lipstick = true;
			this.clear();}	
		else if(this.type == "Wire Coat Hanger"){
			Player.fireRateBoost += 105;
			Player.playLoot(this);
			Player.wireCoatHanger = true;
			this.clear();}
		else if(this.type == "Jesus Juice"){
			Player.rangeBoost += 90;
			Player.dmgBoost += 0.35;
			Player.playLoot(this);
			Player.jesusJuice = true;
			this.clear();}
		//TREASURE
		else if(this.type == "Skeleton Key"){
			Player.keys = 99;
			Player.skeletonKey = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Boom!"){
			if(Player.bombs < 99){
				Player.bombs+=10;
				Player.playLoot(this);
				this.clear();}}
		else if(this.type == "<3"){
			Player.maxhp++;
			Player.hp = Player.maxhp;
			Player.lessThanThree = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Bucket of Lard"){
			Player.maxhp += 2;
			Player.hp += 0.5;
			Player.speedBoost -= 0.2;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Growth Hormones"){
			Player.dmgBoost += 0.35;
			Player.speedBoost += 0.2;
			Player.Growth = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Roid Rage"){
			Player.speedBoost += 0.2;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "The Halo"){
			Player.dmgBoost += 0.3;
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.fireRateBoost += 35;
			Player.maxhp++;
			Player.hp++;
			Player.Halo=true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Magic Mushroom"){
			Player.dmgBoost += 0.3;
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.dmgMult += 0.5;
			Player.maxhp++;
			Player.hp = Player.maxhp;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Mini Mushroom"){
			Player.speedBoost += 0.2;
			Player.rangeBoost += 90;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Max's Head"){
			Player.dmgBoost += 0.3;
			Player.dmgMult += 0.3;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Wiggle Worm"){
			Player.fireRateBoost += 35;
			Player.isWiggle = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Number One"){
			Player.rangeBoost -= 220;
			Player.fireRateBoost += 180;
			Player.isNumberOne = true;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Speed Ball"){
			Player.speedBoost += 0.4;
			Player.bulletSpeedBoost += 1.2;
			Player.playLoot(this);
			Player.isSpeedBall = true;
			this.clear();}
		else if(this.type == "Tooth Picks"){
			Player.bulletSpeedBoost += 0.2;
			Player.isToothPicks = true;
			Player.playLoot(this);
			this.clear();}
		//SECRET
		else if(this.type == "Pyro"){
			Player.bombs = 99;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Raw Liver"){
			Player.maxhp+=2;
			if(Player.maxhp <= 12) Player.hp = Player.maxhp;
			Player.playLoot(this);
			this.clear();}
		//GOLDEN CHESTS
		else if(this.type == "The Sad Onion"){
			Player.fireRateBoost += 70;
			Player.playLoot(this);
			this.clear();}
		else if(this.type == "Wooden Spoon"){
			Player.speedBoost += 0.4;
			Player.playLoot(this);
			this.clear();}
		//OTHER
		else if(this.type == "The Small Rock"){
			Player.dmgBoost += 0.4;
			Player.fireRateBoost += 35;
			Player.speedBoost -= 0.2;
			Player.playLoot(this);
			Player.smallRock = true;
			this.clear();}
	}
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

function createItem(x,y,type,slide){
// 1/1000 .. 0.1%
//BASIC DROPS 

	// MONSTRE DE BASE, 5% de chance de drop. Coins ou Coeurs
	if(type == "basic"){ 
		var rand = getRand(20,1);
		if(rand == 1){
			rand = getRand(2,1);
			if(rand ==1) loot("Health",x,y,Game,slide);
			if(rand ==2) loot("Money",x,y,Game,slide);}}
			
		
	//ROCK BRISABLE, TABLE DE LOOT SPÉCIFIQUE
	else if(type == "xblock") loot("Rock",x,y,Game,slide)
	
	 //POOP, 10% de chance de drop. Coins ou Coeurs
	else if(type == "poop" || type == "fire"){
		var rand = getRand(8,1);
		if(rand == 1){
			rand = getRand(2,1);
			if(rand ==1) loot("Health",x,y,Game,slide);
			if(rand ==2) loot("Money",x,y,Game,slide);}}
			
	
	//BOSS KILL
	else if(type == "boss"){
		loot("Health",x,y,Game,slide);
		loot("Health",x,y,Game,slide);}
		
	//NORMAL ROOMS
	else if(type == "Room"){
		var rand = getRand(2,1);
		if(rand == 1){
			rand = getRand(4,1);
			if(rand ==1) loot("Health",x,y,Game,slide);
			if(rand ==2) loot("Money",x,y,Game,slide);
			if(rand ==3) loot("Bomb",x,y,Game,slide);
			if(rand ==4) loot("Key",x,y,Game,slide);}}
			
	//BOSS ROOMS 
	else if (type =="Boss"){
		var rand = getRand(bossPool.length,0);
		var bossloot = bossPool[rand];
		Game.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),bossloot,slide));
		bossPool.splice(rand,1);
	}
	//TREASURE ROOMS 
	else if (type =="Treasure"){
		var rand = getRand(treasurePool.length,0);
		var treasureloot = treasurePool[rand];
		Game.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),treasureloot,slide));
		treasurePool.splice(rand,1);
	}
	//SACRIFICE ROOMS 
	else if (type =="Sacrifice"){
		var rand = getRand(sacriPool.length,0);
		var sacriloot = sacriPool[rand];
		Game.Items.push(new Item(x+getRand(10,0),y+getRand(10,0),sacriloot,slide));
		sacriPool.splice(rand,1);
	}
	//SECRET ROOMS 
	else if (type =="Secret"){
		var srand = getRand(secretPool.length,0);
		var secretloot = secretPool[1];
		Game.Items.push(new Item(x+5,y+5,secretloot,slide));
		secretPool.splice(1,1);
		
	}
	
}

console.log('items.js loaded');