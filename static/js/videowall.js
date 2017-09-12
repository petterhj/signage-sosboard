// 	SOSBoard
// ===========================================================================

var VIDEOWALL = VIDEOWALL || {
	// App
	container: null,
	refreshrate: 5000,

	// Init
	init: function() {
		this.container = $('div.videowall');

		this.container.append(this.camera(424667, 'E18', 'Maritim'));
		// this.container.append(this.camera(413229, 'R150', 'Ullern'));
		// this.container.append(this.camera(297619, 'E18', 'Hjortnes'));
		// this.container.append(this.camera(410395, 'R150', 'Ullevål'));
		// this.container.append(this.camera(297634, 'R4', 'Aker sykehus'));
		// this.container.append(this.camera(406344, 'E6', 'Ryen'));
		// this.container.append(this.camera(444691, 'E6', 'Sandstuveien'));
		// this.container.append(this.camera(427603, 'R163', 'Østre Aker vei'));
		// this.container.append(this.camera(513151, 'E6', 'Furuset'));
		// this.container.append(this.camera(410396, 'E6', 'Karihaugen'));
		// this.container.append(this.camera(329272, 'E18', 'Fiskevollbukta'));
		// this.container.append(this.camera(804808, 'E6', 'Djupdalen'));
	},

	// Camera
	camera: function(id, road, name) {
		// Element
		var camera = $('<div>', {
			class: 'camera',
			style: 'background-image: url("http://webkamera.vegvesen.no/kamera?id=' + id +'");'
		})
		.append($('<span>', {class: 'road', 'data-type': road.substring(0, 1)}).text(road))
		.append($('<span>', {class: 'name'}).text(name));

		// Timer
		// $.timer(function() {
  //       	console.log('Update: ' + id);
  //       	// var update = VIDEOWALL.camera(id, road, name);
  //       	// camera.replaceWith(update);
  //       	console.log($(this));
  //   	}).set({time: VIDEOWALL.refreshrate, autostart: true});


		// Return element
		return camera;
	}	
}
