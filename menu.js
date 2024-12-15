//Cannon constants
const ENEMY_RELEASE_INTERVAL_IN_MILLISECONDS = 1200;

function summonMenuElement(type, x, y, width, height, targetX, targetY, pace, color, content)
{
	let element;
	const transformPace = [Math.random() * Math.PI, Math.PI * 5 + 3, Math.random() * 200 + 200];
	
	if(type == "text") {
		element = new Element([x, y], 0, 0);
		element.textSize = width;
		element.draw = () => {
			ctx.textAlign = "center";
			ctx.fillStyle = element.color;
			ctx.font = `${prop(element.textSize)}px Righteous`;
			ctx.fillText(element.content, prop(element.position[0]), prop(element.position[1]));
		}
	} else if(type == "button") {
		element = new Element([x - width / 2, y - height / 2], width, height);
		element.draw = () => {
			ctx.globalAlpha = element.opacity;
			ctx.strokeStyle = element.color;
			ctx.lineWidth = prop(9);
			ctx.strokeRect(prop(element.position[0]), prop(element.position[1]), prop(element.width), prop(element.height));
			
			ctx.textAlign = "center";
			ctx.fillStyle = element.color;
			ctx.font = `${prop(40)}px Righteous`;
			ctx.fillText(element.content, prop(element.position[0] + element.width / 2), prop(element.position[1] + element.height / 2 + 13));
			ctx.globalAlpha = 1;
		}
	}
	element.content = content;
	element.target = [targetX, targetY];
	element.color = color;
	element.additionalUpdates = [];
	element.update = () => {
		element.position[0] += (element.target[0] + transformPace[1] * Math.sin(counter / transformPace[2] - transformPace[0]) - element.width / 2 - element.position[0]) / pace;
		element.position[1] += (element.target[1] - element.height / 2 - element.position[1]) / pace;
		if(type == "button") element.opacity += ((element.isHover ? 0.5 : 1) - element.opacity) / 50;
		for(let i = 0; i < element.additionalUpdates.length; i++) element.additionalUpdates[i]();
	}
	
	elements.push(element);
	return element;
}

function summonMenu()
{
	page = "menu";
	const menuElements = [];
	
	//Titles
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 400, 120, undefined, WIDTH / 2, 170, 100, "blue", "Bouncy Strike"));
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 70, undefined, WIDTH / 2, 270, 140, "#000080", "Simulator"));
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 30, undefined, WIDTH / 2, 310, 140, "#000080", "Approved by Newton"));
	
	//Controls & credit
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 42, undefined, WIDTH / 2 + 500, HEIGHT / 2 - 50, 160, "#000080", "Controls"));
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 30, undefined, WIDTH / 2 + 500, HEIGHT / 2, 180, "#000080", "Move: WASD / Arrow keys"));
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 30, undefined, WIDTH / 2 + 500, HEIGHT / 2 + 45, 200, "#000080", "Shoot: Spacebar"));
	
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 42, undefined, WIDTH / 2 - 500, HEIGHT / 2 - 50, 160, "#000080", "Music"));
	menuElements.push(summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 30, undefined, WIDTH / 2 - 500, HEIGHT / 2, 180, "#000080", "Cecilia - FOMO | Instrumental"));
	
	//Start button
	const startButton = summonMenuElement("button", -400 + Math.random() * (WIDTH + 800), HEIGHT + 800, 130, 65, WIDTH / 2, HEIGHT / 2 + 30, 160, "blue", "Start");
	menuElements.push(startButton);
	startButton.onClick = () => {
		for(let i = 0; i < menuElements.length; i++) {
			const element = menuElements[i];
			if(element.id == "musicButton") continue;
			element.onClick = () => {};
			element.update = () => {
				element.position[1] += element.position[1] / 140;
				if(element.position[1] > HEIGHT * 2) elements.splice(elements.indexOf(element), 1);
			}
		}
		startGame();
	}
	
	//Documentation button
	const documentationButton = summonMenuElement("button", -400 + Math.random() * (WIDTH + 800), HEIGHT + 800, 320, 65, WIDTH / 2 - 190, HEIGHT / 2 + 130, 160, "blue", "Elastic Collision");
	menuElements.push(documentationButton);
	documentationButton.onClick = () => {
		window.open("https://www.101computing.net/elastic-collision-in-a-pool-game/");
	}
	
	//Source code button
	const sourceCodeButton = summonMenuElement("button", -400 + Math.random() * (WIDTH + 800), HEIGHT + 800, 320, 65, WIDTH / 2 + 190, HEIGHT / 2 + 130, 160, "blue", "Source Code");
	menuElements.push(sourceCodeButton);
	sourceCodeButton.onClick = () => {
		window.open("https://github.com/MichaelAlpin/Bouncy-Strike");
	}
}

function addMusicButton()
{
	const musicButton = summonMenuElement("button", -400 + Math.random() * (WIDTH + 800), HEIGHT + 800, 200, 65, WIDTH - 130, 70, 160, "blue", "Music On");
	musicButton.id = "musicButton";
	musicButton.on = true;
	musicButton.onClick = () => {
		if(musicButton.on) {
			audioSources.music.volume = 0;
			musicButton.content = "Music Off";
		} else {
			audioSources.music.volume = 1;
			musicButton.content = "Music On";
		}
		musicButton.on = !musicButton.on;
	}
}

function startGame()
{
	page = "game";
	counter = 0;
	
	//Reset game variables
	player.HP = PLAYER_MAX_HP;
	player.score = 0;
	
	//Menu button
	const menuButton = summonMenuElement("button", -400 + Math.random() * (WIDTH + 800), HEIGHT + 800, 130, 65, WIDTH - 340, 70, 160, "blue", "Menu");
	menuButton.id = "menuButton";
	menuButton.onClick = () => {
		enemies.splice(0, enemies.length);
		for(let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if(element.id == "musicButton") continue;
			element.onClick = () => {};
			element.update = () => {
				element.position[1] += element.position[1] / 140;
				if(element.position[1] > HEIGHT * 2) elements.splice(elements.indexOf(element), 1);
			}
		}
		summonMenu();
	}
	
	//Score text
	let scoreText = summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 40, undefined, 120, 70, 160, "blue", "Score: 0");
	scoreText.id = "scoreText";
	scoreText.additionalUpdates.push(() => {
		scoreText.content = "Score: " + player.score;
	});
	
	//Cannon
	const cannon = new Element([-100, HEIGHT / 2 - 50], 50, 50);
	cannon.angle = Math.PI / 2;
	cannon.targetAngle = Math.random() * (Math.PI - 0.2) - (Math.PI - 0.2) / 2;
	cannon.z = 1;
	cannon.update = () => {
		cannon.position[0] /= 1.02;
		if(page == "game" && counter % Math.floor(gameTicksPerMillisecond * ENEMY_RELEASE_INTERVAL_IN_MILLISECONDS) == 0) {
			cannon.targetAngle = Math.random() * (Math.PI - 1) - (Math.PI - 1) / 2;
		}
		if(page == "game" && (counter - Math.floor(gameTicksPerMillisecond * ENEMY_RELEASE_INTERVAL_IN_MILLISECONDS / 2)) % Math.floor(gameTicksPerMillisecond * ENEMY_RELEASE_INTERVAL_IN_MILLISECONDS) == 0) {
			enemies.push(new Enemy([cannon.position[0] + Math.cos(cannon.angle) * 50, cannon.position[1] + Math.sin(cannon.angle) * 50], cannon.angle));
		}
		cannon.angle += (cannon.targetAngle - cannon.angle) / 60;
	}
	cannon.draw = () => {
		ctx.lineWidth = prop(8);
		drawRotatedRect(cannon.position[0] + Math.cos(cannon.angle) * 50, cannon.position[1] + Math.sin(cannon.angle) * 50, 80, 42, cannon.angle, "#ff751a", "fill");
		drawRotatedRect(cannon.position[0] + Math.cos(cannon.angle) * 50, cannon.position[1] + Math.sin(cannon.angle) * 50, 80, 42, cannon.angle, "#b34700", "stroke");
		ctx.fillStyle = "#ff751a";
		ctx.strokeStyle = "#b34700";
		ctx.beginPath();
		ctx.arc(prop(cannon.position[0]), prop(cannon.position[1]), prop(cannon.width), 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	elements.push(cannon);
	
	//Start music in case didn't already
	if(audioSources.music.paused) {
		audioSources.music.play();
	}
}

function gameOver()
{
	page = "gameOver";
	
	enemies.splice(0, enemies.length);
	
	//Summon game over menu
	summonMenuElement("text", -400 + Math.random() * (WIDTH + 800), HEIGHT + 600, 120, undefined, WIDTH / 2, HEIGHT / 2 - 145, 100, "red", "Game Over");
	for(let i = 0; i < elements.length; i++) {
		const element = elements[i];
		if(element.id == "scoreText") {
			element.target = [WIDTH / 2, HEIGHT / 2 - 65];
			element.additionalUpdates.push(() => {
				element.textSize += (65 - element.textSize) / 80;
			});
		}
		if(element.id == "menuButton") {
			element.target = [WIDTH / 2, HEIGHT / 2 + 35];
			element.color = "red";
		}
	}
}
