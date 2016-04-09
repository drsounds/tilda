const FLAG_SIDE_SCROLLING = 0x1;
const TILE_SIZE = 14;
const NUM_SCREEN_TILES_X = 124;
const NUM_SCREEN_TILES_Y = 128;
const TILE_SOLID = 1;
const TILE_FLAG_JUMP_LEFT = 2;
const TILE_FLAG_JUMP_TOP = 4;
const TILE_FLAG_JUMP_RIGHT = 8;
const TILE_FLAG_JUMP_BOTTOM = 16;
const GAME_READY = 0;
const GAME_RUNNING = 1;
var TILESET = `x y flags
1 0 1
2 0 5
3 0 5
4 0 1
1 1 3
2 1 1
3 1 1
4 1 8
2 2 1
3 2 1
4 2 8
1 3 1
2 3 17
3 3 17`;


class Renderer {
	constructor() {
	}
	
	loadImage(url) {
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
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
	constructor (renderer) {
		this.renderer = renderer;
		this.zoom = {
			x: 1,
			y: 1
		};
		this.level = null;
		this.blockTypes = {};
		this.editor = {
			activeTile: -1
		};
		this.cameraX = 0;
		this.activeTile = -1;
		this.cameraY = 0;
		this.selectedX = 0;
		this.controlsLocked = false;
		this.selectedY = 0;
		this.tileset = this.renderer.loadImage('img/tileset.png');
		this.loadTiles(TILESET);
		this.state = GAME_READY;
		window.addEventListener('click', (event) => {
			var width = this.renderer.canvas.width;
			var height = this.renderer.canvas.height;
			var pageWidth = window.innerWidth;
			var pageHeight = window.innerHeight;
			
			var cx = width;
			var cy = height;
			
			var x = (event.pageX / pageWidth) * cx;
			var y = (event.pageY / pageHeight) * cy;
			
			this.selectedX = Math.floor((x + 1) / TILE_SIZE);
			this.selectedY = Math.floor((y + 1) / TILE_SIZE) ;
			
		})
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

	loadLevel(url) {
		return new Promise((resolve, reject) => {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () => {
				if (xmlHttp.readyState == 4) {
					if (xmlHttp.status == 200) {
						var level = JSON.parse(xmlHttp.responseText);
						level = new Level(this, level);
						this.setLevel(level);
						resolve(level);
					} else {
						reject();
					}
				}
			}
			xmlHttp.open('GET', url, true);
			xmlHttp.send(null);
		});
	}

	setLevel(level) {
		this.level = level;
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
					var blockType = this.blockTypes[block.type];
					var is_solid = (blockType.flags & TILE_SOLID) == TILE_SOLID;
					var obj = this.level.objects[i];
					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && block.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.moveX > 0 && is_solid) {
						if ((blockType.flags & TILE_FLAG_JUMP_LEFT) == TILE_FLAG_JUMP_LEFT) {
							this.controlsLocked = true;
							obj.moveX = -2;
							obj.moveZ = 5;
						} else {
							obj.moveX = 0;
						}
					}
					
					if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE && obj.x < left + TILE_SIZE && obj.x > left && obj.moveX < 0 && is_solid) {
					
						if ((blockType.flags & TILE_FLAG_JUMP_RIGHT)  == TILE_FLAG_JUMP_RIGHT) {
							this.controlsLocked = true;
							obj.moveX = 2;
							obj.moveZ = 5;
						} 
							obj.moveX = 0;
						
					}

					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE && obj.moveY > 0 && is_solid) {
						
						if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM)  == TILE_FLAG_JUMP_BOTTOM) {
							this.controlsLocked = true;
							obj.moveY = 2;
							obj.moveZ = 5;
						} else {
							obj.moveY = 0;
						}
					}

					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.y < top + TILE_SIZE && obj.y > top - TILE_SIZE && obj.moveY < 0 && is_solid) {
						if ((blockType.flags & TILE_FLAG_JUMP_TOP) == TILE_FLAG_JUMP_TOP) {
							this.controlsLocked = true;
							obj.moveY = -0.2;
							obj.moveZ = 0.25;
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
					var type = this.blockTypes[block.type];
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
				var top = (this.renderer.canvas.height ) - TILE_SIZE;
				this.renderer.renderImageChunk(this.tileset, left, top, width, height, block.tileX * TILE_SIZE, block.tileY * TILE_SIZE, width, height);
			}
		}
		this.renderer.context.strokeStyle = 'yellow';
		this.renderer.context.rect(this.selectedX * TILE_SIZE, this.selectedY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		this.renderer.context.stroke();
	}
}


class Entity {
	constructor(level) {
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
		this.moveZ *= 0.9;
		if (this.moveZ > 0) {
		}
		this.z -= 0.1;
		if (this.z < 0) {
			this.moveZ = 0;
			this.controlsLocked = false;
			this.z = 0;
		}
	}
	render() {

	}
}


class PlayerEntity extends Entity {
	constructor(level) {
		super(level);
		this.level = level;
		window.onkeydown = (event) => {
			if (this.level.game.controlsLocked) {
				return;
			}
			if (event.code == 'ArrowUp') {
				this.moveY = -.1;
			}
			if (event.code == 'ArrowDown') {
				this.moveY = .1;
			}
			if (event.code == 'ArrowLeft') {
				this.moveX = -0.1;
			}
			if (event.code == 'ArrowRight') {
				this.moveX = .1;
			}
			if (event.code == 'KeyA') {
				this.moveZ = 1;
			}
		}
		window.onkeyup = (event) => {
				if (this.level.game.controlsLocked) {
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
	render() {

	}
}


class Block {
	constructor(tile) {
		var parts = tile.split(' ');
		this.tileX = parseInt(parts[0]);
		this.tileY = parseInt(parts[1]);
	
		this.flags = parseInt(parts[2]);
	}
}

class Level {
	setBlock(x, y, block) {
		block.level = this;
		if (!(x in this.blocks)) {
			this.blocks[x] = {};
		}
		this.blocks[x][y] = block;
	}
	constructor(game, level) {
		this.game = game;
		this.blocks = {};
		this.flags = level.flags;
		this.objects = [];
		for (var i in level.blocks) {
			var block = level.blocks[i];
			var blockType = this.game.blockTypes[block.type];
			this.setBlock(block.x, block.y, block);
		}
		this.objects.push(new PlayerEntity(level.player.x, level.player.y));
	}

	render() {

	}
}


