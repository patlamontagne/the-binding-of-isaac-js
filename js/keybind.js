
function keyboardEvent(){
    //Gestion des touches du clavier
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);

    window.addEventListener("touchend", touchUp, false);
    window.addEventListener("touchcancel", touchUp, false);
    window.addEventListener("touchleave", touchUp, false);
    touchzone.addEventListener("touchstart", touchDown, false);
    touchzone.addEventListener("touchmove", touchDown, false);

    offset_left = touchzone.offsetLeft + stage.offsetLeft;
    offset_top = touchzone.offsetTop + stage.offsetTop;
    deltaW = $('#uicanvas').width() / 960;
    deltaH = $('#uicanvas').height() / 576;
    // alert(deltaSize);
}
var touchzone = getEl("uicanvas");
var stage = getEl("game");
var offset_left;
var offset_top;
var deltaW = 1;
var deltaH = 1;

var keyW = false, keyA = false, keyS = false, keyD = false, keyQ = false, keyE = false; //WASDQE
var keyLeft = false, keyUp = false, keyRight = false, keyDown = false; //ARROWS
var keyPause = false, keyShift = false, keySpace = false;// ENTER

var touchMoveLeft = false, touchMoveUp = false, touchMoveRight = false, touchMoveDown = false;
var touchAttLeft = false, touchAttUp = false, touchAttRight = false, touchAttDown = false;

var azerty = false;

var W_Z = 87; // ou 90
var A_Q = 65; // ou 81
var Q_A = 81;
var S = 83;
var D = 68;
var E = 69;
var SPACE = 32;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;
var SHIFT = 16;
var ENTER = 13;

// mode clavier
function setAzerty(bool){
    // true = azerty (europe)
    // false = qwerty (usa)
    
    W_Z = bool ? 90 : 87; // ou 90
    A_Q = bool ? 81 : 65; // ou 81
    Q_A = bool ? 65 : 81; // ou 81
}

function onKeyDown(event){
    event.preventDefault();
    var keyCode = event.keyCode;
    switch(keyCode){
        case SPACE : keySpace = true; break;        // Space Bar
        case LEFT_ARROW : keyLeft = true; break;        // Left arrow
        case UP_ARROW : keyUp = true; break;        // up arrow
        case RIGHT_ARROW : keyRight = true; break;  // right arrow
        case DOWN_ARROW : keyDown = true; break;        // down arrow
        case D : keyD = true; break;        //d
        case S : keyS = true; break;        //s
        case A_Q : keyA = true; break;      //a
        case W_Z : keyW = true; break;      //w
        case Q_A : keyQ = true; break;      //q
        case E : keyE = true; break;        //e
        case SHIFT : keyShift = true; break;    //shift
        case ENTER : keyPause = true; break;    //enter
    }
}
function onKeyUp(event){
    event.preventDefault();
    var keyCode = event.keyCode
    switch(keyCode){
        case SPACE : keySpace = false; break;       // Space Bar
        case LEFT_ARROW : keyLeft = false; break;   // Left arrow
        case UP_ARROW : keyUp = false; break;       // up arrow
        case RIGHT_ARROW : keyRight = false; break;     // right arrow
        case DOWN_ARROW : keyDown = false; break;   // down arrow
        case D: keyD = false; break;        //d
        case S : keyS = false; break;       //s
        case A_Q : keyA = false; break;         //a
        case W_Z : keyW = false; break;         //w
        case Q_A : keyQ = false; break;         //q
        case E : keyE = false; break;       //e
        case SHIFT : keyShift = false; break;   //shift
        case ENTER : keyPause = false; break;   //enter
    }
}

function touchDown(event){
    
    event.preventDefault();

    for(var i = 0; i < event.touches.length; i++){
        var touchpos = event.touches[i];
        var x = (touchpos.pageX - offset_left ) / deltaW;
        var y = (touchpos.pageY - offset_top ) / deltaH;

        if(x >= 480 ) touchCol(x,y,attpad);
        else touchCol(x,y,movepad);     
    }

    keyW = move_up.active;
    keyA = move_left.active;
    keyS = move_down.active;
    keyD = move_right.active;

    keyUp = att_up.active;
    keyLeft = att_left.active;
    keyDown = att_down.active;
    keyRight = att_right.active;
    keyE = att_bomb.active;
}
function touchUp(event){  //changedTouches
    event.preventDefault();
    resetTouchMove();
}

function touchCol(x,y,attpad){
    for( var j = 0; j < attpad.length; j++ ){

        var btn = attpad[j];
        if (x > btn.x  && x < ( btn.x + btn.width ) && y > btn.y && y < (btn.y + btn.height)) {
            btn.active = true;
        } else btn.active = false;
    }
}
function resetTouchMove(){
    for( var j = 0; j < movepad.length; j++ ){
        var btn = movepad[j];
        btn.active = false;
    }

    keyW = move_up.active;
    keyA = move_left.active;
    keyS = move_down.active;
    keyD = move_right.active;

    keyUp = att_up.active;
    keyLeft = att_left.active;
    keyDown = att_down.active;
    keyRight = att_right.active;
}

// touch
    var btn_margin = 40;
    var pad_width = 170;
    var att_btn_scale = 0.35 + pad_width / 1600;

    var move_up = {
        type: 'move',
        name: 'up',
        active: false,
        x: btn_margin,
        y: touchzone.height-pad_width-btn_margin,
        width: pad_width,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
    var move_left = {
        type: 'move',
        name: 'left',
        active: false,
        x: btn_margin,
        y: touchzone.height-pad_width-btn_margin,
        width: pad_width /3,
        height: pad_width,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
    var move_down = {
        type: 'move',
        name: 'down',
        active: false,
        x: btn_margin,
        y: touchzone.height-pad_width/3-btn_margin,
        width: pad_width,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
    var move_right = {
        type: 'move',
        name: 'right',
        active: false,
        x: btn_margin + pad_width * 2/3,
        y: touchzone.height - pad_width - btn_margin,
        width: pad_width / 3,
        height: pad_width,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }


    var att_up = {
        type: 'attack',
        name: 'up',
        active: false,
        x: touchzone.width - pad_width + pad_width/3 - btn_margin,
        y: touchzone.height - pad_width - btn_margin,
        width: pad_width / 3,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.width);
        }
    }
    var att_left = {
        type: 'attack',
        name: 'left',
        active: false,
        x: touchzone.width - pad_width - btn_margin,
        y: touchzone.height - pad_width + pad_width /3 - btn_margin,
        width: pad_width / 3,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.width);
        }
    }
    var att_down = {
        type: 'attack',
        name: 'down',
        active: false,
        x: touchzone.width - pad_width + pad_width/3 - btn_margin,
        y: touchzone.height - pad_width/3 - btn_margin,
        width: pad_width / 3,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.width);
        }
    }
    var att_right = {
        type: 'attack',
        name: 'right',
        active: false,
        x: touchzone.width - pad_width/3 - btn_margin,
        y: touchzone.height - pad_width + pad_width /3 - btn_margin,
        width: pad_width / 3,
        height: pad_width / 3,
        draw: function(ctx){
            ctx.fillRect(this.x,this.y,this.width,this.width);
        }
    }

    var movepad = [move_up, move_left, move_down, move_right];
    var attpad = [att_up, att_left, att_down, att_right];
















    /* pad gauche */

    var ctrl_left = {
        x: btn_margin,
        y: canvas.height-btn_margin,
        width: pad_width,
        height: pad_width,
        sprite: imageTool.ctrl_left,
        draw: function(ctx){
            ctx.drawImage(this.sprite, this.x, this.y - this.height, this.width, this.height);
        }
    }


    /* pad droit */

    var ctrl_right = {
        x: canvas.width-btn_margin,
        y: canvas.height-btn_margin,
        width: pad_width,
        height: pad_width,
        sprite: imageTool.ctrl_right,
        draw: function(ctx){
            ctx.drawImage(this.sprite, this.x - this.width, this.y - this.height, this.width, this.height);
        }
    }


    var controls = [ ctrl_left, ctrl_right];























console.log('keybind.js LOADED.');