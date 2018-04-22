		
	    var img;
		var imgFairy;
		var imgSpell;
 
			
		//EaselJS Stage instance that wraps the Canvas element
		var stage;
		//EaselJS Shape instance that we will animate
		var circle;
		var newCircle;
		var newLine;
		//radius of the circle Graphics that we will draw.
		var CIRCLE_RADIUS = 10;
		//x position that we will reset Shape to when it goes off
		//screen
		var circleXReset;
		//EaselJS Rectangle instance we will use to store the bounds
		//of the Canvas
		var bounds;
		var bitmapFairy;
		var bitmapFairy2;
		var canvasOffset;
		var canvasWrapper;
		var canvasOverlayWrapper;
		var lineGraphics;
		var Mouse = {x:0,y:0}; //mouse 
		var myPoint = {x:0,y:0};
		var myOrigin = {x:320,y:479};
	    var vectorOne = {x:0,y:0};
		var vectorTwo = {x:0,y:0};
		
		var canvas;
		
		var lastEnemyAddedScore = 0;
		var currentEnemyCount = 0;
		var MIN_ENEMY_APPEAR_SCORE = 1000;
		var MAX_NUMBER_OF_ENEMY = 5;
 
		function unloadGameObjects()
		{
			prevSpell = null;
			var l = stage.getNumChildren();
            for (var i=l-1; i>0; i--) {
                var someObject = stage.getChildAt(i);
                if(someObject.name != null){
					if(someObject.name.indexOf("aSpell",0) >= 0){
						stage.removeChildAt(i);
                    }
                    if(someObject.name.indexOf("aSparkle",0) >= 0){
						stage.removeChildAt(i);
                    }
					if(someObject.name.indexOf("aFairyBubble",0) >= 0){
						stage.removeChildAt(i);
					}
					if(someObject.name.indexOf("aBubbleBurst",0) >= 0){					
						stage.removeChildAt(i);
					}
					if(someObject.name.indexOf("anExplosion",0) >= 0){
						stage.removeChildAt(i);
					}
					if(someObject.name.indexOf("anEvilShot",0) >= 0){
						stage.removeChildAt(i);
					}
					if(someObject.name.indexOf("anEnemy",0) >= 0){
						stage.removeChildAt(i);
					}
				}
			}
			
		}
 
		//function called by the Tick instance at a set interval
		function tick()
		{
			if(titleIsOnFlag == true){
				stage.update();
				return;
			}
			
			if(gameIsPausedFlag){
				//pauseGame();
				return;
			}
		
			if(health <= 0 || magicPower <= 0)
			{
				//alert("game over");
				showEndGame();
				stage.update();
			}
			else {
				//update everything
				
				//var newPoint = findNewPointTake3(Mouse);
				//updateLineWand(newPoint);
				
				updateControlStick(Mouse);
				
				//ADD NEW FAIRY IF NEEDED
				if(score >= MIN_SCORE_ADD_NEW_BUBBLE){
					if((score % ADD_NEW_FAIRY_BUBBLE_MOD == 0) && (lastScoreFairyAdded != score)){
						//add new fairy 
						lastScoreFairyAdded = score;
						addFairyBubble(1);	
					}
				}
				
				
				iterateAllObjects();
				
				updateText();
				
				if((score % 400 == 0) && (lastEnemyAddedScore != score) && (score > MIN_ENEMY_APPEAR_SCORE))
				{
					currentEnemyCount += 1;
					if(currentEnemyCount <= MAX_NUMBER_OF_ENEMY){
						lastEnemyAddedScore = score;
						addEnemy();
					}
				}
				
				updateHealthBar();
				
				//re-render the stage
				stage.update();
			}
		}
		
		
		var endText;
		var scoreMessage;
		var messageStr;
		function showEndGame()
		{
			unloadGameObjects();
			gameEndFlag = true;
			endText.text = "Game Over!";
			scoreMessage.text = "Your Score: " + score;
			messageStr.text = "";
			
			scoreLabel.text = "";
			healthLabel.text = "";
			magicText.text = "";
		
			bmpPlayAgain.visible = true;
		}
		
		
	
/////////////////////////  Mouse /////////////////////////////

		function onMouseClick(e)
        {
			if(titleIsOnFlag){
				 titleIsOnFlag = false;
				 startGame();
			}
			else if(gameEndFlag){
				if(checkPlayAgainClick(Mouse)){
					gameEndFlag = false;
					endText.text = "";
					messageStr.text = "";
					scoreMessage.text = "";
					reStartGame();
				}
			}
			else if(gameIsPausedFlag){
				resumeGame();
			}
			else if(checkGamePauseClick(Mouse)){
				pauseGame();
			}
			else{
				addSpellShot(myOrigin, Mouse);
			}
        }
        
		//called when the mouse is moved over the canvas
		function onMouseMove(e)
		{
			//update the Mouse position coordinates
			updateMouseCoordinates(e);
		}
		
		//update the mouse coordinates
		function updateMouseCoordinates(e)
		{
			//we store these in a global object so they can be easily accessed
			//from anywhere (other classes)
			Mouse.x = stage.mouseX;
			Mouse.y = stage.mouseY;
		}

/////////////////////////  Math /////////////////////////////		
		function distanceBetweenPoints(p1, p2)
		{
			var dx = p1.x - p2.x;
			var dy = p1.y - p2.y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			return(dist);
		}
		
		function angleToPoint(p1, r)
		{
			if(r<=0){
				r = 1;
			}
			var angRad = Math.acos(p1.x/r);
			return(angRad);
		}
		
		function findNewPoint(m)
		{
			newDist = distanceBetweenPoints(myOrigin, m);
			newAng = angleToPoint(m, newDist);
			
			myPoint.x = newXVal(50, newAng);
			myPoint.y = newYVal(50, newAng);
			
			//return(myPoint);
		}
		
		function findNewPointTake2(m)
		{
			//create vectors
			var endPoint = {x:639, y:479};//end of canvas
			vectorOne = makeVector(myOrigin, endPoint);
			vectorTwo = makeVector(myOrigin, m);
			//find angle between vectors
			var angBetweenVec = angleBetweenVectors(vectorOne, vectorTwo);
			
			//find distance
			//var distP = distanceBetweenPoints(myOrigin, m);
			
			//find new point
			myPoint.x = newXVal(50, angBetweenVec);
			myPoint.y = newYVal(50, angBetweenVec);
		}
		
		function findNewAngle(m)
		{
		
			var endPoint = {x:639, y:479};//end of canvas
			vectorOne = makeVector(myOrigin, endPoint);
			vectorTwo = makeVector(myOrigin, m);
			//find angle between vectors
			var angBetweenVec = angleBetweenVectors(vectorOne, vectorTwo);
			angBetweenVec = (angBetweenVec * (180 / 3.14159));
			return(angBetweenVec);
			
		}
		
		function findNewPointTake3(m)
		{
			vectorOne = makeVector(myOrigin, m);
			var somePoint = findPointInVector(vectorOne, 60);
			//myPoint.x =  somePoint.x;
			//myPoint.y =  somePoint.y;
			return(somePoint);
			//myPoint.x = m.x;
			//myPoint.y = m.y;
		}
		
		function makeVector(p1, p2)
		{
			var somePoint = {x:0, y:0};
			somePoint.x = (p2.x - p1.x);
			somePoint.y = (p2.y - p1.y);
			
			return (somePoint);
		}
		
		function unitVector(aVec)
		{
			var mag = modulusOfVector(aVec);
			var unitVec = {x:0,y:0};
			if(mag <=0){
				mag = 1;
			}
			unitVec.x = aVec.x / mag;
			unitVec.y = aVec.y / mag;
			return(unitVec);
		}
		
		function findPointInVector(aVec1, dist)
		{
			unitVec = unitVector(aVec1);
			var somePoint = {x:0, y:0};
			somePoint.x = unitVec.x * dist;
			somePoint.y = unitVec.y * dist;
			
			somePoint.x = somePoint.x + myOrigin.x;
			somePoint.y = somePoint.y + myOrigin.y;
			
			return (somePoint);
		}
        
        
        function findPointInUnitVector(aOrigin, aUnitVec1, dist)
		{
			var somePoint = {x:0, y:0};
			somePoint.x = aUnitVec1.x * dist;
			somePoint.y = aUnitVec1.y * dist;
			
			somePoint.x = somePoint.x + aOrigin.x;
			somePoint.y = somePoint.y + aOrigin.y;
			
			return (somePoint);
		}
		
		function modulusOfVector(aVector)
		{
			//|V1| = SquareRoot(x1^2 + y1^2 + z1^2),
			return (Math.sqrt((aVector.x * aVector.x) + (aVector.y * aVector.y)));			
		}
		
		function angleBetweenVectors(aVector1, aVector2)
		{
			// cos(theta) = (x1*x2 + y1*y2 + z1*z2)/(|V1|*|V2|),
			modV1 = modulusOfVector(aVector1);
			modV2 = modulusOfVector(aVector2);
			
			return Math.acos(((aVector1.x * aVector2.x) + (aVector1.y * aVector2.y)) / (modV1 * modV2));

		}
		
		function newXVal(r, ang)
		{
			return (r * Math.cos(ang));
		}
		
		function newYVal(r, ang)
		{
			return (r * Math.sin(ang));
		}


		
///////////////////////// Global Vars /////////////////////////////

var imgSeq = new Image();		// The image for the sparkle animation
var bmpSeq;						// The animated sparkle template to clone 

var imgBubbleBurstSeq = new Image();		// The image for the bubble burst
var bmpBubbleBurstSeq;		// The image for the bubble burst


var imgEnemySeq = new Image();	
var bmpEnemySeq;		

var imgEnemyShot = new Image();	
var bmpEnemyShot;		


var imgExplosionSeq = new Image();	
var bmpExplosionSeq;		

var imgControlStick = new Image();
var bmpControlStick;

var imgRedEffect = new Image();
var bmpRedEffect;

var imgPlayAgain = new Image();
var bmpPlayAgain;

var imgTitle = new Image();	
var bmpTitle;		

var SpellShotObject = {posX:0, posY:0, alive:0, uvX:0, uvY:0, distFromOrigin:0}
var SpellShotGraphics;
var SpellShotShape;
var spellCount;
var spellShotBitmap;
var prevSpell;
var spawnSpellFlag = 1;
var scoreLabel;
var score;

var healthLabel;
var health;

var magicPower;

var titleIsOnFlag = true;
var gameEndFlag = false;


//////////////////////////////// Load Images //////////////////////////////

function loadImages()
{	
	img = new Image();
    img.src = "images/fback5.jpg";
	//img.src = "images/fback2.jpg";
	imgFairy = new Image();
    imgFairy.src = "images/fairy2.png";     
    imgSpell = new Image();
    imgSpell.src = "images/spell02_29x29.png";
	imgBubbleBurstSeq.src ="images/fairybubbleburst.png";
	imgEnemySeq.src = "images/enemy_new58x52.png";
	imgExplosionSeq.src = "images/enemyhit_35x35.png";
	
	imgEnemyShot.src = "images/spell04_sm.png";
	imgRedEffect.src = "images/redEffect.png"
	
	imgTitle.src = "images/title.jpg";
	
	imgControlStick.src = "images/controller_stick.png";
	
	imgPlayAgain.src = "images/playagainbtn_sm.png";
	
    imgSeq.onload = initParticles;
    imgSeq.src = "images/sparkle_white.png";	
	
	
}


///////////////////////////////// Init Game ///////////////////////////

function init()
{
			//check and see if the canvas element is supported in
			//the current browser
			//http://diveintohtml5.org/detect.html#canvas
			if(!(!!document.createElement('canvas').getContext))
			{
				var wrapper = document.getElementById("canvasWrapper");
				wrapper.innerHTML = "Your browser does not appear to support " +
				"the HTML5 Canvas element";
				return;
			}
 
			//get a reference to the canvas element
			canvas = document.getElementById("stageCanvas");
			//set mouse events
			canvas.onmousemove = onMouseMove;
			canvas.onclick = onMouseClick;

			//copy the canvas bounds to the bounds instance.
			//Note, if we resize the canvas, we need to reset
			//these bounds.
			bounds = new Rectangle();
			bounds.width = canvas.width;
			bounds.height = canvas.height;
			
			stage = new Stage(canvas);
			showLoading();
			stage.update();

            loadImages();	
			
			
			initFairyBubble();
			initSpellShot();
			initParticles();
			initBubbleBurst();
			initEnemy();
			initExplosion();
			initEnemyShot();
			
			addTitle(); 
			 
			//tell the stage to render to the canvas
			stage.update();
			
			Ticker.setFPS(24);
			Ticker.addListener(this);
			Ticker.addListener(window);
 
}

		function showLoading()
		{
			var loadingText = new Text("Loading...","bold 40px Arial","#FFF");
			stage.addChild(loadingText);
			loadingText.x = 220;
			loadingText.y = 120;
		}
		
		function reStartGame()
		{
			magicPower = 5;
			health = 15;
			lastEnemyAddedScore = 0;
			currentEnemyCount = 0;
			lastEvilShotScore = 0;
			doUnhideABubbleFlag = 0;
			lastFairyBubbleReverseScore = 0;
 			score = 0;
			redEffectOnFlag = false;
			gameIsPausedFlag = false;
			
			//reset effect
			bmpRedEffect.alpha = 1;
			bmpRedEffect.tickCount = 0;
			bmpRedEffect.visible = false;
			
			bmpPlayAgain.visible = false;
				
			addAllBubbles();
		
		}
		
		function startGame()
		{
			//clear title
			
			//init
			magicPower = 5;
			health = 15;
			lastEnemyAddedScore = 0;
			currentEnemyCount = 0;
			lastEvilShotScore = 0;
			doUnhideABubbleFlag = 0;
			lastFairyBubbleReverseScore = 0;
 			score = 0;
			redEffectOnFlag = false;
			gameIsPausedFlag = false;
			
			addBackGround();
			initText();
			endText.text = "";
			addLineWand();
			addHealthBar();
			addAllBubbles();
			addPlayAgainButton();
		}
		
		function addPlayAgainButton()
		{
			bmpPlayAgain = new Bitmap(imgPlayAgain);
			bmpPlayAgain.x = 10;
			bmpPlayAgain.y = 10;
			bmpPlayAgain.x2 = 10 + 167;
			bmpPlayAgain.y2 = 10 + 50;
			bmpPlayAgain.visible = false;
			stage.addChild(bmpPlayAgain);
		}
		
		function checkPlayAgainClick(mousePoint)
		{
			
			if((mousePoint.x >= bmpPlayAgain.x && mousePoint.x  < (bmpPlayAgain.x2)) &&
				(mousePoint.y >=  bmpPlayAgain.y && mousePoint.y < (bmpPlayAgain.y2)))
			{
				return(true);
			}
			else{
				return(false);
			}
				
		}
		
		
		var gameIsPausedFlag = false;
		function pauseGame()
		{
			//display game is paused
			gameIsPausedFlag = true;
			messageStr.x = 140;
			messageStr.text = "Game Paused: Click To Continue";
			stage.update();
		}
		
		function checkGamePauseClick(mousePoint)
		{
			
			if((mousePoint.x >= 594 && mousePoint.x  < 627) &&
				(mousePoint.y >= 12 && mousePoint.y < 43))
			{
				return(true);
			}
			else{
				return(false);
			}
				
		}
		
		function resumeGame()
		{
			gameIsPausedFlag = false;
			messageStr.x = 180;
			messageStr.text = "";
		}
		
		function addTitle()
		{
			var bitmap = new Bitmap(imgTitle);
            bitmap.x = 0;
            bitmap.y = 0;
			stage.addChild(bitmap);
		}
		
		function addBackGround()
		{
			 var bitmap = new Bitmap(img);
             bitmap.x = 0;
             bitmap.y = 0;
			 stage.addChild(bitmap);
			 
			 bmpRedEffect = new Bitmap(imgRedEffect)
			 bmpRedEffect.x = 0;
			 bmpRedEffect.y = canvas.height - 25;
			 bmpRedEffect.visible = false;
			 bmpRedEffect.tickCount = 0;
			 stage.addChild(bmpRedEffect);
		}
		
		var redEffectOnFlag = false;
		function showRedEffect()
		{
			if(!redEffectOnFlag){
				return;
			}
			bmpRedEffect.visible = true;
			bmpRedEffect.tickCount += 1;
			if(bmpRedEffect.tickCount < 50){
				//bmpRedEffect.alpha -= 0.1;
				if(bmpRedEffect.alpha <= 0)
				{
					bmpRedEffect.alpha = 1;
				}
			}
			else{
				bmpRedEffect.alpha = 1;
				bmpRedEffect.tickCount = 0;
				bmpRedEffect.visible = false;
				redEffectOnFlag = false;
			}
		}
		
		
		var healthBar;
		var healthBarShape;
		var fairyBar;
		var fairyBarShape;
		var fairyBarX = 315;
		var fairyBarY = 21;
		var fairyBarWidth = 60;
		
		var healthBarX = 422;
		var healthBarY = 21;
		var healthBarWidth = 60;
		
		function addHealthBar()
		{
			fairyBar = new Graphics();			
			fairyBar.setStrokeStyle(7);
			fairyBar.beginStroke(Graphics.getRGB(0,255,255, 1.0));
			fairyBar.moveTo(fairyBarX,fairyBarY);
			fairyBar.lineTo(fairyBarX + fairyBarWidth,fairyBarY);
			fairyBarShape = new Shape(fairyBar);
			stage.addChild(fairyBarShape);
			
			healthBar = new Graphics();			
			healthBar.setStrokeStyle(7);
			healthBar.beginStroke(Graphics.getRGB(255,66,66, 1.0));
			healthBar.moveTo(healthBarX,healthBarY);
			healthBar.lineTo(healthBarX + healthBarWidth, healthBarY);
			healthBarShape = new Shape(healthBar);
			stage.addChild(healthBarShape);
		}
		
		function updateHealthBar()
		{
			fairyBar.clear();
			fairyBar.setStrokeStyle(7);
			fairyBar.beginStroke(Graphics.getRGB(0,255,255, 1.0));
			fairyBar.moveTo(fairyBarX,fairyBarY);
			fairyBar.lineTo(fairyBarX + (health * (60 / 15)),fairyBarY);
			
			healthBar.clear();
			healthBar.setStrokeStyle(7);
			healthBar.beginStroke(Graphics.getRGB(255,66,66, 1.0));
			healthBar.moveTo(healthBarX,healthBarY);
			healthBar.lineTo(healthBarX + (magicPower * (60 / 5)), healthBarY);
		}
		

		function addLineWand()
		{
			/*lineGraphics = new Graphics();			
			lineGraphics.setStrokeStyle(5);
			lineGraphics.beginStroke(Graphics.getRGB(255,255,255,.7));
			lineGraphics.moveTo(0,0);
			lineGraphics.lineTo(10,10);
			newLine = new Shape(lineGraphics);
			stage.addChild(newLine);*/
			
			bmpControlStick = new Bitmap(imgControlStick);
			bmpControlStick.x = myOrigin.x;
			bmpControlStick.y = myOrigin.y - 15;
			bmpControlStick.regX = 0;
			bmpControlStick.regY = 15/2;
			stage.addChild(bmpControlStick);
			
		}

		function updateLineWand(aPoint)
		{
			//clear previous line
			lineGraphics.clear();
			lineGraphics.setStrokeStyle(5);
			lineGraphics.beginStroke(Graphics.getRGB(255,255,255,.7));
			lineGraphics.moveTo(myOrigin.x, myOrigin.y);
			lineGraphics.lineTo(aPoint.x, aPoint.y);
			
		}
		
		var CONTROL_STICK_WIDTH = 15;
		var CONTROL_STICK_HEIGHT = 46;
		function updateControlStick(aPoint)
		{
		
			var newAng = findNewAngle(aPoint);
			
			//alert("width " + bmpControlStick.width);
			//alert("ht " + bmpControlStick.height);
		
			bmpControlStick.x = myOrigin.x;
			bmpControlStick.y = myOrigin.y;
			bmpControlStick.regX = 0;
			bmpControlStick.regY = CONTROL_STICK_WIDTH/2;
			bmpControlStick.rotation = -newAng;
		}


///////////////////// Enemy Shot /////////////////////

var lastEvilShotScore = 0;
var EVILSHOT_WD = 48;
var EVILSHOT_HT = 48;

function initEnemyShot()
{
	bmpEnemyShot = new Bitmap(imgEnemyShot);
	bmpEnemyShot.regX = bmpSeq.frameWidth/2|0;
	bmpEnemyShot.regY = bmpSeq.frameHeight/2|0;
}

function addEnemyShot(x,y)
{
	cloneEnemyShot = bmpEnemyShot.clone();
	cloneEnemyShot.x = x;
	cloneEnemyShot.y = y;
	cloneEnemyShot.speed = 3;
	cloneEnemyShot.name = "anEvilShot";
	stage.addChild(cloneEnemyShot);
}

function updateEnemyShot(anEnemyShot, pid)
{
    anEnemyShot.y += anEnemyShot.speed;
	anEnemyShot.rotation += 30;
	
	if(anEnemyShot.y > (canvas.height - 6) ){
		redEffectOnFlag = true;
		magicPower = magicPower - 1;
		removeEnemyShot(pid);
	}
}

function removeEnemyShot(pid)
{
	stage.removeChildAt(pid);
}

////////////////////// Handle SpellShot //////////////////////////////	
		function initSpellShot()
		{    
            SpellShotGraphics = new Graphics();			
			SpellShotGraphics.setStrokeStyle(5);
			SpellShotGraphics.beginStroke(Graphics.getRGB(255,0,0,.7));
			SpellShotGraphics.drawCircle(0,0, CIRCLE_RADIUS / 2);
			SpellShotShape = new Shape(SpellShotGraphics);
            spellCount = 0;			
			spellShotBitmap = new Bitmap(imgSpell);
		}
		
		function addSpellShot(originLocation, mouseLocation)
		{
		
			var newLocPoint = {x:0, y:0};
			newLocPoint.x = originLocation.x;
			newLocPoint.y = originLocation.y;
			
			
			if(prevSpell!=null){
				//alert("here");
				
				if(prevSpell.x > canvas.width ||  prevSpell.x < 0){
					spawnSpellFlag = 1;
				}
				
				if(prevSpell.y > canvas.height ||  prevSpell.y < 0){
					spawnSpellFlag = 1;
				}
				
				if(prevSpell.distFromOrigin < (canvas.height * 0.75) && spawnSpellFlag!=1){
					return;
				}
			}
			
            //compute vector
            var newVec = makeVector(newLocPoint, mouseLocation);
			//compute unit vector
            var newUnitVec = unitVector(newVec);
			
			var newAngle = findNewAngle(mouseLocation);
            
			//clone new spell shot
            //var newSpell = SpellShotShape.clone();
			var newSpell = spellShotBitmap.clone();
            //set up properties
			/*newSpell.regX = 0;
			newSpell.regY = 0;
			newSpell.rotation = -newAngle;*/
			
            newSpell.x = newLocPoint.x;
            newSpell.y = newLocPoint.y;
			
            newSpell.posX = newLocPoint.x;
            newSpell.posY = newLocPoint.y;
            newSpell.alive = 1;
            newSpell.uvX = newUnitVec.x;
            newSpell.uvY = newUnitVec.y;
            newSpell.distFromOrigin = CONTROL_STICK_HEIGHT;
            newSpell.name = "aSpell" + (stage.getNumChildren() + 1);
            prevSpell = newSpell;
			spawnSpellFlag = 0;
			//add to canvas
            stage.addChild(newSpell);
		}
		
		function updateSpellShot(aSpellShot, objId)
		{
            if(aSpellShot.live == 0){
                removeSpellShot(objId);
            }
            else{
                if(aSpellShot.x > canvas.width || aSpellShot.x < 0
                    || aSpellShot.y > canvas.width || aSpellShot.y < 0){
                    removeSpellShot(objId);
                }
                else{
					var newLocPoint = {x:0, y:0};
					newLocPoint.x = myOrigin.x;
					newLocPoint.y = myOrigin.y;
			
                    //update distance from origin, find pos on vector
                    var newDistance = aSpellShot.distFromOrigin + 30;
                    var uniVec = {x:0,y:0};
                    uniVec.x = aSpellShot.uvX;
                    uniVec.y = aSpellShot.uvY;
                    var newerPoint = findPointInUnitVector(newLocPoint, uniVec, newDistance);
					
					//align shot properly (corner of sprite issue)
					newerPoint.x = newerPoint.x - 15; //half width
					newerPoint.y = newerPoint.y - 15;//half height

                    aSpellShot.x = newerPoint.x;
                    aSpellShot.y = newerPoint.y;
                    aSpellShot.posX = newerPoint.x;
                    aSpellShot.posY = newerPoint.y;
                    aSpellShot.distFromOrigin = newDistance;
					                    
                    addSparkles(3, aSpellShot.x +6 , aSpellShot.y + 6);
                }
            }
            
		}
		
		function removeSpellShot(objId)
		{
			//remove out of canvas spell shots
            stage.removeChildAt(objId);
		}


//////////////////////////////////// Process All Objects //////////////////////////////////		
		function iterateAllObjects()
		{
			//iterate through all objects in game and update as necessary
            var l = stage.getNumChildren();
            for (var i=l-1; i>0; i--) {
                var someObject = stage.getChildAt(i);
                if(someObject.name != null){
                    if(someObject.name.indexOf("aSpell",0) >= 0){
                        var collHappened = detectCollision(someObject);
                        if(collHappened==1){
                            someObject.live = 0;
                            removeSpellShot(i);
							spawnSpellFlag = 1;
							score += 50;
							//alert("Collision");
                        }
                        else{
                            updateSpellShot(someObject, i);
                        }
                    }
                    if(someObject.name.indexOf("aSparkle",0) >= 0){
                        updateParticle(someObject, i);
                    }
					if(someObject.name.indexOf("aFairyBubble",0) >= 0){
						updateFairyBubble(someObject);
					}
					if(someObject.name.indexOf("aBubbleBurst",0) >= 0){
						updateBubbleBurst(someObject, i);
					}
					if(someObject.name.indexOf("anExplosion",0) >= 0){
						updateExplosion(someObject, i);
					}
					if(someObject.name.indexOf("anEvilShot",0) >= 0){
						if(someObject.visible == false){
							removeEnemyShot(i);
						}
						else{
							updateEnemyShot(someObject, i);
						}
					}
					if(someObject.name.indexOf("anEnemy",0) >= 0){
                        if(someObject.visible == false){
							removeEnemy(i);
						}
						else{
							updateEnemy(someObject, i);
						}
                    }
					
					if(redEffectOnFlag){
						showRedEffect();
					}
                }
            }
		}
        
		
		
        function detectCollision(p1){
            var l = stage.getNumChildren();
            var collResult = 0;
            for (var i=l-1; i>0; i--) {
                var someObject = stage.getChildAt(i);
                if(someObject.name != null){
                    if(someObject.name.indexOf("aFairyBubble",0) >= 0){
                        if((p1.x >= someObject.x) && (p1.x < (someObject.x + BUBBLE_WD))
                            && (p1.y >= someObject.y) && (p1.y < (someObject.y + BUBBLE_HT))){
							if(someObject.visible == true){
								//collision happens
								collResult = 1;
								hideFairyBubble(someObject);
								addBubbleBurst(someObject.x, someObject.y);
							}
                            
                         }
                    }
					if(someObject.name.indexOf("anEvilShot",0) >= 0){
						var collDist = distanceBetweenPoints(someObject, p1);
						if(someObject.visible == true){
							if(collDist <= ((EVILSHOT_WD + EVILSHOT_HT)/2)){
									collResult = 1;
									someObject.visible = false;
									addExplosion(someObject.x, someObject.y);
							}
						}
						/*
						if((p1.x >= someObject.x) && (p1.x < (someObject.x + EVILSHOT_WD))
                            && (p1.y >= someObject.y) && (p1.y < (someObject.y + EVILSHOT_HT))){
							if(someObject.visible == true){
								//collision happens
								collResult = 1;
								someObject.visible = false;
								addExplosion(someObject.x, someObject.y);
							}
                         }*/
					}
					if(someObject.name.indexOf("anEnemy",0) >= 0){
						if((p1.x >= someObject.x) && (p1.x < (someObject.x + ENEMY_WD))
                            && (p1.y >= someObject.y) && (p1.y < (someObject.y + ENEMY_HT))){
							if(someObject.visible == true){
								//collision happens
								collResult = 1;
								someObject.visible = false;
								addExplosion(someObject.x, someObject.y);
							}
                         }
					}
                }
            }
            return(collResult);
        }

/////////////////////////// Bubble Burst ////////////
function initBubbleBurst()
{
	bmpBubbleBurstSeq = new BitmapSequence(new SpriteSheet(imgBubbleBurstSeq,150,150));
	bmpBubbleBurstSeq.regX = bmpBubbleBurstSeq.frameWidth/2|0;
	bmpBubbleBurstSeq.regY = bmpBubbleBurstSeq.frameHeight/2|0;
}

function addBubbleBurst(x,y)
{
	var bubbleBurstClone = bmpBubbleBurstSeq.clone();
	bubbleBurstClone.x = x;
	bubbleBurstClone.y = y;
	bubbleBurstClone.tickCount = 0;
	bubbleBurstClone.floatCount = 0;
	bubbleBurstClone.name = "aBubbleBurst";
	bubbleBurstClone.currentFrame = 1|0;
	stage.addChild(bubbleBurstClone);
}

function updateBubbleBurst(aBubbleBurst, pid)
{
	aBubbleBurst.tickCount += 1; 
	if(aBubbleBurst.tickCount > 7){
		//removeBubbleBurst(pid);
		aBubbleBurst.tickCount = 6;
		aBubbleBurst.paused = true;
		if(aBubbleBurst.floatCount==0){
			aBubbleBurst.y = aBubbleBurst.y - 30;
		}
		aBubbleBurst.y = aBubbleBurst.y - 15;
		aBubbleBurst.floatCount = aBubbleBurst.floatCount + 1;
		if(aBubbleBurst.y < - 15 ){
			removeBubbleBurst(pid);
		}
	}
	
}

function removeBubbleBurst(pid)
{
	//addFairyBubble();
	doUnhideABubbleFlag += 1;
	stage.removeChildAt(pid);
}


/////////////////////////// Manage Fairy Bubble ////////////

var doUnhideABubbleFlag = 0;

var MAX_Y_FAIRY_BUBBLE = 350;
var MIN_Y_FAIRY_BUBBLE = 80;
var FAIRY_NEW_Y_POS = 100;
var MAX_FAIRY_SPEED = 15;
var MIN_FAIRY_SPEED = 1;
var MAX_FAIRY_COUNT = 2;

var BUBBLE_WD = 73;
var BUBBLE_HT = 73;

function initFairyBubble()
{
	bitmapFairy = new Bitmap(imgFairy);
	bitmapFairy.speed = 0;
	bitmapFairy.dir = 0; //0=left, 1=right, 3=up, 4=down
	bitmapFairy.reverse = 0;
	bitmapFairy.x = 0;
	bitmapFairy.y = 0;
	bitmapFairy.ht = 73; //height
	bitmapFairy.wd = 73; //width 
}

function addAllBubbles()
{
	for(var i=0; i<MAX_FAIRY_COUNT ;i++){
		addFairyBubble(i);
	}
}

function selectMaxBubbleSpeed()
{
	if(score >= 20000)
		return(MAX_FAIRY_SPEED);
	
	if(score < 50)
		return(1);
		
	if(score >= 50 && score < 100)
		return(2);
		
	if(score >= 100 && score < 300)
		return(4);
		
	if(score >= 300 && score < 500)
		return(5);
		
	if(score >= 500 && score < 1000)
		return(8);
	
	if(score >= 1000 && score < 5000)
		return(10);
	
	if(score >= 5000 && score < 20000)
		return(12);
		
	//anything else
	return(12);
}


var TOTAL_MAX_FAIRY_COUNT = 10;
var currNumOfFairy = 0;
var lastScoreFairyAdded = 0;

function addFairyBubble(val)
{
	
	
	if(currNumOfFairy > TOTAL_MAX_FAIRY_COUNT)
	{
		//too many fairy don't add anymore
		return;
	}
	
	currNumOfFairy = currNumOfFairy + 1;
	
	newBitmapFairy = bitmapFairy.clone();
	//select random position
	
	if(val==0)
	{
		newBitmapFairy.y = Math.floor(Math.random() * MAX_Y_FAIRY_BUBBLE);
		if(newBitmapFairy.y < MIN_Y_FAIRY_BUBBLE){
			newBitmapFairy.y = MIN_Y_FAIRY_BUBBLE;
		}
	}
	else{
		newBitmapFairy.y = (Math.floor(Math.random() * MAX_Y_FAIRY_BUBBLE)) + (MIN_Y_FAIRY_BUBBLE / 2);
	
	}
	
	
	//select random speed
	newBitmapFairy.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
	newBitmapFairy.name = "aFairyBubble";
	
	stage.addChild(newBitmapFairy);
}


function hideFairyBubble(aFairyBubble)
{
	aFairyBubble.visible = false;
}

function removeFairyBubble(pid)
{
	stage.removeChildAt(pid);
}

var lastFairyBubbleReverseScore = 0;
var MIN_SCORE_REVERSE_BUBBLE = 200;
var MIN_SCORE_ADD_NEW_BUBBLE = 19000;
var ADD_NEW_FAIRY_BUBBLE_MOD = 10000;

function updateFairyBubble(aFairyBubble)
{

	if(aFairyBubble.visible == false && doUnhideABubbleFlag<=0)
	{
		doUnhideABubbleFlag = 0;
		return;
		//doUnhideABubbleFlag = 1;
	}

	if(doUnhideABubbleFlag > 0 && (aFairyBubble.visible == false))
	{
		doUnhideABubbleFlag = doUnhideABubbleFlag - 1;
		
		if((Math.floor(Math.random()* 11)) % 3 == 0 && (score >= MIN_SCORE_REVERSE_BUBBLE))
		{
			aFairyBubble.x = canvas.width;
			aFairyBubble.reverse = 1;
		}
		else{
			aFairyBubble.x = 0;
			aFairyBubble.reverse = 0;
		}
		
		
		aFairyBubble.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
		aFairyBubble.visible = true;
	}
	
	var posChange=Math.floor(Math.random()*30);
	
	
	/*if((score % 500 == 0) && (lastFairyBubbleReverseScore != score)){
		aFairyBubble.reverse = 1;
		lastFairyBubbleReverseScore = score;
	}else{
		aFairyBubble.reverse = 0;
	}*/
	
	if(aFairyBubble.reverse == 1){
		aFairyBubble.x -= aFairyBubble.speed;
	}
	else{
		aFairyBubble.x += aFairyBubble.speed;
	}
	
	
	
	
	if(posChange == 11 || posChange == 17 || aFairyBubble.dir == 0){
		aFairyBubble.y = aFairyBubble.y + 1;
        aFairyBubble.dir = 0;
	}
	
	if(posChange == 8 || posChange == 22 || aFairyBubble.dir == 1){
		aFairyBubble.y = aFairyBubble.y - 1;
        aFairyBubble.dir = 1;
	}
			
	if(aFairyBubble.y > MAX_Y_FAIRY_BUBBLE){
		aFairyBubble.y = MAX_Y_FAIRY_BUBBLE;
	}
	
	if(aFairyBubble.y < 0){
		aFairyBubble.y = 1;
	}
	
	if(aFairyBubble.x < 0){
		health = health - 1;
		//if(aFairyBubble.reverse == 1){
			aFairyBubble.x = canvas.width;
			aFairyBubble.y = Math.floor(Math.random()*MAX_Y_FAIRY_BUBBLE);
			aFairyBubble.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
			Math.floor(Math.random()*MAX_Y_FAIRY_BUBBLE);
			if(aFairyBubble.y < MIN_Y_FAIRY_BUBBLE){
				aFairyBubble.y = MIN_Y_FAIRY_BUBBLE;
				aFairyBubble.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
			}
		//}
	}
		
	if(aFairyBubble.x > canvas.width){
		health = health - 1;
		aFairyBubble.x = 0;
		aFairyBubble.y = Math.floor(Math.random()*MAX_Y_FAIRY_BUBBLE);
		aFairyBubble.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
		Math.floor(Math.random()*MAX_Y_FAIRY_BUBBLE);
		if(aFairyBubble.y < MIN_Y_FAIRY_BUBBLE){
			aFairyBubble.y = MIN_Y_FAIRY_BUBBLE;
			aFairyBubble.speed = Math.floor(Math.random()* selectMaxBubbleSpeed()) + MIN_FAIRY_SPEED;
		}
	}
}

////////////////////////Enemy ////////////////////////
var ENEMY_WD = 58;
var ENEMY_HT = 51;

function initEnemy()
{
	bmpEnemySeq = new BitmapSequence(new SpriteSheet(imgEnemySeq,ENEMY_WD,ENEMY_HT));
	bmpEnemySeq.regX = bmpEnemySeq.frameWidth/2|0;
	bmpEnemySeq.regY = bmpEnemySeq.frameHeight/2|0;
	bmpEnemySeq.name = "anEnemy";
	bmpEnemySeq.wd = 58;
	bmpEnemySeq.ht = 51;
}

function addEnemy()
{
	newCloneEnemy = bmpEnemySeq.clone();
	newCloneEnemy.x = Math.floor(Math.random() * canvas.width);
	newCloneEnemy.y = Math.floor(Math.random() * (canvas.height / 2));
	newCloneEnemy.speed = 4;
	newCloneEnemy.visible = true;
	newCloneEnemy.dir = 1;

	stage.addChild(newCloneEnemy);
}

function updateEnemy(anEnemyObj, pid)
{
	if(anEnemyObj.visible == false)
	{
		return;
	}
	
	var posChange=Math.floor(Math.random()*30);
	
	if(posChange == 11 || posChange == 17 || anEnemyObj.dir == 1){
		anEnemyObj.y = anEnemyObj.y + Math.floor(Math.random() * 2);
		anEnemyObj.x = anEnemyObj.x + (Math.floor(Math.random() * 6) + anEnemyObj.speed);
		anEnemyObj.dir = 1;
	}
	
	if(posChange == 8 || posChange == 22 || anEnemyObj.dir == 0){
		anEnemyObj.x = anEnemyObj.x - (Math.floor(Math.random() * 6) + anEnemyObj.speed);
		anEnemyObj.y = anEnemyObj.y + Math.floor(Math.random() * 2);
		anEnemyObj.dir = 0;
    }
	
	if( (anEnemyObj.x  > canvas.width) || anEnemyObj.x  < 0){
		anEnemyObj.x = Math.floor(Math.random() * canvas.width);
	}
	
	if( (anEnemyObj.y  > (canvas.height / 2)) || (anEnemyObj.y  < 0) ){
		anEnemyObj.y = Math.floor(Math.random() * (canvas.height / 2));;
	}
	
	var evilShotCheck = 550;
	
	if(score > 2000){
		evilShotCheck = 450;
	}
	
	if(score > 5000){
		evilShotCheck = 350;
	}
	
	if(score > 10000){
		evilShotCheck = 250;
	}
	
	if(score % evilShotCheck == 0 && lastEvilShotScore!= score){
		addEnemyShot(anEnemyObj.x, anEnemyObj.y);
		lastEvilShotScore = score;
	}
	
	
}

function destroyEnemy(enemyObj, pid)
{
	removeEnemy(pid);
	addExplosion(enemyObj.x, enemyObj.y);
}

function removeEnemy(pid)
{
	currentEnemyCount = currentEnemyCount - 1;
	if(currentEnemyCount < 0){
		currentEnemyCount = 0;
	}
	stage.removeChildAt(pid);
}

/////////////////////// Explosion /////////////////////
function initExplosion()
{
	bmpExplosionSeq = new BitmapSequence(new SpriteSheet(imgExplosionSeq,35,35));
	//bmpExplosionSeq = new BitmapSequence(new SpriteSheet(imgExplosionSeq,84,118));
	bmpExplosionSeq.regX = bmpExplosionSeq.frameWidth/2|0;
	bmpExplosionSeq.regY = bmpExplosionSeq.frameHeight/2|0;
	bmpExplosionSeq.name = "anExplosion";
	//bmpExplosionSeq.wd = 35;
	//bmpExplosionSeq.ht = 49;
	bmpExplosionSeq.tickCount = 0;
	
}


function addExplosion(x, y)
{
	newCloneExplosion = bmpExplosionSeq.clone();
	newCloneExplosion.x = x;
	newCloneExplosion.y = y;
	newCloneExplosion.tickCount = 0;

	stage.addChild(newCloneExplosion);
}

function updateExplosion(anExplosionObj, pid)
{
	anExplosionObj.tickCount += 1;
	
	//anExplosionObj.alpha -= 0.1;
	//anExplosionObj.y += 1;
		
	if(anExplosionObj.tickCount > 4){
		removeExplosion(pid);
	}

}

function removeExplosion(pid)
{
	stage.removeChildAt(pid);
}








/////////////////////// Particles /////////////////////

function initParticles() {
	// this instance will be cloned as needed to create new sparkles.
	// note that we are using a simple SpriteSheet with no frameData.
	// by default, it will loop through all of the frames in the image.
	bmpSeq = new BitmapSequence(new SpriteSheet(imgSeq,21,23));
	bmpSeq.regX = bmpSeq.frameWidth/2|0;
	bmpSeq.regY = bmpSeq.frameHeight/2|0;
		
}

function updateParticle(aParticle, pid){
    aParticle.alpha = aParticle.alpha - 0.1;
    aParticle.scaleX = aParticle.scaleY / 1.2;
    if(aParticle.alpha < 0.1){
        removeParticle(pid);
    }
}

function removeParticle(pid)
{
    stage.removeChildAt(pid);
}


function addSparkles(count, x, y) {
	//create the specified number of sparkles
	for (var i=0; i<count; i++) {
		// clone the original sparkle, so we don't need to set shared properties:
		var sparkle = bmpSeq.clone();
		
		// set display properties:
		sparkle.x = x;
		sparkle.y = y;
		sparkle.rotation = Math.random()*360;
		sparkle.alpha = 1;
		sparkle.scaleX = sparkle.scaleY = Math.random()+0.1;
        sparkle.name = "aSparkle";
			
		// add to the display list:
		stage.addChild(sparkle);
	}
}

//////////////////////////////// Text ////////////////////////////
var magicText;
function initText()
{
	// add a text object to output the current FPS:
	scoreLabel = new Text("Score: ","bold 24px Arial","#FFF");
	stage.addChild(scoreLabel);
	scoreLabel.x = 10;
	scoreLabel.y = 30;
	
	// add a text object to output the current FPS:
	healthLabel = new Text("","bold 12px Arial","#0FF");
	stage.addChild(healthLabel);
	healthLabel.x = 10;
	healthLabel.y = 55;
	
	//end text
	endText = new Text("","bold 40px Arial","#FFF");
	stage.addChild(endText);
	endText.x = 220;
	endText.y = 120;
	//stage.addChild(endText);
	
	//end text
	magicText = new Text("","bold 12px Arial","#FFF");
	stage.addChild(magicText);
	magicText.x = 10;
	magicText.y = 75;
	
		
	//end text
	scoreMessage = new Text("","bold 24px Arial","#FFF");
	stage.addChild(scoreMessage);
	scoreMessage.x = 235;
	scoreMessage.y = 155;
	
	//end text
	messageStr = new Text("","bold 24px Arial","#FFF");
	stage.addChild(messageStr);
	messageStr.x = 180;
	messageStr.y = 375;
}

function updateText()
{
	scoreLabel.text = "Score: " + score;
	//healthLabel.text = "Health: " + health;
	//magicText.text = "Magic: " + magicPower;
}

	