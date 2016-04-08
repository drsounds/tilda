const {Tilda, CanvasRenderer} = require('./tilda.js');

window.addEventListener('load', () => {
    var canvasRenderer = new CanvasRenderer(document.querySelector('canvas'));
	var game = new Tilda(canvasRenderer);
	game.loadLevel('levels/overworld.json').then((level) => {
	   game.start(); 
	});
});