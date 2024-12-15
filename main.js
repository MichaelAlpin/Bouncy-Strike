//Elements & image sources
let canvas, ctx;
let imageSources = {};
let audioSources = {};

//Input
const mouse = {
	x: 0,
	y: 0
};
const keys = [];

//Counter & page management
let counter = 0;
let page = "menu";

//Game constants
const GROUND_HEIGHT = 100;
const PLAYER_SIZE = 45;
const GRAVITY = 0.02;

const PLAYER_SPEED = 0.05;
const PLAYER_JUMP_POWER = 3;
const PLAYER_SLOWDOWN = 1.02;
const PLAYER_BEND_POWER = 0.1;
const PLAYER_COOLDOWN_IN_MILLISECONDS = 500;
const PLAYER_MAX_HP = 10;

//Player & enemies
const player = {
	position: [WIDTH / 2, -PLAYER_SIZE / 2],
	velocity: [0, 0],
	angle: -Math.PI / 2,
	closestEnemy: undefined,
	coolDown: PLAYER_COOLDOWN_IN_MILLISECONDS * gameTicksPerMillisecond,
	HP: PLAYER_MAX_HP,
	score: 0
};
const enemies = [];

//Start action
function onBodyLoad()
{
	//Load all elements
	loadElements();
	
	//Set elements
	adjustCanvasSize();
	audioSources.music.loop = true;
	
	//Events
	document.addEventListener("visibilitychange", visibilityChange);
	
	canvas.addEventListener("mousemove", mouseMove);
	canvas.addEventListener("mousedown", checkForButtonClick);
	
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
	
	//Initial action
	summonMenu();
	
	//Start update and animation
	refreshTick();
	animate();
}

//The update
function update()
{
	counter++;
	player.coolDown--;
	if(page == "game") player.HP = Math.min(player.HP + 0.0006, PLAYER_MAX_HP);
	
	//Update player
	
	/*
	To make this game fairly playable, I'm not gonna use the exact constants working on Earth, like g=9.8, with a different scale,
	but rather manipulate the values while keeping in mind most of the laws of physics - you can consider it a different planet
	*/
	
	//Update velocities
	player.velocity[1] += GRAVITY;
	if(keys.includes("KeyD") || keys.includes("ArrowRight")) player.velocity[0] += PLAYER_SPEED;
	if(keys.includes("KeyA") || keys.includes("ArrowLeft")) player.velocity[0] -= PLAYER_SPEED;
	player.velocity[0] /= PLAYER_SLOWDOWN;
	if(keys.includes("KeyS") || keys.includes("ArrowDown")) player.velocity[1] += PLAYER_BEND_POWER;
	
	//Ground & border collusion
	if(player.position[1] > HEIGHT - GROUND_HEIGHT - PLAYER_SIZE / 2) {
		player.position[1] = HEIGHT - GROUND_HEIGHT - PLAYER_SIZE / 2;
		player.velocity[1] = 0;
		if(keys.includes("KeyW") || keys.includes("ArrowUp")) {
			player.velocity[1] = -PLAYER_JUMP_POWER;
		}
	}
	if(player.position[0] > WIDTH - PLAYER_SIZE / 2) {
		player.position[0] = WIDTH - PLAYER_SIZE / 2;
		player.velocity[0] /= -2;
	}
	if(player.position[0] < PLAYER_SIZE / 2) {
		player.position[0] = PLAYER_SIZE / 2;
		player.velocity[0] /= -2;
	}
	
	//Update position
	player.position[0] += player.velocity[0];
	player.position[1] += player.velocity[1];
	
	//Update angle & closest enemy
	player.closestEnemy = undefined;
	if(page == "game" && enemies.length > 0) {
		for(let i = 0; i < enemies.length; i++) {
			if((player.closestEnemy === undefined || (enemies[i].position[0] - player.position[0]) ** 2 + (enemies[i].position[0] - player.position[0]) ** 2 <
				(player.closestEnemy.position[0] - player.position[0]) ** 2 + (player.closestEnemy.position[0] - player.position[0]) ** 2)) {
				player.closestEnemy = enemies[i];
			}
		}
		if(player.closestEnemy !== undefined) {
			player.angle = Math.atan2(player.closestEnemy.position[1] - player.position[1], player.closestEnemy.position[0] - player.position[0]);
		}
	}
	
	//Shoot
	if(page == "game" && keys.includes("Space") && player.coolDown <= 0) {
		player.coolDown = PLAYER_COOLDOWN_IN_MILLISECONDS * gameTicksPerMillisecond;
		new Shot([player.position[0], player.position[1]], player.angle);
	}
	
	//Update elements
	checkForButtonHover();
	elements.sort((e1, e2) => e1.z - e2.z);
	for(let i = 0; i < elements.length; i++) {
		elements[i].update();
	}
}

//The animation
function animate()
{
	//Requast animation frame
	requestAnimationFrame(animate);
	
	//Canvas setup
	adjustCanvasSize();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//Draw ground
	ctx.fillStyle = "#00ff00";
	ctx.fillRect(0, prop(HEIGHT - GROUND_HEIGHT), prop(WIDTH), prop(GROUND_HEIGHT));
	ctx.strokeStyle = "#009900";
	ctx.lineWidth = prop(8);
	ctx.beginPath();
	ctx.moveTo(0, prop(HEIGHT - GROUND_HEIGHT) + ctx.lineWidth / 2);
	ctx.lineTo(prop(WIDTH), prop(HEIGHT - GROUND_HEIGHT) + ctx.lineWidth / 2);
	ctx.closePath();
	ctx.stroke();
	
	//Draw elements
	elements.sort((e1, e2) => e1.z - e2.z);
	for(let i = 0; i < elements.length; i++) {
		elements[i].draw();
	}
	
	//Draw player
	ctx.lineWidth = prop(5);
	drawRotatedRect(player.position[0] + Math.cos(player.angle) * PLAYER_SIZE / 2, player.position[1] + Math.sin(player.angle) * PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE / 3, player.angle, "blue", "fill");
	drawRotatedRect(player.position[0] + Math.cos(player.angle) * PLAYER_SIZE / 2, player.position[1] + Math.sin(player.angle) * PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE / 3, player.angle, "black", "stroke");
	
	ctx.lineWidth = prop(6);
	ctx.fillRect(prop(player.position[0] - PLAYER_SIZE / 2), prop(player.position[1] - PLAYER_SIZE / 2), prop(PLAYER_SIZE), prop(PLAYER_SIZE));
	ctx.strokeRect(prop(player.position[0] - PLAYER_SIZE / 2) + ctx.lineWidth / 2, prop(player.position[1] - PLAYER_SIZE / 2) + ctx.lineWidth / 2, prop(PLAYER_SIZE) - ctx.lineWidth, prop(PLAYER_SIZE) - ctx.lineWidth);
	
	//Draw player's HP
	ctx.lineWidth = prop(4);
	ctx.fillStyle = "red";
	ctx.fillRect(prop(player.position[0] - PLAYER_SIZE / 2) + ctx.lineWidth, prop(player.position[1] - PLAYER_SIZE / 2 - 15) + ctx.lineWidth, prop(PLAYER_SIZE) - ctx.lineWidth * 2, prop(13) - ctx.lineWidth * 2);
	ctx.fillStyle = "lime";
	ctx.fillRect(prop(player.position[0] - PLAYER_SIZE / 2) + ctx.lineWidth, prop(player.position[1] - PLAYER_SIZE / 2 - 15) + ctx.lineWidth, Math.max((prop(PLAYER_SIZE) - ctx.lineWidth * 2) * player.HP / PLAYER_MAX_HP, 0), prop(13) - ctx.lineWidth * 2);
	ctx.strokeRect(prop(player.position[0] - PLAYER_SIZE / 2) + ctx.lineWidth / 2, prop(player.position[1] - PLAYER_SIZE / 2 - 15) + ctx.lineWidth / 2, prop(PLAYER_SIZE) - ctx.lineWidth, prop(13) - ctx.lineWidth);
	
	//Draw closest enemy target
	if(player.closestEnemy !== undefined) {
		const enemy = player.closestEnemy;
		ctx.strokeStyle = "red";
		ctx.lineWidth = prop(6);
		
		ctx.beginPath();
		ctx.moveTo(prop(enemy.position[0] - (enemy.radius + 3)), prop(enemy.position[1] - (enemy.radius + 3) / 2));
		ctx.lineTo(prop(enemy.position[0] - (enemy.radius + 3)), prop(enemy.position[1] - (enemy.radius + 3)));
		ctx.lineTo(prop(enemy.position[0] - (enemy.radius + 3) / 2), prop(enemy.position[1] - (enemy.radius + 3)));
		
		ctx.moveTo(prop(enemy.position[0] + (enemy.radius + 3)), prop(enemy.position[1] - (enemy.radius + 3) / 2));
		ctx.lineTo(prop(enemy.position[0] + (enemy.radius + 3)), prop(enemy.position[1] - (enemy.radius + 3)));
		ctx.lineTo(prop(enemy.position[0] + (enemy.radius + 3) / 2), prop(enemy.position[1] - (enemy.radius + 3)));
		
		ctx.moveTo(prop(enemy.position[0] - (enemy.radius + 3)), prop(enemy.position[1] + (enemy.radius + 3) / 2));
		ctx.lineTo(prop(enemy.position[0] - (enemy.radius + 3)), prop(enemy.position[1] + (enemy.radius + 3)));
		ctx.lineTo(prop(enemy.position[0] - (enemy.radius + 3) / 2), prop(enemy.position[1] + (enemy.radius + 3)));
		
		ctx.moveTo(prop(enemy.position[0] + (enemy.radius + 3)), prop(enemy.position[1] + (enemy.radius + 3) / 2));
		ctx.lineTo(prop(enemy.position[0] + (enemy.radius + 3)), prop(enemy.position[1] + (enemy.radius + 3)));
		ctx.lineTo(prop(enemy.position[0] + (enemy.radius + 3) / 2), prop(enemy.position[1] + (enemy.radius + 3)));
		
		ctx.stroke();
	}
}
