//Element array, all elements need to be stored here to be active
const elements = [];

//Element object
function Element(position, width, height)
{
	this.position = position;
	this.width = width;
	this.height = height;
	
	this.isHover = false;
	this.opacity = 1;
	this.z = 0;
	
	this.id = "";
	
	this.update = () => {};
	this.onClick = () => {};
	this.draw = () => {}
}

//Check for button clicks
//Need to add [canvas.addEventListener("mousedown", checkForButtonClick);]
function checkForButtonClick()
{
	for(let i = 0; i < elements.length; i++) {
		if(elements[i].isHover) elements[i].onClick();
	}
}

//Check for button hovers
function checkForButtonHover()
{
	for(let i = 0; i < elements.length; i++) {
		elements[i].isHover = (mouse.x >= prop(elements[i].position[0]) && mouse.x <= prop(elements[i].position[0]) + prop(elements[i].width) &&
				mouse.y >= prop(elements[i].position[1]) && mouse.y <= prop(elements[i].position[1]) + prop(elements[i].height));
	}
}
