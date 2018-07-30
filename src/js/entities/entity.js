export default class Entity {
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
