const {Tilda, CanvasRenderer} = require('./tilda.js');


window.addEventListener('load', () => {
    var canvasRenderer = new CanvasRenderer(document.querySelector('canvas'));
	var game = new Tilda(canvasRenderer);
	
	var path = window.location.pathname.substr(1).split(/\//g);
	var level = 'overworld';
	console.log(path);
	if (path.length > 1) {
		level = path[1];
	}

	game.loadLevel(level).then((level) => {
	   game.start(); 
	   var iframe = document.createElement('iframe');
	   iframe.style.height = 1200;
	   game.propertiesWindow = document.querySelector('iframe#properties');
	   $('#script').val(game.level.script);
	});
	window.saveFields = function () {
		game.level.script = $('#script').val();	 
	   	game.level.save();	
	};
	game.addEventListener('levelchanged', function (event) {
		history.pushState(
			{
				level: event.data.level.id
			},
			'Level',
			'/level/' + event.data.level.id
		);
		 $('#script').val(game.level.script);
	});
});