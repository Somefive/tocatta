"use strict";

/**
 * Created by somefive on 17-7-3.
 */
var app = void 0,
    imageFile = void 0,
    imageData = void 0,
    pageCanvas = void 0,
    sectorManager = void 0;
function readImage(file) {
	imageFile = file;
	var fr = new FileReader();
	fr.readAsDataURL(file);
	fr.onload = function () {
		var img = new Image();
		img.src = this.result;
		img.onload = function () {
			var scale = pageCanvas.canvas.height / this.height < pageCanvas.canvas.width / this.width ? pageCanvas.canvas.height / this.height : pageCanvas.canvas.width / this.width;
			var height = this.height * scale;
			var width = this.width * scale;
			var cX = pageCanvas.canvas.width / 2,
			    cY = pageCanvas.canvas.height / 2;
			console.log(cX + " " + cY + " - " + width + " - " + height);
			pageCanvas.ctx.drawImage(img, cX - width / 2, cY - height / 2, width, height);
			app.displayWidth = width;
			app.displayLeftOffset = cX - width / 2;
			imageData = pageCanvas.ctx.getImageData(cX - width / 2, cY - height / 2, width, height);
			sectorManager.load(imageData);
			// sectorManager.drawSystems(true);
		};
	};
}

require.config({
	paths: {
		'jquery': 'lib/jquery.min'
	}
});
require(['jquery', 'imageProcess', 'notations'], function ($) {
	$(document).ready(function () {
		pageCanvas = new BaseCanvas(document.getElementById('page-canvas'));
		sectorManager = new SectorManager();
	});
});
var Vue = void 0;
require(['lib/vue.min'], function (_Vue) {
	Vue = _Vue;
	require(['components/system']);
	app = new Vue({
		el: '#tocatta-app',
		data: {
			message: 'Hello Tocatta!',
			systems: [],
			systemEditable: false,
			displayWidth: 0,
			displayLeftOffset: 0
		},
		methods: {
			autoGenerate: function autoGenerate() {
				sectorManager.drawSystems(true);
				sectorManager.calcMeasures();
			},
			openReadImageDialog: function openReadImageDialog() {
				document.getElementById('btn-read-image').click();
			},
			changeSystemEditable: function changeSystemEditable() {
				this.systemEditable = !this.systemEditable;
			}
		}
	});
});
//# sourceMappingURL=mark.js.map