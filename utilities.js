//Fixed screen size
const WIDTH = 1536;
const HEIGHT = 695;

//Animation variables
let gameTicksCompletedCount = 0;
let performanceNotVisbleMs = 0;
let performanceNotVisblePointMs = 0;
const refreshStartTimeMs = performance.now();
const gameTicksPerMillisecond = 250 / 1000;

//Load elements
function loadElements()
{
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");
	
	audioSources.music = document.querySelector("#music");
}

//Pause the tick counting when the game isn't visible
function visibilityChange()
{
	if(document.visibilityState == 'visible') {
		performanceNotVisbleMs += performance.now() - performanceNotVisblePointMs;
	} else {
		performanceNotVisblePointMs = performance.now();
	}
}

//Get mouse cordinates
function mouseMove(event)
{
	mouse.x = event.offsetX * window.devicePixelRatio;
	mouse.y = event.offsetY * window.devicePixelRatio;
}

//Update keys pressed
function keyDown(event)
{
	if(!keys.includes(event.code)) keys.push(event.code);
}

//Update keys pressed
function keyUp(event)
{
	keys.splice(keys.indexOf(event.code), 1);
}

//Animation control
function refreshTick() {
	const refreshNowTimeMs = (performance.now() - performanceNotVisbleMs) - refreshStartTimeMs;
	const gameTicksExpectedCount = refreshNowTimeMs * gameTicksPerMillisecond;
	while(gameTicksExpectedCount > gameTicksCompletedCount) {
		update();
		++gameTicksCompletedCount;
	}
	requestAnimationFrame(refreshTick);
}

//Get value proportional to the computer screen size
function prop(n)
{
	return n / HEIGHT * canvas.height;
}

//Convert value proportional to the screen size to original value
function reverseProp(n)
{
	return n * HEIGHT / canvas.height;
}

//Make the canvas fit the screen while keeping a constant width:height ratio
function adjustCanvasSize()
{
	canvas.width = window.innerWidth * window.devicePixelRatio;
	canvas.height = window.innerHeight * window.devicePixelRatio;
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	canvas.style.width = `${window.innerWidth}px`;
	canvas.style.height = `${window.innerHeight}px`;
	if(canvas.width / canvas.height > WIDTH / HEIGHT) {
		canvas.height = window.innerHeight * window.devicePixelRatio;
		canvas.width = canvas.height * WIDTH / HEIGHT;
		canvas.style.width = `${window.innerHeight * WIDTH / HEIGHT}px`;
		canvas.style.height = `${window.innerHeight}px`;
	} else {
		canvas.width = window.innerWidth * window.devicePixelRatio;
		canvas.height = canvas.width / WIDTH * HEIGHT;
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerWidth / WIDTH * HEIGHT}px`;
	}
}

//Draw rect [x,y,width,height] rotated by [angle] radians 
function drawRotatedRect(x, y, width, height, angle, color, drawMethod)
{
	const halfDiagonal = Math.sqrt(width ** 2 + height ** 2) / 2;
	const diagonalAngle = Math.atan(height / width);
	
	ctx.beginPath();
	ctx.moveTo(prop(x - halfDiagonal * Math.cos(diagonalAngle + angle)),
				prop(y - halfDiagonal * Math.sin(diagonalAngle + angle)));
				
	ctx.lineTo(prop(x + halfDiagonal * Math.cos(diagonalAngle - angle)),
				prop(y - halfDiagonal * Math.sin(diagonalAngle - angle)));
				
	ctx.lineTo(prop(x + halfDiagonal * Math.cos(diagonalAngle + angle)),
				prop(y + halfDiagonal * Math.sin(diagonalAngle + angle)));
				
	ctx.lineTo(prop(x - halfDiagonal * Math.cos(diagonalAngle - angle)),
				prop(y + halfDiagonal * Math.sin(diagonalAngle - angle)));
				
	ctx.closePath();
	
	if(drawMethod === "fill") {
		ctx.fillStyle = color;
		ctx.fill();
	} else if(drawMethod === "stroke") {
		ctx.strokeStyle = color;
		ctx.stroke();
	}
}

//Check for collusion between arc [x1,y1,r1] and rectangle [x2,y2,w2,h2]
function checkArcAndRectCollusion(x1, y1, r1, x2, y2, w2, h2)
{
	return x1 > x2 - r1 && x1 < x2 + w2 + r1 && y1 > y2 && y1 < y2 + h2 ||
		x1 > x2 && x1 < x2 + w2 && y1 > y2 - r1 && y1 < y2 + h2 + r1 ||
		(x1 - x2) ** 2 + (y1 - y2) ** 2 < r1 ** 2 ||
		(x1 - (x2 + w2)) ** 2 + (y1 - y2) ** 2 < r1 ** 2 ||
		(x1 - x2) ** 2 + (y1 - (y2 + h2)) ** 2 < r1 ** 2 ||
		(x1 - (x2 + w2)) ** 2 + (y1 - (y2 + h2)) ** 2 < r1 ** 2;
}

//Rotate [vector] by [angle]
function rotateVector(vector, angle)
{
	return [vector[0] * Math.cos(angle) - vector[1] * Math.sin(angle), vector[0] * Math.sin(angle) + vector[1] * Math.cos(angle)];
}

//Draw an arrow going from [x1,y1] to [x2,y2]
function drawArrow(x1, y1, x2, y2)
{
	const angle = Math.atan2(y2 - y1, x2 - x1);
	
	ctx.beginPath();
	ctx.moveTo(prop(x1), prop(y1));
	ctx.lineTo(prop(x2), prop(y2));
	ctx.moveTo(prop(x2 + Math.cos(angle + Math.PI + Math.PI / 6) * 20), prop(y2 + Math.sin(angle + Math.PI + Math.PI / 6) * 20));
	ctx.lineTo(prop(x2), prop(y2));
	ctx.lineTo(prop(x2 + Math.cos(angle + Math.PI - Math.PI / 6) * 20), prop(y2 + Math.sin(angle + Math.PI - Math.PI / 6) * 20));
	ctx.stroke();
}

//Draw the velocity given if it's big enough
function drawVelocity(position, velocity)
{
	ctx.lineWidth = prop(5);
	
	if(Math.abs(velocity[0]) > 0.1) {
		ctx.strokeStyle = "#0099ff";
		drawArrow(position[0], position[1], position[0] + velocity[0] * 25, position[1]);
	}
	
	if(Math.abs(velocity[1]) > 0.1) {
		ctx.strokeStyle = "#e6e600";
		drawArrow(position[0], position[1], position[0], position[1] + velocity[1] * 25);
	}
	
	if(velocity[0] ** 2 + velocity[1] ** 2 > 0.02) {
		ctx.strokeStyle = "#ff6600";
		drawArrow(position[0], position[1], position[0] + velocity[0] * 25, position[1] + velocity[1] * 25);
	}
}
