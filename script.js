$(function () {


/*
	$.widget("ui.patternomatic", {
		//get preset
		//set last view patternvars from preset

		//create
		//create controlpattern
		//create control color

		//change
		//update preview svg
		//are current patternvars different to lvpatternvars
			//set previewbutton to create preview
		//else
			//set previewbutton to download file
	},
	$.widget("ui.controlpattern", {
		//create sizeslider
		//sizeslider.onchnage = patternomatic.change
	},
	$.widget("ui.controlcolor", {
		//create hueslider
		//create satbrt slider
		//create highlightslider
		//create noiseslider
	},
	$.widget("ui.patternpixelmatrix", {
		//resize
	},
	$.widget("ui.patternpreview", {
		//click preview
	},
*/

	$.widget("ui.patternpicker", {
		options: {
			patternsize: 0,
			pattern: []
		},
		_create: function() {
			var self = this,
				o = this.options;

			$("#pattern input[type=checkbox]").change(function () {
				$(this).parents(".pixel").toggleClass("pixel-on", $(this).is(":checked"));
				$("#prv_p_"+$(this).attr("id").substr(6, 3)).css("visibility", ($(this).is(":checked") ? "visible" : "hidden"));
			});

			self.resize(o.patternsize);

			$("#pattern").children(".pattern_row").children(".pixel").each(function (i, a) {
				$(a).children("input").prop("checked", o.pattern[i]).change();
			});
		},
		value: function( newvalue ) {
			var self = this,
				o = this.options;

			if (newvalue.patternsize) {
				o.patternsize = newvalue.patternsize;
				self.resize(newvalue.patternsize);
				$("#previewsvg").preview("value", {patternsize: newvalue.patternsize});
			}

			if (newvalue.pattern) {
				o.pattern = newvalue.pattern;
				$("#pattern").children(".pattern_row").children(".pixel").each(function (i, a) {
					$(a).children("input").prop("checked", o.pattern[i]).change();
				});
				$("#previewsvg").preview("value", {pattern: newvalue.pattern});
			}
		},
		resize: function(value) {
			$("#pattern").children("div").hide();
			$("#pattern").children("div").children("div").hide();

			$("#pattern").removeClass();
			$("#pattern").addClass("pattern_"+value+"sq");
		
			if (value >= 3) {
				$("#pattern").children("div:nth-child(1), div:nth-child(2), div:nth-child(3)").show();
				$("#pattern").children("div").children("div:nth-child(1), div:nth-child(2), div:nth-child(3)").show();
			}
			if (value >= 4) {
				$("#pattern").children("div:nth-child(4)").show();
				$("#pattern").children("div").children("div:nth-child(4)").show();
			}
			if (value >= 5) {
				$("#pattern").children("div:nth-child(5)").show();
				$("#pattern").children("div").children("div:nth-child(5)").show();
			}
			if (value >= 6) {
				$("#pattern").children("div:nth-child(6)").show();
				$("#pattern").children("div").children("div:nth-child(6)").show();
			}
			if (value >= 7) {
				$("#pattern").children("div:nth-child(7)").show();
				$("#pattern").children("div").children("div:nth-child(7)").show();
			}
		},
	});

	$.widget("ui.colorpicker", {
		options: {
			patternsize: 0,
			pattern: [],
			hue: 0,
			saturation: 0,
			lightness: 0,
			highlight: 0,
			noise: 0,
			file: ""
		},
		_create: function() {
			var self = this,
				o = this.options;

			o.saturation = 100 - o.saturation;

			$("#patternpicker").colorpicker("value", o);

			$("#patternsizeslider").slider({orientation: "horizontal", min: 3, max: 7, value: o.patternsize, 
				slide: function(event, ui) {
					$("#pattern").patternpicker("value", {patternsize: ui.value});
				},
			});

			$("#hueslider").slider({orientation: "horizontal", min: 0, max: 360, value: o.hue,
				slide: function(event, ui) {
					$("#patternpicker").colorpicker("value", {hue: ui.value});
				}
			});

			$("#saturationslider").squiggles({valueX: o.saturation, valueY: o.lightness, 
				slide: function(event, ui) {
					$("#patternpicker").colorpicker("value", {saturation: ui.value.x, lightness: ui.value.y});
				}
			});
			
			$("#highlightslider").slider({orientation: "horizontal", min: 0, max: 12, step: 0.01, value: o.highlight, 
				slide: function(event, ui) {
					$("#patternpicker").colorpicker("value", {highlight: ui.value});
				}
			});
			
			$("#noiseslider").slider({orientation: "horizontal", min: 0, max: 12, step: 0.01, value: o.noise, 
				slide: function(event, ui) {
					$("#patternpicker").colorpicker("value", {noise: ui.value});
				}
			});
		},
		value: function( newvalue ) {
			var self = this,
				o = this.options;

/*
			if (newvalue.patternsize) {
				o.patternsize = newvalue.patternsize;
				$("#previewsvg").preview("value", {patternsize: newvalue.patternsize});
			}
*/
			if (newvalue.hue) {
				o.hue = newvalue.hue;
				$("#previewsvg").preview("value", {hue: newvalue.hue});
			}
			if (newvalue.saturation) {
				o.saturation = newvalue.saturation;
				$("#previewsvg").preview("value", {saturation: newvalue.saturation});
			}
			if (newvalue.lightness) {
				o.lightness = newvalue.lightness;
				$("#previewsvg").preview("value", {lightness: newvalue.lightness});
			}
			if (newvalue.highlight) {
				o.highlight = newvalue.highlight;
				$("#previewsvg").preview("value", {highlight: newvalue.highlight});
			}
			if (newvalue.noise) {
				o.noise = newvalue.noise;
				$("#previewsvg").preview("value", {noise: newvalue.noise});
			}
			if (newvalue.file) {
				o.file = newvalue.file;
			}

			if (newvalue.hue) {
				$("#saturationslider").css("background", "url('g6728.png') left -28px no-repeat, -webkit-gradient(linear, left top, right top, from(hsl("+o.hue+", 100%, 50%)), to(hsl("+o.hue+", 0%, 50%)))");
			}

/* 			$("#noiseslider").slider("value", (ui.value - 6) * 1.2 + 6); */
			var lalalala = $.Color([(o.hue / 360), ((100 - o.saturation) / 100), (o.lightness / 100)], "HSL");
			var luminance = (lalalala.red() / 255 * 0.2126) + (lalalala.green() / 255 * 0.7152) + (lalalala.blue() / 255 * 0.0722);

			$("#submit").toggleClass("submit_light", (luminance > 0.5));

			if (newvalue.hue || newvalue.saturation || newvalue.lightness) {
				$("#highlightslider").css("background", "url('g6728.png') left -20px no-repeat, -webkit-gradient(linear, left top, right top, from(hsl("+o.hue+", "+(100 - o.saturation)+"%, "+o.lightness+"%)), to(hsl("+o.hue+", "+(100 - o.saturation)+"%, "+(o.lightness + 24)+"%)))");
		
				$("#noiseslider").css("background-color", "hsl("+o.hue+", "+(100 - o.saturation)+"%, "+o.lightness+"%)");
			}

			if (newvalue.file) {
				$("body").css("background-image", "url('files/"+o.file+"')");
			}
		},
	});
	$.widget("ui.preview", {
		options: {
			patternsize: 0,
			pattern: [],
			hue: 0,
			saturation: 0,
			lightness: 0,
			highlight: 0,
			noise: 0
		},
		_create: function() {
			var self = this,
				o = this.options;

			$("#prv_bgrect").attr("fill", "hsl("+o.hue+", "+(o.saturation)+"%, "+(o.lightness)+"%)");
			$("#prv_pattern").children("rect").attr("fill", "hsl("+o.hue+", "+(o.saturation)+"%, "+(o.lightness + o.highlight)+"%)");
			$("#prv_noise").css("opacity", o.noise/50);
			$("#prv_pattern").attr("width", o.patternsize).attr("height", o.patternsize);
		},
		value: function( newvalue ) {
			var self = this,
				o = this.options;

			if (newvalue.patternsize) {
				o.patternsize = newvalue.patternsize;
			}
			if (newvalue.hue) {
				o.hue = newvalue.hue;
			}
			if (newvalue.saturation) {
				o.saturation = newvalue.saturation;
			}
			if (newvalue.lightness) {
				o.lightness = newvalue.lightness;
			}
			if (newvalue.highlight) {
				o.highlight = newvalue.highlight;
			}
			if (newvalue.noise) {
				o.noise = newvalue.noise;
			}

			if (newvalue.hue || newvalue.saturation || newvalue.lightness) {
				$("#prv_bgrect").attr("fill", "hsl("+o.hue+", "+(100 - o.saturation)+"%, "+(o.lightness)+"%)");
			}

			if (newvalue.hue || newvalue.saturation || newvalue.lightness || newvalue.highlight) {
				$("#prv_pattern").children("rect").attr("fill", "hsl("+o.hue+", "+(100 - o.saturation)+"%, "+(o.lightness + o.highlight)+"%)");
			}

			if (newvalue.noise) {
				$("#prv_noise").css("opacity", o.noise/50);
			}

			if (newvalue.patternsize) {
				$("#prv_pattern").attr("width", o.patternsize).attr("height", o.patternsize);
			}
		}
	});
	$.widget("ui.history", {
		options: {
		},
		_create: function() {
			var self = this,
				o = this.options;

/* 			self.addtohistory(o.firsthistory); */
/* 			self.blargh(o.firsthistory); */

/* console.log(JSON.parse(localStorage.history).slice(-10)); */

var showhistories = Math.floor($("#history").width() / (48 + 8));

			if (localStorage.history) {
console.log(JSON.parse(localStorage.history).slice(-1 * showhistories));
				for (var i in JSON.parse(localStorage.history).slice(-showhistories)) {
					self.blargh(JSON.parse(localStorage.history).slice(-showhistories)[i], "#history");
				}
				for (var i in JSON.parse(localStorage.history)) {
					self.blargh(JSON.parse(localStorage.history)[i], "#favorites");
				}
			}
			
		},
		addtohistory: function(data) {
			if (localStorage) {
				if (!localStorage.getItem("history")) {
					localStorage.setItem("history", JSON.stringify([]));
				}

				localStorage.history = JSON.stringify(JSON.parse(localStorage.history).concat(data));
			}
		},
		blargh: function(data, parent) {
/*
			if ((parent == "#history" || parent == "#history, #favorites") && $("#history").children().size() >= 10) {
				$("#history").children().first().remove();
			}
*/

			var history = $("<div class=\"old_pattern\" style=\"background: url(g6728.png) 0px -514px no-repeat, url('files/"+data.file+"') center center no-repeat;\" />")
				.data("definition", data)
				.click(function () {
					$("#pattern").patternpicker("value", $(this).data("definition"));

					$("#patternsizeslider").slider("value", $(this).data("definition").patternsize);

					$("#patternpicker").colorpicker("value", $(this).data("definition"));

					$("#hueslider").slider("value", $(this).data("definition").hue);
					$("#saturationslider").squiggles("value", {x:$(this).data("definition").saturation, y:$(this).data("definition").lightness});
					$("#highlightslider").slider("value", $(this).data("definition").highlight);
				});

			if (parent == "#history" || parent == "#history, #favorites") {
				history.appendTo($("#history"));
			}
			if (parent == "#favorites" || parent == "#history, #favorites") {
				if (parent == "#history, #favorites") {
					history = history.clone();
				}

				history.prependTo($("#favorites"));
			}
		}
	});

	var preset = {
		hue: 207,
		saturation: 50,
		lightness: 25,
		highlight: 4,
		noise: 8,
		patternsize: 5,
		pattern: [
			true, true, false, true, false, false, false,
			true, true, false, true, false, false, false,
			true, true, false, true, false, false, false,
			true, true, false, true, false, false, false,
			true, true, false, true, false, false, false,
			false, false, false, false, false, false, false,
			false, false, false, false, false, false, false
		],
		file: "0d71ed6e5cfbf61dc4c73f04e8b76237_final.png"
	}
/*
	var preset = {
		hue: 219,
		saturation: 13,
		lightness: 22,
		highlight: 4,
		noise: 8,
		patternsize: 4,
		pattern: [
			true, true, true, false, false, false, false,
			true, true, false, true, false, false, false,
			true, false, true, true, false, false, false,
			false, true, true, true, false, false, false,
			false, false, false, false, false, false, false,
			false, false, false, false, false, false, false,
			false, false, false, false, false, false, false
		],
		file: "facf9d566bf30558e5765f7f7087d89a_final.png"
	}
*/

	$("#patternpicker").colorpicker(preset);
	$("#pattern").patternpicker(preset);
	$("#previewsvg").preview(preset);
/* 	$("#history").history({firsthistory: preset}); */

/* 	localStorage.clear(); */

	$("#submit").click(function() {
		$("#prog").toggleClass("prog_waiting", true);

		var saturationlightness = $("#saturationslider").squiggles("value");

		var data = {
			hue: $("#hueslider").slider("value"),
			saturation: saturationlightness.x,
			lightness: saturationlightness.y,
			highlight: $("#highlightslider").slider("value"),
			noise: $("#noiseslider").slider("value"),
			patternsize: $("#patternsizeslider").slider("value"),
			pattern: $.map($("#pattern").children("div").children(".pixel").children("input"), function (a) {
				return $(a).is(":checked");
			})
		}

		$.ajax({
			type: "POST",
			url: "createtile.php",
			data: data,
			success: function(msg){
				hashfile = $.parseJSON(msg);

				$("#patternpicker").colorpicker("value", {file: hashfile.file});

				window.document.location.hash = hashfile.hash;

				$("#prog").toggleClass("prog_waiting", false);

				data.file = hashfile.file;
				data.hash = hashfile.hash;

/* 				$("#history").history("addtohistory", data); */
/* 				$("#history").history("blargh", data, "#history, #favorites"); */
			}
		});
	});
});