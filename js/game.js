//Variables globales et Arrays
//PAUSE
var isChanging = false;
var lastChange = Date.now();
var updatingBackground = false;
var isPaused = false, lastPaused = Date.now();
var gameOver = false;
var gameOverOpac=0;
var gameOverTime = 0;
//FPSCOUNTER
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var hitBox = false;
var playerBullets = [];
var playerBulletsBack = [];
var Animations = [];
var tempAnimations = [];
var rockIsDropped = false;
var numImages = 0;
var numLoaded = 0;
var floorCount = 0;
var Game;
var floorStructure;
var currentFloor;
var possibleRooms;

var newside ="";
var transitionStage =2;
var timeCounter =0;
var roomChangeOpac=1;
var isaaciconpos = 0;
var loadinganim = "";

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
	updatingBackground = true;
}

function loading(state){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	if(state){
		context.clearRect(0,0,canvas.width,canvas.height);
		context.drawImage(imageTool.loading, 0, 0, canvas.width, canvas.height);
		var percentLeft = (numLoaded / numImages)*100;
		context.fillStyle = '#c12613';
		context.fillRect(0,canvas.height-20,percentLeft*9.6,20);
		context.fillStyle = 'black';}
	else if(!state){context.clearRect(0,0,canvas.width,canvas.height);}
}

// Loop du jeu
function mainloop(){	
	//if(keyQ)toggleHitbox();
	if(Date.now() - lastChange <= 500){
		isChanging = true;}
	else isChanging = false;	
	if(!gameOver && !gameIsPaused() ){
	
		if( Date.now() - lastChange > 1000){
			Game.update();
			Game.clear();
			Player.update();}
		if( Date.now() - lastChange > 900 && Date.now() - lastChange < 1100 ){
			updatingBackground = true;}
		showAdjacentRooms();
		if(keyW || keyS){Animations[0].update(Player.x,Player.y);}
		if(keyD){Animations[1].update(Player.x,Player.y);}
		if(keyA){Animations[2].update(Player.x,Player.y);}
		//Sang
		for(var s=0; s<tempAnimations.length;s++){
			tempAnimations[s].playOnce();
			if(tempAnimations[s].isOver)tempAnimations.splice(s,1);}
		}
		Game.draw();
		
		if(transitionStage !=0){
			transition();
			var uicanvas = getEl("uicanvas");
			var uicontext = uicanvas.getContext('2d');
			uicontext.drawImage(imageTool.blackScreen, 0, 0, uicanvas.width, uicanvas.height);}
	//fps calcul
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}

function generateFloor(){
	floorCount++;
	var newfloor = eval("floor"+floorCount); 
	var floorrand = getRand(newfloor.length,0);
	floorStructure = newfloor[floorrand];
	possibleRooms = eval("rooms"+floorCount);
	currentFloor = new Array(floorStructure.length);
	
	//Peuple les rooms
	for(var y=0; y < floorStructure.length; y++){
		currentFloor[y] = new Array(floorStructure[y].length);
		for(var x=0; x < floorStructure[y].length; x++){
			currentFloor[y][x]= new Nothing(); //Initialiser toutes les rooms, même celles qui n'existent pas
			//BASIC ROOMS
			if(floorStructure[y][x] == "0"){ //Si room de base présente dans la structure
				var randRoom = getRand(possibleRooms.length,0); //Choisir une room random parmis celle disponibles
				currentFloor[y][x] = new Room("Room",possibleRooms[randRoom],y,x,floorrand+1); //L'assigner à l'étage
				possibleRooms.splice(randRoom,1);
				} //Enleve la room des rooms disponibles
				
		//BOSS
		if(floorStructure[y][x] == "B"){ 
			currentFloor[y][x] = new Room("Boss",bossRooms[floorCount-1],y,x,"Boss room");}//Assigner la Boss room
				
			
		}
	}
	//SPECIAL
	var ry = getRand(floorStructure.length,0);
	var	rx = getRand(floorStructure[ry].length,0);
	//TREASURE
	while (floorStructure[ry][rx] !="1"){
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	floorStructure[ry][rx] ="2"
	currentFloor[ry][rx] = new Room("Treasure",treasureRooms[0],ry,rx,"Treasure room"); //Assigner la Treasure room
	//SHOP
	while (floorStructure[ry][rx] !="1"){
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	floorStructure[ry][rx] ="2"
	var randShop = getRand(shopRooms.length,0)
	currentFloor[ry][rx] = new Room("Shop",shopRooms[randShop],ry,rx, "Shop room"); //Assigner la Shop room
	
	//SACRIFICE
	var failCount = 0;
	while (floorStructure[ry][rx] !="1" || failCount < 50){
		failCount++;
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	floorStructure[ry][rx] ="2"
	var sacriRand = getRand(2,1);
	if(sacriRand ==2) currentFloor[ry][rx] = new Room("Sacrifice",sacrificeRooms[0],ry,rx, "Sacrifice room"); //Assigner la Sacrifice room
	
	//CURSED
	var failCount = 0;
	while (floorStructure[ry][rx] !="1" || failCount < 50){
		failCount++;
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	floorStructure[ry][rx] ="2"
	var randCursed = getRand(cursedRooms.length,0)
	currentFloor[ry][rx] = new Room("Cursed",cursedRooms[randCursed],ry,rx,"Cursed room"); //Assigner la curse room
	
	//SECRET
	while (floorStructure[ry][rx] !="S"){
		ry = getRand(floorStructure.length,0);
		rx = getRand(floorStructure[ry].length,0);}
	var randSecret = getRand(secretRooms.length,0)
	currentFloor[ry][rx] = new Room("Secret",secretRooms[randSecret],ry,rx,"Secret room"); //Assigner la Treasure room
	secretRooms.splice(randSecret,1);
			
	//Salle de départ	
	for(var y=0; y < floorStructure.length; y++){
		for(var x=0; x < floorStructure[y].length; x++){
			while (floorStructure[ry][rx] !="0"){
				ry = getRand(floorStructure.length,0);
				rx = getRand(floorStructure[ry].length,0);}
			currentFloor[ry][rx] = new Room("Room",startingRoom[0],ry,rx,floorrand+1); //Assigner la starting room
			Game = currentFloor[ry][rx];
			currentFloor[ry][rx].isVisited = true;
			currentFloor[ry][rx].isCurrent = true;
		}
	}
	//Créer le niveau
	for(var i=0; i<currentFloor.length;i++){
		for(var j=0; j<currentFloor[i].length;j++){
			//alert("i = "+i+"... j = "+j);
			if(currentFloor[i][j].exists){
				currentFloor[i][j].create();
				currentFloor[i][j].shopCreate();}
		}
	}
	
	loadinganim =  new Animation(7,280,356,100,80,75,imageTool.bodyAnim,-7,13,1);
}

function playerAnimations(){//(maxframe,x,y,width,height,updatetime,spritesheet,offsetx,offsety,scale)
	Animations = [];
	Animations[0] = new Animation(7,Player.x,Player.y,100,80,55,imageTool.bodyAnim,-7,13,1);
	Animations[1] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyRight,-9,13,1);
	Animations[2] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyLeft,-5,13,1);
	Animations[3] = new Animation(6,Player.x,Player.y,140,140,70,imageTool.playerloot,-7,13,1);
	Animations[4] = new Animation(4,Player.x,Player.y,63,52,125,imageTool.heartanim,-7,13,1.1);}

// Pause
function gameIsPaused(){
	if(keyPause && (Date.now() - lastPaused > 200)){
		if(isPaused) isPaused = false;
		else isPaused = true;
	lastPaused = Date.now();}
	return isPaused;
}

// Mode Hitbox / debug
var lastToggle = Date.now();
function toggleHitbox(){
 var nowToggle = Date.now();
	if(Date.now() - lastToggle > 300){
		if(hitBox) hitBox =false;
		else hitBox = true;
		updatingBackground = true;
		lastToggle = Date.now();}
}

//Image de fond
var Background = {
	x: 0, y: 0,	height: 576, width: 960,
	draw : function(context){
		//BG
		if(Game.type == "Secret" || Game.type == "Cursed") context.drawImage(imageTool.bgsecret, this.x, this.y, this.width, this.height);
		else context.drawImage(imageTool["bg"+floorCount], this.x, this.y, this.width, this.height);
		
		//OVERLAY 
		if (Game.type == "Boss" || Game.type == "Sacrifice"){
			context.drawImage(imageTool.bloodRoom, this.x, this.y, this.width, this.height);
			context.drawImage(imageTool.overlayboss, this.x, this.y, this.width, this.height);}
		else if(Game.overlayRand == 3 && floorCount < 3 && Game.type =="Room") context.drawImage(imageTool["overlay"+floorCount], this.x, this.y, this.width, this.height);
	}
};

//Vide
function Nothing(){
	this.exists = false;
}

function changeRoom(side){
	lastChange = Date.now();
	Player.accelx = 0;
	Player.accely = 0;
	transitionStage =5;
	Game.isCurrent = false;
	Game.reset();
	 newside= side;
	for(var i = 0; i < Game.Items.length; i++){
		if(Game.Items[i].type=="Chest" || Game.Items[i].type=="Redchest"){
			if(!Game.Items[i].canBeUsed) Game.Items.splice(i,1);
		}
	}
	
	for(var d = 0; d< Game.Doors.length; d++){
		Game.Doors[d].isDestroyed = false;
		if(Game.Doors[d].type =="Cursed" || Game.type == "Cursed"){
			Game.Doors[d].type = "Cursed";
			Game.Doors[d].locked = true;
			Game.Doors[d].isColliding = true;}
	}
	
}

function newRoom(){
		if(newside == "left"){
			Game = currentFloor[Game.locy][Game.locx-1];
			Player.x  = canvas.width - 100;}
			
		else if(newside == "right"){
			Game = currentFloor[Game.locy][Game.locx+1];
			Player.x = 74;}
		
		else if(newside == "up"){
			Game = currentFloor[Game.locy-1][Game.locx];
			Player.y = canvas.height-120;}
		
		else if(newside == "down"){
			Game = currentFloor[Game.locy+1][Game.locx];
			Player.y = 74;}
	
	if(!Game.isVisited){Game.isVisited= true;gameStats.rooms++;}
	Game.isCurrent = true;
	updatingBackground = true;

}

function transition(){
//CHANGEMENT D'ÉTAGE
		if(transitionStage <5){
			var canvas = getEl("canvas");
			var context = canvas.getContext('2d');
			context.save();
			if(roomChangeOpac < 1 && transitionStage == 1) roomChangeOpac +=0.03;
			if(roomChangeOpac >= 1 && transitionStage == 1) {
				transitionStage = 2;
				generateFloor();
				updatingBackground = true;}
			if(transitionStage ==2 && timeCounter < 120){
				Player.accelx=0;
				Player.accely=0;
				timeCounter++;
				isaaciconpos++;
				if(timeCounter > 119){transitionStage =3;timeCounter =0;}
			}
			if(roomChangeOpac > 0 && transitionStage == 3) roomChangeOpac -=0.03;
			if(roomChangeOpac <= 0 && transitionStage == 3) {transitionStage=0;roomChangeOpac=0;timeCounter =0;}
			context.globalAlpha = roomChangeOpac;
			context.drawImage(imageTool.loading, 0, 0, canvas.width, canvas.height);
			
			context.font = "12pt wendy";
			context.fillStyle = 'white';
			var floornames = ["Basement","Caves","The Depths"];
			var flooricons = [imageTool.duke,imageTool.project,imageTool.duke2];
			context.textAlign = 'center';
			
			//BG
			for(var i = 0; i < floornames.length; i++){
				context.drawImage(imageTool.uibar,canvas.width/2-400,  i*120+90,400,70);
			}
			
			//ISAAC ANIMATION
			if(transitionStage==2){
				loadinganim.update(60,isaaciconpos-37);
				loadinganim.draw(context);}
			else  context.drawImage(imageTool.bodyIdle, 57,isaaciconpos-23, 40, 40);
			context.drawImage(imageTool.playerDown, 45,isaaciconpos-58, 64, 55);
			
			//FLOOR NAMES & BOSS ICONS
			for(var i = 0; i < floornames.length; i++){
				context.fillText(floornames[i],canvas.width/2-250,  i*120+120);
				context.drawImage(flooricons[i],canvas.width/2-150,  i*120+70,80,80);
				if(i+1<=bossbeaten) context.drawImage(imageTool.xmark,canvas.width/2-150,  i*120+70,80,80);
			}
				
			
			context.restore();
			isChanging = true;
		}
		//CHANGEMENT DE PIECE
		else if(transitionStage >4){
			var canvas = getEl("canvas");
			var context = canvas.getContext('2d');
			//context.clearRect(0,0,canvas.width,canvas.height);
			context.save();
			if(roomChangeOpac < 1 && transitionStage == 5) roomChangeOpac +=0.04;
			if(roomChangeOpac >= 1 && transitionStage == 5) {
				transitionStage = 6;
				newRoom();
				updatingBackground = true;}
			if(roomChangeOpac > 0 && transitionStage == 6) roomChangeOpac -=0.05;
			if(roomChangeOpac <= 0 && transitionStage == 6) {transitionStage=0;roomChangeOpac=0;}
			context.globalAlpha = roomChangeOpac;
			context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
			context.restore();
			isChanging = true;
		}
}

function changeFloor(){
	lastChange = Date.now();
	Game.isCurrent = false;
	Game.reset();
	Player.accelx= 0;
	Player.accely=0;
	transitionStage =1;
}

function showAdjacentRooms(){ //Découvrir les pièces adjacentes
	if(Game.locx > 0 && currentFloor[Game.locy][Game.locx-1].exists && currentFloor[Game.locy][Game.locx-1].type != "Secret"){
		currentFloor[Game.locy][Game.locx-1].isVisible=true;
		currentFloor[Game.locy][Game.locx-1].iconVisible=true;}
	if(Game.locx < currentFloor[Game.locy].length-1 && currentFloor[Game.locy][Game.locx+1].exists && currentFloor[Game.locy][Game.locx+1].type != "Secret"){
		currentFloor[Game.locy][Game.locx+1].isVisible=true;
		currentFloor[Game.locy][Game.locx+1].iconVisible=true;}
	if(Game.locy > 0 && currentFloor[Game.locy-1][Game.locx].exists && currentFloor[Game.locy-1][Game.locx].type != "Secret"){
		currentFloor[Game.locy-1][Game.locx].isVisible=true;
		currentFloor[Game.locy-1][Game.locx].iconVisible=true;}
	if(Game.locy < currentFloor.length-1 && currentFloor[Game.locy+1][Game.locx].exists && currentFloor[Game.locy+1][Game.locx].type != "Secret"){
		currentFloor[Game.locy+1][Game.locx].isVisible=true;
		currentFloor[Game.locy+1][Game.locx].iconVisible=true;}
}

function showMap(item){
	if(item == "Treasure Map"){
		for(var i = 0; i< currentFloor.length; i++){
			for(var j = 0; j< currentFloor[i].length; j++){
				if(currentFloor[i][j].exists) currentFloor[i][j].isVisible = true;	}}}
	else if(item == "The Compass"){
		for(var i = 0; i< currentFloor.length; i++){
			for(var j = 0; j< currentFloor[i].length; j++){
				if(currentFloor[i][j].exists) currentFloor[i][j].iconVisible = true;	}}}
}

function freeCell(x,y){
	this.type = "free";
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.draw = function(context){
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
	}
}

function Door(x,y,side,type,locked){
	this.side = side;
	this.name = "Door";
	this.type = type;
	this.locked = locked;
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.img = 0;
	this.bgimg = 0;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.use = function(){
		if(this.locked && Game.combatMode ==0){
			if((this.type =="Shop" || this.type == "Treasure" ) && Player.keys > 0){
				this.locked=false;
				Player.keys--;
				updatingBackground = true;
			}
			else if (this.type == "Cursed" || Game.type =="Cursed"){
				this.locked=false;
				this.isColliding = false;
				Player.getDamage(0.5);
			}
		}
	}
	this.destroy = function(){
		if(Game.type !="Boss"){
			this.isDestroyed = true;
			updatingBackground = true;}
	}
	this.draw = function(context){
		if(this.isDestroyed){
			if(this.type != "Treasure" && this.type != "Shop")this.isColliding = false;
			else this.isDestroyed = false;}
		else if(Game.combatMode!=0 || this.locked) this.isColliding = true;
		else this.isColliding = false;
		var offset = 0;
		if(this.side == "left") {
			var imgwidth = 74;
			var imgheight = 128;
			var offsetx = -3;
			var offsety = -30;	
			var bgwidth = 54;
			var bgheight = 94;
			var bgx = 12;
			var bgy = -12;		
			if(Game.type =="Secret" && this.type != ("Secret" || "Cursed")){
				this.img = imageTool.secretL;
				this.bgimg = imageTool.spacer;}
				
			else if(this.type =="Secret"){
				if(!this.isDestroyed){
					this.isColliding = true;
					this.img = imageTool.spacer;
					this.bgimg = imageTool.spacer;}
				else this.img = imageTool.secretL;
					this.bgimg = imageTool.spacer;}
					
			else{
				if(this.type =="Treasure") {
					if(this.locked) this.bgimg = imageTool.keyholeL;
					else this.bgimg = imageTool.doorLopen;
					this.img = imageTool.TdoorL;}
					
			else if(this.type=="Cursed" || Game.type=="Cursed") {
				this.img = imageTool.curseddoorL;}
					
			else if(this.type =="Shop") {
				if(this.locked) this.bgimg = imageTool.shopKeyholeL;
				else this.bgimg = imageTool.doorLopen;
				this.img = imageTool.doorL;}
				
			else if(this.type =="Boss") this.img = imageTool.BdoorL;
			
			else this.img = imageTool.doorL;
			
				
				if(this.isDestroyed) this.bgimg = imageTool.doorLopen;
			else if(Game.combatMode!=0 && (this.type=="Cursed" || Game.type=="Cursed"))this.bgimg = imageTool.doorLclosed;
				else if(Game.combatMode!=0 && !this.locked)this.bgimg = imageTool.doorLclosed;
				else if(!this.locked || this.type=="Cursed" || Game.type=="Cursed")this.bgimg = imageTool.doorLopen;
			}
		}
			
		else if(this.side == "right") {
			var imgwidth = 74;
			var imgheight = 128;
			var offsetx = -5;
			var offsety = -30;
			var bgwidth = 54;
			var bgheight = 94;
			var bgx = 0;
			var bgy = -12;
			if(Game.type =="Secret" && this.type != ("Secret" || "Cursed")){
				this.img = imageTool.secretR;
				this.bgimg = imageTool.spacer;}
				
			else if(this.type =="Secret"){
				if(!this.isDestroyed){
					this.isColliding = true;
					this.img = imageTool.spacer;
					this.bgimg = imageTool.spacer;}
				else this.img = imageTool.secretR;
					this.bgimg = imageTool.spacer;}
					
			else{ 
				if(this.type =="Treasure"){
				if(this.locked) this.bgimg = imageTool.keyholeR;
				else this.bgimg = imageTool.doorRopen;
				this.img = imageTool.TdoorR;}
				
			else if(this.type=="Cursed" || Game.type=="Cursed") {
				this.img = imageTool.curseddoorR;}
					
			else if(this.type =="Shop") {
					if(this.locked) this.bgimg = imageTool.shopKeyholeR;
					else this.bgimg = imageTool.doorRopen;
					this.img = imageTool.doorR;}
					
			else if(this.type =="Boss")	this.img = imageTool.BdoorR;
			
			else this.img = imageTool.doorR;
			
			if(this.isDestroyed) this.bgimg = imageTool.doorRopen;
			else if(Game.combatMode!=0 && (this.type=="Cursed" || Game.type=="Cursed"))this.bgimg = imageTool.doorRclosed;
			else if(Game.combatMode!=0 && !this.locked)this.bgimg = imageTool.doorRclosed;
			else if(!this.locked || this.type=="Cursed" || Game.type=="Cursed")this.bgimg = imageTool.doorRopen;
			}
		}
			
		else if(this.side == "up") {
			var imgwidth = 138;
			var imgheight = 84;
			var offsetx = -35;
			var offsety = -4;
			var bgwidth = 94;
			var bgheight = 54;
			var bgx = -13;
			var bgy = 18;
			if(Game.type =="Secret" && this.type != ("Secret" || "Cursed")){
				this.img = imageTool.secretU;
				this.bgimg = imageTool.spacer;}
				
			else if(this.type =="Secret"){
				if(!this.isDestroyed){
					this.isColliding = true;
					this.img = imageTool.spacer;
					this.bgimg = imageTool.spacer;}
				else this.img = imageTool.secretU;
					this.bgimg = imageTool.spacer;}
					
			else{
				if(this.type =="Treasure") {
				if(this.locked) this.bgimg = imageTool.keyholeU;
				else this.bgimg = imageTool.doorUopen;
				this.img = imageTool.TdoorU;}
					
			else if(this.type=="Cursed" || Game.type=="Cursed") {
					this.img = imageTool.curseddoorU;}
					
			else if(this.type =="Shop") {
					if(this.locked) this.bgimg = imageTool.shopKeyholeU;
					else this.bgimg = imageTool.doorUopen;
					this.img = imageTool.doorU;}
					
			else if(this.type =="Boss")this.img = imageTool.BdoorU;
			
			else this.img = imageTool.doorU;
			
			if(this.isDestroyed) this.bgimg = imageTool.doorUopen;
			else if(Game.combatMode!=0 && (this.type=="Cursed" || Game.type=="Cursed"))this.bgimg = imageTool.doorUclosed;
			else if(Game.combatMode!=0 && !this.locked)this.bgimg = imageTool.doorUclosed;
			else if(!this.locked || this.type=="Cursed" || Game.type=="Cursed")this.bgimg = imageTool.doorUopen;
			}
		}
			
		else if(this.side == "down") {
			var imgwidth = 138;
			var imgheight = 84;
			var offsetx = -35;
			var offsety = -12;
			var bgwidth = 94;
			var bgheight = 64;
			var bgx = -13;
			var bgy = -8;
			if(Game.type =="Secret" && this.type != ("Secret" || "Cursed")){
				this.img = imageTool.secretD;
				this.bgimg = imageTool.spacer;}
				
			else if(this.type =="Secret"){
				if(!this.isDestroyed){
					this.isColliding = true;
					this.img = imageTool.spacer;
					this.bgimg = imageTool.spacer;}
				else this.img = imageTool.secretD;
					this.bgimg = imageTool.spacer;}
					
			else {
			if(this.type =="Treasure") {
				if(this.locked) this.bgimg = imageTool.keyholeD;
				else this.bgimg = imageTool.doorDopen;
				this.img = imageTool.TdoorD;}
					
			else if(this.type=="Cursed" || Game.type=="Cursed") {
					this.img = imageTool.curseddoorD ;}
					
			else if(this.type =="Shop") {
					if(this.locked) this.bgimg = imageTool.shopKeyholeD;
					else this.bgimg = imageTool.doorDopen;
					this.img = imageTool.doorD;}
					
			else if(this.type =="Boss")	this.img = imageTool.BdoorD;
			
			else this.img = imageTool.doorD;
			
			if(this.isDestroyed) this.bgimg = imageTool.doorDopen;
			else if(Game.combatMode!=0 && (this.type=="Cursed" || Game.type=="Cursed"))this.bgimg = imageTool.doorDclosed;
			else if(Game.combatMode!=0 && !this.locked)this.bgimg = imageTool.doorDclosed;
			else if(!this.locked || this.type=="Cursed" || Game.type=="Cursed")this.bgimg = imageTool.doorDopen;
			}
		}
			
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(this.bgimg, this.x+bgx, this.y+bgy, bgwidth, bgheight);	
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
	this.width = 60;
	this.height = 60;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.canDrop = true;
	this.isColliding = true;
	this.destroy = function(){
		if(this.type == "xblock"){
			if(this.canDrop){
				createItem(x,y,this.type);
				this.canDrop =false;}}
		this.isDestroyed = true;
		this.isColliding = false;
		updatingBackground = true;
	}
	this.draw = function(context){
	if(this.rand == 1) this.type = "xblock";
	else this.type = "block";
		if(!this.isDestroyed){
			if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
			if(this.type == "xblock")  context.drawImage(imageTool.xblock, this.x-3, this.y+3, 64, 74);
			else {
			switch(this.imgRand){
				case 1: context.drawImage(imageTool.block, this.x-3, this.y+3, 64, 74);break;
				case 2: context.drawImage(imageTool.block1, this.x-3, this.y+3, 64, 74);break;
				case 3: context.drawImage(imageTool.block2, this.x-3, this.y+3, 64, 74);break;
				default: context.drawImage(imageTool.block, this.x-3, this.y+3, 64, 74);break;}}}
	}
}

function Poop(x,y){
	this.type = "poop";
	this.x = x+4;
	this.y = y+4;
	this.state = 0; //Étapes de destruction
	this.width = 50;
	this.height = 50;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.canAnim = true;
	this.destroy = function(){
		this.isDestroyed = true;
		this.state =5;
		updatingBackground = true;
	}
	this.draw = function(context){
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.state < 1) context.drawImage(imageTool.poop1, this.x-12, this.y-10, 78, 78);
		else if(this.state < 1.75) context.drawImage(imageTool.poop2, this.x-12, this.y-6, 78, 78);
		else if(this.state < 2.5) context.drawImage(imageTool.poop3, this.x-12, this.y-3, 78, 78);
		else if(this.state < 3.25) context.drawImage(imageTool.poop4, this.x-12, this.y, 78, 78);
		else { context.drawImage(imageTool.poop5, this.x-12, this.y-3, 78, 78);
			if(this.canAnim){
				/*sounds.bullet.currentTime = 0;
				sounds.bullet.play();*/
				if(!this.isDestroyed)createItem(this.x,this.y,"poop");
				tempAnimations.push(new Animation(7,this.x,this.y,200,200,45,imageTool.poopAnim,-58,-90,1));
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
		updatingBackground = true;
	}
	this.draw = function(context){
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.state < 1) context.drawImage(imageTool.barrel1, this.x-12, this.y-6, 82, 82);
		else if(this.state < 2) context.drawImage(imageTool.barrel2, this.x-12, this.y-6, 82, 82);
		else if(this.state < 3) context.drawImage(imageTool.barrel3, this.x-12, this.y-6, 82, 82);
		else {
			context.drawImage(imageTool.barrel4, this.x-12, this.y-6, 82, 82);
			if(this.canAnim){
				Game.Explosions.push(new Explosion(this.x+15,this.y+15));
				this.canAnim = false;}
			this.isColliding = false;}
		context.restore();
	}
}

function Hole(x,y,name){
	this.type = "hole";
	this.name = name;
	this.x = x;
	this.y = y;
	this.width = 58;
	this.height = 58;
	this.canBeDestroyed = false;
	this.isColliding = true;
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(imageTool[this.name], x-7, y+8, 74, 74);
		}
}

function Glue(x,y){
	this.type = "glue";
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.use = function(obj){
		if(obj == Player) obj.isSlowed = Date.now();
	}
	this.destroy = function(){
		this.isDestroyed = true;
	}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(!this.isDestroyed) context.drawImage(imageTool.glue, x-15, y-13, 96, 96);}
}

function Spikes(x,y){
	this.type = "spikes";
	this.x = x+5;
	this.y = y+9;
	this.dmg = 1;
	this.width = 50;
	this.height = 50;
	this.useTimer = 0;
	this.hasLooted = false;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.use = function(obj){
		if(obj == Player) obj.getDamage(this.dmg);
		else obj.getDamage(this.dmg);
		if(Game.type == "Sacrifice" && (Date.now() - this.useTimer > 1000)){
					
			if(!this.hasLooted) {
				var rand = getRand(5,1);
				if(rand==1){
					var subrand = getRand(4,1);
					if(subrand==1) loot("Health",x,x+100,Game,true)
					else if(subrand==2){ 
						var subsubrand = getRand(10,1);
						if(subsubrand == 1) Game.Items.push(new Chest(this.x,this.y+100,"Redchest"));
						else Game.Items.push(new Chest(this.x,this.y+100,"Chest"));
					}
				}
				if(rand==2){
					this.hasLooted = true;
					createItem(this.x+10,this.y+100,"Sacrifice")}
			}
			this.useTimer = Date.now();
		}
	}
	this.destroy = function(){	}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(!this.isDestroyed) context.drawImage(imageTool.spikes, x-8, y-3, 78, 78);}
}

function Fireplace(x,y,type){
	this.type= type;
	this.x = x+4;
	this.y = y+4;
	this.state = 0; //Étapes de destruction
	this.rand = getRand(50,1);
	this.fireAnim = new Animation(4,this.x,this.y,130,160,70,imageTool.fireplace,0,0,1);
	this.hellfireAnim = new Animation(4,this.x,this.y,130,160,70,imageTool.hellfireplace,0,0,1);
	this.img = imageTool.fireon;
	this.dmg = 0.5;
	this.attackSpeed = 3;
	this.lastFire = Date.now();
	this.fireRate = 4000;
	this.range = 1500;
	this.width = 45;
	this.height = 45;
	this.canLoot = true;
	this.canBeDestroyed = true;
	this.isDestroyed = false;
	this.isColliding = true;
	this.use = function(obj){
		if(obj == Player) obj.getDamage(this.dmg);
		else obj.getDamage(this.dmg);
	}
	this.destroy = function(){
		this.isDestroyed = true;
		this.state =5;
	}
	this.draw = function(context){
		if(this.type == "fireplace" && this.rand ==1) this.type = "hellfireplace";
		if(this.type =="fireplace") this.fireAnim.update(this.x-8,this.y-32); //Animation fire
		else {
			this.hellfireAnim.update(this.x-8,this.y-32); //Animation hellfire
			if(this.state < 4){
				this.dirx = (Player.x - Player.width) - (this.x -this.width/3);
				this.diry = (Player.y - Player.height*2) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = this.dirx/hyp;
				this.diry = this.diry/hyp;
				if(hyp <=350)this.attack();}
		}
		
		context.drawImage(this.img, this.x-4, this.y+16, this.width+12, this.height+12);
		if(hitBox){context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);}
		if(this.state < 4){
			if(this.type =="fireplace") this.fireAnim.draw(context);
			else this.hellfireAnim.draw(context);}
		else {
			this.img = imageTool.fireoff;
			if(this.canLoot){
				/*sounds.bullet.currentTime = 0;
				sounds.bullet.play();*/
				if(!this.isDestroyed)createItem(this.x,this.y,"fire");
				this.canLoot = false;}
				
			this.isColliding = false;}
		context.restore();
	}
	this.attack = function(){ 
		if(  Date.now() - this.lastFire > this.fireRate){ //compare le temps actuel avec le temps de la derniere attaque
			Game.enemyBullets.push(new enemyBullet(this.attackSpeed,this.range,this.x+10,this.y+10,this.dirx,this.diry,this.dmg,20));
			this.lastFire = Date.now();	}
	}

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
	this.projectileSliding = false;
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
		this.checkCollide(playerBullets);
		this.checkCollide(playerBulletsBack);
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

		//Projectile contact
		else if (this.projectileSliding){			
			this.projectileSliding = false;
			if(Date.now() - this.slidingTimer > 100){
				this.dirx = (this.explox - 13) - (this.x - this.width/2);
				this.diry = (this.exploy - 13) - (this.y - this.height/2);
				var hyp = Math.sqrt(this.dirx*this.dirx + this.diry*this.diry);
				this.dirx = Math.round(this.dirx/hyp);
				this.diry =  Math.round(this.diry/hyp);
				this.slidingTimer = Date.now();}
			this.speed = Player.attackSpeed-3;}
			
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
		else if(obj == playerBullets || obj == playerBulletsBack){
		for(var i=0;i<obj.length;i++){
			if(this.y < obj[i].y + obj[i].height &&
			this.y + this.height > obj[i].y &&
			this.x + this.width  > obj[i].x && 
			this.x < obj[i].x + obj[i].width ){
				this.projectileSliding = true;
				obj[i].alive = false;
				this.explox = obj[i].x;this.exploy = obj[i].y;}}
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
	this.width = 228;
	this.height = 164;
	this.x = (x-this.width/2) +20;
	this.y = y-this.height/2;
	this.frame = 0;
	this.alive = true;
	this.currentTimer= Date.now();
	this.timer = 80;
	this.canAnim = true;
	this.update = function(){
		if(this.frame < this.timer){
			this.frame ++;
			this.checkCollide(Game.collideMaps);
			this.checkCollide(Game.Doors);
			this.checkCollide(Game.traps);
			this.checkCollide(Game.Minions);
			this.checkCollide(Game.Towers);
			this.checkCollide(Game.Bosses);
			this.checkCollide(Player);
			updatingBackground = true;
		}
		if(Date.now() - this.currentTimer > this.timer){
			this.alive = false;
		}
	}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.canAnim){
			tempAnimations.push(new Animation(19,this.x,this.y-15,200,150,16,imageTool.explosion,0,0,1));
			Game.sprites.push(new Sprite(imageTool.explosionmark,this.x+10,this.y+50, 188, 100));
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

function shopItem(x,y){
	this.x = x+12;
	this.y = y+12;
	this.width = 32;
	this.height = 32;
	this.name = "";
	this.type = "";
	this.price =0;
	this.desc = " ";
	this.img = "";
	this.priceImg = "";
	this.isCreated = false;
	this.alive = true;
	this.create = function(){
		if(!this.isCreated){
			var rand = getRand(2,1); //Choix entre pickup et item
			//Items
			if(rand <2 && Game.currentShopPool.length >0){
				console.log('currentShopPool.length ' + Game.currentShopPool.length);
				var rand = getRand(Game.currentShopPool.length,0);
				console.log('Tentative de création dun item');
				this.name = Game.currentShopPool[rand];
				console.log('nom: ' +this.name);
				Game.currentShopPool.splice(rand,1);
				if(this.name == "The Compass"){this.desc = "Reveal rooms"; this.price = 15; this.priceImg = imageTool.price15; this.img = imageTool.thecompass;}
				else if(this.name == "Treasure Map"){this.desc = "Reveal floor";this.price = 15; this.priceImg = imageTool.price15; this.img = imageTool.treasuremap;
				}
			}
			//PickUps
			else{
				var rand = getRand(Game.currentPickupPool.length,0);
				this.name = Game.currentPickupPool[rand];
				Game.currentPickupPool.splice(rand,1);
				if(this.name == "Heart"){this.price = 3; this.priceImg = imageTool.price3; this.img = imageTool.health;}
				if(this.name == "Soul Heart"){this.price = 5; this.priceImg = imageTool.price5; this.img = imageTool.armor;}
				if(this.name == "Half Heart") {this.price = 3; this.priceImg = imageTool.price3; this.img = imageTool.halfhealth;}
				if(this.name == "Bomb"){this.price = 5; this.priceImg = imageTool.price5; this.img = imageTool.bomb;}
				if(this.name == "Key"){this.price = 5; this.priceImg = imageTool.price5; this.img = imageTool.key;}
			}
			this.isCreated = true;
			
			this.type = this.name;
			console.log('4 item ' + this.name + ' created');
		}
	}
	this.buy = function(){
		Player.gold -= this.price;
		Player.playLoot(this);
		this.alive = false;
	}
	this.use = function(){
		if(Player.gold >= this.price){
			if(this.name == "Heart"){
				if(Player.hp <12){
					if(Player.maxhp - Player.hp == 0.5){Player.hp += 0.5;}
					else if(Player.maxhp - Player.hp >= 1){ Player.hp++;}
					this.buy();}}
			if(this.name == "Half Heart"){
				if(Player.hp <12){
					if(Player.maxhp - Player.hp >= 0.5){Player.hp += 0.5;}
					this.buy();}}
			if(this.name == "Soul Heart"){Player.soul++;this.buy();}
			if(this.name == "Bomb"){if(Player.bombs < 99){Player.bombs++;this.buy();}}
			if(this.name == "Key"){if(Player.keys < 99){Player.keys++;this.buy();}}
			//Items
			if(this.name == "The Compass"){
				Player.TheCompass = true;
				this.buy();
				var a = shopPool.indexOf("The Compass");
				shopPool.splice(a,1);
				}
			if(this.name == "Treasure Map"){
				Player.TreasureMap = true;
				this.buy();
				var a = shopPool.indexOf("Treasure Map");
				shopPool.splice(a,1);
				}
		}
	}
	this.draw = function(context){
		this.create();
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.save();
		context.globalAlpha = 0.15;
		context.drawImage(imageTool.shadow, this.x-4, this.y, 40, 40);
		context.restore();
		context.drawImage(this.img, this.x-18, this.y-34, 70, 70);
		context.drawImage(this.priceImg, this.x-12, this.y+45, 60, 36);
	}
}

function TrapDoor(x,y){
	this.x = x+7;
	this.y = y+2;
	this.width = 50;
	this.height = 30;
	this.canBeUsed = false;
	this.isSpawned = false;
	this.spawntimer;
	this.alive = true;
	this.update = function(){}
	this.use = function(){		
		if(floorCount>2) this.canBeUsed = false;
		
		if(this.canBeUsed){
			this.canBeUsed = false;
			changeFloor();}}
	this.draw = function(context){
		if(!this.isSpawned && !this.canBeUsed && Game.combatMode ==0){this.isSpawned = true; this.spawntimer=Date.now();}
		if(Date.now() - this.spawntimer > 1000)	this.canBeUsed = true;
		
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		
		if(floorCount<=2 && this.isSpawned){
			context.drawImage(imageTool.trapdoor,this.x-7,this.y,64,64);}
	}
}

function Chest(x,y,type){
	this.type =type;
	this.x = x+10;
	this.y = y+20;
	this.dirx=0;
	this.diry=0;
	this.speed =0;
	this.width = 40;
	this.height = 40;
	this.redRand = getRand(10,1);
	this.redLoot = getRand(3,1);
	this.moneyRand = getRand(3,3);
	this.pickupRand = getRand(2,1);
	this.bonusRand = getRand(4,1);
	this.slidingTimer=0;
	this.PlayerSliding = false;
	this.ExploSliding=false;
	this.canBeUsed = true; //Fermé ou ouvert
	this.alive = true;
	this.isColliding=true;
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
			this.speed = 4;}
		else if(this.speed > 0) this.speed -= this.speed/10;
		
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
	this.use = function(){
		if(this.canBeUsed){
			this.canBeUsed = false;
			
			if(this.type == "Chest"){
				for(var i =0; i < this.moneyRand; i++){	loot("Money",this.x+(4*i),this.y+(4*i),Game,true);}
				
				if(this.pickupRand == 1) Game.Items.push(new Item(x+12,y+12,"Bomb",true));
				else if(this.pickupRand == 2) Game.Items.push(new Item(x,y,"Key",true));
		
				//this.alive = false;
			}
			else if(this.type =="Redchest"){
				if(this.redLoot == 1 && chestPool.length > 0){ //ITEM
					var redItem = getRand(chestPool.length,0);
					console.log(chestPool[redItem]);
					Game.Items.push(new Item(this.x+20,this.y-50,chestPool[redItem],true));
					chestPool.splice(redItem,1);
				}
				else if(this.redLoot == 2){ // SPIDERS OU BOMBES
					var badRand = getRand(2,1);
					
					for(var i = 0; i< 2; i++){
						if(badRand ==1){
							Game.combatMode = 1;
							Game.Minions.push(new Spider(this.x+10+(30*i),this.y+80,1+floorCount/2,"spider",true));}
						else if(badRand ==2) Game.Bombs.push(new Bomb("normal",this.x-20+(60*i),this.y+15));
					}
				}
				else{ //SOULHEART
					var soulRand = getRand(2,1);
					for(var i = 0; i<soulRand; i++){
						Game.Items.push(new Item(this.x+10+(30*i),this.y-50,"Soul Heart",true));
					}
				}
			}
		}
	}
	this.draw = function(context){
		if(this.type=="Chest"){
			if(this.redRand == 1) this.type ="Redchest";
			else this.type ="Chest";}
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		if(this.type == "Chest"){
			if(this.canBeUsed) context.drawImage(imageTool.chest,this.x-12,this.y-6,62,62);
			else context.drawImage(imageTool.chestopen,this.x-12,this.y-6,62,62);
		}
		else if(this.type == "Redchest"){
			if(this.canBeUsed) context.drawImage(imageTool.redchest,this.x-12,this.y-6,62,62);
			else context.drawImage(imageTool.redchestopen,this.x-12,this.y-6,62,62);
		}
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

//Shopkeeper GREED
function Shopkeeper(img,x,y,width,height){
	this.x = x;
	this.y = y+65;
	this.type = "Shopkeeper";
	this.width = width;
	this.height = height;
	this.img = img;
	this.isColliding=true;
	this.use = function(){}
	this.update = function(){}
	this.draw = function(context){
		if(hitBox)context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(this.img,this.x-6,this.y-300,75,325);
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
	this.dir = getRand(4,1);
	this.update = function(){
		if(!bossroom){
			if(this.y < this.tary) {
				updatingBackground = true;
				this.y += this.speed;
				switch(this.dir){
					case 1: this.x++;break;
					case 2: this.x--;break;
					case 3: this.x-=2;break;
					case 4: this.x+=2; break;
				}
			}
		}
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


//
//
// Niveau (Objet principal)
function Room(type,map,locy,locx,title){
	this.type = type;
	this.title = title;
	this.locy = locy; //Position Y dans l'array d'étage
	this.locx = locx; // Position X dans l'array d'étage
	this.grid = [];
	this.overlayRand = getRand(3,1);
	this.currentPickupPool = [];
	this.currentShopPool = [];
	this.shop = [];
	this.Minions = []; //Monstres errants
	this.Towers = []; //Monstres fixes
	this.enemyBullets = [];
	this.collideMaps = []; //Objets infranchissables par le joueur et par les projectiles
	this.wallMaps = []; //Murs invisibles
	this.traps = []; // Pièges
	this.holeMaps = []; //Objets franchissables par les projectiles et certains Monstres, mais pas par le joueur
	this.freeCells = []; //Espace libre, franchissable par tout
	this.Items = []; // Drops, gold, boosts, hp, tout objets
	this.Doors = []; // Permet de transitionner entre les salles
	this.Bombs = [];
	this.Explosions = [];
	this.Bosses = []; 
	this.overSprites = []; //Image fixes flottantes
	this.sprites = []; //Images fixes, sang, taches, etc
	this.enemies = 0; //Total d'ennemies présents
	this.combatMode = 1; //Mode de combat
	this.lootx = 0; //Positionx du loot de room
	this.looty = 0; //Positiony du loot de room
	this.canSpawnLoot = false; // Détermine si la room peut donner du loot ou pas
	this.exists = true; //Propriété pour filtrer l'array des salles existantes et des emplacements vides
	this.isVisited = false; //Minimap, la salle a été visité
	this.isCurrent = false; //Minimap, la salle actuelle
	this.isVisible = false; //Minimap, la salle est visible (adjacente à une salle visitée, ou le joueur possède une carte)
	this.iconVisible = false;  //Minimap, l'icone de la salle est visible (adjacente à une salle visitée, ou le joueur possède une boussole)
	this.coinPresent = false;
	this.keyPresent = false;
	this.chestPresent = false;
	this.bombPresent = false;
	this.hpPresent = false;
	this.map = map; //Tileset
	this.shopCreate = function(){
		if(this.type=="Shop"){
			this.currentPickupPool = ["Key","Bomb","Heart","Soul Heart","Half Heart"];
			this.currentShopPool = shopPool;
			
			console.log('this.currentPickupPool.length = ' + this.currentPickupPool.length);
			console.log('this.currentShopPool.length = ' + this.currentShopPool.length);
			
			this.shop = [];
			
			for(var i=0,y=0; i< this.map.length; i++,y+=64){
				for(var j=0,x=0; j< this.map[i].length; j++,x+=64){
					if(this.map[i][j] == "Sh") this.shop.push(new shopItem(x,y));
				}
			}
			//for(var p = 0; p< this.shop.length; p++){
			//	this.shop[p].create();}
		}
	}
	this.create= function(){	
		for(var i=0,y=0; i< this.map.length; i++,y+=64){
			this.grid[i] = new Array(this.map[i].length);
			for(var j=0,x=0; j< this.map[i].length; j++,x+=64){
			var locked =false;
				this.grid[i][j]=0;
				if(this.map[i][j] == "Pl") {this.freeCells.push(new freeCell(x,y));Player.x=x+15;	Player.y=y;
				if(floorCount ==1)this.sprites.push(new Sprite(imageTool.tutorial,130,100, 700, 238));}
				//PORTES
				else if(this.map[i][j] == "+L") {
					if(this.locx > 0){
						if(currentFloor[this.locy][this.locx-1].exists){
							if((currentFloor[this.locy][this.locx-1].type=="Treasure" && floorCount > 1) ||
							currentFloor[this.locy][this.locx-1].type=="Shop" ||
							currentFloor[this.locy][this.locx-1].type=="Cursed") locked = true;
							else locked = false;
							this.Doors.push(new Door(x,y,"left",currentFloor[this.locy][this.locx-1].type,locked));}
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));}
					
					
				else if(this.map[i][j] == "+R") {
					if(this.locx < currentFloor[this.locy].length-1){
						if(currentFloor[this.locy][this.locx+1].exists){
							if((currentFloor[this.locy][this.locx+1].type=="Treasure" && floorCount > 1) ||
							currentFloor[this.locy][this.locx+1].type=="Shop" ||
							currentFloor[this.locy][this.locx+1].type=="Cursed") locked = true;
							else locked = false;
							this.Doors.push(new Door(x,y,"right",currentFloor[this.locy][this.locx+1].type,locked));}
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
					
					
				else if(this.map[i][j] == "+U") {
					if(this.locy > 0){
						if(currentFloor[this.locy-1][this.locx].exists){
							if((currentFloor[this.locy-1][this.locx].type=="Treasure" && floorCount > 1) ||
							currentFloor[this.locy-1][this.locx].type=="Shop" ||
							currentFloor[this.locy-1][this.locx].type=="Cursed") locked = true;
							else locked = false;
							this.Doors.push(new Door(x,y,"up",currentFloor[this.locy-1][this.locx].type,locked));}
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
					
					
				else if(this.map[i][j] == "+D") {
					if(this.locy < currentFloor.length-1){
						if(currentFloor[this.locy+1][this.locx].exists){
							if((currentFloor[this.locy+1][this.locx].type=="Treasure" && floorCount > 1) ||
							currentFloor[this.locy+1][this.locx].type=="Shop" ||
							currentFloor[this.locy+1][this.locx].type=="Cursed") locked = true;
							else locked = false;
							this.Doors.push(new Door(x,y,"down",currentFloor[this.locy+1][this.locx].type,locked));}
						else this.wallMaps.push(new Wall(x,y));}
					else this.wallMaps.push(new Wall(x,y));	}
				//Obstacles
				else if(this.map[i][j] == "  ") {	this.freeCells.push(new freeCell(x,y)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Tg") {	this.traps.push(new Glue(x,y)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Ts") {	this.traps.push(new Spikes(x,y)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "!!") {	this.wallMaps.push(new Wall(x,y));this.grid[i][j]=0;}
				else if(this.map[i][j] == "Bl") {	this.collideMaps.push(new Block(x,y));this.grid[i][j]=0;}
				else if(this.map[i][j] == "Oo") {	this.collideMaps.push(new Poop(x,y));this.grid[i][j]=0;}
				else if(this.map[i][j] == "Tn") {	this.collideMaps.push(new Tnt(x,y));this.grid[i][j]=0;}
				else if(this.map[i][j] == "Tf") {	this.collideMaps.push(new Fireplace(x,y,"fireplace")); this.grid[i][j]=0;}
				else if(this.map[i][j] == "Th") {	this.collideMaps.push(new Fireplace(x,y,"hellfireplace")); this.grid[i][j]=0;}
				else if(this.map[i][j] =="HA" || this.map[i][j] =="HB" || this.map[i][j] =="HC" || this.map[i][j] =="HD" ||
						this.map[i][j] =="HE" || this.map[i][j] =="HF" || this.map[i][j] =="HG" || this.map[i][j] =="HH" ||
						this.map[i][j] =="HI" || this.map[i][j] =="HJ" || this.map[i][j] =="HK" || this.map[i][j] =="HL" ||
						this.map[i][j] =="HM" || this.map[i][j] =="HN" || this.map[i][j] =="HO" || this.map[i][j] =="HP"){	this.holeMaps.push(new Hole(x,y,this.map[i][j]));this.grid[i][j]=0;}
				//Ennemis
				else if(this.map[i][j] == "Sp") {	this.Minions.push(new Spider(x+15,y+25,1+floorCount*2/3,"spider",true)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Sb") {	this.Minions.push(new Spider(x+15,y+25,3+floorCount*2/3,"buttspider",true)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Zo") {	this.Minions.push(new Zombie(x+10,y+20,3+floorCount*2/3)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Cl") {	this.Minions.push(new Clotty(i,j,x+10,y+20,5+floorCount*2/3)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Ma") {	this.Minions.push(new Maggot(i,j,x+10,y+20,3+floorCount*2/3)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Fl") {	this.Minions.push(new Fly(x,y,1+floorCount*2/3,"Black",true)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Af") {	this.Minions.push(new Fly(x,y,1+floorCount*2/3,"Attack",true)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "Pf") {	this.Minions.push(new Fly(x,y,2+floorCount*2/3,"Pooter",true)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "To") {	this.Towers.push(new Tower(x,y,4+floorCount*2/3,true)); this.grid[i][j]=1;}
				//Bosses
				else if(this.map[i][j] == "X1") {	this.Bosses.push(new Duke(x,y,70,1)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "X3") {	this.Bosses.push(new Duke(x,y,120,2)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "X2") {	this.Bosses.push(new Project(422,230,180)); this.grid[i][j]=1;}
				else if(this.map[i][j] == "ZZ") {	this.Items.push(new TrapDoor(x,y));this.grid[i][j]=1;}
				//Shopkeeper
				else if(this.map[i][j] == "Sk") {	
					var skimg = "shopkeeper"+getRand(9,1);
					this.overSprites.push(new Shopkeeper(imageTool[skimg],x,y,60,20)); this.grid[i][j]=1;}
				//Items
				else if(this.map[i][j] == "CC") {	this.Items.push(new Chest(x,y,"Chest"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "RC") {	this.Items.push(new Chest(x,y,"Redchest"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "XY") {	this.lootx = x+10; this.looty = y+10;this.canSpawnLoot=true; this.grid[i][j]=1;}
				else if(this.map[i][j] == "00") {	loot("Health",x+10,y+10,this);this.grid[i][j]=1;}
				else if(this.map[i][j] == "01") {	loot("Money",x+10,y+10,this);this.grid[i][j]=1;}
				else if(this.map[i][j] == "02") {	this.Items.push(new Item(x+16,y+16,"Bomb"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "03") {	this.Items.push(new Item(x+16,y+16,"Key"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "04") {	this.Items.push(new Item(x+16,y+16,"Number One"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "05") {	this.Items.push(new Item(x+16,y+16,"Wiggle Worm"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "06") {	this.Items.push(new Item(x+16,y+16,"The Halo"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "07") {	this.Items.push(new Item(x+16,y+16,"Pyro"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "08") {	this.Items.push(new Item(x+16,y+16,"Jesus Juice"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "09") {	this.Items.push(new Item(x+16,y+16,"Wire Coat Hanger"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "10") {	this.Items.push(new Item(x+16,y+16,"Speed Ball"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "11") {	this.Items.push(new Item(x+16,y+16,"The Small Rock"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "12") {	this.Items.push(new Item(x+16,y+16,"Mom's Lipstick"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "13") {	this.Items.push(new Item(x+16,y+16,"The Inner Eye"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "14") {	this.Items.push(new Item(x+16,y+16,"Tooth Picks"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "15") {	this.Items.push(new Item(x+16,y+16,"Growth Hormones"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "16") {	this.Items.push(new Item(x+16,y+16,"<3"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "17") {	this.Items.push(new Item(x+16,y+16,"Skeleton Key"));this.grid[i][j]=1;}
				else if(this.map[i][j] == "18") {	this.Items.push(new Item(x+16,y+16,"The Belt"));this.grid[i][j]=1;}
				
				for(var d = 0; d< this.Doors.length; d++){
				this.Doors[d].isDestroyed = false;
				if(this.Doors[d].type =="Cursed" || this.type == "Cursed"){
					this.Doors[d].type = "Cursed";
					this.Doors[d].locked = true;
					this.Doors[d].isColliding = true;}
				}
			}
		}
	}
	this.update = function(){
	
		//Détection items laissés dans les salles
		this.coinPresent = false;
		this.keyPresent = false;
		this.chestPresent = false;
		this.bombPresent = false;
		this.hpPresent = false;
		
		for(var i = 0; i<this.Items.length; i++){
			if(this.Items[i].type== "Half Heart" || this.Items[i].type== "Heart" || this.Items[i].type== "Soul Heart") this.hpPresent = true;
			else if(this.Items[i].type== "Nickel" || this.Items[i].type== "Coin" || this.Items[i].type== "Dime")  this.coinPresent = true;
			else if(this.Items[i].type== "Chest" || this.Items[i].type== "Redchest") {
				if(this.Items[i].canBeUsed) this.chestPresent = true;}
			else if(this.Items[i].type== "Key")  this.keyPresent = true;
			else if(this.Items[i].type== "Bomb")  this.bombPresent = true;
		}
	
	
	
	
		for(var k=0; k<this.sprites.length;k++){
			this.sprites[k].update();			}	
	for(var k=0; k<this.overSprites.length;k++){
			this.overSprites[k].update();			}			
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
			if( !this.Bosses[xb].alive ){ this.Bosses.splice(xb,1);gameStats.kill++;}}			
		for(var i=0;i<this.Minions.length;i++){
			this.Minions[i].update();
			if( !this.Minions[i].alive ){ this.Minions.splice(i,1);gameStats.kill++;}}				
		for(var t=0;t<this.Towers.length;t++){
			this.Towers[t].update();
			if( !this.Towers[t].alive ){this.Towers.splice(t,1);gameStats.kill++;}}	
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
		for(var tb=0;tb<this.collideMaps.length;tb++){
			if(this.collideMaps[tb].type == "Chest" || this.collideMaps[tb].type == "Redchest")this.collideMaps[tb].update();}
			
		this.enemies = this.Minions.length + this.Towers.length + this.Bosses.length;
		if(this.enemies <=0){
			if(this.canSpawnLoot){
				createItem(this.lootx,this.looty,this.type,false);
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
		context.clearRect(0,0,canvas.width,canvas.height);
		if(hitBox){context.globalAlpha = 0.5;}
		else context.globalAlpha = 1;
		
		//Éléments décor
		if(updatingBackground){
			
			var bgcanvas = getEl("bgcanvas");
			var bgcontext = bgcanvas.getContext('2d');
			bgcontext.clearRect(0,0,bgcanvas.width,canvas.height);
			
			Background.draw(bgcontext);
			for(var k=0;k<this.sprites.length;k++){this.sprites[k].draw(bgcontext);}
			for(var d=0;d<this.Doors.length;d++){this.Doors[d].draw(bgcontext);}
			for(var c=0;c<this.collideMaps.length;c++){
				if(this.collideMaps[c].type!="fireplace" && this.collideMaps[c].type!="hellfireplace")this.collideMaps[c].draw(bgcontext);}
			for(var h=0;h<this.holeMaps.length;h++){this.holeMaps[h].draw(bgcontext);}
			
			bgcontext.drawImage(imageTool.uinote, -60, canvas.height-30, 300, 40);
			bgcontext.font = "12pt wendy";
			bgcontext.fillStyle = 'white';
			if(this.type =="Room"){
				if(floorCount ==1) var floorname = "Basement " + this.title;
				else if(floorCount ==2) var floorname = "Caves "+ this.title;
				else if(floorCount ==3) var floorname = "The Depths "+ this.title;}
			else floorname = this.title;
			bgcontext.fillText(floorname,8, canvas.height-8);
		}
		for(var c=0;c<this.collideMaps.length;c++){
			if(this.collideMaps[c].type=="fireplace" || this.collideMaps[c].type=="hellfireplace")this.collideMaps[c].draw(context);}
		
		if(Player.textShowing){
				context.save();
				context.fillStyle = 'white';
				context.textAlign = 'center';
				context.font = "20pt wendy";
				context.drawImage(imageTool.uibar, 0,0, 960, 60);
				context.fillText(Player.itemHoldingName,canvas.width/2 ,35);
				if(Player.itemHoldingDesc !=" ")	{
					context.font = "12pt wendy";
					context.textAlign = 'right';
					context.drawImage(imageTool.uinote, canvas.width-240, canvas.height-30, 300, 40);
					context.fillText(Player.itemHoldingDesc,canvas.width-8, canvas.height-8);
				}
			context.restore();
		}
		
		//Items et traps
		for(var t=0;t<this.traps.length;t++){this.traps[t].draw(context);}
		for(var u=0;u<this.Items.length;u++){this.Items[u].draw(context);}	
		for(var s=0;s<this.shop.length;s++){
			this.shop[s].draw(context);
			if(!this.shop[s].alive)this.shop.splice(s,1);}	
		
		//GAME OVER
		if(gameOver){
			context.save();
			if(gameOverOpac < 0.8) gameOverOpac +=0.03;
			context.globalAlpha = gameOverOpac;
			context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
			context.drawImage(imageTool.deathlight, Player.x-60, Player.y-430,150, 500);
			context.restore();
		}
		
		//Monstres et joueur
		Player.drawBody(context);
		
		if(!gameOver){
			for(var i=0;i<this.Minions.length;i++){
				if(this.Minions[i].type !="Eye")this.Minions[i].draw(context);}
			for(var t=0;t<this.Towers.length;t++){this.Towers[t].draw(context);}
			for(var b=0;b<playerBulletsBack.length;b++){playerBulletsBack[b].draw(context);}
			for(var u=0;u<this.Bombs.length;u++){this.Bombs[u].draw(context);}}
			
		Player.drawHead(context);
		
		if(!gameOver){
			for(var xb=0;xb<this.Bosses.length;xb++){this.Bosses[xb].draw(context);}
			for(var u=0;u<this.Explosions.length;u++){this.Explosions[u].draw(context);}	
			for(var tb=0;tb<this.enemyBullets.length;tb++){this.enemyBullets[tb].draw(context);}
			//Minions par dessus joueurs et boss
			for(var i=0;i<this.Minions.length;i++){
				if(this.Minions[i].type =="Eye")this.Minions[i].draw(context);}
			for(var j=0;j<playerBullets.length;j++){playerBullets[j].draw(context);}
			//Animations (sang, explosion etc)
			for(var s=0; s<tempAnimations.length;s++) tempAnimations[s].drawOnce(context);}		
			
		//Sprites flottants 
		for(var s=0; s<this.overSprites.length;s++) this.overSprites[s].draw(context);		
		
		//Game Over Screen
		if(gameOver){
			if(Date.now() - gameOverTime > 1000){
			context.drawImage(imageTool.gameover, 260,40,670, 500);
			context.save();
			context.font = "14pt danielbk";
			context.textAlign = 'left';
			context.fillStyle = 'black';
			context.rotate(6*Math.PI/180);
			context.globalAlpha = 0.65;
			context.fillText(gameStats.rooms-1,500,162);
			context.fillText(gameStats.kill,405,203);
			context.fillText(gameStats.bullet,452,242);
			var hitpercent = (gameStats.hit / gameStats.bullet)*100;
			if(isNaN(hitpercent)) hitpercent =0;
			context.fillText(hitpercent.toFixed(),402,281);
			context.restore();

			}
		}
		//UI
		Player.drawUI(context,uicontext);
		
		//Debug
		if(hitBox){
			context.font = "12pt Arial";
			context.fillStyle = 'white';
			//context.fillText("BOSS: "+this.Bosses.length,5,15);
			//context.fillText("MINIONS: "+this.Minions.length,5,35);
			context.fillText("MODE: "+this.combatMode,5,55);
			context.fillText("Phase: "+this.Bosses[0].phase,5,75);
			context.fillText("X: "+this.Bosses[0].dirx.toFixed(2),5,95);
			context.fillText("Y: "+this.Bosses[0].diry.toFixed(2),5,115);
			context.fillText("Tail: "+this.Bosses[0].tail.length,5,135);
			for(var i = 0; i < this.Bosses[0].tail.length; i++){
				context.fillText("Tail["+i+"]: HYP :"	+this.Bosses[0].tail[i].hyp.toFixed(2)  + " - POS : " +this.Bosses[0].tail[i].position + " - LEADER : " +this.Bosses[0].tail[i].leaderpos
											,5,195+(i*20));
			}
			
		}
		
		//Pause
		if(isPaused){
			context.save();
			context.globalAlpha = 0.7;
			context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
			context.restore();
			context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);
		}
			updatingBackground = false;
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
// Fin Niveau
//
//

var gameStats = {
	bullet:0,
	hit:0,
	kill:0,
	rooms:0
};

function getRand(nbPos,nbDep){ return Math.floor(Math.random()*nbPos + nbDep);}
function getEl(id){ return document.getElementById(id);}
function toRad(angle) { return angle * (Math.PI / 180);}
console.log('game.js loaded');