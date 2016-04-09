(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _require = require('./tilda.js');

var Tilda = _require.Tilda;
var CanvasRenderer = _require.CanvasRenderer;


window.addEventListener('load', function () {
	var canvasRenderer = new CanvasRenderer(document.querySelector('canvas'));
	var game = new Tilda(canvasRenderer);

	var path = window.location.pathname.substr(1).split(/\//g);
	var level = 'overworld';
	console.log(path);
	if (path.length > 1) {
		level = path[1];
	}

	game.loadLevel(level).then(function (level) {
		game.start();
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		iframe.src = 'tileset.html';
		game.propertiesWindow = document.createElement('iframe');
		document.body.appendChild(game.propertiesWindow);
		game.propertiesWindow.src = 'properties.html';
	});
	game.addEventListener('levelchanged', function (event) {
		history.pushState({
			level: event.data.level.id
		}, 'Level', '/level/' + event.data.level.id);
	});
});

},{"./tilda.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FLAG_SIDE_SCROLLING = 0x1;
var TILE_SIZE = 16;
var NUM_SCREEN_TILES_X = 124;
var NUM_SCREEN_TILES_Y = 128;
var TILE_SOLID = 1;
var TILE_FLAG_JUMP_LEFT = 2;
var TILE_FLAG_JUMP_TOP = 4;
var TILE_FLAG_JUMP_RIGHT = 8;
var TILE_FLAG_JUMP_BOTTOM = 16;
var GAME_READY = 0;
var GAME_RUNNING = 1;
var TOOL_POINTER = 0;
var TOOL_DRAW = 1;
var TOOL_PROPERTIES = 2;
var MODE_PLAYING = 0;
var MODE_EDITING = 1;
var TILESET = '';

var Renderer = function () {
	function Renderer() {
		_classCallCheck(this, Renderer);
	}

	_createClass(Renderer, [{
		key: 'loadImage',
		value: function loadImage(url) {}
	}, {
		key: 'translate',
		value: function translate(x, y) {}
	}, {
		key: 'renderImageChunk',
		value: function renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {}
	}, {
		key: 'clear',
		value: function clear() {}
	}]);

	return Renderer;
}();

var CanvasRenderer = exports.CanvasRenderer = function (_Renderer) {
	_inherits(CanvasRenderer, _Renderer);

	function CanvasRenderer(canvas) {
		_classCallCheck(this, CanvasRenderer);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CanvasRenderer).call(this));

		_this.canvas = canvas;
		_this.context = canvas.getContext('2d');
		return _this;
	}

	_createClass(CanvasRenderer, [{
		key: 'clear',
		value: function clear() {
			this.context.fillStyle = 'white';
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}, {
		key: 'translate',
		value: function translate(x, y) {
			this.context.translate(x, y);
		}
	}, {
		key: 'loadImage',
		value: function loadImage(url) {

			var image = new Image();
			image.src = 'img/tileset.png';
			return image;
		}
	}, {
		key: 'renderImageChunk',
		value: function renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {
			this.context.drawImage(image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight);
		}
	}]);

	return CanvasRenderer;
}(Renderer);

var Tilda = exports.Tilda = function () {
	_createClass(Tilda, [{
		key: 'dispatchEvent',
		value: function dispatchEvent(event) {
			if (this.hasOwnProperty('on' + event.type) && this['on' + event.type] instanceof Function) {
				this['on' + event.type].call(this, event);
			}
		}
	}, {
		key: 'addEventListener',
		value: function addEventListener(eventId, callback) {
			this['on' + eventId] = callback;
		}
	}, {
		key: 'getPostionFromCursor',
		value: function getPostionFromCursor() {
			var width = this.renderer.canvas.width;
			var height = this.renderer.canvas.height;
			var pageWidth = this.renderer.canvas.getBoundingClientRect().width;
			var pageHeight = this.renderer.canvas.getBoundingClientRect().height;

			var cx = width;
			var cy = height;

			var x = (event.pageX - this.renderer.canvas.getBoundingClientRect().left) / pageWidth * cx;
			var y = event.pageY / pageHeight * cy;

			var selectedX = Math.floor((x + 1) / TILE_SIZE);
			var selectedY = Math.floor((y + 1) / TILE_SIZE);
			return {
				x: selectedX,
				y: selectedY
			};
		}
	}]);

	function Tilda(renderer) {
		var _this2 = this;

		_classCallCheck(this, Tilda);

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

		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var lines = xmlHttp.responseText.split('\n');
					for (var i in lines) {
						var block = new Block(lines[i]);
						_this2.blockTypes[block.id] = block;
					}
				} else {}
			}
		};
		xmlHttp.open('GET', '/t.tileset', true);
		xmlHttp.send(null);
		window.addEventListener('mousedown', function (event) {
			if (_this2.mode != MODE_EDITING) {
				return;
			}
			var pos = _this2.getPostionFromCursor();

			if (event.which == 1) {

				switch (_this2.editor.tool) {
					case TOOL_DRAW:
						_this2.level.setBlock(pos.x, pos.y, {
							x: pos.x,
							y: pos.y,
							type: _this2.editor.activeBlockType
						});
						break;
					case TOOL_POINTER:
						_this2.editor.selectedX = pos.x;
						_this2.editor.selectedY = pos.y;
						_this2.propertiesWindow.contentWindow.postMessage({
							block: _this2.level.blocks[_this2.editor.selectedX][_this2.editor.selectedY]

						}, '*');
						break;
				}
				_this2.level.save();
			}
			if (event.which == 3) {
				event.preventDefault();
				_this2.level.removeBlock(pos.x, pos.y);
				_this2.level.save();
			}
		});
		window.addEventListener('message', function (event) {
			_this2.editor.tool = event.data.tool;
			if ('blockType' in event.data) {
				if (event.data.blockType != null) {
					_this2.activeTool = TOOL_DRAW;
					_this2.editor.activeBlockType = event.data.blockType;
				} else {
					_this2.activeTool = TOOL_POINTER;
				}
			}
			if ('block' in event.data) {
				_this2.level.blocks[event.data.block.x][event.data.block.y] = event.data.block;
			}
		});
	}

	_createClass(Tilda, [{
		key: 'getBlockType',
		value: function getBlockType(blockType) {
			for (var b in this.blockTypes) {
				var bt = this.blockTypes[b];
				if (bt.tileX == blockType.tileX && bt.tileY == blockType.tileY && bt.flags == blockType.flags) {
					return b;
				}
			}
		}
	}, {
		key: 'start',
		value: function start() {
			this.gameInterval = setInterval(this.tick.bind(this), 5);
			this.renderInterval = setInterval(this.render.bind(this), 5);
			this.state = GAME_RUNNING;
		}
	}, {
		key: 'stop',
		value: function stop() {
			clearInterval(this.gameInterval);
			clearInterval(this.renderInterval);
			this.state = GAME_READY;
		}
	}, {
		key: 'loadTiles',
		value: function loadTiles(tiles) {
			var tiles = tiles.split('\n');
			for (var i = 1; i < tiles.length; i++) {
				var tile = tiles[i];

				var blockType = new Block(tile);
				this.blockTypes[i] = blockType;
			}
		}
	}, {
		key: 'loadLevel',
		value: function loadLevel(id) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.onreadystatechange = function () {
					if (xmlHttp.readyState == 4) {
						if (xmlHttp.status == 200) {
							var level = JSON.parse(xmlHttp.responseText);
							level = new Level(_this3, level);
							level.id = id;

							_this3.setLevel(level);
							resolve(level);
						} else {
							reject();
						}
					}
				};
				xmlHttp.open('GET', '/api/levels/' + id, true);
				xmlHttp.send(null);
			});
		}
	}, {
		key: 'setLevel',
		value: function setLevel(level) {
			this.level = level;
			var evt = new CustomEvent('levelchanged');
			evt.data = {
				level: level
			};

			this.dispatchEvent(evt);
		}
	}, {
		key: 'tick',
		value: function tick() {
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

							if ((blockType.flags & TILE_FLAG_JUMP_RIGHT) == TILE_FLAG_JUMP_RIGHT) {
								this.isJumpingOver = true;
								obj.moveX = 3;
								obj.moveZ = 3;
							}
							obj.moveX = 0;
						}

						if (obj.x > left - TILE_SIZE / 2 && obj.x < left + TILE_SIZE * 0.7 && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 && obj.moveY > 0 && is_solid) {

							if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM) == TILE_FLAG_JUMP_BOTTOM) {
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
	}, {
		key: 'render',
		value: function render() {
			this.renderer.clear();
			if (this.level) {
				for (var x in this.level.blocks) {
					for (var y in this.level.blocks[x]) {
						var left = (TILE_SIZE * x - this.cameraX) * this.zoom.x;
						var top = (TILE_SIZE * y - this.cameraY) * this.zoom.y;
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

						this.renderer.renderImageChunk(this.tileset, left, top, width, height, tileX, tileY, width, height);
					}
				}
				for (var i in this.level.objects) {
					var object = this.level.objects[i];
					var left = (object.x - this.cameraX) * this.zoom.x;
					var top = (object.y - this.cameraY) * this.zoom.y;
					var zeta = object.z * this.zoom.y;
					var width = TILE_SIZE * this.zoom.x;
					var height = TILE_SIZE * this.zoom.y;
					var tileX = object.tileX * TILE_SIZE;
					var tileY = object.tileY * TILE_SIZE;
					if (zeta > 0) {}
					this.renderer.renderImageChunk(this.tileset, left, top, width, height, 0, TILE_SIZE * 1, width, height);
					this.renderer.renderImageChunk(this.tileset, left, top - zeta, width, height, tileX, tileY, width, height); // Render shadow
				}
				for (var i in this.blockTypes) {
					var block = this.blockTypes[i];
					var width = TILE_SIZE * this.zoom.x;
					var height = TILE_SIZE * this.zoom.y;
					var left = i * TILE_SIZE * this.zoom.x;
					var top = this.renderer.canvas.height - TILE_SIZE * 2;
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
	}]);

	return Tilda;
}();

var Entity = function () {
	function Entity(game, level) {
		_classCallCheck(this, Entity);

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

	_createClass(Entity, [{
		key: 'tick',
		value: function tick() {
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
	}, {
		key: 'render',
		value: function render() {}
	}]);

	return Entity;
}();

var CharacterEntity = function (_Entity) {
	_inherits(CharacterEntity, _Entity);

	function CharacterEntity(game, level) {
		_classCallCheck(this, CharacterEntity);

		var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(CharacterEntity).call(this, game, level));

		_this4.level = level;
		_this4.x = _this4.level.player.x;
		_this4.tileX = 2;
		_this4.tileY = 1;
		_this4.y = _this4.level.player.y;

		return _this4;
	}

	_createClass(CharacterEntity, [{
		key: 'turnRight',
		value: function turnRight() {

			this.tileX = 4;
		}
	}, {
		key: 'turnLeft',
		value: function turnLeft() {

			this.tileX = 5;
		}
	}, {
		key: 'turnUp',
		value: function turnUp() {

			this.tileX = 2;
		}
	}, {
		key: 'turnDown',
		value: function turnDown() {

			this.tileX = 3;
		}
	}, {
		key: 'walkLeft',
		value: function walkLeft() {
			this.turnLeft();
			this.moveX = -.3;
		}
	}, {
		key: 'walkRight',
		value: function walkRight() {
			this.turnRight();
			this.moveX = .3;
		}
	}, {
		key: 'walkUp',
		value: function walkUp() {
			this.moveY = -.3;
			this.turnUp();
		}
	}, {
		key: 'walkDown',
		value: function walkDown() {
			this.moveY = .3;
			this.turnDown();
		}
	}, {
		key: 'jump',
		value: function jump() {
			this.moveZ = 1;
		}
	}, {
		key: 'render',
		value: function render() {}
	}]);

	return CharacterEntity;
}(Entity);

var PlayerEntity = function (_CharacterEntity) {
	_inherits(PlayerEntity, _CharacterEntity);

	function PlayerEntity(game, level) {
		_classCallCheck(this, PlayerEntity);

		var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerEntity).call(this, game, level));

		window.onkeydown = function (event) {
			if (_this5.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				_this5.walkUp();
			}
			if (event.code == 'ArrowDown') {
				_this5.walkDown();
			}
			if (event.code == 'ArrowLeft') {
				_this5.walkLeft();
			}
			if (event.code == 'ArrowRight') {
				_this5.walkRight();
			}
			if (event.code == 'KeyA') {
				_this5.jump();
			}
		};
		window.onkeyup = function (event) {
			if (_this5.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				_this5.moveY = -0;
			}
			if (event.code == 'ArrowDown') {
				_this5.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				_this5.moveX = -0;
			}
			if (event.code == 'ArrowRight') {
				_this5.moveX = 0;
			}
			if (event.code == 'KeyA') {
				_this5.moveZ = 0;
			}
		};

		return _this5;
	}

	return PlayerEntity;
}(CharacterEntity);

var Block = function Block(tile) {
	_classCallCheck(this, Block);

	var parts = tile.split(' ');
	this.id = parts[0];
	this.tileX = parseInt(parts[1]);
	this.tileY = parseInt(parts[2]);

	this.flags = parseInt(parts[3]);
};

var Level = function () {
	_createClass(Level, [{
		key: 'setBlock',
		value: function setBlock(x, y, block) {
			if (!(x in this.blocks)) {
				this.blocks[x] = {};
			}
			if (!block) {
				return;
			}
			this.blocks[x][y] = block;
		}
	}, {
		key: 'removeBlock',
		value: function removeBlock(x, y) {
			delete this.blocks[x][y];
		}
	}, {
		key: 'save',
		value: function save() {
			var jsonData = {
				blocks: [],
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
			var xmlHttp = new XMLHttpRequest(); // new HttpRequest instance
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4) {
					if (xmlHttp.status == 200) {
						var json = JSON.parse(xmlHttp.responseText);
					} else {
						debugger;
					}
				}
			};
			xmlHttp.open("PUT", "/api/levels/" + this.id + '', true);
			xmlHttp.setRequestHeader("Content-Type", "application/json");
			xmlHttp.send(json_upload);
		}
	}]);

	function Level(game, level) {
		_classCallCheck(this, Level);

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

	_createClass(Level, [{
		key: 'render',
		value: function render() {}
	}]);

	return Level;
}();

},{}]},{},[1]);
