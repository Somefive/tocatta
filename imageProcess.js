/**
 * Created by somefive on 17-7-3.
 */
class PaintPattern {
	static drawLinesHorizontally(baseCanvas, pts) {
		baseCanvas.clear();
		baseCanvas.ctx.beginPath();
		baseCanvas.ctx.moveTo(baseCanvas.ctx[0]*baseCanvas.canvas.width,0);
		let interval = baseCanvas.canvas.height/pts.length;
		for (let i=1;i<pts.length;++i) {
			baseCanvas.ctx.lineTo(pts[i]*baseCanvas.canvas.width,i*interval);
		}
		baseCanvas.ctx.stroke();
	}
}

/**
 * A class for reconstructed color data.
 */
class ReshapedColorData {
	constructor(imageData) {
		let array = [], index = 0;
		for (let row=0;row<imageData.height;++row) {
			array.push([]);
			for (let col=0;col<imageData.width;++col) {
				array[row].push([
					imageData.data[index],
					imageData.data[index+1],
					imageData.data[index+2],
					imageData.data[index+3]
				]);
				index += 4;
			}
		}
		this.data = array;
		this.width = imageData.width;
		this.height = imageData.height;
	}
}

class ImageProcess {
	
	/**
	 * Get the smoothed color depth of average image row
	 * @param rcd Reshaped Color Data
	 * @param smoothDepth
	 * @returns {Array}
	 */
	static getRowColorDepth(rcd, smoothDepth = 3) {
		let depth = [];
		for (let row=0;row<rcd.height;++row) {
			let total = 0;
			for (let col=0;col<rcd.width;++col) {
				let color = rcd.data[row][col][0] + rcd.data[row][col][1] + rcd.data[row][col][2];
				color = color*rcd.data[row][col][3]/4/256/256;
				if (rcd.data[row][col][3] < 25) color = 1;
				total += color;
			}
			let value = total/imageData.width;
			depth.push(value);
		}
		depth = ImageProcess.normalize(ImageProcess.smooth(ImageProcess.normalize(depth),smoothDepth));
		return depth;
	}
	
	/**
	 * Get the barline separated measures of a system
	 * @param rcd Reshaped Color Data where system comes from
	 * @param system
	 * @param blackThreshold the depth of color below which will be recognized as black
	 * @param continuousMinPercentage the threshold of percentage of continuous black pixels to be recognized as a barline
	 * @param barlineHalfWidth the half width of a speculated barline
	 * @param measureMinLength the minimal length of continuous columns to be identified as a measure
	 * @returns {Array}
	 */
	static getColumnContinuousLines(rcd, system, blackThreshold = 0.4, continuousMinPercentage = 0.7, barlineHalfWidth = 1, measureMinLength = 5) {
		let rowBegin = system.y, rowEnd = system.y+system.height, isBarline = [];
		system.measures.splice(0, system.measures.length);
		for (let col=0;col<rcd.width;++col) {
			let maxLength = 0, current = 0;
			for (let y = rowBegin; y < rowEnd; ++y) {
				let isBlack = false;
				for (let dx = -barlineHalfWidth; dx <= barlineHalfWidth; ++dx) {
					let x = col + dx;
					if (x < 0 || x >= rcd.width) continue;
					let color = rcd.data[y][x][0] + rcd.data[y][x][1] + rcd.data[y][x][2];
					color = color*rcd.data[y][x][3]/4/256/256;
					if (rcd.data[y][x][3] < 25) color = 1;
					if (color < blackThreshold) {
						isBlack = true;
						break;
					}
				}
				if (isBlack) {
					current += 1;
					if (current > maxLength) maxLength += current;
				} else {
					current = 0;
				}
			}
			isBarline.push(maxLength > system.height*continuousMinPercentage);
		}
		let measureStart = -1;
		for (let i=1;i<rcd.width;++i) {
			if (measureStart == -1) {
				if (isBarline[i-1] && !isBarline[i]) measureStart = i;
			} else {
				if (isBarline[i]) {
					if (i - measureStart > measureMinLength) system.measures.push(new Measure(measureStart, i-1));
					measureStart = -1;
				}
			}
		}
		return system.measures;
	}
	
	/**
	 * Calculate continuous blocks position. list of [beginAt, length]
	 * @param dataSeq
	 * @param depthThreshold
	 * @param intervalThreshold
	 * @returns {Array}
	 */
	static getContinuousBlocks(dataSeq, depthThreshold=0.98, intervalThreshold=5) {
		let cbs = [];
		let beginAt = -1;
		for (let i=0;i<dataSeq.length;++i) {
			if (dataSeq[i] < depthThreshold) {
				if (beginAt == -1) beginAt = i;
			} else {
				if (beginAt >= 0 && (i-beginAt) > intervalThreshold) cbs.push(new System(beginAt, i-beginAt));
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
	static normalize(dataSeq, min_start = 1, max_start = 0) {
		let _min = min_start, _max = max_start;
		for (let i=0;i<dataSeq.length;++i) {
			if (dataSeq[i]<_min) _min = dataSeq[i];
			if (dataSeq[i]>_max) _max = dataSeq[i];
		}
		let cpy = [];
		for (let i=0;i<dataSeq.length;++i) cpy.push((dataSeq[i]-_min)/(_max-_min));
		return cpy;
	}
	
	/**
	 * Smooth a sequence of data
	 * @param dataSeq
	 * @param depth
	 * @returns {Array}
	 */
	static smooth(dataSeq, depth=1) {
		let cpy = [], ds = dataSeq;
		while (depth > 0) {
			for (let i=0;i<ds.length;++i) {
				let d1 = (i-2)>=0?ds[i-2]:1;
				let d2 = (i-1)>=0?ds[i-1]:1;
				let d3 = ds[i];
				let d4 = (i+1)<ds.length?ds[i+1]:1;
				let d5 = (i+2)<ds.length?ds[i+2]:1;
				let value = d1*0.1+d2*0.2+d3*0.4+d4*0.2+d5*0.1;
				cpy.push(value);
			}
			ds = cpy;
			cpy = [];
			depth -= 1;
		}
		return ds;
	}
}