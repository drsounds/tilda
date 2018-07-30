import Entity from './Entity'

export default class CharacterEntity extends Entity {
	constructor(game, level) {
		super(game, level);
		this.level = level;
		this.tileX = 2;
		this.tileY = 1;
	
	}
	
	turnRight() {
		
		this.tileX = 4;
	}
	turnLeft() {
		
		this.tileX = 5;
	}
	turnUp() {
		
		this.tileX = 2;
	}
	turnDown() {
		
		this.tileX = 3;
	}
	walkLeft() {
		this.turnLeft();
		this.moveX = -.3;
	}
	
	walkRight() {
		this.turnRight();
		this.moveX = .3;
		
	}
	
	walkUp() {
		this.moveY = -.3;
		this.turnUp();
	}
	
	walkDown() {
		this.moveY = .3;
		this.turnDown();
	}
	
	stop() {
		this.moveX = 0;
		this.moveY = 0;
	}
	
	jump() {
		this.moveZ = 1;
	}
	
	render() {

	}
}