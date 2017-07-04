/**
 * Created by somefive on 17-7-5.
 */
Vue.component('measure-item',{
	props: ['measure', 'editable'],
	template:
		`<div class="measure" @click="click">
			<div class="left-stretch horizontal-boundary-stretch" v-show="editable"
				@mousemove="leftDrag" @mousedown="leftDragStart"
				@mouseup="leftDragEnd" @mouseleave="leftDragEnd">
				<i class="fa fa-angle-left center-align"></i></div>
			<div class="right-stretch horizontal-boundary-stretch" v-show="editable"
				@mousemove="rightDrag" @mousedown="rightDragStart"
				@mouseup="rightDragEnd" @mouseleave="rightDragEnd">
				<i class="fa fa-angle-right center-align"></i></div>
			<div class="sector-edit-btn trash-btn" v-on:click="remove" v-show="editable"><i class="fa fa-trash"></i></div>
		</div>`,
	methods: {
		click: function(event) {
			event.stopPropagation();
		},
		remove: function() {
			this.$emit('remove', this.measure);
		},
		leftDrag: function(event) {
			if (!this.leftDragging) return;
			this.measure.start = event.clientX - this.offset;
		},
		leftDragStart: function(event) {
			this.offset = event.clientX - this.measure.start;
			this.leftDragging = true;
		},
		leftDragEnd: function(event) {
			this.leftDrag(event);
			this.leftDragging = false;
		},
		rightDrag: function(event) {
			if (!this.rightDragging) return;
			this.measure.end = event.clientX - this.offset;
		},
		rightDragStart: function(event) {
			this.offset = event.clientX - this.measure.end;
			this.rightDragging = true;
		},
		rightDragEnd: function(event) {
			this.rightDrag(event);
			this.rightDragging = false;
		}
	}
});
Vue.component('system-item',{
	props: ['system', 'editable'],
	template:
		`<div class="widget system" @click="click" v-show="systemVisible"
				v-bind:style="{top: system.y + 'px', height: system.height + 'px'}">
				<div class="up-stretch vertical-boundary-stretch" v-show="systemEditable"
					@mousemove="upDrag" @mousedown="upDragStart"
					@mouseup="upDragEnd" @mouseleave="upDragEnd">
					<i class="fa fa-angle-up"></i></div>
				<div class="down-stretch vertical-boundary-stretch" v-show="systemEditable"
					@mousemove="downDrag" @mousedown="downDragStart"
					@mouseup="downDragEnd" @mouseleave="downDragEnd">
					<i class="fa fa-angle-down"></i></div>
				<measure-item v-bind:editable="measureEditable" v-on:remove="removeMeasure"
					v-for="measure in system.measures" v-bind:measure="measure"
					v-bind:style="{left: measure.start + 'px', width: (measure.end-measure.start+1) + 'px'}"
					v-show="measureVisible"></measure-item>
				<div class="sector-edit-btn trash-btn" v-on:click="remove" v-show="systemEditable"><i class="fa fa-trash"></i></div>
				<div class="sector-edit-btn change-visibility-btn" v-on:click="changeMeasureVisibility"><i class="fa" v-bind:class="visibilityClass"></i></div>
				<div class="sector-edit-btn change-editability-btn" v-on:click="changeMeasureEditability" v-show="measureVisible"><i class="fa fa-edit"></i></div>
			</div>`,
	data: function() {
		return {
			mode: "visible"
		}
	},
	computed: {
		measureEditable: function() { return this.mode == "edit-measure"; },
		measureVisible: function() { return this.mode == "view-measure" || this.mode == "edit-measure" },
		systemEditable: function() { return this.mode != "invisible" && this.editable; },
		systemVisible: function() { return this.mode != "invisible"; },
		visibilityClass: function() { return this.measureVisible?"fa-eye-slash":"fa-eye"}
	},
	methods: {
		changeMeasureVisibility: function() {
			if (this.measureVisible) this.mode = "visible";
			else this.mode = "view-measure";
		},
		changeMeasureEditability: function() {
			if (this.measureEditable) this.mode = "view-measure";
			else this.mode = "edit-measure";
		},
		remove: function() {
			this.$emit('remove', this.system);
		},
		removeMeasure: function(measure) {
			let index = this.system.measures.indexOf(measure);
			if (index >= 0) this.system.measures.splice(index,1);
		},
		click: function(event) {
			if (this.measureEditable) {
				let x = event.layerX;
				if (this.system.measures.every((e) => {
						return x < e.start || x > e.end;
					})) {
					this.system.measures.push(new Measure(x, x+30));
				}
			}
			event.stopPropagation();
		},
		upDragStart: function(event) {
			this.system.offsetY = event.clientY - this.system.y;
			this.system.bottom = this.system.y + this.system.height;
			this.system.upDragging = true;
		},
		upDragEnd: function(event) {
			this.upDrag(event);
			this.system.upDragging = false;
		},
		upDrag: function(event) {
			if (!this.system.upDragging) return;
			let newY = event.clientY - this.system.offsetY;
			let newHeight = this.system.bottom - newY;
			if (newHeight > 30) {
				this.system.y = newY;
				this.system.height = newHeight;
			}
		},
		downDragStart: function(event) {
			this.system.offsetY = event.clientY - this.system.y - this.system.height;
			this.system.downDragging = true;
		},
		downDragEnd: function(event) {
			this.downDrag(event);
			this.system.downDragging = false;
		},
		downDrag: function(event) {
			if (!this.system.downDragging) return;
			let newY = event.clientY - this.system.offsetY;
			let newHeight = newY - this.system.y;
			if (newHeight > 30) this.system.height = newHeight;
		}
	}
});
Vue.component('system-items',{
	props: ['systems', 'editable'],
	template:
		`<div id="div-systems" @click="click">
            <system-item v-for="system in systems" v-bind:system="system" v-bind:editable="editable" v-on:remove="removeSystem"></system-item>
        </div>`,
	methods: {
		removeSystem: function(item) {
			let index = this.systems.indexOf(item);
			if (index >= 0) this.systems.splice(index,1);
		},
		click: function(event) {
			if (!this.editable) return;
			let y = event.layerY;
			if (this.systems.every((e) => {
					return y < e.y || y > (e.y+e.height);
				})) {
				this.systems.push(new System(y, 30));
			}
			event.stopPropagation();
		}
	}
});