$(function () {
	$.widget("ui.foobar", {
		options: {
			patternsize: 0,
			pattern: [],
			hue: 0,
			saturation: 0,
			lightness: 0,
			highlight: 0,
			noise: 0,
		},
		_create: function() {
			this.element.append('<canvas class="molecule"></canvas>');
			this.element.append('<canvas class="noise"></canvas>');
			this.setnoise();
			this.element.append('<canvas class="tile"></canvas>');
			this.element.append('<canvas class="background"></canvas>');
		},
		_init: function() {
			this.setmolecule();
			this.settile();
			this.setbackground();
		},
		setmolecule: function() {
			var preset = this.options;

			if (this.element.children(".molecule")[0].getContext) {
				var ctx = this.element.children(".molecule")[0].getContext('2d');
			
				this.element.children(".molecule")[0].width = preset.patternsize;
				this.element.children(".molecule")[0].height = preset.patternsize;
			
				ctx.fillStyle = ("hsl("+preset.hue+","+preset.saturation+"%,"+preset.lightness+"%)");
				ctx.fillRect(0, 0, 7, 7);
			
				for (y=0; y<7; y++) {
					if (y>=preset.patternsize) continue;
			
					for (x=0; x<7; x++) {
						if (x>=preset.patternsize) continue;
			
						if (!preset.pattern[y*7+x]) continue;
			
						ctx.fillStyle = ("hsl("+preset.hue+","+preset.saturation+"%,"+Math.min(100,preset.lightness+preset.highlight)+"%)");
						ctx.fillRect(x, y, 1, 1);
					}
				}
			}
		},
		setnoise: function() {
			if (this.element.children(".noise")[0].getContext) {
				this.element.children(".noise")[0].width = 280;
				this.element.children(".noise")[0].height = 280;

				var ctx = this.element.children(".noise")[0].getContext('2d');

				ctx.fillStyle = ("white");
				ctx.fillRect(0, 0, 280, 280);

				var imageData = ctx.getImageData(0, 0, 280, 280);
				var pixels = imageData.data;

				for (var i = 0, il = pixels.length; i < il; i += 4) {
					// generate "noise" pixel
					var color = Math.ceil(Math.random() * 255*0.75 + 255*0.25);
				
					pixels[i] =     color;
					pixels[i + 1] = color;
					pixels[i + 2] = color;
				}
	
				ctx.putImageData(imageData, 0, 0);
			}
		},
		settile: function() {
			var preset = this.options;
		
			if (this.element.children(".tile")[0].getContext) {
				var ctx = this.element.children(".tile")[0].getContext('2d');
			
				if (preset.patternsize == 7) {
					this.element.children(".tile")[0].width = 280;
					this.element.children(".tile")[0].height = 280;
				} else {
					this.element.children(".tile")[0].width = 240;
					this.element.children(".tile")[0].height = 240;
				}
			
				var img=this.element.children(".molecule")[0];
				var pat=ctx.createPattern(img,"repeat");
			
				ctx.fillStyle = pat;
				ctx.fillRect(0, 0, 280, 280);
			}

			var noisectx = this.element.children(".noise")[0].getContext('2d');
			var noiseData = noisectx.getImageData(0, 0, this.element.children(".noise")[0].width, this.element.children(".noise")[0].height);
			var noisepixels = noiseData.data;
			
			// Get image pixels
			var imageData = ctx.getImageData(0, 0, this.element.children(".tile")[0].width, this.element.children(".tile")[0].height);
			var pixels = imageData.data;
			
			var alpha = preset.noise/100;
			var alpha1 = 1 - alpha;
			
			for (var i = 0, il = pixels.length; i < il; i += 4) {			
				oR = pixels[i];
				oG = pixels[i + 1];
				oB = pixels[i + 2];

				nR = noisepixels[i];
				nG = noisepixels[i + 1];
				nB = noisepixels[i + 2];

				pixels[i] =     nR * alpha + oR * alpha1;
				pixels[i + 1] = nG * alpha + oG * alpha1;
				pixels[i + 2] = nB * alpha + oB * alpha1;
			}
			
			ctx.putImageData(imageData, 0, 0);
		},
		downloadtile: function() {
			var hash = encode_hash(this.options);
			this.element.children(".tile")[0].toBlob(function(blob) {
			    saveAs(blob, "patternomatic_"+hash+".png");
			});
		},
		setbackground: function() {
			if (this.element.children(".background")[0].getContext) {
				var ctx = this.element.children(".background")[0].getContext('2d');
			
				this.element.children(".background")[0].width = $(document).width();
				this.element.children(".background")[0].height = $(document).height();
			
				var pat=ctx.createPattern(this.element.children(".tile")[0],"repeat");
			
				ctx.fillStyle = pat;
				ctx.fillRect(0, 0, 4000, 3000);
			}
		},
	});

	$.widget("ui.pixels", {
		options: {
			patternsize: 0,
			pattern: [],
		},
		_create: function() {
			var row;

			this.change = this.options.change;

			this.element.addClass("ui-pixels")
				.addClass("ui-pixels-4_rows");

			for (var y = 0; y < 7; y++) {
				row = $('<div class="ui-pixels-row"></div>').appendTo(this.element);

				for (var x = 0; x < 7; x++) {
					this.createpixel(x, y).appendTo(row);
				}
			}
		},
		_init: function() {
			this.element
				.removeClass("ui-pixels-3_rows")
				.removeClass("ui-pixels-4_rows")
				.removeClass("ui-pixels-5_rows")
				.removeClass("ui-pixels-6_rows")
				.removeClass("ui-pixels-7_rows")
				.addClass("ui-pixels-"+this.options.patternsize+"_rows");
		},
		pixels: function(pattern) {
			for (var i = 0; i < 49; i++) {
				var x = i%7;
				var y = Math.floor(i/7);
				this.element.find(".ui-pixels-pixel-at_"+x+"_"+y).toggleClass("ui-pixels-pixel-on", pattern[i]);
			}
		},
		createpixel: function(x, y) {
			return $('<div class="ui-pixels-pixel"></div>')
				.addClass("ui-pixels-pixel-at_"+x+"_"+y)
				.addClass("ui-pixels-pixel-ring_"+Math.max(x, y))
				.toggleClass("ui-pixels-pixel-on", this.options.pattern[y*7+x])
				.click(function() {
					$(this).toggleClass("ui-pixels-pixel-on");
					$(this).parents(".ui-pixels").pixels("resetpreset", null);
				});
		},
		resetpreset: function() {
			this.options.pattern = $.map($(this.element).find(".ui-pixels-pixel"), function (a) {
				return $(a).hasClass("ui-pixels-pixel-on");
			});
			this.change();
		}
	});

	//log errors to raven
	Raven.config("https://1648a82633344b35b25b63cd70a889c4:2a3a86b59df8442fb1f23e06a0d362a3@app.getsentry.com/1083");
	window.onerror = Raven.process;

	//blue vertical stripes, alternating thicknesses
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
	};

/*
	//blue diagonal stripes
	console.log(encode_hash({
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
	}));
	var preset = decode_hash("a2ekggx4vvp6xo074");
*/

	if (window.document.location.hash) {
		try {
			var preset = decode_hash(window.document.location.hash.substr(1));
		} catch (err) {
			//could not create page from hash, use default
			var preset = decode_hash("9j65z2q4jerqh0ni8");
		}
	} else {
		//var preset = preset;
	}

	$("#tile").foobar(preset);

	$("#hueslider").slider({orientation: "horizontal", min: 0, max: 360, value: preset.hue,
		slide: function(event, ui) {
			preset.hue = ui.value;
			$("#tile").foobar(preset);
			$("#saturationslider").css("background", "url('ui-2dslider-bg.png') left -28px no-repeat, -webkit-gradient(linear, left top, right top, from(hsl("+preset.hue+", 100%, 50%)), to(hsl("+preset.hue+", 0%, 50%)))");
 		},
		stop: function(event, ui) {
			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
		},
	}).append('<div class="ui-slider-bg"></div>');

	$("#saturationslider").squiggles({valueX: 100-preset.saturation, valueY: preset.lightness, 
		slide: function(event, ui) {
			preset.saturation = 100-ui.value.x;
			preset.lightness = ui.value.y;
			$("#tile").foobar(preset);
 		},
		stop: function(event, ui) {
			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
		}
	}).css("background", "url('ui-2dslider-bg.png') left -28px no-repeat, -webkit-gradient(linear, left top, right top, from(hsl("+preset.hue+", 100%, 50%)), to(hsl("+preset.hue+", 0%, 50%)))").append('<div class="ui-slider-bg"></div>');

	$("#pixelsslider").slider({orientation: "horizontal", min: 3, max: 7, step: 1, value: preset.patternsize, 
		slide: function(event, ui) {
			preset.patternsize = ui.value;
			$("#pixels").pixels({patternsize: preset.patternsize, pattern: preset.pattern});
			$("#tile").foobar(preset);
 		},
		stop: function(event, ui) {
			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
		}
	}).append('<div class="ui-slider-bg"></div>');

	$("#pixels").pixels({patternsize: preset.patternsize, pattern: preset.pattern,
		change: function(event, ui) {
			preset.pattern = this.options.pattern;
			$("#tile").foobar(preset);

			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
 		}
	});

	$("#highlightslider").slider({orientation: "horizontal", min: 0, max: 12, step: 0.01, value: preset.highlight, 
		slide: function(event, ui) {
			preset.highlight = ui.value;
			$("#tile").foobar(preset);
 		},
		stop: function(event, ui) {
			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
		}
	}).append('<div class="ui-slider-bg"></div>');

	$("#noiseslider").slider({orientation: "horizontal", min: 0, max: 12, step: 0.01, value: preset.noise, 
		slide: function(event, ui) {
			preset.noise = ui.value;
			$("#tile").foobar(preset);
 		},
		stop: function(event, ui) {
			$("body").data("ignore_hash_change", true);
			window.document.location.hash = encode_hash(preset);
		}
	}).append('<div class="ui-slider-bg"></div>');

	$("#download").click(function(event, ui) {
		$("#tile").foobar("downloadtile", preset);
	});
	$(window).resize(function() {
		$("#tile").foobar(preset);
	});

	function encode_hash(preset) {
		try {
			verify_hash_preset(preset);
		} catch (err) {
			throw "can't encode hash, preset is invalid: "+err;
		}

		var hue_input = Math.round(preset.hue);
		var saturation_input = Math.round(preset.saturation);
		var lightness_input = Math.round(preset.lightness);
		var highlight_input = Math.round(preset.highlight);
		var noise_input = Math.round(preset.noise);
		var patternsize_input = Math.round(preset.patternsize);
		var pattern_input = Math.round(preset.pattern);

		var huedigits = "";
		var satbounce = false;
		var satdigits = "";
		var lghbounce = false;
		var lghdigits = "";
		var hltbounce = false;
		var hltdigits = "";
		var nsebounce = false;
		var nsedigits = "";
	
		if (hue_input>=100) {
			huedigits = hue_input.toString();
		} else if (hue_input>=10) {
			huedigits = "0"+hue_input.toString();
		} else {
			huedigits = "00"+hue_input.toString();
		}
	
		if (saturation_input==100) {
			satbounce = true;
			satdigits = "00";
		} else if (saturation_input>=10) {
			satdigits = saturation_input.toString();
		} else {
			satdigits = "0"+saturation_input.toString();
		}
	
		if (lightness_input==100) {
			lghbounce = true;
			lghdigits = "00";
		} else if (lightness_input>=10) {
			lghdigits = lightness_input.toString();
		} else {
			lghdigits = "0"+lightness_input.toString();
		}
	
		if (highlight_input>=10) {
			hltbounce = true;
			hltdigits = parseInt(highlight_input-10).toString();
		} else {
			hltdigits = highlight_input.toString();
		}
	
		if (noise_input>=10) {
			nsebounce = true;
			nsedigits = parseInt(noise_input-10).toString();
		} else {
			nsedigits = noise_input.toString();
		}
	
		var pszadj = patternsize_input-3;

		var patdec = 0;
		for (var i=0; i<49; i++) {
			if (pattern_input[i]) patdec += Math.pow(2,48-i);
		}
		var patb36 = parseInt(patdec, 10).toString(36);

		var optb36 = parseInt(
			huedigits
			+satdigits
			+lghdigits
			+hltdigits
			+nsedigits
			+parseInt((satbounce ? 4 : 0) + (lghbounce ? 2 : 0) + (hltbounce ? 1 : 0), 10).toString()
			+parseInt((nsebounce ? 5 : 0) + pszadj, 10).toString()
		, 10).toString(36);

		while (optb36.length<7) {
			optb36 = "0"+optb36;
		}
		while (patb36.length<10) {
			patb36 = "0"+patb36;
		}

		return optb36+patb36;
	}

	function decode_hash(hash) {
		if (hash.length!=17) {
			throw "can't decode hash, hash is wrong";
		}

		var optb36 = hash.substr(0,7);
		var patb36 = hash.substr(7,10);

		var optdec = parseInt(optb36, 36).toString(10);
		while (optdec.length<11) {
			optdec = "0"+optdec;
		}

		var huedigits = optdec.substr(0,3);
		var satdigits = optdec.substr(3,2);
		var lghdigits = optdec.substr(3+2,2);
		var hltdigits = optdec.substr(3+2+2,1);
		var nsedigits = optdec.substr(3+2+2+1,1);

		var slh_flag = optdec.substr(3+2+2+1+1,1);
		var satbounce = slh_flag==4||slh_flag==5||slh_flag==6||slh_flag==7;
		var lghbounce = slh_flag==2||slh_flag==3||slh_flag==6||slh_flag==7;
		var hltbounce = slh_flag==1||slh_flag==3||slh_flag==5||slh_flag==7;

		var np_flag = optdec.substr(3+2+2+1+1+1,1);
		var nsebounce = np_flag>4;
		var pszdigits = np_flag;

		var patdec = parseInt(patb36, 36).toString(10);
		var patarr = new Array;
		for (var i=0; i<49; i++) {
			var bin2dec = Math.pow(2,48-i);
			patarr[i] = (patdec >= bin2dec);
			if (patdec >= bin2dec) patdec -= bin2dec;
		}

		var preset = {
			hue: parseInt(huedigits, 10),
			saturation: parseInt(satdigits, 10)+(satbounce?100:0),
			lightness: parseInt(lghdigits, 10)+(lghbounce?100:0),
			highlight: parseInt(hltdigits, 10)+(hltbounce?10:0),
			noise: parseInt(nsedigits, 10)+(nsebounce?10:0),
			patternsize: parseInt(pszdigits, 10)+(nsebounce?-5:0)+3,
			pattern: patarr,
		}

		try {
			verify_hash_preset(preset);
		} catch (err) {
			throw "can't decode hash, outcome preset is invalid"+err;
		}

		return preset;
	}

	function verify_hash_preset(preset) {
		var hash_error = false;
		var hash_error_message = "";

		if (typeof preset.hue != "number") { hash_error_message += (hash_error?", ":"")+"hue must be numeric"; hash_error = true; }
		if (preset.hue<0) { hash_error_message += (hash_error?", ":"")+"hue must be >= 0"; hash_error = true; }
		if (preset.hue>360) { hash_error_message += (hash_error?", ":"")+"hue must be <= 360"; hash_error = true; }

		if (typeof preset.saturation != "number") { hash_error_message += (hash_error?", ":"")+"saturation must be numeric"; hash_error = true; }
		if (preset.saturation<0) { hash_error_message += (hash_error?", ":"")+"saturation must be >= 0"; hash_error = true; }
		if (preset.saturation>100) { hash_error_message += (hash_error?", ":"")+"saturation must be <= 100"; hash_error = true; }

		if (typeof preset.lightness != "number") { hash_error_message += (hash_error?", ":"")+"lightness must be numeric"; hash_error = true; }
		if (preset.lightness<0) { hash_error_message += (hash_error?", ":"")+"lightness must be >= 0"; hash_error = true; }
		if (preset.lightness>100) { hash_error_message += (hash_error?", ":"")+"lightness must be <= 100"; hash_error = true; }

		if (typeof preset.highlight != "number") { hash_error_message += (hash_error?", ":"")+"highlight must be numeric"; hash_error = true; }
		if (preset.highlight<0) { hash_error_message += (hash_error?", ":"")+"highlight must be >= 0"; hash_error = true; }
		if (preset.highlight>12) { hash_error_message += (hash_error?", ":"")+"highlight must be <= 12"; hash_error = true; }

		if (typeof preset.noise != "number") { hash_error_message += (hash_error?", ":"")+"noise must be numeric"; hash_error = true; }
		if (preset.noise<0) { hash_error_message += (hash_error?", ":"")+"noise must be >= 0"; hash_error = true; }
		if (preset.noise>12) { hash_error_message += (hash_error?", ":"")+"noise must be <= 12"; hash_error = true; }

		if (typeof preset.patternsize != "number") { hash_error_message += (hash_error?", ":"")+"patternsize must be numeric"; hash_error = true; }
		if (preset.patternsize % 1 !== 0) { hash_error_message += (hash_error?", ":"")+"patternsize must be integer"; hash_error = true; }
		if (preset.patternsize<3) { hash_error_message += (hash_error?", ":"")+"patternsize must be >= 3"; hash_error = true; }
		if (preset.patternsize>7) { hash_error_message += (hash_error?", ":"")+"patternsize must be <= 7"; hash_error = true; }

		if (typeof preset.pattern != "object") { hash_error_message += (hash_error?", ":"")+"pattern must be object"; hash_error = true; }
		if (preset.pattern.length!=49) { hash_error_message += (hash_error?", ":"")+"pattern must have 49 elements"; hash_error = true; }

		if (hash_error) throw hash_error_message;
	}

	function hashChanged(event){
	    if($("body").data("ignore_hash_change") === false) {
			try {
				var preset = decode_hash(window.document.location.hash.substr(1));
			} catch (err) {
				//could not update page from hash, use default
				var preset = decode_hash("9j65z2q4jerqh0ni8");
			}
			$("#tile").foobar(preset);
			$("#hueslider").slider("value", preset.hue);
			$("#saturationslider")
				.squiggles("value", {"x":100-preset.saturation, "y":preset.lightness})
				.css("background", "url('ui-2dslider-bg.png') left -28px no-repeat, -webkit-gradient(linear, left top, right top, from(hsl("+preset.hue+", 100%, 50%)), to(hsl("+preset.hue+", 0%, 50%)))");
			$("#pixelsslider").slider("value", preset.patternsize);
			$("#pixels")
				.pixels(preset)
				.pixels("pixels", preset.pattern);
			$("#highlightslider").slider("value", preset.highlight);
			$("#noiseslider").slider("value", preset.noise);
	    }
	    $("body").data("ignore_hash_change", false);
	}

	$("body").data("ignore_hash_change", false);
	$(window).bind("hashchange", hashChanged);

	if (!window.document.location.hash) {
		$("body").data("ignore_hash_change", true);
		window.document.location.hash = encode_hash(preset);
	}
});