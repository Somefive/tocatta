'use strict';

/**
 * Created by somefive on 17-7-5.
 */
Vue.component('system-item', {
	props: ['system'],
	template: '<div class="widget system" @click="click"\n\t\t\t\tv-bind:style="{top: system.y + \'px\', height: system.height + \'px\'}">\n\t\t\t\t<div class="close-btn" v-on:click="removeSystem()"><i class="fa fa-window-close"></i></div>\n\t\t\t\t<div class="up-stretch boundary-stretch"\n\t\t\t\t\t@mousemove="upDrag" @mousedown="upDragStart"\n\t\t\t\t\t@mouseup="upDragEnd" @mouseleave="upDragEnd">\n\t\t\t\t\t<i class="fa fa-angle-up"></i></div>\n\t\t\t\t<div class="down-stretch boundary-stretch"\n\t\t\t\t\t@mousemove="downDrag" @mousedown="downDragStart"\n\t\t\t\t\t@mouseup="downDragEnd" @mouseleave="downDragEnd">\n\t\t\t\t\t<i class="fa fa-angle-down"></i></div>\n\t\t\t</div>',
	methods: {
		removeSystem: function removeSystem() {
			this.$emit('remove', this.system);
		},
		click: function click(event) {
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
	props: ['systems'],
	template: '<div id="div-systems" @click="click">\n            \t<system-item v-for="system in systems" v-bind:system="system" v-on:remove="removeItem"></system-item>\n        \t</div>',
	methods: {
		removeItem: function removeItem(item) {
			var index = this.systems.indexOf(item);
			if (index >= 0) this.systems.splice(index, 1);
		},
		click: function click(event) {
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