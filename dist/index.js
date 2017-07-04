'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by somefive on 17-6-30.
 */
var app = null;
var pageDisplay1 = null,
    pageDisplay2 = null;
require.config({
	paths: {
		'jquery': 'lib/jquery.min'
	}
});
require(['jquery'], function ($) {
	$(document).ready(function () {
		pageDisplay1 = new PageDisplay('page-display-canvas-1');
		pageDisplay2 = new PageDisplay('page-display-canvas-2');
	});
});
require(['lib/vue.min'], function (Vue) {
	app = new Vue({
		el: '#tocatta-app',
		data: {
			message: 'Hello Tocatta!'
		}
	});
});
var tmp = void 0;

var Messenger = function () {
	function Messenger() {
		var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "localhost";
		var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 9050;
		var callback = arguments[2];

		_classCallCheck(this, Messenger);

		this.socket = new WebSocket("ws://" + host + ":" + port);
		this.socket.onmessage = function (message) {
			console.log("AAA");
			message = JSON.parse(message.data);
			console.log(message);
			callback(message);
		};
	}

	_createClass(Messenger, [{
		key: 'send',
		value: function send(message) {
			var _this = this;

			if (this.socket.readyState !== 1) setTimeout(function () {
				_this.send(message);
			});else this.socket.send(message);
		}
	}]);

	return Messenger;
}();

var PageManager = function () {
	function PageManager(name) {
		var _this2 = this;

		var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "jpg";

		_classCallCheck(this, PageManager);

		this.name = name;
		this.dict = {};
		this.pageFault = false;
		this.suffix = suffix;
		this.messenger = new Messenger("localhost", 9050, function (message) {
			if (message.status) {
				var img = new Image();
				img.src = message.data;
				_this2.dict[message.name] = img;
				img.onload = function () {
					console.log(message.name + ":" + img.width + "x" + img.height);
				};
			} else {
				_this2.pageFault = true;
			}
		});
	}

	_createClass(PageManager, [{
		key: 'get',
		value: function get(page_id) {
			if (!this.dict[name + page_id]) {
				this.getFromServer(page_id);
			}
		}
	}, {
		key: 'getFromServer',
		value: function getFromServer(page_id) {
			this.messenger.send(name + page_id + "." + this.suffix);
		}
	}]);

	return PageManager;
}();

var pageManager = new PageManager('', 'jpg');

var measures = [];
function preload() {
	pageManager.get(2);
	setTimeout(function () {
		var page = pageManager.dict[2];
		var interval = page.height / 5;
		for (var i = 0; i < 5; ++i) {
			measures.push(new ImageClip(page, 0, i * interval, page.width, interval));
		}
	}, 3000);
}
preload();

var ImageClip = function ImageClip(image, sx, sy, sWidth, sHeight) {
	_classCallCheck(this, ImageClip);

	this.image = image;
	this.sx = sx;
	this.sy = sy;
	this.sWidth = sWidth;
	this.sHeight = sHeight;
};

var PageDisplay = function () {
	function PageDisplay(canvas_id) {
		_classCallCheck(this, PageDisplay);

		this.canvas = document.getElementById(canvas_id);
		this.canvas.height = this.canvas.clientHeight;
		this.canvas.width = this.canvas.clientWidth;
		this.ctx = this.canvas.getContext('2d');
		this.centerX = this.canvas.clientWidth / 2;
		this.centerY = this.canvas.clientHeight / 2;
		// this.scale = 1.0;
		this.imageClipCollection = [];
	}

	_createClass(PageDisplay, [{
		key: 'clear',
		value: function clear() {
			this.imageClipCollection = [];
			this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
			var heightSum = 0;
			this.imageClipCollection.forEach(function (element) {
				heightSum += element.sHeight;
			});
			var scale = heightSum < 1 ? 1.0 : this.canvas.clientHeight / heightSum;
			var lastY = 0;
			this.imageClipCollection.forEach(function (element) {
				var imageClip = element;
				var realHeight = imageClip.sHeight * scale;
				var realWidth = imageClip.sWidth * scale;
				var offsetX = _this3.centerX - realWidth / 2;
				var offsetY = lastY;
				lastY = offsetY + realHeight;
				console.log(imageClip);
				console.log(offsetX + " " + offsetY + " " + realWidth + " " + realHeight + " " + scale);
				_this3.ctx.drawImage(imageClip.image, imageClip.sx, imageClip.sy, imageClip.sWidth, imageClip.sHeight, offsetX, offsetY, realWidth, realHeight);
			});
		}
	}, {
		key: 'rescale',
		value: function rescale(scale) {
			this.scale = scale;
			this.render();
		}
	}]);

	return PageDisplay;
}();
//# sourceMappingURL=index.js.map