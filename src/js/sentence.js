export default class Sentence {
	constructor(setence) {
		var parts = setence.split(' ');
		this.subject = parts[0];
		this.predicate = parts[1];
		this.object = parts[2];
		this.duration = parts[3];
	}
}