const {Tilda, CanvasRenderer} = require('./tilda.js');

const queryString = require('query-string');
window.addEventListener('load', () => {
    var canvasRenderer = new CanvasRenderer(document.querySelector('canvas'));
	var game = new Tilda(canvasRenderer);
	
	var path = window.location.pathname.substr(1).split(/\//g);
	const parsed = queryString.parse(window.location.search);
	let location = {x: 0, y: 0}
	
	if (parsed.x) location.x = parseFloat(parsed.x)
	if (parsed.y ) location.y = parseFloat(parsed.y)
	var level = 'overworld';
	console.log(path);
	if (path.length > 1) {
		level = path[1];
	}
	
	var dockManager = new dockspawn.DockManager(document.querySelector("body"));
	dockManager.initialize();

	var canvas = new dockspawn.PanelContainer(document.querySelector("#canvas"), dockManager);
	var scriptEditor = new dockspawn.PanelContainer(document.querySelector("#scriptWindow"), dockManager);
	var propertiesEditor = new dockspawn.PanelContainer(document.querySelector("#properties"), dockManager);
	var toolbox = new dockspawn.PanelContainer(document.querySelector("#toolbar"), dockManager);
	
	var documentNode = dockManager.context.model.documentManagerNode;
	
	dockManager.dockRight(documentNode, propertiesEditor, 0.1);
	dockManager.dockFill(documentNode, canvas);
	dockManager.dockUp(documentNode, toolbox, 0.2);
	dockManager.dockDown(documentNode, scriptEditor, 0.2);
	
	window.onresize = function (event) {
		dockManager.resize(window.innerWidth, window.innerHeight);
	}
	window.onresize();
	//var editor = ace.edit('script');
	//editor.getSession().setMode('ace/mode/javascript');
	//editor.setTheme('ace/theme/monokai');
	game.loadLevel(level, location).then((level) => {
	   game.start(); 
	   var iframe = document.createElement('iframe');
	   iframe.style.height = 1200;
	   game.propertiesWindow = document.querySelector('iframe#properties');
	   $('#script').val(game.level.script);
	});
	document.querySelector('#toolbar').addEventListener('mousedown', function (event) {
            var x = event.pageX;
            var y = event.pageY - $('#toolbar').offset().top;
            var TILE_SIZE = 16;
            var tileX = Math.floor((x + 1) / TILE_SIZE);
            var tileY = Math.floor((y + 1) / TILE_SIZE);
            var selection = document.querySelector('#selection');
            selection.style.width = TILE_SIZE + 'px';
            selection.style.height = TILE_SIZE + 'px';
            selection.style.left = (tileX * TILE_SIZE) + 'px';
            selection.style.top = (tileY * TILE_SIZE) + 'px';
            var type = null;
            var tool = 0;
            for (var i in game.blockTypes) {
            	var blockType = game.blockTypes[i];
            	if (tileX == blockType.tileX && tileY == blockType.tileY) {
            		type = blockType.id;
            	}
            }
            
            if (tileX == 0 && tileY == 0) {
            	tool = 0;
            } else {
            	tool = 1;
            }
            
            console.log(type);
            game.editor.activeBlockType = type;
            game.editor.tool = tool;
        });
	window.addEventListener('message', (event) => {
		
	});
	game.addEventListener('selectedblock', (event) => {
		var block = event.data.block;
		if (!block) {
			return;
		}
        if (!block.teleport) {
            block.teleport = {
                x: 0,
                y: 0,
                level: null
            };
        }
        $('#teleport_x').val(block.teleport.x);
        $('#teleport_y').val(block.teleport.y);
        $('#yin').val(block.yin);
        $('#yang').val(block.yang);
        $('#teleport_level').val(block.teleport.level);
        $('#object_script').val(block.script);
	});
	window.save = function () {
		try {
			var block = game.editor.selectedBlock;
			block.script = $('#object_script').val();
            block.yin = parseInt($('#yin').val());
            block.yang = parseInt($('#yang').val());
            block.teleport = {
                x: $('#teleport_x').val(),
                y: $('#teleport_y').val(),
                level: $('#teleport_level').val()
            };
			game.setBlock(block);
			debugger;
		} catch (e) {
		}
		game.level.script = $('#script').val();	 
	   	game.level.save();	
	};
	game.addEventListener('move', function (event) {
		history.replaceState(
			{
				level: {
					id:event.data.level.id,
					player: {
						x: event.data.level.player.x,
						y: event.data.level.player.y
					}
				}
			},
			'Level',
			'/level/' + event.data.level.id + '?x=' + event.data.level.player.x + '&y=' +  event.data.level.player.y
		
		);
	})
	game.addEventListener('levelchanged', function (event) {
		history.pushState(
			{
				level: {
					id:event.data.level.id,
					player: {
						x: event.data.level.player.x,
						y: event.data.level.player.y
					}
				},
				position: event.data.position
			},
			'Level',
			'/level/' + event.data.level.id + '?x=' + event.data.level.player.x + '&y=' +  event.data.level.player.y
		
		);
		 $('#script').val(game.level.script);
	});
});