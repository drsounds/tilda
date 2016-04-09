const FLAG_SIDE_SCROLLING = 0x1;
const TILE_SIZE = 16;
const NUM_SCREEN_TILES_X = 124;
const NUM_SCREEN_TILES_Y = 128;
const TILE_SOLID = 1;
const TILE_FLAG_JUMP_LEFT = 2;
const TILE_FLAG_JUMP_TOP = 4;
const TILE_FLAG_JUMP_RIGHT = 8;
const TILE_FLAG_JUMP_BOTTOM = 16;
const GAME_READY = 0;
const GAME_RUNNING = 1;
const TOOL_POINTER = 0;
const TOOL_DRAW = 1;
const TOOL_PROPERTIES = 2;
const MODE_PLAYING = 0;
const MODE_EDITING = 1;
var TILESET = ``;

class Renderer {
	constructor() {
	}
	
	loadImage(url) {
	}
	
	translate(x, y) {
		
	}
	
	renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {

	}
	
	clear() {
		
	}
}

export class CanvasRenderer extends Renderer {
	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}
	
	clear() {
		this.context.fillStyle = 'white';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	translate(x, y) {
		this.context.translate(x, y);
	}
	
	loadImage(url) {
		
		var image = new Image();
		image.src = 'img/tileset.png';
		return image;
	}

	renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {
		this.context.drawImage(image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight);
	}
}

export class Tilda {
	dispatchEvent(event) {
		if (this.hasOwnProperty('on' + event.type) && this['on' + event.type] instanceof Function) {
			this['on' + event.type].call(this, event);
		}
	}
	addEventListener(eventId, callback) {
		this['on' + eventId] = callback;
	}
	
	
	getPostionFromCursor() {
		var width = this.renderer.canvas.width;
		var height = this.renderer.canvas.height;
		var pageWidth = this.renderer.canvas.getBoundingClientRect().width;
		var pageHeight = this.renderer.canvas.getBoundingClientRect().height;
		
		var cx = width;
		var cy = height;
		
		var x = ((event.pageX - this.renderer.canvas.getBoundingClientRect().left) / pageWidth) * cx;
		var y = (event.pageY / pageHeight) * cy ;
		
		var selectedX = Math.floor((x + 1) / TILE_SIZE);
	 	var selectedY = Math.floor((y + 1) / TILE_SIZE) ;
		return {
			x: selectedX,
			y: selectedY
		};
	}
	
	constructor (renderer) {
		
		this.gameWidth = 192;
		this.gameHeight = 192;
		renderer.canvas.width = this.gameWidth;
		renderer.canvas.height = this.gameHeight;
		
		
		this.renderer = renderer;
		this.zoom = {
			x: 1,
			y: 1
		};
		this.level = null;
		this.blockTypes = {};
		this.editor = {
			selectedX: 0,
			tool: TOOL_POINTER,
			selectedY: 0,
			activeBlockType: 15
		};
		this.cameraX = 0;
		this.activeTile = {
			x: 1, y: 2
		};
		this.cameraY = 0;
		this.activeTool = 0;
		this.isJumpingOver = false;
		this.mode = MODE_EDITING;
		this.tileset = this.renderer.loadImage('img/tileset.png');
		this.loadTiles(TILESET);
		this.state = GAME_READY;
		var xmlHttp = new XMLHttpRequest();
	
		xmlHttp.onreadystatechange = () => {
		if (xmlHttp.readyState == 4) {
		    if (xmlHttp.status == 200) {
		        var lines = xmlHttp.responseText.split('\n');
		        for (var i in lines) {
		        	var block = new Block(lines[i]);
		            this.blockTypes[block.id] = block;
		
		        	
		        }
		        
		    } else {
		    }
		}
		};
		xmlHttp.open('GET', '/t.tileset', true);
		xmlHttp.send(null);
		window.addEventListener('mousedown', (event) => {
			if (this.mode != MODE_EDITING) {
				return;
			}
			var pos = this.getPostionFromCursor();

			if (event.which == 1) {
				
			
			
				switch(this.editor.tool) {
					case TOOL_DRAW:
						this.level.setBlock(pos.x, pos.y, {
							x: pos.x,
							y: pos.y,
							type: this.editor.activeBlockType
						});
						break;
					case TOOL_POINTER:
						this.editor.selectedX = pos.x;
						this.editor.selectedY = pos.y;
						this.propertiesWindow.contentWindow.postMessage(
							{
								block: this.level.blocks[this.editor.selectedX][this.editor.selectedY]
								
							},
							'*'
						)
						break;
				}
				this.level.save();
			
			}
			if (event.which == 3) {
				event.preventDefault();
				this.level.removeBlock(pos.x, pos.y);
				this.level.save();
			}
		});
		window.addEventListener('message', (event) => {
			this.editor.tool = event.data.tool;
				if ('blockType' in event.data) {
					if (event.data.blockType != null) {
						this.activeTool = TOOL_DRAW;
						this.editor.activeBlockType = event.data.blockType;
					} else {
						this.activeTool = TOOL_POINTER;
					}
				} 	
				if ('block' in event.data) {
					this.level.blocks[event.data.block.x][event.data.block.y] = event.data.block;
				}
		})
	}
	
	getBlockType(blockType) {
		for (var b in this.blockTypes) {
			var bt = this.blockTypes[b];
			if (bt.tileX == blockType.tileX && bt.tileY == blockType.tileY && bt.flags == blockType.flags) {
				return b;
			}
		}
	}
	
	start() {
		this.gameInterval = setInterval(this.tick.bind(this), 5);
		this.renderInterval = setInterval(this.render.bind(this), 5);
		this.state = GAME_RUNNING;
	}

	stop() {
		clearInterval(this.gameInterval);
		clearInterval(this.renderInterval);
		this.state = GAME_READY;
	}

	loadTiles(tiles) {
		var tiles = tiles.split('\n');
		for (var i = 1; i < tiles.length; i++) {
			var tile = tiles[i];

			var blockType = new Block(tile);
			this.blockTypes[i] = blockType;
		}
	}

	loadLevel(id) {
		return new Promise((resolve, reject) => {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () => {
				if (xmlHttp.readyState == 4) {
					if (xmlHttp.status == 200) {
						var level = JSON.parse(xmlHttp.responseText);
						level = new Level(this, level);
						level.id = id;
						
						this.setLevel(level);
						resolve(level);
					} else {
						reject();
					}
				}
			}
			xmlHttp.open('GET', '/api/levels/' + id, true);
			xmlHttp.send(null);
		});
	}

	setLevel(level) {
		this.level = level;
		var evt = new CustomEvent('levelchanged');
		evt.data = {
			level: level
		};
		
		this.dispatchEvent(evt);
	}

	tick() {
		for (var i in this.level.objects) {
			var obj = this.level.objects[i];
			obj.tick();
		}
		for (var x in this.level.blocks) {
			for (var y in this.level.blocks[x]) {
				for (var i in this.level.objects) {
					var left = x * TILE_SIZE;
					var top = y * TILE_SIZE;
					var block = this.level.blocks[x][y];
					if (!block) {
						return;
					}
					var blockType = this.blockTypes[block.type];
					if (!blockType) {
						continue;
					}
					if (this.isJumpingOver) {
						return;
					}
					var is_solid = (blockType.flags & TILE_SOLID) == TILE_SOLID;
					var obj = this.level.objects[i];
					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.y > top - TILE_SIZE * 0.8 && obj.y < top + TILE_SIZE / 2 - 1 && obj.moveX > 0 && is_solid) {
						if ((blockType.flags & TILE_FLAG_JUMP_LEFT) == TILE_FLAG_JUMP_LEFT) {
							this.isJumpingOver = true;
							obj.moveX = -4;
							obj.moveZ = 5;
						} else {
							obj.moveX = 0;
						}
					}
					
					if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 - 1 && obj.x < left + TILE_SIZE * 0.9 && obj.x > left - TILE_SIZE * 0.8 && obj.moveX < 0 && is_solid) {
					
						if ((blockType.flags & TILE_FLAG_JUMP_RIGHT)  == TILE_FLAG_JUMP_RIGHT) {
							this.isJumpingOver = true;
							obj.moveX = 3;
							obj.moveZ = 3;
						} 
							obj.moveX = 0;
						
					}

					if (obj.x > left - TILE_SIZE / 2 && obj.x < left + TILE_SIZE * 0.7 && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 && obj.moveY > 0 && is_solid) {
						
						if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM)  == TILE_FLAG_JUMP_BOTTOM) {
							this.isJumpingOver = true;
							obj.moveY = 1;
							obj.moveZ = 1;
						} else {
							obj.moveY = 0;
						}
					}

					if (obj.x > left - TILE_SIZE * .9 && obj.x < left + TILE_SIZE * .7 && obj.y < top + TILE_SIZE / 2 && obj.y > top - TILE_SIZE * 0.9 && obj.moveY < 0 && is_solid) {
						if ((blockType.flags & TILE_FLAG_JUMP_TOP) == TILE_FLAG_JUMP_TOP) {
							this.isJumpingOver = true;
							obj.moveY = -0.6;
							obj.moveZ = 1;
						} else {
							obj.moveY = 0;
						}
					}


				}

			}
		}
	}

	render() {
		this.renderer.clear();
		if (this.level) {
			for (var x in this.level.blocks) {
				for (var y in this.level.blocks[x]) {
					var left = ((TILE_SIZE * x) - this.cameraX) * this.zoom.x;
					var top = ((TILE_SIZE * y) - this.cameraY) * this.zoom.y;
					var width = TILE_SIZE * this.zoom.x;
					var height = TILE_SIZE * this.zoom.y;
					var block = this.level.blocks[x][y];
					if (!block) {
						return;
					}
					var type = this.blockTypes[block.type];
					if (!type) {
						continue;
					}
					var tileX = type.tileX * TILE_SIZE;
					var tileY = type.tileY * TILE_SIZE;
					
					this.renderer.renderImageChunk(this.tileset, left, top,  width, height, tileX, tileY, width, height); 
				}
			}
			for (var i in this.level.objects) {
				var object = this.level.objects[i];
				var left = ((object.x) - this.cameraX) * this.zoom.x;
				var top = ((object.y) - this.cameraY) * this.zoom.y;
				var zeta = ((object.z)) * this.zoom.y;
				var width = TILE_SIZE * this.zoom.x;
				var height = TILE_SIZE * this.zoom.y;
				var tileX = object.tileX * TILE_SIZE;
				var tileY = object.tileY * TILE_SIZE;
				if (zeta > 0) {
				}
				this.renderer.renderImageChunk(this.tileset, left, top, width, height, 0, TILE_SIZE * 1, width, height); 
				this.renderer.renderImageChunk(this.tileset, left, top - zeta,  width, height, tileX, tileY, width, height);  // Render shadow
			}
			for (var i in this.blockTypes) {
				var block = this.blockTypes[i];
				var width = TILE_SIZE * this.zoom.x;
				var height = TILE_SIZE * this.zoom.y;
				var left = (i * TILE_SIZE) * this.zoom.x;
				var top = (this.renderer.canvas.height ) - TILE_SIZE * 2;
				//this.renderer.renderImageChunk(this.tileset, left, top, width, height, block.tileX * TILE_SIZE, block.tileY * TILE_SIZE, width, height);
			}
		}
		
		// set camera
		var clusterX = Math.floor((this.level.player.x + 1) / this.gameWidth);
		var clusterY = Math.floor((this.level.player.y + 1) / this.gameHeight);
		this.cameraX = clusterX * this.gameWidth;
		this.cameraY = clusterY * this.gameHeight;
		var width = TILE_SIZE * this.zoom.x;
		var height = TILE_SIZE * this.zoom.y;
		this.renderer.renderImageChunk(this.tileset, 0, this.renderer.canvas.height - TILE_SIZE * 2, TILE_SIZE, TILE_SIZE, this.activeTile.x * TILE_SIZE, this.activeTile.x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		
		this.renderer.context.beginPath();
		this.renderer.context.strokeStyle = 'blue';
		this.renderer.context.strokeWidth = '1px';
		this.renderer.context.rect(this.editor.selectedX * TILE_SIZE, this.editor.selectedY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		this.renderer.context.stroke();
	}
}


class Entity {
	constructor(game, level) {
		this.level = level;
		this.game = game;
		this.moveX = 0;
		this.moveY = 0;
		this.moveZ = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.tileX = 0;
		this.tileY = 0;
	}
	tick() {
		this.x += this.moveX;
		this.y += this.moveY;
		this.z += this.moveZ;
		if (this.z > 0) {
		this.moveZ -= 0.03;
		}
		if (this.z < 0) {
			this.moveZ = 0;
			if (this.game.isJumpingOver) {
				this.game.isJumpingOver = false;
				this.moveX = 0;
				
				this.moveY = 0;
			}
			this.z = 0;
		}
	}
	render() {

	}
}


class CharacterEntity extends Entity {
	constructor(game, level) {
		super(game, level);
		this.level = level;
		this.x = this.level.player.x;
		this.tileX = 2;
		this.tileY = 1;
		this.y = this.level.player.y;
	
	}
	
	turnRight() {
		
		this.tileX = 4;
	}
	turnLeft() {
		
		this.tileX = 5;
	}
	turnUp() {
		
		this.tileX = 2;
	}
	turnDown() {
		
		this.tileX = 3;
	}
	walkLeft() {
		this.turnLeft();
		this.moveX = -.3;
	}
	
	walkRight() {
		this.turnRight();
		this.moveX = .3;
		
	}
	
	walkUp() {
		this.moveY = -.3;
		this.turnUp();
	}
	
	walkDown() {
		this.moveY = .3;
		this.turnDown();
	}
	
	jump() {
		this.moveZ = 1;
	}
	
	render() {

	}
}


class PlayerEntity extends CharacterEntity {
	
	
	constructor(game, level) {
		super(game, level);
		
		window.onkeydown = (event) => {
			if (this.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				this.walkUp();
			
			}
			if (event.code == 'ArrowDown') {
				this.walkDown();
			}
			if (event.code == 'ArrowLeft') {
				this.walkLeft();
			}
			if (event.code == 'ArrowRight') {
				this.walkRight();
			}
			if (event.code == 'KeyA') {
				this.jump();
			}
		}
		window.onkeyup = (event) => {
			if (this.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				this.moveY = -0;
			}
			if (event.code == 'ArrowDown') {
				this.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				this.moveX = -0;
			}
			if (event.code == 'ArrowRight') {
				this.moveX = 0;
			}
			if (event.code == 'KeyA') {
				this.moveZ = 0;
			}
		}
		
	}
	
}


class Block {
	constructor(tile) {
		var parts = tile.split(' ');
		this.id = parts[0];
		this.tileX = parseInt(parts[1]);
		this.tileY = parseInt(parts[2]);
	
		this.flags = parseInt(parts[3]);
	}
}

class Level {
	setBlock(x, y, block) {
		if (!(x in this.blocks)) {
			this.blocks[x] = {};
		}
		if (!block) {
			return;
		}
		this.blocks[x][y] = block;
	}
	
	removeBlock(x, y) {
		delete this.blocks[x][y];
	}
	
	save() {
		var jsonData = {
			blocks:[],
			player: {
				x: this.player.x,
				y: this.player.y
			}
		};
		
		for (var x in this.blocks) {
			for (var y in this.blocks[x]) {
				var block = this.blocks[x][y];
				if (!block) {
					return;
				}
				jsonData.blocks.push(block);
			}
		}
		
		var json_upload = JSON.stringify(jsonData, null, 2);
		var xmlHttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var json = JSON.parse(xmlHttp.responseText);
					
				} else {
					debugger;
				}
			}
		}
		xmlHttp.open("PUT", "/api/levels/" + this.id + '', true);
		xmlHttp.setRequestHeader("Content-Type", "application/json");
		xmlHttp.send(json_upload);
	}
	constructor(game, level) {
		this.game = game;
		this.name = level.name;
		this.blocks = {};
		this.flags = level.flags;
		this.objects = [];
		for (var i in level.blocks) {
			var block = level.blocks[i];
			this.setBlock(block.x, block.y, block);
		}
		this.player = new PlayerEntity(game, level);
		this.objects.push(this.player);
	}

	render() {

	}
}


