function keyboardEvent(){
	//Gestion des touches du clavier
	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);
}

var keyW = false, keyA = false, keyS = false, keyD = false; //WASD
var keyLeft = false, keyUp = false, keyRight = false, keyDown = false; //ARROWS
var keyPause = false; // ENTER

function onKeyDown(event){
	var keyCode = event.keyCode;
	switch(keyCode){
		case 37: keyLeft = true; break;		// Left arrow
		case 38: keyUp = true; break;		// up arrow
		case 39: keyRight = true; break; 	// right arrow
		case 40: keyDown = true; break; 	// down arrow
		case 68: keyD = true; break; 		//d
		case 83: keyS = true; break; 		//s
		case 65: keyA = true; break; 		//a
		case 87: keyW = true; break;		//w
		case 13: keyPause = true; break;	//enter
	}
}
function onKeyUp(event){
	var keyCode = event.keyCode
	switch(keyCode){
		case 37: keyLeft = false; break; 	// Left arrow
		case 38: keyUp = false; break; 		// up arrow
		case 39: keyRight = false; break; 	// right arrow
		case 40: keyDown = false; break; 	// down arrow
		case 68: keyD = false; break; 		//d
		case 83: keyS = false; break;		//s
		case 65: keyA = false; break; 		//a
		case 87: keyW = false; break; 		//w
		case 13: keyPause = false; break; 	//enter
	}
}