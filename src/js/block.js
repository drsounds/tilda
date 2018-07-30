export default class Block {
	constructor(tile) {
		var parts = tile.split(' ');
		this.id = parts[0];
		this.tileX = parseInt(parts[1]);
		this.tileY = parseInt(parts[2]);
	
		this.flags = parseInt(parts[3]);
	}
}
