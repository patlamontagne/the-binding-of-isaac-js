	var pad_width = 210;
	var base_width = 64;
	var WIDTH = base_width * 1;
	function writeMessage(message) {
	    text.setText(message);
	    layer.draw();
	}

	var stage = new Kinetic.Stage({
	    container: 'controls',
	    width: $('#controls').width(),
	    height: $('#controls').height()
	});
	var layer = new Kinetic.Layer();

	var text = new Kinetic.Text({
	    x: 10,
	    y: 10,
	    fontFamily: 'Calibri',
	    fontSize: 24,
	    text: '',
	    fill: 'black'
	});

	var att_up = new Kinetic.Rect({
	    x: stage.width() - pad_width + pad_width/3 - btn_margin,
        y: stage.height() - pad_width - btn_margin,
	    width: WIDTH,
	    height: WIDTH,
	    stroke: 'white',
	    strokeWidth: 2
	});

	var att_left = new Kinetic.Rect({
	    x: stage.width() - pad_width - btn_margin,
        y: stage.height() - pad_width + pad_width /3 - btn_margin,
	    width: WIDTH,
	    height: WIDTH,
	    stroke: 'white',
	    strokeWidth: 2
	});

	var att_down = new Kinetic.Rect({
	    x: stage.width() - pad_width + pad_width/3 - btn_margin,
        y: stage.height() - pad_width/3 - btn_margin,
	    width: WIDTH,
	    height: WIDTH,
	    stroke: 'white',
	    strokeWidth: 2
	});

	var att_right = new Kinetic.Rect({
	    x: stage.width() - pad_width/3 - btn_margin,
        y: stage.height() - pad_width + pad_width /3 - btn_margin,
	    width: WIDTH,
	    height: WIDTH,
	    stroke: 'white',
	    strokeWidth: 2
	});






	att_up.on('mousedown', function() {
		keyUp = true;
	});
	att_up.on('mouseup', function() {
	    writeMessage('Touchend circle');
	});

	layer.add(att_up);
	layer.add(att_left);
	layer.add(att_down);
	layer.add(att_right);
	layer.add(text);
	stage.add(layer);