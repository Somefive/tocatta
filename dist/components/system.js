'use strict';

/**
 * Created by somefive on 17-7-5.
 */
Vue.component('measure-item', {
	props: ['measure', 'editable'],
	template: '<div class="measure" @click="click">\n\t\t\t<div class="left-stretch horizontal-boundary-stretch" v-show="editable"\n\t\t\t\t@mousemove="leftDrag" @mousedown="leftDragStart"\n\t\t\t\t@mouseup="leftDragEnd" @mouseleave="leftDragEnd">\n\t\t\t\t<i class="fa fa-angle-left center-align"></i></div>\n\t\t\t<div class="right-stretch horizontal-boundary-stretch" v-show="editable"\n\t\t\t\t@mousemove="rightDrag" @mousedown="rightDragStart"\n\t\t\t\t@mouseup="rightDragEnd" @mouseleave="rightDragEnd">\n\t\t\t\t<i class="fa fa-angle-right center-align"></i></div>\n\t\t\t<div class="sector-edit-btn trash-btn" v-on:click="remove" v-show="editable"><i class="fa fa-trash"></i></div>\n\t\t</div>',
	methods: {
		click: function click(event) {
			event.stopPropagation();
		},
		remove: function remove() {
			this.$emit('remove', this.measure);
		},
		leftDrag: function leftDrag(event) {
			if (!this.leftDragging) return;
			this.measure.start = event.clientX - this.offset;
		},
		leftDragStart: function leftDragStart(event) {
			this.offset = event.clientX - this.measure.start;
			this.leftDragging = true;
		},
		leftDragEnd: function leftDragEnd(event) {
			this.leftDrag(event);
			this.leftDragging = false;
		},
		rightDrag: function rightDrag(event) {
			if (!this.rightDragging) return;
			this.measure.end = event.clientX - this.offset;
		},
		rightDragStart: function rightDragStart(event) {
			this.offset = event.clientX - this.measure.end;
			this.rightDragging = true;
		},
		rightDragEnd: function rightDragEnd(event) {
			this.rightDrag(event);
			this.rightDragging = false;
		}
	}
});
Vue.component('system-item', {
	props: ['system', 'editable'],
	template: '<div class="widget system" @click="click" v-show="systemVisible"\n\t\t\t\tv-bind:style="{top: system.y + \'px\', height: system.height + \'px\'}">\n\t\t\t\t<div class="up-stretch vertical-boundary-stretch" v-show="systemEditable"\n\t\t\t\t\t@mousemove="upDrag" @mousedown="upDragStart"\n\t\t\t\t\t@mouseup="upDragEnd" @mouseleave="upDragEnd">\n\t\t\t\t\t<i class="fa fa-angle-up"></i></div>\n\t\t\t\t<div class="down-stretch vertical-boundary-stretch" v-show="systemEditable"\n\t\t\t\t\t@mousemove="downDrag" @mousedown="downDragStart"\n\t\t\t\t\t@mouseup="downDragEnd" @mouseleave="downDragEnd">\n\t\t\t\t\t<i class="fa fa-angle-down"></i></div>\n\t\t\t\t<measure-item v-bind:editable="measureEditable" v-on:remove="removeMeasure"\n\t\t\t\t\tv-for="measure in system.measures" v-bind:measure="measure"\n\t\t\t\t\tv-bind:style="{left: measure.start + \'px\', width: (measure.end-measure.start+1) + \'px\'}"\n\t\t\t\t\tv-show="measureVisible"></measure-item>\n\t\t\t\t<div class="sector-edit-btn trash-btn" v-on:click="remove" v-show="systemEditable"><i class="fa fa-trash"></i></div>\n\t\t\t\t<div class="sector-edit-btn change-visibility-btn" v-on:click="changeMeasureVisibility"><i class="fa" v-bind:class="visibilityClass"></i></div>\n\t\t\t\t<div class="sector-edit-btn change-editability-btn" v-on:click="changeMeasureEditability" v-show="measureVisible"><i class="fa fa-edit"></i></div>\n\t\t\t</div>',
	data: function data() {
		return {
			mode: "visible"
		};
	},
	computed: {
		measureEditable: function measureEditable() {
			return this.mode == "edit-measure";
		},
		measureVisible: function measureVisible() {
			return this.mode == "view-measure" || this.mode == "edit-measure";
		},
		systemEditable: function systemEditable() {
			return this.mode != "invisible" && this.editable;
		},
		systemVisible: function systemVisible() {
			return this.mode != "invisible";
		},
		visibilityClass: function visibilityClass() {
			return this.measureVisible ? "fa-eye-slash" : "fa-eye";
		}
	},
	methods: {
		changeMeasureVisibility: function changeMeasureVisibility() {
			if (this.measureVisible) this.mode = "visible";else this.mode = "view-measure";
		},
		changeMeasureEditability: function changeMeasureEditability() {
			if (this.measureEditable) this.mode = "view-measure";else this.mode = "edit-measure";
		},
		remove: function remove() {
			this.$emit('remove', this.system);
		},
		removeMeasure: function removeMeasure(measure) {
			var index = this.system.measures.indexOf(measure);
			if (index >= 0) this.system.measures.splice(index, 1);
		},
		click: function click(event) {
			if (this.measureEditable) {
				var x = event.layerX;
				if (this.system.measures.every(function (e) {
					return x < e.start || x > e.end;
				})) {
					this.system.measures.push(new Measure(x, x + 30));
				}
			}
			event.stopPropagation();
		},
		upDragStart: function upDragStart(event) {
			this.system.offsetY = event.clientY - this.system.y;
			this.system.bottom = this.system.y + this.system.height;
			this.system.upDragging = true;
		},
		upDragEnd: function upDragEnd(event) {
			this.upDrag(event);
			this.system.upDragging = false;
		},
		upDrag: function upDrag(event) {
			if (!this.system.upDragging) return;
			var newY = event.clientY - this.system.offsetY;
			var newHeight = this.system.bottom - newY;
			if (newHeight > 30) {
				this.system.y = newY;
				this.system.height = newHeight;
			}
		},
		downDragStart: function downDragStart(event) {
			this.system.offsetY = event.clientY - this.system.y - this.system.height;
			this.system.downDragging = true;
		},
		downDragEnd: function downDragEnd(event) {
			this.downDrag(event);
			this.system.downDragging = false;
		},
		downDrag: function downDrag(event) {
			if (!this.system.downDragging) return;
			var newY = event.clientY - this.system.offsetY;
			var newHeight = newY - this.system.y;
			if (newHeight > 30) this.system.height = newHeight;
		}
	}
});
Vue.component('system-items', {
	props: ['systems', 'editable'],
	template: '<div id="div-systems" @click="click">\n            <system-item v-for="system in systems" v-bind:system="system" v-bind:editable="editable" v-on:remove="removeSystem"></system-item>\n        </div>',
	methods: {
		removeSystem: function removeSystem(item) {
			var index = this.systems.indexOf(item);
			if (index >= 0) this.systems.splice(index, 1);
		},
		click: function click(event) {
			if (!this.editable) return;
			var y = event.layerY;
			if (this.systems.every(function (e) {
				return y < e.y || y > e.y + e.height;
			})) {
				this.systems.push(new System(y, 30));
			}
			event.stopPropagation();
		}
	}
});
//# sourceMappingURL=system.js.map