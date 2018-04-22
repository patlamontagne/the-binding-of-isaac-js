window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

//event listener
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event){
  var keyCode = event.keyCode;
  switch(keyCode){
    case 37: keyLeft = true; break; // Left arrow
	case 38: keyUp = true; break; // up arrow
	case 39: keyRight = true; break; // right arrow
	case 40: keyDown = true; break; // down arrow
    case 68: keyD = true; break;  //d
    case 83: keyS = true; break; //s
    case 65: keyA = true; break; //a
    case 87: keyW = true; break; //w
  }
}
function onKeyUp(event){
  var keyCode = event.keyCode;

  switch(keyCode){
	case 37: keyLeft = false; break; // Left arrow
	case 38: keyUp = false; break; // up arrow
	case 39: keyRight = false; break; // right arrow
	case 40: keyDown = false; break; // down arrow
    case 68: keyD = false; break;  //d
    case 83: keyS = false; break; //s
    case 65: keyA = false; break; //a
    case 87: keyW = false; break; //w
  }
}

//neccessary variables
var tickX = 375;
var tickY = 230;

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;
var speed = 5;

//main animation function
var imageObj = new Image();
var imageHead = 'player4.png';
imageObj.src = imageHead;


function drawPlayer(){
	window.requestAnimationFrame(drawPlayer);
	var canvas = document.getElementById("myCanvas");
	var c = canvas.getContext("2d");
	
	if(tickX>=690){tickX=690;}
	if(tickY>=390){tickY=390;}
	
	if(tickX<=60){tickX=60;}
	if(tickY<=30){tickY=30;}
	
	
	if(!keyDown || !keyLeft || !keyUp || !keyRight){imageHead = 'player4.png';}
	if(keyLeft){imageHead = 'player1.png';}
	if(keyUp){imageHead = 'player2.png';}
	if(keyRight){imageHead = 'player3.png';}
	if(keyDown){imageHead = 'player4.png';}
	imageObj.src = imageHead;
	
	c.clearRect(0,0,1400,900);
	c.drawImage(imageObj, tickX, tickY);

	if(keyD){tickX+=speed;}
	if(keyS){tickY+=speed;}
	if(keyA){tickX-=speed;}
	if(keyW){tickY-=speed;}
	
}
	window.requestAnimationFrame(drawPlayer);