"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by somefive on 17-7-3.
 */
var PaintPattern = function () {
	function PaintPattern() {
		_classCallCheck(this, PaintPattern);
	}

	_createClass(PaintPattern, null, [{
		key: "drawLinesHorizontally",
		value: function drawLinesHorizontally(baseCanvas, pts) {
			baseCanvas.clear();
			baseCanvas.ctx.beginPath();
			baseCanvas.ctx.moveTo(baseCanvas.ctx[0] * baseCanvas.canvas.width, 0);
			var interval = baseCanvas.canvas.height / pts.length;
			for (var i = 1; i < pts.length; ++i) {
				baseCanvas.ctx.lineTo(pts[i] * baseCanvas.canvas.width, i * interval);
			}
			baseCanvas.ctx.stroke();
		}
	}]);

	return PaintPattern;
}();

/**
 * A class for reconstructed color data.
 */


var ReshapedColorData = function ReshapedColorData(imageData) {
	_classCallCheck(this, ReshapedColorData);

	var array = [],
	    index = 0;
	for (var row = 0; row < imageData.height; ++row) {
		array.push([]);
		for (var col = 0; col < imageData.width; ++col) {
			array[row].push([imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3]]);
			index += 4;
		}
	}
	this.data = array;
	this.width = imageData.width;
	this.height = imageData.height;
};

var ImageProcess = function () {
	function ImageProcess() {
		_classCallCheck(this, ImageProcess);
	}

	_createClass(ImageProcess, null, [{
		key: "getRowColorDepth",


		/**
   * Get the smoothed color depth of average image row
   * @param rcd Reshaped Color Data
   * @param smoothDepth
   * @returns {Array}
   */
		value: function getRowColorDepth(rcd) {
			var smoothDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

			var depth = [];
			for (var row = 0; row < rcd.height; ++row) {
				var total = 0;
				for (var col = 0; col < rcd.width; ++col) {
					var color = rcd.data[row][col][0] + rcd.data[row][col][1] + rcd.data[row][col][2];
					color = color * rcd.data[row][col][3] / 4 / 256 / 256;
					if (rcd.data[row][col][3] < 25) color = 1;
					total += color;
				}
				var value = total / imageData.width;
				depth.push(value);
			}
			depth = ImageProcess.normalize(ImageProcess.smooth(ImageProcess.normalize(depth), smoothDepth));
			return depth;
		}

		/**
   * Calculate continuous blocks position. list of [beginAt, length]
   * @param dataSeq
   * @param depthThreshold
   * @param intervalThreshold
   * @returns {Array}
   */

	}, {
		key: "getContinuousBlocks",
		value: function getContinuousBlocks(dataSeq) {
			var depthThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.98;
			var intervalThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;

			var cbs = [];
			var beginAt = -1;
			for (var i = 0; i < dataSeq.length; ++i) {
				if (dataSeq[i] < depthThreshold) {
					if (beginAt == -1) beginAt = i;
				} else {
					if (beginAt >= 0 && i - beginAt > intervalThreshold) cbs.push([beginAt, i - beginAt]);
					beginAt = -1;
				}
			}
			return cbs;
		}

		/**
   * Normalize a sequence of data by shifting and stretching
   * @param dataSeq
   * @param min_start
   * @param max_start
   * @returns {Array}
   */

	}, {
		key: "normalize",
		value: function normalize(dataSeq) {
			var min_start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
			var max_start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

			var _min = min_start,
			    _max = max_start;
			for (var i = 0; i < dataSeq.length; ++i) {
				if (dataSeq[i] < _min) _min = dataSeq[i];
				if (dataSeq[i] > _max) _max = dataSeq[i];
			}
			var cpy = [];
			for (var _i = 0; _i < dataSeq.length; ++_i) {
				cpy.push((dataSeq[_i] - _min) / (_max - _min));
			}return cpy;
		}

		/**
   * Smooth a sequence of data
   * @param dataSeq
   * @param depth
   * @returns {Array}
   */

	}, {
		key: "smooth",
		value: function smooth(dataSeq) {
			var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

			var cpy = [],
			    ds = dataSeq;
			while (depth > 0) {
				for (var i = 0; i < ds.length; ++i) {
					var d1 = i - 2 >= 0 ? ds[i - 2] : 1;
					var d2 = i - 1 >= 0 ? ds[i - 1] : 1;
					var d3 = ds[i];
					var d4 = i + 1 < ds.length ? ds[i + 1] : 1;
					var d5 = i + 2 < ds.length ? ds[i + 2] : 1;
					var value = d1 * 0.1 + d2 * 0.2 + d3 * 0.4 + d4 * 0.2 + d5 * 0.1;
					cpy.push(value);
				}
				ds = cpy;
				cpy = [];
				depth -= 1;
			}
			return ds;
		}
	}]);

	return ImageProcess;
}();
//# sourceMappingURL=imageProcess.js.map