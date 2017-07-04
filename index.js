/**
 * Created by somefive on 17-6-30.
 */
let app = null;
let pageDisplay1 = null, pageDisplay2 = null;
require.config({
	paths: {
		'jquery': 'lib/jquery.min'
	}
});
require(['jquery'], function($){
	$(document).ready(function(){
		pageDisplay1 = new PageDisplay('page-display-canvas-1');
		pageDisplay2 = new PageDisplay('page-display-canvas-2');
	})
});
require(['lib/vue.min'], function(Vue){
	app = new Vue({
		el: '#tocatta-app',
		data: {
			message: 'Hello Tocatta!'
		}
	});
});
let tmp;
class Messenger {
	constructor(host = "localhost", port = 9050, callback) {
		this.socket = new WebSocket("ws://"+host+":"+port);
		this.socket.onmessage = function(message) {
			console.log("AAA");
			message = JSON.parse(message.data);
			console.log(message);
			callback(message);
		}
	}
	send(message) {
		if (this.socket.readyState !== 1) setTimeout(() => {this.send(message);});
		else this.socket.send(message);
	}
}

class PageManager {
	constructor(name, suffix="jpg") {
		this.name = name;
		this.dict = {};
		this.pageFault = false;
		this.suffix = suffix;
		this.messenger = new Messenger("localhost", 9050, (message) => {
			if (message.status) {
				let img = new Image();
				img.src = message.data;
				this.dict[message.name] = img;
				img.onload = () => {console.log(message.name+":"+img.width+"x"+img.height)};
			} else {
				this.pageFault = true;
			}
		});
	}
	get(page_id) {
		if (!this.dict[name+page_id]) {
			this.getFromServer(page_id);
		}
	}
	getFromServer(page_id) {
		this.messenger.send(name+page_id+"."+this.suffix);
	}
}

let pageManager = new PageManager('', 'jpg');

let measures = [];
function preload() {
	pageManager.get(2);
	setTimeout(() => {
		let page = pageManager.dict[2];
		let interval = page.height/5;
		for (let i=0;i<5;++i)
			measures.push(new ImageClip(page, 0, i*interval, page.width, interval));
	}, 3000);
}
preload();

class ImageClip {
	constructor(image, sx, sy, sWidth, sHeight) {
		this.image = image;
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
	}
}

class PageDisplay {
	constructor(canvas_id) {
		this.canvas = document.getElementById(canvas_id);
		this.canvas.height = this.canvas.clientHeight;
		this.canvas.width = this.canvas.clientWidth;
		this.ctx = this.canvas.getContext('2d');
		this.centerX = this.canvas.clientWidth/2;
		this.centerY = this.canvas.clientHeight/2;
		// this.scale = 1.0;
		this.imageClipCollection = [];
	}
	clear() {
		this.imageClipCollection = [];
		this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
	}
	render() {
		this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		let heightSum = 0;
		this.imageClipCollection.forEach((element) => {
			heightSum += element.sHeight;
		});
		let scale = (heightSum < 1) ? 1.0 : this.canvas.clientHeight/heightSum;
		let lastY = 0;
		this.imageClipCollection.forEach((element) => {
			let imageClip = element;
			let realHeight = imageClip.sHeight*scale;
			let realWidth = imageClip.sWidth*scale;
			let offsetX = this.centerX - realWidth/2;
			let offsetY = lastY;
			lastY = offsetY + realHeight;
			console.log(imageClip);
			console.log(offsetX+" "+offsetY+" "+realWidth+" "+realHeight+" "+scale);
			this.ctx.drawImage(imageClip.image,
				imageClip.sx, imageClip.sy, imageClip.sWidth, imageClip.sHeight,
				offsetX, offsetY, realWidth, realHeight);
		});
	}
	rescale(scale) {
		this.scale = scale;
		this.render();
	}
}