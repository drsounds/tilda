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
	var dockManager = new dockspawn.DockManager(document.querySelector("body"));
	dockManager.initialize();

	var canvas = new dockspawn.PanelContainer(document.querySelector("#canvas"), dockManager);
	var scriptEditor = new dockspawn.PanelContainer(document.querySelector("#scriptWindow"), dockManager);
	var propertiesEditor = new dockspawn.PanelContainer(document.querySelector("#properties"), dockManager);
	var toolbox = new dockspawn.PanelContainer(document.querySelector("#toolbar"), dockManager);

	var documentNode = dockManager.context.model.documentManagerNode;

	dockManager.dockRight(documentNode, propertiesEditor, 0.2);
	dockManager.dockFill(documentNode, canvas);
	dockManager.dockLeft(documentNode, toolbox, 0.2);
	dockManager.dockDown(documentNode, scriptEditor, 0.2);

	window.onresize = function (event) {
		dockManager.resize(window.innerWidth, window.innerHeight);
	};
	window.onresize();
	//var editor = ace.edit('script');
	//editor.getSession().setMode('ace/mode/javascript');
	//editor.setTheme('ace/theme/monokai');
	game.loadLevel(level).then(function (level) {
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
		selection.style.left = tileX * TILE_SIZE + 'px';
		selection.style.top = tileY * TILE_SIZE + 'px';
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

	game.addEventListener('selectedblock', function (event) {
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
		} catch (e) {}
		game.level.script = $('#script').val();
		game.level.save();
	};
	game.addEventListener('levelchanged', function (event) {
		history.pushState({
			level: event.data.level.id
		}, 'Level', '/level/' + event.data.level.id);
		$('#script').val(game.level.script);
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

var Setence = function Setence(setence) {
	_classCallCheck(this, Setence);

	var parts = setence.split(' ');
	this.subject = parts[0];
	this.predicate = parts[1];
	this.object = parts[2];
	this.duration = parts[3];
};

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

var Tilda = function () {
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
		key: 'seq',
		value: function seq() {
			this.sequence = arguments[0];
			if (!this.sequence) {
				debugger;
			}
			this.next();
		}
	}, {
		key: 'getObject',
		value: function getObject(obj) {}
	}, {
		key: 'lock',
		value: function lock() {
			this.status.locked = true;
		}
	}, {
		key: 'unlock',
		value: function unlock() {
			this.status.locked = false;
		}
	}, {
		key: 'next',
		value: function next() {

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
	}, {
		key: 'getPostionFromCursor',
		value: function getPostionFromCursor() {
			var width = this.renderer.canvas.width;
			var height = this.renderer.canvas.height;
			var pageWidth = this.renderer.canvas.getBoundingClientRect().width;
			var pageHeight = this.renderer.canvas.getBoundingClientRect().height;
			var bounds = this.renderer.canvas.getBoundingClientRect();

			var cx = width;
			var cy = height;

			var x = (event.pageX - bounds.left) / pageWidth * cx;
			var y = (event.pageY - bounds.top) / pageHeight * cy;

			var selectedX = Math.floor((x + 1) / TILE_SIZE);
			var selectedY = Math.floor((y + 1) / TILE_SIZE);
			return {
				x: selectedX,
				y: selectedY
			};
		}

		/**
   * Tells us if a certain flag is meet
   * */

	}, {
		key: 'hasFlag',
		value: function hasFlag(flag) {
			return this.status.flags.indexOf(flag) != -1;
		}
	}, {
		key: 'getSetting',
		value: function getSetting(setting, defaultValue) {
			if (!setting in this.status.settings) {
				return defaultValue;
			}
			return this.status.settings[setting];
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
		};
		this.text = '';
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
		this.renderer.canvas.addEventListener('mousedown', function (event) {
			if (_this2.mode != MODE_EDITING) {
				return;
			}
			var pos = _this2.getPostionFromCursor();

			if (event.which == 1) {

				switch (_this2.editor.tool) {
					case TOOL_DRAW:
						_this2.level.setBlock(pos.x + _this2.cameraX / TILE_SIZE, pos.y + _this2.cameraY / TILE_SIZE, {
							x: pos.x + _this2.cameraX / TILE_SIZE,
							y: pos.y + _this2.cameraY / TILE_SIZE,
							type: _this2.editor.activeBlockType
						});
						break;
					case TOOL_POINTER:
						_this2.editor.selectedX = pos.x;
						_this2.editor.selectedY = pos.y;
						_this2.editor.selectedBlock = _this2.level.blocks[_this2.editor.selectedX + _this2.cameraX / TILE_SIZE][_this2.editor.selectedY + _this2.cameraY / TILE_SIZE];
						var evt = new CustomEvent('selectedblock');
						evt.data = {
							block: _this2.editor.selectedBlock
						};
						_this2.dispatchEvent(evt);
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
	}

	_createClass(Tilda, [{
		key: 'setBlock',
		value: function setBlock(block) {
			this.level.blocks[block.x][block.y] = block;
		}
	}, {
		key: 'setBlockType',
		value: function setBlockType(blockType) {
			if (blockType != null) {
				this.activeTool = TOOL_DRAW;
				this.editor.activeBlockType = event.data.blockType;
			} else {
				this.activeTool = TOOL_POINTER;
			}
		}
	}, {
		key: 'setTool',
		value: function setTool(tool) {
			this.activeTool = tool;
		}
	}, {
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
	}, {
		key: 'message',
		value: function message(_message, cb) {
			this.text = _message;
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
								obj.moveX = .6;
								obj.moveZ = 3;
							} else {
								obj.moveX = 0;
							}
						}

						if (obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 - 1 && obj.x < left + TILE_SIZE && obj.x > left - TILE_SIZE && obj.moveX < 0 && is_solid) {

							if ((blockType.flags & TILE_FLAG_JUMP_LEFT) == TILE_FLAG_JUMP_LEFT) {
								this.isJumpingOver = true;
								obj.moveX = 3;
								obj.moveZ = 3;
							} else {
								obj.moveX = 0;
							}
						}

						if (obj.x > left - TILE_SIZE / 2 && obj.x < left + TILE_SIZE * 0.7 && obj.y > top - TILE_SIZE && obj.y < top + TILE_SIZE / 2 - 2 && obj.moveY > 0 && is_solid) {
							if (block.teleport) {
								if (block.teleport.level) {
									this.loadLevel(block.teleport.level);
								}
							}
							if ((blockType.flags & TILE_FLAG_JUMP_BOTTOM) == TILE_FLAG_JUMP_BOTTOM) {
								this.isJumpingOver = true;
								obj.moveY = 1;
								obj.moveZ = 1;
							} else {
								obj.moveY = 0;
							}
						}

						if (obj.x > left - TILE_SIZE && obj.x < left + TILE_SIZE - 1 && obj.y < top + TILE_SIZE / 2 && obj.y > top - TILE_SIZE && is_solid) {
							if (block.script && block.script.length > 0 && this.aKeyPressed) {
								// #QINOTE #AQUAJOGGING@R@CT
								try {
									var func = new Function(block.script);
									func.apply(this);
								} catch (e) {
									console.log(e.stack);
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

			this.renderer.context.font = "11px Courier";
			this.renderer.context.fillStyle = 'black';
			this.renderer.context.fillText('points ' + this.status.points, 2, 12);
			if (this.text && this.text.length > 0) {
				this.renderer.context.fillStyle = 'rgba(0, 0, 0, .8)';
				this.renderer.context.fillRect(10, 22, 180, 60);
				this.renderer.context.fillStyle = 'white';
				wrapText(this.renderer.context, this.text, 22, 32, 180, 9);
			}
		}
	}]);

	return Tilda;
}();

// From http://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element


exports.Tilda = Tilda;
function wrapText(context, text, x, y, line_width, line_height) {
	var line = '';
	var paragraphs = text.split('\n');
	for (var i = 0; i < paragraphs.length; i++) {
		var words = paragraphs[i].split(' ');
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > line_width && n > 0) {
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += line_height;
			} else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
		y += line_height;
		line = '';
	}
}

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
		_this4.tileX = 2;
		_this4.tileY = 1;

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
		key: 'stop',
		value: function stop() {
			this.moveX = 0;
			this.moveY = 0;
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

		_this5.x = _this5.level.player.x;
		_this5.y = _this5.level.player.y;

		window.onkeydown = function (event) {

			_this5.game.keysPressed.push(event.code);
			if (_this5.game.status.locked) {
				return;
			}
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
				_this5.game.aKeyPressed = true;
				console.log(_this5.aKeyPressed);
				_this5.game.next();
				if (_this5.game.activeBlock) {
					if (_this5.game.activeBlock.script.length > 0) {
						try {
							var func = new Function(_this5.game.activeBlock.script);
							func.apply(_this5.game);
						} catch (e) {
							console.log(e.stack);
						}
					}

					_this5.game.text = '';
					_this5.game.activeBlock = null;
					return;
				}
				_this5.jump();
			}
		};
		window.onkeyup = function (event) {

			_this5.game.keysPressed = array_remove(_this5.game.keysPressed, event.code);
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
				_this5.game.aKeyPressed = false;
				_this5.moveZ = 0;
			}
		};

		return _this5;
	}

	return PlayerEntity;
}(CharacterEntity);

// http://stackoverflow.com/questions/9792927/javascript-array-search-and-remove-string


function array_remove(array, elem, all) {
	for (var i = array.length - 1; i >= 0; i--) {
		if (array[i] === elem) {
			array.splice(i, 1);
			if (!all) break;
		}
	}
	return array;
};

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
				script: this.script,
				player: {
					x: this.player.x,
					y: this.player.y
				}
			};

			for (var x in this.blocks) {
				for (var y in this.blocks[x]) {
					var block = this.blocks[x][y];
					if (!block && block == null) {
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
					} else {}
				}
			};
			xmlHttp.open("PUT", "/api/levels/" + this.id + '', true);
			xmlHttp.setRequestHeader("Content-Type", "application/json");
			xmlHttp.send(json_upload);
		}
	}, {
		key: 'addEntity',
		value: function addEntity(type, x, y) {
			var t = new type(this.game, this);
			t.x = x * TILE_SIZE;
			t.y = y * TILE_SIZE;
			return t;
		}
	}]);

	function Level(game, level) {
		_classCallCheck(this, Level);

		this.game = game;
		this.name = level.name;
		this.entities = {};
		this.blocks = {};
		this.player = level.player;
		this.flags = level.flags;
		this.script = level.script;
		this.objects = [];
		for (var i in level.blocks) {
			var block = level.blocks[i];
			if (block != null) this.setBlock(block.x, block.y, block);
		}
		this.player = new PlayerEntity(game, level);
		if ('entities' in level) {
			for (var e in level.entities) {
				var _entity = level.entities[e];
				var type = _entity.type;
				var entity = new this[type](_entity);
				this.objects.push(entity);
				this.entities[_entity.id] = entity;
			}
		}

		this.objects.push(this.player);
	}

	_createClass(Level, [{
		key: 'render',
		value: function render() {}
	}]);

	return Level;
}();

},{}]},{},[1]);
