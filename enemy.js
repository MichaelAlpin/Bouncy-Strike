//Enemy constants
const ENEMY_RADIUS_RANGE = [20, 28];
const ENEMY_VELOCITY_RANGE = [2, 3];
const ENEMY_DENSITY = 1;
const ENEMY_COLORS = [["#cc33ff", "#8600b3"], ["#ffff00", "#b3b300"], ["#ff3385", "#cc0052"]];
const ENEMY_DAMAGE = 1;

function Enemy(position, angle)
{
	this.radius = ENEMY_RADIUS_RANGE[0] + Math.random() * (ENEMY_RADIUS_RANGE[1] - ENEMY_RADIUS_RANGE[0]);
	this.startingVelocity = ENEMY_VELOCITY_RANGE[0] + Math.random() * (ENEMY_VELOCITY_RANGE[1] - ENEMY_VELOCITY_RANGE[0]);
	this.position = [Math.max(position[0], this.radius), position[1]];
	this.velocity = [this.startingVelocity * Math.cos(angle), this.startingVelocity * Math.sin(angle)];
	this.mass = ENEMY_DENSITY * this.radius * this.radius * Math.PI;
	this.color = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
	this.opacity = 1;
	this.z = -1;
	this.id = "";
	
	this.update = () => {
		if(page != "game") return;
		
		//Update velocities
		this.velocity[1] += GRAVITY;
		
		//Ground & border collusion
		if(this.position[1] > HEIGHT - GROUND_HEIGHT - this.radius) {
			this.position[1] = HEIGHT - GROUND_HEIGHT - this.radius;
			this.velocity[1] = Math.min(-this.velocity[1] + 0.05, 0);
		}
		if(this.position[1] < this.radius) {
			this.position[1] = this.radius;
			this.velocity[1] = Math.max(-this.velocity[1] - 0.05, 0);
		}
		if(this.position[0] > WIDTH - this.radius) {
			this.position[0] = WIDTH - this.radius;
			this.velocity[0] *= -1;
		}
		if(this.position[0] < this.radius) {
			this.position[0] = this.radius;
			this.velocity[0] *= -1;
		}
		
		//Player collusion
		if(checkArcAndRectCollusion(this.position[0], this.position[1], this.radius, player.position[0] - PLAYER_SIZE / 2, player.position[1] - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)) {
			player.HP -= ENEMY_DAMAGE;
			enemies.splice(enemies.indexOf(this), 1);
			this.color = ["#ff1a1a", "#b30000"];
			this.update = () => {
				this.radius *= 1.01;
				this.opacity /= 1.002;
				if(this.opacity < 0.1) {
					elements.splice(elements.indexOf(this), 1);
				}
			}
			if(player.HP <= 0) gameOver();
		}
		
		//Enemy collusion
		for(let i = 0; i < enemies.length; i++) {
			if(enemies[i] == this) continue;
			
			const positionMargin = [enemies[i].position[0] - this.position[0], enemies[i].position[1] - this.position[1]];
			const distance = Math.sqrt(positionMargin[0] ** 2 + positionMargin[1] ** 2);
			
			if(distance ** 2 < (this.radius + enemies[i].radius) ** 2) {
				const bounceDirection = Math.atan2(positionMargin[1], positionMargin[0]);
				
				//Update the enemies velocity
				const u1 = rotateVector(this.velocity, -bounceDirection);
				const u2 = rotateVector(enemies[i].velocity, -bounceDirection);
				
				this.velocity = rotateVector([u1[0] * (this.mass - enemies[i].mass) / (this.mass + enemies[i].mass) + u2[0] * 2 * enemies[i].mass / (this.mass + enemies[i].mass), u1[1]], bounceDirection);
				enemies[i].velocity = rotateVector([u2[0] * (enemies[i].mass - this.mass) / (this.mass + enemies[i].mass) + u1[0] * 2 * this.mass / (this.mass + enemies[i].mass), u2[1]], bounceDirection);
				this.velocity[0] /= 1.05;
				this.velocity[1] /= 1.05;
				enemies[i].velocity[0] /= 1.05;
				enemies[i].velocity[1] /= 1.05;
				
				
				//Separate the enemies
				this.position[0] += (this.radius + enemies[i].radius - distance) / 2 * Math.cos(bounceDirection + Math.PI);
				this.position[1] += (this.radius + enemies[i].radius - distance) / 2 * Math.sin(bounceDirection + Math.PI);
				enemies[i].position[0] += (this.radius + enemies[i].radius - distance) / 2 * Math.cos(bounceDirection);
				enemies[i].position[1] += (this.radius + enemies[i].radius - distance) / 2 * Math.sin(bounceDirection);
				
			}
		}
		
		//Update position
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
	}
	
	this.draw = () => {
		ctx.globalAlpha = this.opacity;
		ctx.lineWidth = prop(6);
		ctx.fillStyle = this.color[0];
		ctx.strokeStyle = this.color[1];
		ctx.beginPath();
		ctx.arc(prop(this.position[0]), prop(this.position[1]), prop(this.radius) - ctx.lineWidth / 2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.globalAlpha = 1;
	}
	
	this.onClick = () => {};
	elements.push(this);
}
