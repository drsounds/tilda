import CharacterEntity from './character'
import { arrayRemove } from '../utils'

export default class PlayerEntity extends CharacterEntity {
	constructor(game, level) {
		super(game, level);
		this.x = this.level.player.x;
		this.y = this.level.player.y;
		this.game.renderer.canvas.tabIndex = 1000;
		
		this.game.renderer.canvas.onkeydown = (event) => {
			
			this.game.keysPressed.push(event.code);
			if (this.game.status.locked) {
				return;
			}
			if (this.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				this.walkUp();
			
			}
			if (event.code == 'ArrowDown') {
				this.walkDown();
			}
			if (event.code == 'ArrowLeft') {
				this.walkLeft();
			}
			if (event.code == 'ArrowRight') {
				this.walkRight();
			}
			if (event.code == 'KeyA') {
				this.game.aKeyPressed = true;
				console.log(this.aKeyPressed);
				this.game.next();
				if (this.game.activeBlock) {
					if (this.game.activeBlock.script.length > 0) {
						try {
							var func = new Function(this.game.activeBlock.script);
							func.apply(this.game);
						} catch (e) {
							console.log(e.stack);
						}
							
					}
					
					this.game.text = '';
					this.game.activeBlock = null;
					return;
				}
				this.jump();
			}
		}
		this.game.renderer.canvas.onkeyup = (event) => {
	
			this.game.keysPressed = arrayRemove(this.game.keysPressed, event.code);
			if (this.game.isJumpingOver) {
				return;
			}
			if (event.code == 'ArrowUp') {
				if (this.moveY < 0)
				this.moveY = -0;
			}
			if (event.code == 'ArrowDown') {
				if (this.moveY > 0)
				this.moveY = 0;
			}
			if (event.code == 'ArrowLeft') {
				if (this.moveX < 0)
				this.moveX = -0;
			}
			if (event.code == 'ArrowRight') {
				if (this.moveX > 0)
				this.moveX = 0;
			}
			if (event.code == 'KeyA') {
				this.game.aKeyPressed = false;
				this.moveZ = 0;
			}
		}
		
	}
	
}
