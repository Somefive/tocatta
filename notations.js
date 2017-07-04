/**
 * Created by somefive on 17-7-4.
 */

class System {
	constructor(y, height) {
		this.y = y;
		this.height = height;
		this.measures = [];
	}
}

class Measure {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
}

class BaseCanvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.canvas.height = this.canvas.clientHeight;
		this.canvas.width = this.canvas.clientWidth;
		this.ctx = this.canvas.getContext('2d');
		this.centerX = this.canvas.width/2;
		this.centerY = this.canvas.height/2;
		this.height = this.canvas.height;
		this.width = this.canvas.width;
	}
	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

class SectorManager {
	constructor() {
		this.smoothDepth = 3;
		this.colorDepthThreshold = 0.98;
		this.intervalThreshold = 50;
		this.cbs = [];
	}
	load(imageData) {
		this.imageData = imageData;
		this.rcd = new ReshapedColorData(imageData);
		app.systems.splice(0,app.systems.length);
	}
	calcSystems() {
		if (!this.rcd) return;
		let depth = ImageProcess.getRowColorDepth(this.rcd, this.smoothDepth);
		this.cbs = ImageProcess.getContinuousBlocks(depth, this.colorDepthThreshold, this.intervalThreshold);
	}
	drawSystems(calculate = false) {
		if (calculate) this.calcSystems();
		app.systems.splice(0,app.systems.length);
		this.cbs.forEach((e) => {
			app.systems.push(e);
		});
	}
	calcMeasures(system = null) {
		let systems = (system)?[system]:this.cbs;
		systems.forEach((e) => {
			ImageProcess.getColumnContinuousLines(this.rcd, e, 0.7, 0.7, 1, 5);
		});
	}
}
