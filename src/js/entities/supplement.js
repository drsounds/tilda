import Entity from './entity'

export default class SupplementEntity extends Entity {
	constructor(game, level) {
		super(game, level);
		this.level = level;
		this.tileX = 2;
		this.tileY = 1;
		
	}
}