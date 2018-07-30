import PlayerEntity from './entities/player'
import * as constants from './constants'

export default class Level {
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
		var xmlHttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var json = JSON.parse(xmlHttp.responseText);
					
				} else {
				}
			}
		}
		xmlHttp.open("PUT", this.game.gameUrl + "/api/levels/" + this.id + '', true);
		xmlHttp.setRequestHeader("Content-Type", "application/json");
		xmlHttp.send(json_upload);
	}
	addEntity(id, type, x ,y) {
		var t = new this.game.entityTypes[type](this.game, this);
		t.x = x * constants.TILE_SIZE;
		t.y = y * constants.TILE_SIZE;
		this.level.entities[id] = t;
		return t;
	}
	constructor(game, level) {
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
			if (block != null)
			this.setBlock(block.x, block.y, block);
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

	render() {

	}
}