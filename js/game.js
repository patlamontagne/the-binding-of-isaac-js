//Variables globales et Arrays
//PAUSE
var isChanging = false;
var lastChange = Date.now();
var isPaused = false, lastPaused = Date.now();
//FPSCOUNTER
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var hitBox = false;
var lastFire = Date.now();
var playerBullets = [];
var playerBulletsBack = [];
var Animations = [];
var tempAnimations = [];

// Compatibilité browser
 var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;
// loop animation			
var recursiveAnim = function() {
    mainloop();
	animFrame( recursiveAnim );
};

//Initialisation
function gameInit(){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	generateFloor();
	playerAnimations();
	keyboardEvent();
	animFrame(recursiveAnim);
}

function loading(state){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	if(state){context.drawImage(imageTool.loading, 0, 0, canvas.width, canvas.height);}
	else if(!state){context.clearRect(0,0,canvas.width,canvas.height);}
}


var Game;
var floorStructure;
var currentFloor;
var possibleRooms;

function generateFloor(){
	var rand = getRand(firstFloor.length,0);
	//alert(rand);
	floorStructure = firstFloor[rand];
	possibleRooms = rooms;
	currentFloor = new Array(floorStructure.length);
	//Peuple les rooms
	for(var y=0; y < floorStructure.length; y++){
		currentFloor[y] = new Array(floorStructure[y].length);
		for(var x=0; x < floorStructure[y].length; x++){
			currentFloor[y][x]= new Nothing(); //Initialiser toutes les rooms, même celles qui n'existent pas
			//BASIC ROOMS
			if(floorStructure[y][x] == "0"){ //Si room de base présente dans la structure
				var randRoom = getRand(rooms.length,0); //Choisir une room random parmis celle disponibles
				currentFloor[y][x] = new Room("Room",rooms[randRoom],y,x); //L'assigner à l'étage
				rooms.splice(randRoom,1);} //Enleve la room des rooms disponibles
			//BOSS
			if(floorStructure[y][x] == "B"){ 
				currentFloor[y][x] = new Room("Boss",bossRooms[0],y,x);}
				
			
		}
	}
	//SPECIAL
	var ry = getRand(floorStructure.length,0);
	var	rx = getRand(floorStructure[ry].length,0);
	
	while (floorStructure[ry][rx] !="1"){
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	currentFloor[ry][rx] = new Room("Treasure",specialRooms[0],ry,rx); //Assigner la starting room
			
	//Salle de départ	
	for(var y=0; y < floorStructure.length; y++){
		for(var x=0; x < floorStructure[y].length; x++){
			while (floorStructure[ry][rx] !="0"){
				ry = getRand(floorStructure.length,0);
				rx = getRand(floorStructure[ry].length,0);}
				var randStart = getRand(startingRoom.length,0);
			currentFloor[ry][rx] = new Room("Room",startingRoom[randStart],ry,rx); //Assigner la starting room
			Game = currentFloor[ry][rx];
			currentFloor[ry][rx].isVisited = true;
			currentFloor[ry][rx].isCurrent = true;
		}
	}
	
	//Créer le niveau
	for(var i=0; i<currentFloor.length;i++){
		for(var j=0; j<currentFloor[i].length;j++){
			//alert("i = "+i+"... j = "+j);
			if(currentFloor[i][j].exists) currentFloor[i][j].create();
		}
	}
}

function playerAnimations(){//(maxframe,x,y,width,height,updatetime,spritesheet,offsetx,offsety)
	Animations = [];
	Animations[0] = new Animation(7,Player.x,Player.y,100,80,55,imageTool.bodyAnim,-7,3);
	Animations[1] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyRight,-9,3);
	Animations[2] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyLeft,-5,3);}

// Pause
function gameIsPaused(){
	if(keyPause && (Date.now() - lastPaused > 200)){
		if(isPaused) isPaused = false;
		else isPaused = true;
	lastPaused = Date.now();}
	return isPaused;
}

function pauseScreen(context){
	context.save();
	context.globalAlpha = 0.7;
	context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
	context.restore();
	if(gameIsPaused()){context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);}
	
}
var lastToggle = Date.now();
function toggleHitbox(){
 var nowToggle = Date.now();
	if(Date.now() - lastToggle > 300){
		if(hitBox) hitBox =false;
		else hitBox = true;
		lastToggle = Date.now();}
}

// Loop du jeu
function mainloop(){
	if(keyQ)toggleHitbox();
	
	if(Date.now() - lastChange < 350){
		isChanging = true;}
	else isChanging = false;
	
	if(!gameIsPaused() && !isChanging){
		Game.update();
		Game.clear();
		Player.update();
		showAdjacentRooms();
		if(keyW || keyS){Animations[0].update(Player.x,Player.y);}
		if(keyD){Animations[1].update(Player.x,Player.y);}
		if(keyA){Animations[2].update(Player.x,Player.y);}
		//Sang
		for(var s=0; s<tempAnimations.length;s++){
			tempAnimations[s].playOnce();
			if(tempAnimations[s].isOver)tempAnimations.splice(s,1);}
		Game.draw();
		}
	//fps calcul
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}

//Image de fond
var Background = {
	x: 0, y: 0,	height: 576, width: 960,
	draw : function(context){
		context.drawImage(imageTool.background, this.x, this.y, this.width, this.height);}
};

function Nothing(){
	this.exists = false;
}

// Niveau
function Room(type,map,locy,locx){
	this.type = type;
	this.locy = locy; //Position Y dans l'array d'étage
	this.locx = locx; // Position X dans l'array d'étage
	this.Minions = []; //Monstres errants
	this.Towers = []; //Monstres fixes
	this.enemyBullets = [];
	this.collideMaps = []; //Objets infranchissables par le joueur et par les projectiles
	this.wallMaps = []; //Murs invisibles
	this.traps = []; // Pièges
	this.holeMaps=[]; //Objets franchissables par les projectiles et certains Monstres, mais pas par le joueur
	this.freeCells = []; //Espace libre, franchissable par tout
	this.Items = []; // Drops, gold, boosts, hp, tout objets
	this.Doors = []; // Permet de transitionner entre les salles
	this.Bombs = [];
	this.Explosions = [];
	this.Bosses = []; 
	this.sprites = []; //Images fixes, sang, taches, etc
	this.enemies = 0; //Total d'ennemies présents
	this.combatMode = 1; //Mode de combat
	this.lootx = 0; //Positionx du loot de room
	this.looty = 0; //Positiony du loot de room
	this.canSpawnLoot = false; // Détermine si la room peut donner du loot ou pas
	this.exists = true; //Propriété pour filtrer l'array des salles existantes et des emplacements vides
	this.isVisited = false; //Minimap, la salle a été visité
	this.isCurrent = false; //Minimap, la salle actuelle
	this.isVisible = false; //Minimap, la salle est visible (adjacente à une salle visitée)
	this.map = map; //Tileset
	this.create= function(){
		for(var i=0,y=0; i< this.map.length; i++,y+=64){
			for(var j=0,x=0; j< this.map[i].length; j++,x+=64){ 
				if(this.map[i][j] == "Pl") {Player.x=x;	Player.y=y;this.sprites.push(new Sprite(imageTool.tutorial,130,100, 700, 237));}
				//PORTES
				else if(this.map[i][j] == "+L") {
					if(this.locx > 0){
						if(currentFloor[this.locy][this.locx-1].exists) this.Doors.push(new Door(x,y,"left"));
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));}
				else if(this.map[i][j] == "+R") {
					if(this.locx < currentFloor[this.locy].length-1){
						if(currentFloor[this.locy][this.locx+1].exists) this.Doors.push(new Door(x,y,"right"));
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
				else if(this.map[i][j] == "+U") {
					if(this.locy > 0){
						if(currentFloor[this.locy-1][this.locx].exists) this.Doors.push(new Door(x,y,"up"));
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
				else if(this.map[i][j] == "+D") {
					if(this.locy < currentFloor.length-1){
						if(currentFloor[this.locy+1][this.locx].exists) this.Doors.push(new Door(x,y,"down"));
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
				//Obstacles
				else if(this.map[i][j] == "  ") {	this.freeCells.push(new freeCell(x,y));}
				else if(this.map[i][j] == "Tg") {	this.traps.push(new Glue(x,y));}
				else if(this.map[i][j] == "!!") {	this.wallMaps.push(new Wall(x,y));}
				else if(this.map[i][j] == "Bl") {	this.collideMaps.push(new Block(x,y));}
				else if(this.map[i][j] == "Oo") {	this.collideMaps.push(new Poop(x,y));}
				else if(this.map[i][j] == "Tn") {	this.collideMaps.push(new Tnt(x,y));}
				else if(this.map[i][j] == "Ho") {	this.holeMaps.push(new Hole(x,y));}
				//Ennemis
				else if(this.map[i][j] == "Sp") {	this.Minions.push(new Spider(x+15,y+25,1.5,"spider",true));}
				else if(this.map[i][j] == "Sb") {	this.Minions.push(new Spider(x+15,y+25,3.25,"buttspider",true));}
				else if(this.map[i][j] == "Zo") {	this.Minions.push(new Zombie(x+10,y+20,3.25));}
				else if(this.map[i][j] == "Fl") {	this.Minions.push(new Fly(x,y,1.25,true));}
				else if(this.map[i][j] == "To") {	this.Towers.push(new Tower(x,y,4.25,true));}
				//Bosses
				else if(this.map[i][j] == "X1") {	this.Bosses.push(new Boss(x,y,60));this.sprites.push(new Blood(0,0,0,true));}
				//Items
				else if(this.map[i][j] == "XY") {	this.lootx = x+10; this.looty = y+10;this.canSpawnLoot=true;}
				else if(this.map[i][j] == "01") {	this.Items.push(new Item(x+10,y+10,"Half Heart"));}
				else if(this.map[i][j] == "02") {	this.Items.push(new Item(x+10,y+10,"Heart"));}
				else if(this.map[i][j] == "03") {	this.Items.push(new Item(x+10,y+10,"Wiggle Worm"));}
				else if(this.map[i][j] == "04") {	this.Items.push(new Item(x+10,y+10,"Tooth Picks"));}
				else if(this.map[i][j] == "05") {	this.Items.push(new Item(x+10,y+10,"Number One"));}
			}
		}
	}
	this.update = function(){
		for(var k=0; k<this.sprites.length;k++){
			this.sprites[k].update();			}			
		for(var u=0;u<this.Items.length;u++){
			this.Items[u].update();
			if( !this.Items[u].alive ) this.Items.splice(u,1);}		
			
		for(var u=0;u<this.Bombs.length;u++){
			this.Bombs[u].update();
			if( !this.Bombs[u].alive ) this.Bombs.splice(u,1);}	
			
		for(var u=0;u<this.Explosions.length;u++){
			this.Explosions[u].update();
			if( !this.Explosions[u].alive ) this.Explosions.splice(u,1);}		
			
		for(var xb=0;xb<this.Bosses.length;xb++){
			this.Bosses[xb].update();
			if( !this.Bosses[xb].alive ) this.Bosses.splice(xb,1);}			
		for(var i=0;i<this.Minions.length;i++){
			this.Minions[i].update();
			if( !this.Minions[i].alive ){ this.Minions.splice(i,1);}}				
		for(var t=0;t<this.Towers.length;t++){
			this.Towers[t].update();
			if( !this.Towers[t].alive ){this.Towers.splice(t,1);}}			
		for(var j=0;j<playerBullets.length;j++){
			playerBullets[j].update();
			if( !playerBullets[j].alive ){
				bulletImpact("player",playerBullets[j].x,playerBullets[j].y,-50,-50);
				playerBullets.splice(j,1);}}			
		for(var b=0;b<playerBulletsBack.length;b++){
			playerBulletsBack[b].update();
			if( !playerBulletsBack[b].alive ){
				bulletImpact("player",playerBulletsBack[b].x,playerBulletsBack[b].y,-50,-50);
				playerBulletsBack.splice(b,1);}}			
		for(var tb=0;tb<this.enemyBullets.length;tb++){
			this.enemyBullets[tb].update();}
			
		this.enemies = this.Minions.length + this.Towers.length + this.Bosses.length;
		if(this.enemies <=0){
			if(this.canSpawnLoot){
				createItem(this.lootx,this.looty,this.type);
				this.canSpawnLoot = false;}
			this.combatMode = 0;}
		else if(this.Bosses.length !=0) this.combatMode = 2;
		else this.combatMode = 1;
	}
	this.draw = function(){
		//Definition contexte canvas
		var canvas = getEl("canvas");
		var context = canvas.getContext('2d');
		var uicanvas = getEl("uicanvas");
		var uicontext = uicanvas.getContext('2d');
		context.clearRect(0,0,uicanvas.width,canvas.height);
		uicontext.clearRect(0,0,uicanvas.width,canvas.height);
		if(hitBox){context.globalAlpha = 0.5;}
		else context.globalAlpha = 1;
		//Éléments
		Background.draw(context);
		for(var k=0;k<this.sprites.length;k++){this.sprites[k].draw(context);}
		for(var d=0;d<this.Doors.length;d++){this.Doors[d].draw(context);}
		for(var c=0;c<this.collideMaps.length;c++){this.collideMaps[c].draw(context);}
		for(var h=0;h<this.holeMaps.length;h++){this.holeMaps[h].draw(context);}
		for(var t=0;t<this.traps.length;t++){this.traps[t].draw(context);}
		for(var u=0;u<this.Items.length;u++){this.Items[u].draw(context);}	
		//Sang
		for(var s=0; s<tempAnimations.length;s++) tempAnimations[s].drawOnce(context);	
		//Monstres et joueur
		Player.drawBody(context);
		for(var i=0;i<this.Minions.length;i++){this.Minions[i].draw(context);}
		for(var t=0;t<this.Towers.length;t++){this.Towers[t].draw(context);}
		for(var b=0;b<playerBulletsBack.length;b++){playerBulletsBack[b].draw(context);}
		for(var u=0;u<this.Bombs.length;u++){this.Bombs[u].draw(context);}	
		Player.drawHead(context);
		for(var u=0;u<this.Explosions.length;u++){this.Explosions[u].draw(context);}	
		for(var tb=0;tb<this.enemyBullets.length;tb++){this.enemyBullets[tb].draw(context);}
		for(var xb=0;xb<this.Bosses.length;xb++){this.Bosses[xb].draw(context);}
		for(var j=0;j<playerBullets.length;j++){playerBullets[j].draw(context);}	
		//Écran de pause
		if( gameIsPaused()) pauseScreen(context);
		Player.drawUI(context,uicontext);
		
		//Debug
		if(hitBox){
			context.font = "12pt Arial";
			context.fillStyle = 'white';
			context.fillText("BOSS: "+this.Bosses.length,5,15);
			context.fillText("MINIONS: "+this.Minions.length,5,35);
			context.fillText("MODE: "+this.combatMode,5,55);
		}
		
		//Minimap
		var top = 10;
		var left = 10;
		for(var y=0; y < currentFloor.length; y++){
			for(var x=0; x < currentFloor[y].length; x++){
				
				
				if(currentFloor[y][x].isCurrent){ uicontext.drawImage(imageTool.current,(x*42)+left,(y*17)+top, 44, 21);}
				else if(currentFloor[y][x].exists && currentFloor[y][x].isVisited){ uicontext.drawImage(imageTool.visited,(x*42)+left,(y*17)+top, 44, 21);}
				else if(currentFloor[y][x].exists && currentFloor[y][x].isVisible){ uicontext.drawImage(imageTool.unvisited,(x*42)+left,(y*17)+top, 44, 21);}
			}
		}
		for(var y=0; y < currentFloor.length; y++){
			for(var x=0; x < currentFloor[y].length; x++){			
				if(currentFloor[y][x].exists && currentFloor[y][x].isVisible && currentFloor[y][x].type =="Boss"){ uicontext.drawImage(imageTool.boss,(x*42)+left,(y*17)+top-8, 44, 32);}
				else if(currentFloor[y][x].exists && currentFloor[y][x].isVisible && currentFloor[y][x].type =="Treasure"){ uicontext.drawImage(imageTool.treasure,(x*42)+left,(y*17)+top-8, 44, 32);}
			}
		}
	}
	this.reset = function(){
		for(var i=0;i<this.Minions.length;i++){this.Minions[i].reset();}
		for(var t=0;t<this.Towers.length;t++){this.Towers[t].reset();}
		for(var xb=0;xb<this.Bosses.length;xb++){this.Bosses[xb].reset();}
		this.enemyBullets = [];
		this.Bombs = [];
		playerBullets = [];
		playerBulletsBack= [];
	}
	
	this.clear = function(){
		for(var i = 0; i<  this.enemyBullets.length; i++){
		if (!this.enemyBullets[i].alive){
			bulletImpact("enemy",this.enemyBullets[i].x,this.enemyBullets[i].y,-50,-50);
			this.enemyBullets.splice(i,1);}}
	}
}


function changeRoom(side){
	lastChange = Date.now();
	Game.isCurrent = false;
	Game.reset();
	for(var d = 0; d< Game.Doors.length; d++){
		Game.Doors[d].isDestroyed = false;
	}
		if(side == "left"){
			Game = currentFloor[Game.locy][Game.locx-1];
			Player.x  = canvas.width - 100;}
			
		else if(side == "right"){
			Game =currentFloor[Game.locy][Game.locx+1];
			Player.x = 74;}
		
		else if(side == "up"){
			Game =currentFloor[Game.locy-1][Game.locx];
			Player.y = canvas.height-120;}
		
		else if(side == "down"){
			Game =currentFloor[Game.locy+1][Game.locx];
			Player.y = 74;}
	Game.isVisited = true;
	Game.isCurrent = true;
}

function showAdjacentRooms(){
	if(Game.locx > 0 && currentFloor[Game.locy][Game.locx-1].exists)currentFloor[Game.locy][Game.locx-1].isVisible=true;
	if(Game.locx < currentFloor[Game.locy].length-1 && currentFloor[Game.locy][Game.locx+1].exists)currentFloor[Game.locy][Game.locx+1].isVisible=true;
	if(Game.locy > 0 && currentFloor[Game.locy-1][Game.locx].exists)currentFloor[Game.locy-1][Game.locx].isVisible=true;
	if(Game.locy < currentFloor.length-1 && currentFloor[Game.locy+1][Game.locx].exists)currentFloor[Game.locy+1][Game.locx].isVisible=true;
}

function freeCell(x,y){
	this.type = "free";
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
}

function Door(x,y,type){
	this.type = type;
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.img = 0;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.destroy = function(){
		this.isDestroyed = true
	}
	this.draw = function(context){
		if(this.isDestroyed) this.isColliding = false;
		else if(Game.combatMode!=0) this.isColliding = true;
		else this.isColliding = false;
		var offset = 0;
		if(this.type == "left") {
			var imgwidth = 74;
			var imgheight = 128;
			var offsetx = 0;
			var offsety = -30;
			if(this.isDestroyed) this.img = imageTool.doorL;
			else if(Game.combatMode!=0)this.img = imageTool.doorLclosed;
			else this.img = imageTool.doorL;}
			
		else if(this.type == "right") {
			var imgwidth = 74;
			var imgheight = 128;
			var offsetx = -5;
			var offsety = -30;
			if(this.isDestroyed) this.img = imageTool.doorR;
			else if(Game.combatMode!=0)this.img = imageTool.doorRclosed;
			else this.img = imageTool.doorR;}
			
		else if(this.type == "up") {
			var imgwidth = 128;
			var imgheight = 74;
			var offsetx = -30;
			var offsety = 4;
			if(this.isDestroyed) this.img = imageTool.doorU;
			else if(Game.combatMode!=0)this.img = imageTool.doorUclosed;
			else this.img = imageTool.doorU;}
			
		else if(this.type == "down") {
			var imgwidth = 128;
			var imgheight = 74;
			var offsetx = -30;
			var offsety = -12;
			if(this.isDestroyed) this.img = imageTool.doorD;
			else if(Game.combatMode!=0)this.img = imageTool.doorDclosed;
			else this.img = imageTool.doorD;}
			
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(this.img, this.x+offsetx, this.y+offsety, imgwidth, imgheight);	
	}
}

function Wall(x,y){
	this.type = "wall";
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.isColliding = true;
	this.draw = function(context){}
}
function Block(x,y){
	this.rand = getRand(100,1);
	this.type = "block";
	this.x = x;
	this.y = y;
	this.imgRand = getRand(3,1);
	this.width = 58;
	this.height = 58;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.destroy = function(){
		if(this.type == "xblock") createItem(x,y,this.type);
		this.isDestroyed = true;
		this.isColliding = false;
	}
	this.draw = function(context){
	if(this.rand == 1) this.type = "xblock";
	else this.type = "block";
		if(!this.isDestroyed){
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			if(this.type == "xblock")  context.drawImage(imageTool.xblock, this.x+3, this.y-2, 64, 80);
			else {
			switch(this.imgRand){
				case 1: context.drawImage(imageTool.block, this.x, this.y-5, 64, 80);break;
				case 2: context.drawImage(imageTool.block1, this.x, this.y-5, 64, 80);break;
				case 3: context.drawImage(imageTool.block2, this.x, this.y-5, 64, 80);break;
				default: context.drawImage(imageTool.block, this.x, this.y-5, 64, 80);break;}}}
	}
}
function Poop(x,y){
	this.type = "poop";
	this.x = x+9;
	this.y = y+9;
	this.state = 0; //Étapes de destruction
	this.width = 45;
	this.height = 45;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.canAnim = true;
	this.destroy = function(){
		this.isDestroyed = true;
		this.state =5;
	}
	this.draw = function(context){
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.state < 1) context.drawImage(imageTool.poop1, this.x-16, this.y-24, 78, 78);
		else if(this.state < 1.75) context.drawImage(imageTool.poop2, this.x-16, this.y-18, 78, 78);
		else if(this.state < 2.5) context.drawImage(imageTool.poop3, this.x-16, this.y-17, 78, 78);
		else if(this.state < 3.25) context.drawImage(imageTool.poop4, this.x-16, this.y-15, 78, 78);
		else { context.drawImage(imageTool.poop5, this.x-16, this.y-14, 78, 78);
			if(this.canAnim){
				sounds.bullet.currentTime = 0;
				sounds.bullet.play();
				if(!this.isDestroyed)createItem(this.x,this.y,"poop");
				tempAnimations.push(new Animation(7,this.x,this.y,200,200,45,imageTool.poopAnim,-58,-102,1));
				this.canAnim = false;}
			this.isColliding = false;}
		context.restore();
	}
}

function Tnt(x,y){
	this.type = "tnt";
	this.x = x;
	this.y = y;
	this.state = 0; //Étapes de destruction
	this.width = 58;
	this.height = 58;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.canAnim = true;
	this.destroy = function(){
		this.isDestroyed = true;
		this.state =4;
	}
	this.draw = function(context){
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.state < 1) context.drawImage(imageTool.barrel1, this.x-12, this.y-10, 82, 82);
		else if(this.state < 2) context.drawImage(imageTool.barrel2, this.x-12, this.y-10, 82, 82);
		else if(this.state < 3) context.drawImage(imageTool.barrel3, this.x-12, this.y-10, 82, 82);
		else {
			context.drawImage(imageTool.barrel4, this.x-12, this.y-10, 82, 82);
			if(this.canAnim){
				Game.Explosions.push(new Explosion(this.x+15,this.y+15));
				this.canAnim = false;}
			this.isColliding = false;}
		context.restore();
	}
}

function Hole(x,y){
	this.type = "hole";
	this.x = x;
	this.y = y;
	this.width = 58;
	this.height = 58;
	this.canBeDestroyed = false;
	this.isColliding = true;
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(imageTool.hole, x-7, y-3, 74, 74);	}
}

function Glue(x,y){
	this.type = "glue";
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.destroy = function(){
		this.isDestroyed = true;
	}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(!this.isDestroyed)context.drawImage(imageTool.glue, x-15, y-13, 96, 96);}
}

function Bomb(type,x,y){
	this.type = type;
	this.x = x;
	this.y = y;
	this.dirx=0;
	this.diry=0;
	this.speed =0;
	this.PlayerSliding = false;
	this.ExploSliding = false;
	this.explox = 0;
	this.exploy = 0;
	this.slidingTimer = Date.now();
	this.width = 32;
	this.height = 32;
	this.explosionTimer = 2100;
	this.currentTimer = Date.now();
	this.alive = true;
	this.blink = 0;
	this.update = function(){
		if(Date.now() - this.currentTimer > this.explosionTimer){
			Game.Explosions.push(new Explosion(this.x,this.y));
			this.alive = false;
		}
		if(Date.now() - this.currentTimer > 700){
			this.checkCollide(Player);
		}
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
			this.speed = Player.speed+4;}
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
			this.speed = 11;}
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
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.save();
		context.globalAlpha = 0.15;
		context.drawImage(imageTool.shadow, this.x-7, this.y, this.width+14, this.height);
		context.restore();
		if(this.blink > 15)this.blink =0;
		else if(this.blink > 0 && this.blink <=7){
			context.save();
			context.globalAlpha = 0;}
		this.blink++;
		context.drawImage(imageTool.bomb, this.x-18, this.y-40, 70, 70);
		context.restore();
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
				if(obj[i].isColliding){
					if(pos == "up"){this.y = obj[i].y+obj[i].height;return true;}
					else if(pos == "down"){this.y = obj[i].y-this.height; return true;}
					else if(pos == "left"){this.x = obj[i].x+obj[i].width;return true;}
					else if(pos == "right"){this.x = obj[i].x-this.width;return true;}}}}}
	}
}

function Explosion(x,y){
	this.width = 188;
	this.height = 138;
	this.x = (x-this.width/2) +15;
	this.y = y-this.height/2;
	this.frame = 0;
	this.alive = true;
	this.currentTimer= Date.now();
	this.timer = 250;
	this.canAnim = true;
	this.update = function(){
		if(this.frame < 1){
			this.frame ++;
			this.checkCollide(Game.collideMaps);
			this.checkCollide(Game.Doors);
			this.checkCollide(Game.traps);
			this.checkCollide(Game.Minions);
			this.checkCollide(Game.Towers);
			this.checkCollide(Game.Bosses);
			this.checkCollide(Player);
		}
		if(Date.now() - this.currentTimer > this.timer){
			this.alive = false;
		}
	}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.canAnim){
			tempAnimations.push(new Animation(19,this.x,this.y-15,200,150,10,imageTool.explosion,0,0,1));
			Game.sprites.push(new Sprite(imageTool.explosionmark,this.x-10,this.y+50, 188, 100));
			this.canAnim = false;}
	}
	this.checkCollide = function(obj){ //calcul de collision
		if(obj == Player){
				if(this.y < obj.y + obj.height &&
				this.y + this.height > obj.y &&
				this.x + this.width  > obj.x && 
				this.x < obj.x + obj.width ){
					Player.getDamage(1,this.x,this.y);
				}
		}
		else {
			for(var i=0;i<obj.length;i++){
				if(this.y < obj[i].y + obj[i].height &&
				this.y + this.height > obj[i].y &&
				this.x + this.width  > obj[i].x && 
				this.x < obj[i].x + obj[i].width ){
					if(obj[i].canBeDestroyed)obj[i].destroy();
					else if((obj == Game.Minions) || (obj == Game.Towers) || (obj == Game.Bosses)){
						obj[i].getDamage(Player.bombDmg);}		
				}
			}
		}
	}
}

function Sprite(img,x,y,width,height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.img = img;
	this.update = function(){
		this.x= this.x;
		this.y = this.y;}
	this.draw = function(context){
		context.drawImage(this.img,this.x,this.y,this.width,this.height);
	}
}

function Blood(x,y,tary,bossroom){
	this.x = x;
	this.y = y;
	this.tary = tary;
	this.speed = 6;
	this.width = 40;
	this.height = 30;
	this.rand = getRand(3,1);
	this.dir = getRand(5,1);
	this.update = function(){
		if(!bossroom){
		if(this.y < this.tary) {
			this.y += this.speed;
			switch(this.dir){
				case 1: this.x++;break;
				case 2: this.x--;break;
				case 3: this.x-=2;break;
				case 4: this.x+=2; break;
				default: ;}}}
	}
	this.draw = function(context){
	if(bossroom){
		context.drawImage(imageTool.bloodRoom, this.x+25, this.y+50, canvas.width-50, canvas.height-100);
	}
	else{
		switch(this.rand){
			case 1: context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);;break;
			case 2: context.drawImage(imageTool.blood2, this.x, this.y, this.width, this.height);;break;
			case 3: context.drawImage(imageTool.blood3, this.x, this.y, this.width, this.height);;break;
			default: context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);;break;}}}
}

function bleed(nb,x,y,tary,height,width,ox,oy,scale){
	for(var l = 0; l <  nb; l++){
		var randx = getRand(ox,-ox/2);
		var randy = getRand(oy,-oy/2);
		Game.sprites.push(new Blood(x-randx,y,tary-randy,false));}
	tempAnimations.push(new Animation(7,x,y,200,200,30,imageTool.bloodAnim,ox,oy,scale));
}
	
function bulletImpact(obj,x,y,ox,oy){
	if(obj == "player") {
		if(Player.isNumberOne){	
			tempAnimations.push(new Animation(14,x,y,200,200,16,imageTool.animNumberOne,ox,oy,2/3));}
		else if(Player.isToothPicks)tempAnimations.push(new Animation(14,x,y,200,200,16,imageTool.eBulletAnim,ox,oy,2/3));
		else tempAnimations.push(new Animation(14,x,y,200,200,16,imageTool.pBulletAnim,ox,oy,2/3));}
	else if(obj == "enemy") tempAnimations.push(new Animation(14,x,y,200,200,16,imageTool.eBulletAnim,ox,oy,2/3));
	
}
function getRand(nbPos,nbDep){ return Math.floor(Math.random()*nbPos + nbDep);}
function getEl(id){ return document.getElementById(id);}