(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

//event listener
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event){
  var keyCode = event.keyCode;
  switch(keyCode){
     case 68:  //d
        keyD = true;
    break;
    case 83:  //s
        keyS = true;
    break;
    case 65: //a
        keyA = true;
    break;
    case 87: //w
        keyW = true;
    break;
  }
}
function onKeyUp(event){
  var keyCode = event.keyCode;

  switch(keyCode){
    case 68:  //d
        keyD = false;
    break;
    case 83:  //s
        keyS = false;
    break;
    case 65: //a
        keyA = false;
    break;
    case 87: //w
        keyW = false;
    break;
  }
}

//neccessary variables
var tickX = 100;
var tickY = 100;

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var speed = 5;

//main animation function
function drawPlayer(){
	window.requestAnimationFrame(drawPlayer);
	var canvas = document.getElementById("myCanvas");
	var c = canvas.getContext("2d");

	c.clearRect(0,0,1400,900);
	c.fillStyle = "black";
	c.fillRect(tickX,tickY,20,20);

	if(keyD == true){tickX+=speed;}
	if(keyS == true){tickY+=speed;}
	if(keyA == true){tickX-=speed;}
	if(keyW == true){tickY-=speed;}
}
	window.requestAnimationFrame(drawPlayer);