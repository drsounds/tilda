export default class Tilda {
	dispatchEvent(event) {
		if (this.hasOwnProperty('on' + event.type) && this['on' + event.type] instanceof Function) {
			this['on' + event.type].call(this, event);
		}
	}
	addEventListener(eventId, callback) {
		this['on' + eventId] = callback;
	}
	
	seq() {
		this.sequence = arguments[0];
		if (!this.sequence) {
			
		}
		this.next();
	}
	
	/**
	 * Returns the cluster the player is in 
	 **/
	getCluster() {
		var clusterX = Math.floor((this.level.player.x + 1) / this.gameWidth);
		var clusterY = Math.floor((this.level.player.y + 1) / this.gameHeight);
		return {
			x: clusterX,
			y: clusterY
		};
	}
	
	addEntity(id, type, x, y) {
		var cluster = this.getCluster();
		return this.level.addEntity(id, type, x + cluster.x * this.gameWidth, cluster.y * this.gameHeight);
	}
	
	getEntity(obj) {
		return this.level.entities[obj];
	} 
	
	lock() {
		this.status.locked = true;
	}
	
	unlock() {
		this.status.locked = false;
	}
	
	next() {
		
		this.text = '';
		if (this.sequence == null) {
			return;
		}
		if (this.sequence.length < 1) {
			return;
		}
		var nextOperation = this.sequence.pop();
		
		nextOperation.call(this);
	}
	
	getPostionFromCursor() {
		var width = this.renderer.canvas.width;
		var height = this.renderer.canvas.height;
		var pageWidth = this.renderer.canvas.getBoundingClientRect().width;
		var pageHeight = this.renderer.canvas.getBoundingClientRect().height;
		var bounds = this.renderer.canvas.getBoundingClientRect();
		
		var cx = width;
		var cy = height;
		
		var x = ((event.pageX - bounds.left) / pageWidth) * cx;
		var y = ((event.pageY - bounds.top) / pageHeight) * cy ;
		
		var selectedX = Math.floor((x + 1) / TILE_SIZE);
	 	var selectedY = Math.floor((y + 1) / TILE_SIZE) ;
		return {
			x: selectedX,
			y: selectedY
		};
	}
	
	/**
	 * Tells us if a certain flag is meet
	 * */
	hasFlag(flag) {
		return this.status.flags.indexOf(flag) != -1;
		
	}
	
	getSetting(setting, defaultValue) {
		if (!setting in this.status.settings) {
			return defaultValue;
		}
		return this.status.settings[setting];
	}
	
	constructor (renderer) {
		this.timers = {};
		this.gameWidth = 192;
		
		this.gameUrl = '';
		this.gameHeight = 192;
		renderer.canvas.width = this.gameWidth;
		renderer.canvas.height = this.gameHeight;
		
		this.sequences = {};
		
		this.renderer = renderer;
		this.zoom = {
			x: 1,
			y: 1
		};
		this.entityTypes = {
			'CharacterEntity': CharacterEntity,
			'PlayerEntity': PlayerEntity
		}
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
		this.keysPressed = [];
		this.cameraY = 0;
		this.activeTool = 0;
		this.isJumpingOver = false;
		this.mode = MODE_EDITING;
		this.tileset = this.renderer.loadImage('img/tileset.png');
		this.loadTiles(TILESET);
		this.state = GAME_READY;
		this.activeBlock = null;
		this.aKeyPressed = false;
		this.status = {
			yin: 0,
			locked: false,
			yang: 0,
			points: 0,
			exp: 0,
			settings: {},
			flags: [],
			level: null
		}
		this.text = '';
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
		xmlHttp.open('GET', this.gameUrl + '/t.tileset', true);
		xmlHttp.send(null);
		this.renderer.canvas.addEventListener('mousedown', (event) => {
			if (this.mode != MODE_EDITING) {
				return;
			}
			var pos = this.getPostionFromCursor();
		
			if (event.which == 1) {
				switch(this.editor.tool) {
					case TOOL_DRAW:
						this.level.setBlock(pos.x + this.cameraX / TILE_SIZE, pos.y + this.cameraY / TILE_SIZE, {
							x: pos.x + this.cameraX / TILE_SIZE,
							y: pos.y + this.cameraY / TILE_SIZE,
							type: this.editor.activeBlockType
						});
						break;
					case TOOL_POINTER:
						if (event.shiftKey) {
							this.level.removeBlock(pos.x + this.cameraX / TILE_SIZE, pos.y + this.cameraY / TILE_SIZE);
							this.level.save();
							return
						}
						this.editor.selectedX = pos.x;
						this.editor.selectedY = pos.y;
						this.editor.selectedBlock = this.level.blocks[this.editor.selectedX + this.cameraX][this.editor.selectedY + this.cameraY];
						var evt = new CustomEvent('selectedblock');
						evt.data =
							{
								block: this.editor.selectedBlock
							};
						this.dispatchEvent(evt);
						break;
				}
				this.level.save();
			
			}
			
		});
		
		
		
	}
	
	setBlock(block) {
		this.level.blocks[block.x][block.y] = block;
	}
	
	setBlockType(blockType) {
		if (blockType != null) {
			this.activeTool = TOOL_DRAW;
			this.editor.activeBlockType = event.data.blockType;
		} else {
			this.activeTool = TOOL_POINTER;
		}
	} 	
	
	setTool(tool) {
		this.activeTool = tool;
	}
	
	getBlockType(blockType) {
		for (var b in this.blockTypes) {
			var bt = this.blockTypes[b];
			if (bt.tileX == blockType.tileX && bt.tileY == blockType.tileY && bt.flags == blockType.flags) {
				return b;
			}
		}
	}
	
	setTimer(id, time, callback) {
		this.timers[id] = {
			frame: 0,
			time: time,
			callback: callback
		};
	}
	
	async playSequence(sequence) {
		await Promise.all(
			sequence.map(
				action => new Promise(
					async (resolve, fail) => {
						await sleep(action.time)
						action.callback(this)
					}
				)
			)
		)
	}
	
	start() {
		this.gameInterval = setInterval(this.tick.bind(this), 5);
		this.renderInterval = setInterval(this.render.bind(this), 5);
		this.state = GAME_RUNNING;
		this.ic = setInterval(() => {
				let event = new CustomEvent('move')
				event.data = {
					level: this.level
				}
				this.dispatchEvent(event)
		}, 1000)
		
		
	}

	stop() {
		clearInterval(this.ic)
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

	loadLevel(id, position={x:0, y: 0}) {
		return new Promise((resolve, reject) => {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () => {
				if (xmlHttp.readyState == 4) {
					if (xmlHttp.status == 200) {
						var level = JSON.parse(xmlHttp.responseText);
						level = new Level(this, level);
						level.player.x = position.x
						level.player.y = position.y
						
						level.id = id;
						
						this.setLevel(level, position);
						resolve(level);
					} else {
						reject();
					}
				}
			}
			xmlHttp.open('GET', this.gameUrl + '/api/levels/' + id, true);
			xmlHttp.send(null);
		});
	}

	setLevel(level, position={x: 0, y: 0}) {
		this.level = level;
		var evt = new CustomEvent('levelchanged');
		evt.data = {
			level: level
		};
		if ('script' in level) {
			try {
				var func = new Function(level.script);
				func.call(this);
			} catch (e) {
				console.log(e.stack);
			}
		}
		this.dispatchEvent(evt);
	}
	
	message(message, cb) {
		this.text = message;
	}
	
	tick() {
		for (var i in this.timers) {
			this.timers[i].frame += 1;
			if (this.timers[i].frame == this.timers.time) {
				debugger;
				this.timers[i].callback.call(this);
			}
		}
		for (var i in this.level.objects) {
			var obj = this.level.objects[i];
			obj.tick();
		}
		for (var x in this.level.blocks) {
			for (var y in this.level.blocks[x]) {
				for (var i in this.level.objects) {
					var collidied = false;
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
						if ((blockType.flags & TILE_FLAG_JUMP_RIGHT) == TILE_FLAG_JUMP_RIGHT) {
							this.isJumpingOver = true;
							obj.moveX = .2;
							obj.moveZ = 1;
						} else {
							obj.moveX = 0;
						}
					}
					
					if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 - 1 && obj.x < left + TILE_SIZE && obj.x > left - TILE_SIZE && obj.moveX < 0 && is_solid) {
						
						if ((blockType.flags & TILE_FLAG_JUMP_LEFT)  == TILE_FLAG_JUMP_LEFT) {
							this.isJumpingOver = true;
							obj.moveX = -.2;
							obj.moveZ = 1;
						}  else {
							obj.moveX = 0;
						}
					}

					if (obj.x > left - TILE_SIZE / 2 && obj.x < left + TILE_SIZE * 0.7 && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 - 2 && obj.moveY > 0 && is_solid) {
						if (block.teleport) {
							if (block.teleport.level) {
								this.loadLevel(block.teleport.level);
							}
						}
						if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM)  == TILE_FLAG_JUMP_BOTTOM) {
							this.isJumpingOver = true;
							obj.moveY = 1;
							obj.moveZ = 1;
						} else {
							obj.moveY = 0;
						}
					}

					if (obj.x > left - TILE_SIZE  && obj.x < left + TILE_SIZE -1 && obj.y < top + TILE_SIZE / 2 && obj.y > top - TILE_SIZE && is_solid) {
						if (block.script && block.script.length > 0 && this.aKeyPressed) { // #QINOTE #AQUAJOGGING@R@CT
							if (block.script.indexOf('res://') == 0) {
								
								var xmlHttp = new XMLHttpRequest();
								xmlHttp.onreadystatechange = () => {
									if (xmlHttp.readyState == 4) {
										if (xmlHttp.status == 200) {
		 									try {
												var func = new Function(xmlHttp.responseText);
												func = func.bind(this);
												func();
											}catch(e) {
												console.log(e.stack);
											}
										}
 									}
								};
								xmlHttp.open('GET', this.gameUrl + block.script.substr('res://'.length));
								xmlHttp.send(null);
							} else {
								try {
									var func = new Function(block.script);
									func.apply(this);
								}catch(e) {
									console.log(e.stack);
								}
							}
						
						
						}
						
						if (obj.moveY < 0) {
							
							if (block.teleport) {
								if (block.teleport.level) {
									this.loadLevel(block.teleport.level);
								}
							}
							if ((blockType.flags & TILE_FLAG_JUMP_TOP) == TILE_FLAG_JUMP_TOP) {
								this.isJumpingOver = true;
								obj.moveY = -0.6;
								obj.moveZ = 1;
							} else {
								obj.moveY = -0;
							}
							this.activeBlock = block;
							collidied = true;
						}
					}
					if (!collidied) {
						this.activeBlock = null;
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
				//this.renderer.renderImageChunk(this.tile, left, top, width, height, block.tileX * TILE_SIZE, block.tileY * TILE_SIZE, width, height);
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
		
		this.renderer.context.font = "11px Courier";
		this.renderer.context.fillStyle = 'black';
		this.renderer.context.fillText(`points ${this.status.points}`, 2, 12);
		if (this.text && this.text.length > 0) {
			this.renderer.context.fillStyle = 'rgba(0, 0, 0, .8)';
			this.renderer.context.fillRect(10, 22, 180, 60);
			this.renderer.context.fillStyle = 'white';
			wrapText(this.renderer.context, this.text, 22, 32, 180, 9);
	
		}
	}
}


// From http://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function wrapText(context, text, x, y, line_width, line_height)
{
    var line = '';
    var paragraphs = text.split('\n');
    for (var i = 0; i < paragraphs.length; i++)
    {
        var words = paragraphs[i].split(' ');
        for (var n = 0; n < words.length; n++)
        {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > line_width && n > 0)
            {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += line_height;
            }
            else
            {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
        y += line_height;
        line = '';
    }
}


