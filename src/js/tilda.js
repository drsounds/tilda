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
		this.activeTile = {
			x: 0, y: 0
		};
		this.cameraY = 0;
		this.selectedX = 0;
		this.activeTool = 0;
		this.isJumpingOver = false;
		this.selectedY = 0;
		this.tileset = this.renderer.loadImage('img/tileset.png');
		this.loadTiles(TILESET);
		this.state = GAME_READY;
		var xmlHttp = new XMLHttpRequest();
	
		xmlHttp.onreadystatechange = () => {
		if (xmlHttp.readyState == 4) {
		    if (xmlHttp.status == 200) {
		        var lines = xmlHttp.responseText.split('\n');
		        for (var i in lines) {
		            this.blockTypes[i] = (new Block(lines[i]));
		
		        	
		        }
		        window.addEventListener('mousedown', (event) => {
		            var x = event.pageX;
		            var y = event.pageY;
		            var TILE_SIZE = 16;
		            var tileX = Math.floor((x + 1) / TILE_SIZE);
		            var tileY = Math.floor((y + 1) / TILE_SIZE);
		            var selection = document.querySelector('#selection');
		            selection.style.width = TILE_SIZE + 'px';
		            selection.style.height = TILE_SIZE + 'px';
		            selection.style.left = (tileX * TILE_SIZE) + 'px';
		            selection.style.top = (tileY * TILE_SIZE) + 'px';
		            var flags = 0;
		            for(var t in this.blockTypes) {
		                var tile = this.blockTypes[t];
		                if (tile.tileX == tileX && tile.tileY == tileY) {
		                    flags = tile.flags;
		                }
		            }
		            window.opener.postMessage({
		                tile: {
		                    x: tileX,
		                    y: tileY,
		                    flags: flags
		                }
		            }, '*');
		        });
		    } else {
		    }
		}
		};
		xmlHttp.open('GET', '/t.tileset', true);
		xmlHttp.send(null);
		window.addEventListener('click', (event) => {
			var width = this.renderer.canvas.width;
			var height = this.renderer.canvas.height;
			var pageWidth = this.renderer.canvas.getBoundingClientRect().width;
			var pageHeight = this.renderer.canvas.getBoundingClientRect().height;
			
			var cx = width;
			var cy = height;
			
			var x = (event.pageX / pageWidth) * cx;
			var y = (event.pageY / pageHeight) * cy - TILE_SIZE;
			
			this.selectedX = Math.floor((x + 1) / TILE_SIZE);
			this.selectedY = Math.floor((y + 1) / TILE_SIZE) ;
			if (this.activeTile.x > 0 && this.activeTile.y > 0) {
				this.level.setBlock(x, y, new Block(
					this.activeTile.x + ' ' + this.activeTile.y + ' ' + this.activeTile.flags	
				));
				
			}
		});
		window.addEventListener('message', (event) => {
			if (event.data.tile) {
				var tileX = event.data.tile.x;
				var tileY = event.data.tile.y;
				this.activeTile.x = tileX;
				this.activeTile.y = tileY;
				if (tileX == 0 && tileY == 0) {
					this.activeTool = TOOL_POINTER;
				} else {
					this.activeTool = TOOL_DRAW;
				}	
			}
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
					if (!blockType) {
						continue;
					}
					if (this.isJumpingOver) {
						return;
					}
					var is_solid = (blockType.flags & TILE_SOLID) == TILE_SOLID;
					var obj = this.level.objects[i];
					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && block.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.moveX > 0 && is_solid) {
						if ((blockType.flags & TILE_FLAG_JUMP_LEFT) == TILE_FLAG_JUMP_LEFT) {
							this.isJumpingOver = true;
							obj.moveX = -4;
							obj.moveZ = 5;
						} else {
							obj.moveX = 0;
						}
					}
					
					if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 && obj.x < left + TILE_SIZE && obj.x > left && obj.moveX < 0 && is_solid) {
					
						if ((blockType.flags & TILE_FLAG_JUMP_RIGHT)  == TILE_FLAG_JUMP_RIGHT) {
							this.isJumpingOver = true;
							obj.moveX = 3;
							obj.moveZ = 3;
						} 
							obj.moveX = 0;
						
					}

					if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE / 2 && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE && obj.moveY > 0 && is_solid) {
						
						if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM)  == TILE_FLAG_JUMP_BOTTOM) {
							this.isJumpingOver = true;
							obj.moveY = 1;
							obj.moveZ = 1;
						} else {
							obj.moveY = 0;
						}
					}

					if (obj.x > left - TILE_SIZE / 2 && obj.x < left + TILE_SIZE && obj.y < top + TILE_SIZE && obj.y > top - TILE_SIZE && obj.moveY < 0 && is_solid) {
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
		this.renderer.translate(0, TILE_SIZE);
		if (this.level) {
			for (var x in this.level.blocks) {
				for (var y in this.level.blocks[x]) {
					var left = ((TILE_SIZE * x) - this.cameraX) * this.zoom.x;
					var top = ((TILE_SIZE * y) - this.cameraY) * this.zoom.y;
					var width = TILE_SIZE * this.zoom.x;
					var height = TILE_SIZE * this.zoom.y;
					var block = this.level.blocks[x][y];
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
		var width = TILE_SIZE * this.zoom.x;
		var height = TILE_SIZE * this.zoom.y;
		this.renderer.renderImageChunk(this.tileset, 0, this.renderer.canvas.height - TILE_SIZE * 2, TILE_SIZE, TILE_SIZE, this.activeTile.x * TILE_SIZE, this.activeTile.x * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		
	/*	this.renderer.context.strokeStyle = 'yellow';
		this.renderer.context.rect(this.selectedX * TILE_SIZE, this.selectedY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		this.renderer.context.stroke();*/
		this.renderer.translate(0, -TILE_SIZE);
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


class PlayerEntity extends Entity {
	constructor(game, level) {
		super(game, level);
		this.level = level;
		this.x = this.level.player.x;
		this.tileX = 2;
		this.tileY = 1;
		this.y = this.level.player.y;
		window.onkeydown = (event) => {
			if (this.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				this.moveY = -.3;
			}
			if (event.code == 'ArrowDown') {
				this.moveY = .3;
			}
			if (event.code == 'ArrowLeft') {
				this.moveX = -.3;
			}
			if (event.code == 'ArrowRight') {
				this.moveX = .3;
			}
			if (event.code == 'KeyA') {
				this.moveZ = 1;
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
		this.objects.push(new PlayerEntity(game, level));
	}

	render() {

	}
}


