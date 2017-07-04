/**
 * Created by somefive on 17-7-5.
 */
Vue.component('system-item',{
	props: ['system'],
	template:
		`<div class="widget system" @click="click"
				v-bind:style="{top: system.y + 'px', height: system.height + 'px'}">
				<div class="close-btn" v-on:click="removeSystem()"><i class="fa fa-window-close"></i></div>
				<div class="up-stretch boundary-stretch"
					@mousemove="upDrag" @mousedown="upDragStart"
					@mouseup="upDragEnd" @mouseleave="upDragEnd">
					<i class="fa fa-angle-up"></i></div>
				<div class="down-stretch boundary-stretch"
					@mousemove="downDrag" @mousedown="downDragStart"
					@mouseup="downDragEnd" @mouseleave="downDragEnd">
					<i class="fa fa-angle-down"></i></div>
			</div>`,
	methods: {
		removeSystem: function() {
			this.$emit('remove', this.system);
		},
		click: function(event) {
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
	props: ['systems'],
	template:
		`<div id="div-systems" @click="click">
            	<system-item v-for="system in systems" v-bind:system="system" v-on:remove="removeItem"></system-item>
        	</div>`,
	methods: {
		removeItem: function(item) {
			let index = this.systems.indexOf(item);
			if (index >= 0) this.systems.splice(index,1);
		},
		click: function(event) {
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