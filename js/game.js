//Variables globales et Arrays
//PAUSE
var isPaused = true, lastPaused = Date.now();
//FPSCOUNTER
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;

var lastFire = Date.now();
var playerBullets = [];
var playerBulletsBack = [];
var Animations = [];
var tempAnimations = [];
var Gamelevel;
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
	generateDungeon();
	Gamelevel = Dungeon[currentLevel];
	createAnimations();
	keyboardEvent();
	animFrame(recursiveAnim);
}

var Dungeon = [];
var currentLevel = 0;
function generateDungeon(){
	Dungeon[0] =  new Level(mapGenerator[0]);
	Dungeon[1] =  new Level(mapGenerator[1]);
	Dungeon[2] =  new Level(mapGenerator[2]);
	Dungeon[3] =  new Level(mapGenerator[3]);
	
	for(var i=0; i<Dungeon.length;i++) Dungeon[i].create();
}

function createAnimations(){ //(maxframe,x,y,width,height,updatetime,spritesheet,offsetx,offsety)
	Animations[0] = new Animation(7,Player.x,Player.y,100,80,55,imageTool.bodyAnim,-5,13);
	Animations[1] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyRight,-7,13);
	Animations[2] = new Animation(9,Player.x,Player.y,100,80,50,imageTool.bodyLeft,-3,13);}

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
	context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);
}

// Loop du jeu
function mainloop(){
	if( !gameIsPaused() && Player.alive ){
		Gamelevel.update();
		Gamelevel.clear();
		Player.update();
		if(keyW || keyS){Animations[0].update();}
		if(keyD){Animations[1].update();}
		if(keyA){Animations[2].update();}
		
		//Sang
		for(var s=0; s<tempAnimations.length;s++) tempAnimations[s].playOnce();
	}
	drawGame();
	//fps calcul
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}

//Affichage
function drawGame(){
	//Definition contexte canvas
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);
	
	
	
	/*Ordre de draw
	1-LEVEL
	Background
	Éléments du sol
	Sprites de débris && sang
	Obstacles
	2-PLAYER & MONSTRES
	Ombres
	Animations de corps
	Têtes
	3-PROJECTILES
	Animations de projectiles et impacts
	Projectiles	*/
	
	//Éléments
	Background.draw(context);
	for(var k=0;k<Gamelevel.sprites.length;k++){Gamelevel.sprites[k].draw(context);}
	for(var d=0;d<Gamelevel.Doors.length;d++){Gamelevel.Doors[d].draw(context);}
	for(var c=0;c<Gamelevel.collideMaps.length;c++){Gamelevel.collideMaps[c].draw(context);}
	for(var h=0;h<Gamelevel.holeMaps.length;h++){Gamelevel.holeMaps[h].draw(context);}
	for(var u=0;u<Gamelevel.Items.length;u++){Gamelevel.Items[u].draw(context);}

	Player.drawBody(context);
	for(var i=0;i<Gamelevel.Minions.length;i++){Gamelevel.Minions[i].draw(context);}
	for(var b=0;b<playerBulletsBack.length;b++){playerBulletsBack[b].draw(context);}
	Player.drawHead(context);
	for(var xb=0;xb<Gamelevel.Bosses.length;xb++){Gamelevel.Bosses[xb].draw(context);}
	for(var j=0;j<playerBullets.length;j++){playerBullets[j].draw(context);}
	
	//Sang
	for(var s=0; s<tempAnimations.length;s++) tempAnimations[s].drawOnce(context);
	
	for(var t=0;t<Gamelevel.Towers.length;t++){Gamelevel.Towers[t].draw(context);}
	for(var tb=0;tb<Gamelevel.towerBullets.length;tb++){Gamelevel.towerBullets[tb].draw(context);}
	//UI
	//Écran de pause
	if( gameIsPaused() ) pauseScreen(context);
	Player.drawUI(context);
}

//Image de fond
var Background = {
	x: 0, y: 0,	height: 576, width: 960,
	draw : function(context){
		context.drawImage(imageTool.background, this.x, this.y, this.width, this.height);
	}
};

var mapGenerator = [
	[
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","D+"],
		["!!","  ","  ","  ","  ","  ","  ","Pl","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"]
	],
	[
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"],
		["!!","  ","  ","  ","Ho","  ","  ","  ","  ","  ","Ho","To","  ","  ","!!"],
		["!!","  ","  ","  ","Ho","  ","  ","  ","  ","  ","Ho","  ","  ","  ","!!"],
		["!!","  ","  ","  ","Ho","  ","  ","  ","  ","  ","Ho","  ","  ","  ","!!"],
		["D-","  ","  ","  ","Ho","  ","  ","Ho","  ","  ","Ho","To","  ","  ","D+"],
		["!!","  ","  ","  ","  ","  ","  ","Ho","  ","  ","Ho","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","Ho","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","Ho","  ","  ","  ","To","  ","  ","!!"],
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"]
	],
	[
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"],
		["!!","  ","  ","  ","Bl","Bl","Bl","Bl","Bl","Bl","Bl","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","Mi","  ","Mi","  ","Mi","Bl","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","Bl","  ","  ","  ","!!"],
		["D-","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","D+"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","Bl","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","Mi","  ","Mi","  ","Mi","Bl","  ","  ","  ","!!"],
		["!!","  ","  ","  ","Bl","Bl","Bl","Bl","Bl","Bl","Bl","  ","  ","  ","!!"],
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"]
	],
	[
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["D-","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","X1","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
		["!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!","!!"]
	]
];

// Niveau
function Level(map){
	this.Minions = []; //Monstres errants
	this.Towers = []; //Monstres fixes
	this.towerBullets = [];
	this.collideMaps = []; //Objets infranchissables par le joueur et par les projectiles
	this.holeMaps=[]; //Objets franchissables par les projectiles et certains Monstres, mais pas par le joueur
	this.freeCells = []; //Espace libre, franchissable par tout
	this.Items = []; // Drops, gold, boosts, hp, tout objets
	this.Doors = []; // Permet de transitionner entre les salles
	this.Bosses = [];
	this.sprites = [];
	this.enemies = 0;
	this.combatMode = 1;
	
	this.map = map; 
	this.create= function(){
		for(var i=0,y=0; i< this.map.length; i++,y+=64){
			for(var j=0,x=0; j< this.map[i].length; j++,x+=64){ 
				if(this.map[i][j] == "Pl") {	Player.x=x;	Player.y=y;}
				if(this.map[i][j] == "D-") {	this.Doors.push(new Door(x,y,"previous"));}
				if(this.map[i][j] == "D+") {	this.Doors.push(new Door(x,y,"next"));}
				if(this.map[i][j] == "  ") {	this.freeCells.push(new freeCell(x,y));}
				if(this.map[i][j] == "!!") {	this.collideMaps.push(new Wall(x,y));}
				if(this.map[i][j] == "Bl") {	this.collideMaps.push(new Block(x,y));}
				if(this.map[i][j] == "Ho") {	this.holeMaps.push(new Hole(x,y));}
				if(this.map[i][j] == "Mi") {	this.Minions.push(new Minion(x,y,1));}
				if(this.map[i][j] == "Fl") {	this.Minions.push(new Fly(x,y,1));}
				if(this.map[i][j] == "To") {	this.Towers.push(new Tower(x,y,1));}
				if(this.map[i][j] == "01") { 	this.Items.push(new Item(x+16,y+16,1));} //Gold
				if(this.map[i][j] == "02") {	this.Items.push(new Item(x+16,y+16,2));} //Health
				if(this.map[i][j] == "03") {	this.Items.push(new Item(x+16,y+16,3));} //Max Health
				if(this.map[i][j] == "X1") {	this.Bosses.push(new Boss(x,y,1));}
			}
		}
	}
	this.update = function(){
		for(var k=0; k<this.sprites.length;k++){
			this.sprites[k].update();			}
			
		for(var u=0;u<this.Items.length;u++){
			this.Items[u].update();
			if( !this.Items[u].alive ) this.Items.splice(u,1);}
					
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
			if( !playerBullets[j].alive ) playerBullets.splice(j,1);}
			
		for(var b=0;b<playerBulletsBack.length;b++){
			playerBulletsBack[b].update();
			if( !playerBulletsBack[b].alive ) playerBulletsBack.splice(b,1);}
			
		for(var tb=0;tb<this.towerBullets.length;tb++){
			this.towerBullets[tb].update();}
			
		this.enemies = this.Minions.length + this.Towers.length + this.Bosses.length;
		if(this.enemies ==0) this.combatMode = 0;
		else if(this.Bosses !=0) this.combatMode = 2;
		else this.combatMode = 1;
	}
	
	this.clear = function(){
		for(var i = 0; i<  this.towerBullets.length; i++){
		if (!this.towerBullets[i].alive)this.towerBullets.splice(i,1);}
	}
}

function freeCell(x,y){
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
	this.draw = function(context){
	var offset = 0;
		if(this.type == "previous") {
			offset = 15;
			if(Gamelevel.combatMode!=0)this.img = imageTool.doorLclosed;
			else this.img = imageTool.doorL;}
		else if(this.type == "next") {
			offset = -5;
			if(Gamelevel.combatMode!=0)this.img = imageTool.doorRclosed;
			else this.img = imageTool.doorR;}
		context.drawImage(this.img, this.x+offset, this.y-20, 54, 104);	
	}
}

function Wall(x,y){
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.draw = function(context){}
}
function Block(x,y){
	this.x = x;
	this.y = y;
	this.rand = getRand(3,1);
	this.width = 64;
	this.height = 64;
	this.draw = function(context){
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		switch(this.rand){
			case 1: context.drawImage(imageTool.block, this.x, this.y-5, 64, 80);;break;
			case 2: context.drawImage(imageTool.block1, this.x, this.y-5, 64, 80);;break;
			case 3: context.drawImage(imageTool.block2, this.x, this.y-5, 64, 80);;break;
			default: context.drawImage(imageTool.block, this.x, this.y-5, 64, 80);;break;}}
}
function Hole(x,y){
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.draw = function(context){
		//context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
		context.drawImage(imageTool.hole, x, y, 64, 64);	}
}

function Blood(x,y,tary){
	this.x = x;
	this.y = y;
	this.tary = tary;
	this.speed = 6;
	this.width = 40;
	this.height = 30;
	this.rand = getRand(3,1);
	this.dir = getRand(5,1);
	this.update = function(){
		if(this.y < this.tary) {
			this.y += this.speed;
			switch(this.dir){
				case 1: this.x++;break;
				case 2: this.x--;break;
				case 3: this.x-=2;break;
				case 4: this.x+=2; break;
				default: ;}}
	}
	this.draw = function(context){
		switch(this.rand){
			case 1: context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);;break;
			case 2: context.drawImage(imageTool.blood2, this.x, this.y, this.width, this.height);;break;
			case 3: context.drawImage(imageTool.blood3, this.x, this.y, this.width, this.height);;break;
			default: context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);;break;}}
	
}

function bleed(nb,x,y,tary,height,width,ox,oy,scale){
	for(var l = 0; l <  nb; l++){
		var randx = getRand(ox,-ox/2);
		var randy = getRand(oy,-oy/2);
		Gamelevel.sprites.push(new Blood(x-randx,y,tary-randy));}
	tempAnimations.push(new Animation(7,x,y,200,200,30,imageTool.bloodAnim,ox,oy,scale));}
	
	


function getRand(nbPos,nbDep){ return Math.floor(Math.random()*nbPos + nbDep);}
function getEl(id){ return document.getElementById(id);}