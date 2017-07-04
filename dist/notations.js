'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by somefive on 17-7-4.
 */

var System = function System(y, height) {
	_classCallCheck(this, System);

	this.y = y;
	this.height = height;
	this.measures = [];
};

var Measure = function Measure(start, end) {
	_classCallCheck(this, Measure);

	this.start = start;
	this.end = end;
};

var BaseCanvas = function () {
	function BaseCanvas(canvas) {
		_classCallCheck(this, BaseCanvas);

		this.canvas = canvas;
		this.canvas.height = this.canvas.clientHeight;
		this.canvas.width = this.canvas.clientWidth;
		this.ctx = this.canvas.getContext('2d');
		this.centerX = this.canvas.width / 2;
		this.centerY = this.canvas.height / 2;
		this.height = this.canvas.height;
		this.width = this.canvas.width;
	}

	_createClass(BaseCanvas, [{
		key: 'clear',
		value: function clear() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}]);

	return BaseCanvas;
}();

var SectorManager = function () {
	function SectorManager() {
		_classCallCheck(this, SectorManager);

		this.smoothDepth = 3;
		this.colorDepthThreshold = 0.98;
		this.intervalThreshold = 50;
		this.cbs = [];
	}

	_createClass(SectorManager, [{
		key: 'load',
		value: function load(imageData) {
			this.imageData = imageData;
			this.rcd = new ReshapedColorData(imageData);
			app.systems.splice(0, app.systems.length);
		}
	}, {
		key: 'calcSystems',
		value: function calcSystems() {
			if (!this.rcd) return;
			var depth = ImageProcess.getRowColorDepth(this.rcd, this.smoothDepth);
			this.cbs = ImageProcess.getContinuousBlocks(depth, this.colorDepthThreshold, this.intervalThreshold);
		}
	}, {
		key: 'drawSystems',
		value: function drawSystems() {
			var calculate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (calculate) this.calcSystems();
			app.systems.splice(0, app.systems.length);
			this.cbs.forEach(function (e) {
				app.systems.push(e);
			});
		}
	}, {
		key: 'calcMeasures',
		value: function calcMeasures() {
			var _this = this;

			var system = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			var systems = system ? [system] : this.cbs;
			systems.forEach(function (e) {
				ImageProcess.getColumnContinuousLines(_this.rcd, e, 0.7, 0.7, 1, 5);
			});
		}
	}]);

	return SectorManager;
}();
//# sourceMappingURL=notations.js.map