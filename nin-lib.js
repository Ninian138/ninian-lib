"use strict"
//global
var ninScreenWidth;
var ninScreenHeight;
var ninModal;
var ninItemSlideList = new Array();
var ninBrowser;



 

//Item slide
function ninItemSlideStart() {
	let list = document.getElementsByTagName('nin-item-slide');
	for (var i = 0; i < list.length; i++) {
		ninItemSlideList[i] = new NinItemSlide(list[i]);
	}
}
function ninItemSlideOnResize() {
	for (var i = 0; i < ninItemSlideList.length; i++) {
		ninItemSlideList[i].onResize();
	}
}

class NinItemSlide {
	constructor (el) {
		this.el = el;
		this.itemList = this.el.getElementsByTagName('nin-item-list')[0];
		let leftarrow = document.createElement('nin-arrow');
		let rightarrow = document.createElement('nin-arrow');
		leftarrow.innerHTML = "<<";
		rightarrow.innerHTML = ">>";
		leftarrow.onclick = this.clickLeft.bind(this);
		rightarrow.onclick = this.clickRight.bind(this);
		this.el.insertBefore(leftarrow, this.itemList);
		this.el.insertBefore(rightarrow, this.itemList.nextSibling);

		this.translateVal = 0;
		this.translateFrom = 0;
		this.translateQuantity = 0;
		this.translatePercentage = 0;

		this.onResize();
		this.contentListEl = this.el.getElementsByTagName('nin-item-list')[0];
		this.contentListEl.addEventListener('mousedown', this.onMousedown.bind(this));
		this.contentListEl.addEventListener('mouseup', this.onMouseup.bind(this));
		this.contentListEl.addEventListener('mousemove', this.onMousemove.bind(this));
		this.contentListEl.addEventListener('mouseleave', this.onMouseleave.bind(this));
		this.contentListEl.addEventListener('touchstart', this.onMousedown.bind(this));
		this.contentListEl.addEventListener('touchend', this.onMouseup.bind(this));
		this.contentListEl.addEventListener('touchmove', this.onMousemove.bind(this));

		this.clicking = false;
		this.clickPointBefore =null;
		this.clickPoint = null;
		this.velocity = 0;
		this.movedtime;
		this.movedtimeBefore;
	}
	move() {
		if(this.translateVal > 0) this.translateVal = 0;
		else if(Math.abs(this.translateVal) > this.maxTranslateVal) this.translateVal = 0 - this.maxTranslateVal;
		this.itemList.style.transform = "translateX("+this.translateVal+"px)";
	}
	moveTo() {
		let spd = 0.04;
		this.translatePercentage += spd;
		this.translateVal = this.translateFrom + (this.translateQuantity * this.translatePercentage);
		if(this.translateVal > 0) this.translateVal = 0;
		else if(Math.abs(this.translateVal) > this.maxTranslateVal) this.translateVal = 0 - this.maxTranslateVal;

		this.itemList.style.transform = "translateX("+this.translateVal+"px)";
		if(this.translatePercentage < 1) setTimeout(this.moveTo.bind(this), 10);
		else this.translatePercentage = 0;
	}
	inertia() {
		this.translateVal += this.velocity;
		if(this.velocity != 0) this.velocity = this.velocity*0.92;
		this.move();

		if(Math.abs(this.velocity)>0.01) setTimeout(this.inertia.bind(this), 20);
	}
	onMousemove(ev) {
		if(this.clicking == true) {
			ev.preventDefault();
			let pageX = this.getPageX(ev);
			this.movedtimeBefore = this.movedtime;
			this.movedtime = ev.timeStamp;
			this.translateVal -= this.clickPoint - pageX;
			this.clickPointBefore = this.clickPoint;
			this.clickPoint = pageX;
			this.move();
		}
	}
	onMousedown(ev) {
		let pageX = this.getPageX(ev);
		this.clicking = true;
		this.clickPoint = pageX;
		this.clickPointBefore = pageX;
		this.movedtime = ev.timeStamp;
		this.movedtimeBefore = ev.timeStamp;
	}
	onMouseup(ev) {
		this.clicking = false;
		let pageX = this.getPageX(ev);
		console.log(this.movedtime - this.movedtimeBefore);
		console.log(this.movedtime - this.movedtimeBefore);
		console.log(this.movedtime - this.movedtimeBefore);
		if(ninBrowser == "firefox") {
			if(this.movedtime - this.movedtimeBefore != 0) {
				this.velocity = (this.clickPoint - this.clickPointBefore)/(this.movedtime - this.movedtimeBefore)*20;
				console.log(this.clickPoint - this.clickPointBefore);
			} else this.velocity = 0;
		} else {
			if(ev.timeStamp - this.movedtime < 80 && this.movedtime - this.movedtimeBefore != 0) {
				this.velocity = (this.clickPoint - this.clickPointBefore)/(this.movedtime - this.movedtimeBefore)*20;
			} else this.velocity = 0;
		}
		
		this.inertia();
	}
	onMouseleave(ev) {
		if(this.clicking == true) this.onMouseup(ev);
	}
	onResize() {
		let firstchild = this.itemList.querySelector('nin-slide-item');
		let beforeSize = this.contentWidth;
		this.contentWidth = parseFloat(window.getComputedStyle(firstchild).width);
		this.marginWidth = parseFloat(window.getComputedStyle(firstchild).marginRight);
		this.moveVal = (this.contentWidth + this.marginWidth) * 3;
		this.maxTranslateVal = (this.contentWidth+this.marginWidth)*(this.itemList.getElementsByTagName('nin-slide-item').length-3);

		if(beforeSize != 0 && beforeSize != NaN && beforeSize != null) {
			this.translateVal = this.translateVal * (this.contentWidth/beforeSize);
			this.itemList.style.transform = "translateX("+this.translateVal+"px)";
		}	
	}
	clickLeft() {
		this.translateFrom = this.translateVal;
		this.translateQuantity = this.moveVal;
		this.moveTo();
	}
	clickRight() {
		this.translateFrom = this.translateVal;
		this.translateQuantity = 0 - this.moveVal;

		this.moveTo();
	}
	getPageX(ev) {
		let pageX;
		pageX = (ev.pageX)? ev.pageX : ev.changedTouches[0].pageX;
		return pageX;
	}
}





//DropDown
function ninDropdownStart() {
	var ninDropdownList = document.getElementsByTagName('nin-dropdown');
	for (var i = 0; i < ninDropdownList.length; i++) {
		new NinDropdown(ninDropdownList[i]);
	}
}
class NinDropdown {
	constructor(el) {
		this.el = el;
		this.activeContent;
		this.activeTitleClassName;
		this.inactiveTitleClassName;
		this.titles = this.el.getElementsByTagName('nin-title');
		this.content = this.el.getElementsByTagName('nin-content-list')[0];
		this.contentItems = this.el.getElementsByTagName('nin-content');
		this.contentHeight = this.content.offsetHeight;
		this.contentIsOpen = false;

		this.heightChangeVal = 0;
		this.slideVal = 0;
		this.slideFrom;

		this.findClassName();
		this.start();
	}
	clicked(num, event) {
		if(!this.contentIsOpen) {
			this.open(num);
		} else if(this.activeContent == num) {
			this.close();
		} else {
			this.titles[this.activeContent].className = this.inactiveTitleClassName;
			this.slideFrom = this.activeContent;
			this.activeContent = num;
			this.active(num);
			this.contentItems[num].style.transform = (this.slideFrom > num)? "translateX(-100%)" : "translateX(100%)";
			this.slide();
		}
	}
	//private
	start (){
		this.content.style.height = "0";
		for (var i = 0; i < this.titles.length; i++) {
			this.titles[i].addEventListener('mousedown', this.clicked.bind(this, i));
		}
		for (var i = 0; i < this.contentItems.length; i++) {
			this.contentItems[i].style.display = "none";
		}
	}
	open(num) {
		this.activeContent = num;
		this.contentIsOpen = true;
		this.contentItems[num].style.transform = "translateX(0px)";
		this.active(num);
		this.changeHeight();
	}
	close() {
		this.contentIsOpen = false;
		this.changeHeight();
	}
	slide() {
		if(this.slideFrom > this.activeContent) {
			this.slideVal	+= 10;
			this.contentItems[this.activeContent].style.transform = "translateX(" + (this.slideVal-100) + "%)";
		} else {
			this.slideVal	-= 10;
			this.contentItems[this.activeContent].style.transform = "translateX(" + (this.slideVal+100) + "%)";
		}
		this.contentItems[this.slideFrom].style.transform = "translateX(" + this.slideVal + "%)";
		
		if(Math.abs(this.slideVal) < 100) setTimeout(this.slide.bind(this),30);
		else {
			this.slideFrom = null;
			this.slideVal = 0;
		}
	}
	changeHeight() {
		this.heightChangeVal += (this.contentIsOpen)? 10 : -10 ;
		this.content.style.height = this.contentHeight*this.heightChangeVal/100 + "px";
		if (this.contentIsOpen == true && this.heightChangeVal<100 || this.contentIsOpen == false && this.heightChangeVal > 0) {
			setTimeout(this.changeHeight.bind(this), 20);
		}
		else if(this.contentIsOpen == false && this.heightChangeVal < 1) {
			this.inactive(this.activeContent);
		}
	}
	active(num) {
		this.contentItems[num].style.display = "block";
		this.titles[num].className = this.activeTitleClassName;
	}
	inactive(num) {
		this.contentItems[num].style.display = "none";
		this.titles[num].className = this.inactiveTitleClassName;
	}
	findClassName() {
		let classList = this.el.getElementsByTagName('nin-title-list')[0].classList;
		for (var i = 0; i < classList.length; i++) {
			if (classList[i].startsWith('active')) this.activeTitleClassName = classList[i];
			else if(classList[i].startsWith('inactive')) this.inactiveTitleClassName = classList[i];
		}
	}
}










//Modal
function ninMordalStart() {
	let modalElArr = document.getElementsByTagName("nin-modal");
	for (var i = 0; i < modalElArr.length; i++) {
		modalElArr[i].style.display = "none";
		modalElArr[i].style.zIndex = "1000";
		modalElArr[i].style.position = "fixed";
	}
	ninModal = new NinModalController();
}
function ninMordalOnResize() {
	ninModal.onResize(ninScreenWidth,ninScreenHeight);
}


class NinModalController {
	constructor() {
		this.activeModal = null;
		this.activeModalPosition = null;
		this.scale = 0;

		this.modalField = document.createElement('nin-modal-field');
		this.modalField.style.width = ninScreenWidth + "px";
		this.modalField.style.height = ninScreenHeight + "px";
		this.modalField.style.display = "none";
		document.body.appendChild(this.modalField);
		this.modalField.addEventListener('mousedown', this.close.bind(this));
	}

	show(id , position) {
		this.activeModal = document.getElementById(id);
		this.activeModal.style.display = "block";
		this.modalField.style.display = "block";
		if(position) this.activeModalPosition = position;
		this.setPosition();
		this.scalePlus();
	}
	scalePlus() {
		this.scale +=0.04;
		this.activeModal.style.transform = "scale("+this.scale+","+this.scale+")";
		if(this.scale < 1) setTimeout(this.scalePlus.bind(this), 10);
	}
	close() {
		this.activeModal.style.display = "none";
		this.activeModal = null;
		this.activeModalPosition =null;
		this.modalField.style.display = "none";
		this.scale = 0;
	}
	onResize(width, height) {
		this.modalField.style.width = width + "px";
		this.modalField.style.height = height + "px";
		if (this.modalField != null) {
			this.setPosition();
		}
	}
	setPosition() {
		if(this.activeModalPosition == 'center') {
			this.activeModal.style.left = (ninScreenWidth - this.activeModal.offsetWidth)/2 + "px";
			this.activeModal.style.top = (ninScreenHeight - this.activeModal.offsetHeight)/2 + "px";
		}
	}
}




class NinSlider {
	constructor(el) {
		this.el = el;
		this.contents = [];
		this.linkEl = [];

		for (var i = 0; i < this.el.children.length; i++) {
			this.contents[i] = this.el.children[i];
			this.contents[i].style.display = "none";
		}
		let leftarrow = document.createElement('nin-slider-arrow');
		let rightarrow = document.createElement('nin-slider-arrow');
		leftarrow.style.left = 0;
		rightarrow.style.right = 0;
		leftarrow.innerHTML = "<<";
		rightarrow.innerHTML = ">>";
		leftarrow.onclick = this.arrowClicked.bind(this, 0);
		rightarrow.onclick = this.arrowClicked.bind(this, 1);
		this.el.appendChild(rightarrow);
		this.el.appendChild(leftarrow);
		this.linkField = document.createElement('nin-slider-linkf');
		this.el.appendChild(this.linkField);
		for (var i = 0; i < this.contents.length; i++) {	
			let newlinkElement = document.createElement('nin-slider-link');
			newlinkElement.onclick = this.linkClicked.bind(this, i);
			this.linkField.appendChild(newlinkElement);
			this.linkEl[i] = newlinkElement;

			//need onresize
			newlinkElement.style.width = newlinkElement.offsetHeight + "px";
		}
		this.contents[0].style.display = "block"
		

		this.active = 0;
		this.translateVal = 0;
		this.length = this.contents.length;
		this.direction;
		this.from;
		this.moving = false;
		this.link = [];
		this.timer;
		this.nextAction;
		

		this.spd = 4;


		//this.setTimer();
		this.changeColor(0);
	}
	linkClicked(num) {
		if(!this.moving) {
			this.getDirection(num);
			this.moveTo(num);
			this.changeColor(num);
		} else {
			this.nextAction = num;
		}
	}
	arrowClicked(num) {
		let dir = (num == 0)? this.active -1 : this.active +1;
		dir = (dir < 0)? this.length-1 : dir;
		dir = (dir >= this.length)? 0 : dir;
		this.linkClicked(dir)
	}
	moveTo(num) {
		this.from = this.active;
		this.active = num;
		this.contents[this.active].style.display = "block";
		if(this.direction != "same") {
			this.contents[this.active].style.transform = (this.direction == "left")? "translateX(100%)" : "translateX(-100%)";
			this.moving = true;
			this.slide();
		}
	}
	slide() {
		this.translateVal += this.spd;
		if(this.direction == "right") {
			this.contents[this.from].style.transform = "translateX(" + ( 0 - this.translateVal) + "%)";
			this.contents[this.active].style.transform = "translateX(" + (100 - this.translateVal) + "%)";
		} else {
			this.contents[this.from].style.transform = "translateX(" + this.translateVal + "%)";
			this.contents[this.active].style.transform = "translateX(" + (this.translateVal - 100) + "%)";
		}
		
		if(this.translateVal > 99) {
			this.contents[this.from].style.display = "none";
			this.translateVal = 0;
			this.moving = false;
			if(this.nextAction != null) {
				this.linkClicked(this.nextAction);
				this.nextAction = null;
			}
		} else setTimeout(this.slide.bind(this), 20);
		
	}
	getDirection(num) {
		if(num == this.active) this.direction = "same";
		else {
			let a = (this.active - num < 1)? this.active + this.contents.length - num : this.active - num;
 			let b = (num - this.active < 1)? num + this.contents.length - this.active : num - this.active;
 			this.direction = (a >=b )? "left" : "right";
 		}
	}
	changeColor() {
		for (var i = 0; i < this.linkEl.length; i++) {
			this.linkEl[i].className = (i == this.active)? "nin-active-slider-link" : "nin-inactive-slider-link" 
		}
	}
}


function ninSliderStart() {

	var ninSliderArray = [];
	var ninSliderElement = document.getElementsByTagName('nin-slider');
	for (var i = 0;ninSliderElement.length > i; i++) {
		ninSliderArray[i] = new NinSlider(ninSliderElement[i]);
	}
}



function ninGetBrowser() {
	let userAgent = window.navigator.userAgent.toLowerCase();
	let version = window.navigator.appVersion.toLowerCase();
	let name = 'unknown';

	if(userAgent.indexOf("msie") != -1) {
			if(version.indexOf("msie 6.") != -1) name = 'ie6';
			else if(version.indexOf("msie 7.") != -1) name = 'ie7';
			else if(version.indexOf("msie 8.") != -1) name = 'ie8';
			else if(version.indexOf("msie 9.") != -1) name = 'ie9';
			else if(version.indexOf("msie 10.") != -1) name = 'ie10';
			else name = 'ie';
	} 
	else if(userAgent.indexOf('trident/7') != -1) name = 'ie11';
	else if(userAgent.indexOf('chrome') != -1) name = 'chrome';
	else if(userAgent.indexOf('safari') != -1) name = 'safari';
	else if(userAgent.indexOf('opera') != -1) name = 'opera';
	else if(userAgent.indexOf('firefox') != -1) name = 'firefox';
	return name;
}
//start
window.onload = function() {
	ninScreenWidth = window.innerWidth;
	ninScreenHeight = window.innerHeight;
	ninSliderStart();
	ninMordalStart();
	ninDropdownStart();
	ninItemSlideStart()
	ninBrowser = ninGetBrowser();
}
window.onresize = function() {
	ninScreenWidth = window.innerWidth;
	ninScreenHeight = window.innerHeight;
	ninMordalOnResize();
	ninItemSlideOnResize();
}