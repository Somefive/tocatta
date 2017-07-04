/**
 * Created by somefive on 17-7-3.
 */
let app, imageFile, imageData, pageCanvas, sectorManager;
function readImage(file) {
	imageFile = file;
	let fr = new FileReader();
	fr.readAsDataURL(file);
	fr.onload = function() {
		let img = new Image();
		img.src = this.result;
		img.onload = function() {
			let scale = pageCanvas.canvas.height/this.height < pageCanvas.canvas.width/this.width ? pageCanvas.canvas.height/this.height : pageCanvas.canvas.width/this.width;
			let height = this.height*scale;
			let width = this.width*scale;
			let cX = pageCanvas.canvas.width/2, cY = pageCanvas.canvas.height/2;
			console.log(cX+" "+cY+" - "+width+" - "+height);
			pageCanvas.ctx.drawImage(img, cX-width/2, cY-height/2, width, height);
			app.displayWidth = width;
			app.displayLeftOffset = cX-width/2;
			imageData = pageCanvas.ctx.getImageData(cX-width/2, cY-height/2, width, height);
			sectorManager.load(imageData);
			// sectorManager.drawSystems(true);
		}
	}
}

require.config({
	paths: {
		'jquery': 'lib/jquery.min'
	}
});
require(['jquery', 'imageProcess', 'notations'], function($){
	$(document).ready(function(){
		pageCanvas = new BaseCanvas(document.getElementById('page-canvas'));
		sectorManager = new SectorManager();
	})
});
let Vue;
require(['lib/vue.min'], function(_Vue){
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
			autoGenerate: function() {
				sectorManager.drawSystems(true);
				sectorManager.calcMeasures();
			},
			openReadImageDialog: function() {
				document.getElementById('btn-read-image').click();
			},
			changeSystemEditable: function() {
				this.systemEditable = !this.systemEditable;
			}
		}
	});
});