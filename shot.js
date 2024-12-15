//Shot constants
const SHOT_RADIUS = 8;
const SHOT_VELOCITY = 5;

function Shot(position, angle)
{
	this.position = position;
	this.angle = angle;
	this.velocity = [SHOT_VELOCITY * Math.cos(this.angle), SHOT_VELOCITY * Math.sin(this.angle)];
	this.radius = SHOT_RADIUS;
	this.z = -2;
	this.id = "";
	
	this.update = () => {
		if(page != "game") return;
		
		//Update velocities
		this.velocity[1] += GRAVITY;
		
		//Ground & border collusion
		if(this.position[1] > HEIGHT - GROUND_HEIGHT - this.radius ||
			this.position[0] > WIDTH - this.radius || this.position[0] < this.radius) {
			elements.splice(elements.indexOf(this), 1);
		}
		
		//Enemy collusion
		for(let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			if((enemy.position[0] - this.position[0]) ** 2 + (enemy.position[1] - this.position[1]) ** 2 < (this.radius + enemies[i].radius) ** 2) {
				//Destroy enemy
				player.score++;
				enemies.splice(enemies.indexOf(enemy), 1);
				enemy.update = () => {
					enemy.radius *= 1.02;
					enemy.opacity /= 1.005;
					if(enemy.opacity < 0.1) {
						elements.splice(elements.indexOf(enemy), 1);
					}
				}
				elements.splice(elements.indexOf(this), 1);
			}
		}
		
		//Update position
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
	}
	
	this.draw = () => {
		ctx.lineWidth = prop(4);
		ctx.fillStyle = "#999900";
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.arc(prop(this.position[0]), prop(this.position[1]), prop(this.radius) - ctx.lineWidth / 2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	
	this.onClick = () => {};
	elements.push(this);
}
