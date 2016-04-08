(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Tilda = require('./tilda.js');

window.addEventListener('load', function () {
	var game = new Tilda(document.querySelector('canvas'));
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
var NUM_SCREEN_TILES_X = 24;
var NUM_SCREEN_TILES_Y = 28;
var TILE_SOLID = 1;
var TILE_FLAG_JUMP_LEFT = 2;
var TILE_FLAG_JUMP_TOP = 4;
var TILE_FLAG_JUMP_RIGHT = 8;
var TILE_FLAG_JUMP_BOTTOM = 16;
var GAME_READY = 0;
var GAME_RUNNING = 1;
var TILESET = 'x y flags\n0 0 1\n1 0 5\n2 0 5\n3 0 1\n0 1 3\n1 1 1\n2 1 1\n3 1 8\n1 2 1\n2 2 1\n3 2 8\n0 3 1\n1 3 17\n2 3 17';

var Renderer = function () {
	function Renderer() {
		_classCallCheck(this, Renderer);
	}

	_createClass(Renderer, [{
		key: 'renderImageChunk',
		value: function renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {}
	}]);

	return Renderer;
}();

var CanvasRenderer = function (_Renderer) {
	_inherits(CanvasRenderer, _Renderer);

	function CanvasRenderer(canvas) {
		_classCallCheck(this, CanvasRenderer);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CanvasRenderer).call(this));

		_this.canvas = canvas;
		_this.context = canvas.getContext('2d');
		return _this;
	}

	_createClass(CanvasRenderer, [{
		key: 'renderImageChunk',
		value: function renderImageChunk(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight) {
			this.context.drawImage(image, destX, destY, destWidth, destHeight, srcX, srcY, srcWidth, srcHeight);
		}
	}, {
		key: 'clear',
		value: function clear() {}
	}]);

	return CanvasRenderer;
}(Renderer);

var Tilda = function () {
	function Tilda(renderer) {
		_classCallCheck(this, Tilda);

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

	_createClass(Tilda, [{
		key: 'start',
		value: function start() {
			this.gameInterval = setInterval(this.tick.bind(this), 10);
			this.renderInterval = setInterval(this.render.bind(this), 15);
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

				var blockType = new BlockType(tile);
				this.blockTypes[i] = blockType;
			}
		}
	}, {
		key: 'setLevel',
		value: function setLevel(level) {
			this.level = level;
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
						var obj = this.level.objects[i];
						if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE && obj.moveX > 0 && obj.flags & TILE_SOLID) {
							if (obj.flags & TILE_FLAG_JUMP_LEFT) {
								obj.moveX = -2;
								obj.moveZ = 5;
							} else {
								obj.moveX = 0;
							}
						}

						if (obj.x < left + TILE_SIZE && obj.x > left && obj.moveX < 0 && obj.flags & TILE_SOLID) {

							if (obj.flags & TILE_FLAG_JUMP_RIGHT) {
								obj.moveX = 2;
								obj.moveZ = 5;
							} else {
								obj.moveX = 0;
							}
						}

						if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE && obj.moveY > 0 && obj.flags & TILE_SOLID) {

							if (obj.flags & TILE_FLAG_JUMP_BOTTOM) {
								obj.moveY = 2;
								obj.moveZ = 5;
							} else {
								obj.moveY = 0;
							}
						}

						if (obj.x < top + TILE_SIZE && obj.y > top && obj.moveY < 0 && obj.flags & TILE_SOLID) {
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
	}, {
		key: 'render',
		value: function render(renderer) {
			this.renderer.clear();
			if (this.level) {
				for (var x in this.level.blocks) {
					for (var y in this.level.blocks[x]) {
						var left = (TILE_SIZE * x - this.cameraX) * this.zoomFactor;
						var top = (TILE_SIZE * y - this.cameraY) * this.zoomFactor;
						var width = TILE_SIZE * this.zoomFactor;
						var height = TILE_SIZE * this.zoomFactor;
						var block = this.levels.blocks[x][y];
						var type = this.blockTypes[block.type];
						var tileX = type.tileX * TILE_SIZE;
						var tileY = type.tileY * TILE_SIZE;
						this.renderer.renderImageChunk(this.tileset, left, top, width, height, tileX, tileY, width, height);
					}
				}
				for (var i in this.level.objects) {
					var object = this.level.objects[i];
					var left = (object.x - this.cameraX) * this.zoomFactor;
					var top = (object.y - this.cameraY) * this.zoomFactor;
					var zeta = object.z * this.zoomFactor;
					top -= zeta;
					var width = TILE_SIZE * this.zoomFactor;
					var height = TILE_SIZE * this.zoomFactor;
					var tileX = object.tileX * TILE_SIZE;
					var tileY = object.tileY * TILE_SIZE;
					this.renderer.renderImageChunk(this.tileset, left, top, width, height, tileX, tileY, width, height); // Render shadow
					this.renderer.renderImageChunk(this.tileset, left, top - zeta, width, height, 0, TILE_SIZE * 1, tileX, tileY, width, height);
				}
			}
		}
	}]);

	return Tilda;
}();

exports.default = Tilda;

var Entity = function () {
	function Entity(level) {
		_classCallCheck(this, Entity);

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
			this.moveZ /= 0.5;
			this.z -= 2;
			if (this.z < 0) {
				this.moveZ = 0;
				this.z = 0;
			}
		}
	}, {
		key: 'render',
		value: function render() {}
	}]);

	return Entity;
}();

var PlayerEntity = function (_Entity) {
	_inherits(PlayerEntity, _Entity);

	function PlayerEntity(level) {
		_classCallCheck(this, PlayerEntity);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerEntity).call(this, level));

		window.onkeydown = function (event) {
			if (event.code == 'ArrowUp') {
				_this2.moveY = -2;
			}
			if (event.code == 'ArrowDown') {
				_this2.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				_this2.moveX = -2;
			}
			if (event.code == 'ArrowRight') {
				_this2.moveX = 2;
			}
			if (event.code == 'Numpad1') {
				_this2.moveZ = 2;
			}
		};
		window.onkeyup = function (event) {
			if (event.code == 'ArrowUp') {
				_this2.moveY = -0;
			}
			if (event.code == 'ArrowDown') {
				_this2.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				_this2.moveY = -0;
			}
			if (event.code == 'ArrowRight') {
				_this2.moveY = 0;
			}
		};
		return _this2;
	}

	_createClass(PlayerEntity, [{
		key: 'render',
		value: function render() {}
	}]);

	return PlayerEntity;
}(Entity);

var Block = function Block(tile) {
	_classCallCheck(this, Block);

	var parts = tile.split(' ');
	this.tileX = parseInt(parts[0]);
	this.tileY = parseInt(parts[1]);
	this.flags = parseInt(parts[2]);
};

var Level = function () {
	_createClass(Level, [{
		key: 'setBlock',
		value: function setBlock(x, y, block) {
			block.level = this;
			if (!(x in this.blocks)) {
				this.blocks[x] = {};
			}
			this.blocks[x][y] = block;
		}
	}]);

	function Level(game, name, flags) {
		_classCallCheck(this, Level);

		this.flags = flags;
		this.game = game;
		this.name = name;
		this.blocks = {};
		this.objects = [];
	}

	_createClass(Level, [{
		key: 'render',
		value: function render() {}
	}]);

	return Level;
}();

},{}]},{},[1]);
