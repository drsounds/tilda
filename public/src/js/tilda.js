const FLAG_SIDE_SCROLLING = 0x1;
const TILE_SIZE = 16;
const NUM_SCREEN_TILES_X = 24;
const NUM_SCREEN_TILES_Y = 28;
const TILE_SOLID = 1;
const TILE_FLAG_JUMP_LEFT = 2;
const TILE_FLAG_JUMP_TOP = 4;
const TILE_FLAG_JUMP_RIGHT = 8;
const TILE_FLAG_JUMP_BOTTOM = 16;
const GAME_READY = 0;
const GAME_RUNNING = 1;
var TILESET = `x y flags
0 0 1
1 0 5
2 0 5
3 0 1
0 1 3
1 1 1
2 1 1
3 1 8
1 2 1
2 2 1
3 2 8
0 3 1
1 3 17
2 3 17`;


class Renderer {
	constructor() {
	}

	renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {

	}
}

class CanvasRenderer extends Renderer {
	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}

	renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {
		this.context.drawImage(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight);
	}

	clear() {

	}
}

export default class Tilda {
	constructor (renderer) {
		this.renderer = renderer;
		this.tileset = new Image();
		this.zoomFactor = 1;
		this.tileset.src = 'img/tileset.png';
		this.level = null;
		this.graphics = canvas.getContext('2d');
		this.blockTypes = {};
		this.editor = {
			activeTile: -1
		};
		this.cameraX = 0;
		this.cameraY = 0;
		this.loadTiles(TILESET);
		this.state = GAME_READY;
	}

	start() {
		this.gameInterval = setInterval(this.tick.bind(this), 10);
		this.renderInterval = setInterval(this.render.bind(this), 15);
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

			var blockType = new BlockType(tile);
			this.blockTypes[i] = blockType;
		}
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
					var obj = this.level.objects[i];
					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.moveX > 0 && (obj.flags & TILE_SOLID)) {
						if (obj.flags & TILE_FLAG_JUMP_LEFT) {
							obj.moveX = -2;
							obj.moveZ = 5;
						} else {
							obj.moveX = 0;
						}
					}

					if (obj.x < left + TILE_SIZE && obj.x > left && obj.moveX < 0 && (obj.flags & TILE_SOLID)) {
					
						if (obj.flags & TILE_FLAG_JUMP_RIGHT) {
							obj.moveX = 2;
							obj.moveZ = 5;
						} else {
							obj.moveX = 0;
						}
					}

					if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE && obj.moveY > 0 && (obj.flags & TILE_SOLID)) {
						
						if (obj.flags & TILE_FLAG_JUMP_BOTTOM) {
							obj.moveY = 2;
							obj.moveZ = 5;
						} else {
							obj.moveY = 0;
						}
					}

					if (obj.x < top + TILE_SIZE && obj.y > top && obj.moveY < 0 && (obj.flags & TILE_SOLID)) {
						if (obj.flags & TILE_FLAG_JUMP_BOTTOM) {
							obj.moveY = 2;
							obj.moveZ = 5;
						} else {
							obj.moveY = 0;
						}
					}


				}

			}
		}
	}

	render(renderer) {
		this.renderer.clear();
		if (this.level) {
			for (var x in this.level.blocks) {
				for (var y in this.level.blocks[x]) {
					var left = ((TILE_SIZE * x) - this.cameraX) * this.zoomFactor;
					var top = ((TILE_SIZE * y) - this.cameraY) * this.zoomFactor;
					var width = TILE_SIZE * this.zoomFactor;
					var height = TILE_SIZE * this.zoomFactor;
					var block = this.levels.blocks[x][y];
					var type = this.blockTypes[block.type];
					var tileX = type.tileX * TILE_SIZE;
					var tileY = type.tileY * TILE_SIZE;
					this.renderer.renderImageChunk(this.tileset, left, top,  width, height, tileX, tileY, width, height); 
				}
			}
			for (var i in this.level.objects) {
				var object = this.level.objects[i];
				var left = ((object.x) - this.cameraX) * this.zoomFactor;
				var top = ((object.y) - this.cameraY) * this.zoomFactor;
				var zeta = ((object.z)) * this.zoomFactor;
				top -= zeta;
				var width = TILE_SIZE * this.zoomFactor;
				var height = TILE_SIZE * this.zoomFactor;
				var tileX = object.tileX * TILE_SIZE;
				var tileY = object.tileY * TILE_SIZE;
				this.renderer.renderImageChunk(this.tileset, left, top,  width, height, tileX, tileY, width, height);  // Render shadow
				this.renderer.renderImageChunk(this.tileset, left, top - zeta, width, height, 0, TILE_SIZE * 1, tileX, tileY, width, height); 
			}
		}
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
		this.moveZ /= 0.5;
		this.z -= 2;
		if (this.z < 0) {
			this.moveZ = 0;
			this.z = 0;
		}
	}
	render() {

	}
}


class PlayerEntity extends Entity {
	constructor(level) {
		super(level);
		window.onkeydown = (event) => {
			if (event.code == 'ArrowUp') {
				this.moveY = -2;
			}
			if (event.code == 'ArrowDown') {
				this.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				this.moveX = -2;
			}
			if (event.code == 'ArrowRight') {
				this.moveX = 2;
			}
			if (event.code == 'Numpad1') {
				this.moveZ = 2;
			}
		}
		window.onkeyup = (event) => {
			if (event.code == 'ArrowUp') {
				this.moveY = -0;
			}
			if (event.code == 'ArrowDown') {
				this.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				this.moveY = -0;
			}
			if (event.code == 'ArrowRight') {
				this.moveY = 0;
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
		this.blocks[x][y] = block;
	}
	constructor(game, name, flags) {
		this.flags = flags;
		this.game = game;
		this.name = name;
		this.blocks = {};
		this.objects = [];
	}

	render() {

	}
}


