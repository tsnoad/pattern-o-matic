(function($) {  

$.widget("ui.squiggles", $.ui.mouse, {  
	options: {
		animate: false,
		max: 100,
		min: 0,
		valueX: 0,
		valueY: 0
	},

	_create: function() {
		var self = this,
			o = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
			handleCount = 1,
			handles = [];

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" +
				( o.disabled ? " ui-slider-disabled ui-disabled" : "" ) );

		for ( var i = existingHandles.length; i < handleCount; i += 1 ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( self.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.hover(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			}, function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "index.ui-slider-handle", i );
		});

/*
		this.handles
			.keydown(function( event ) {
				var ret = true,
					index = $( this ).data( "index.ui-slider-handle" ),
					allowed,
					curVal,
					newVal,
					step;
	
				if ( self.options.disabled ) {
					return;
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if ( !self._keySliding ) {
							self._keySliding = true;
							$( this ).addClass( "ui-state-active" );
							allowed = self._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = self.options.step;
				if ( self.options.values && self.options.values.length ) {
					curVal = newVal = self.values( index );
				} else {
					curVal = newVal = self.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = self._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = self._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimAlignValue( curVal + ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimAlignValue( curVal - ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === self._valueMax() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === self._valueMin() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal - step );
						break;
				}
	
				self._slide( event, index, newVal );
	
				return ret;
	
			})
			.keyup(function( event ) {
				var index = $( this ).data( "index.ui-slider-handle" );
	
				if ( self._keySliding ) {
					self._keySliding = false;
					self._stop( event, index );
					self._change( event, index );
					$( this ).removeClass( "ui-state-active" );
				}
	
			});
*/

		this._refreshValue();

		this._animateOff = false;
	},

	destroy: function() {
		this.handles.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" )
			.removeData( "slider" )
			.unbind( ".slider" );

		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function( event ) {
		var o = this.options,
			position,
			normValueXY,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValueXY = this._normValueFromMouse( position );

		this._slide( event, index, normValueXY );

		return true;
	},


	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValueXY = this._normValueFromMouse( position );
		
		this._slide( event, this._handleIndex, normValueXY );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},


	_normValueFromMouse: function( position ) {
		var pixelTotalX,
			pixelMouseX,
			percentMouseX,
			valueTotal,
			valueMouseX;

		pixelTotalX = this.elementSize.width;
		pixelMouseX = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );

		pixelTotalY = this.elementSize.height;
		pixelMouseY = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );

		percentMouseX = ( pixelMouseX / pixelTotalX );
		if ( percentMouseX > 1 ) {
			percentMouseX = 1;
		}
		if ( percentMouseX < 0 ) {
			percentMouseX = 0;
		}

		percentMouseY = ( pixelMouseY / pixelTotalY );
		if ( percentMouseY > 1 ) {
			percentMouseY = 1;
		}
		if ( percentMouseY < 0 ) {
			percentMouseY = 0;
		}
		percentMouseY = 1 - percentMouseY;

		valueTotal = this._valueMax() - this._valueMin();
		valueMouseX = this._valueMin() + percentMouseX * valueTotal;
		valueMouseY = this._valueMin() + percentMouseY * valueTotal;

		return { x: valueMouseX, y: valueMouseY };
	},

	_slide: function( event, index, newValXY ) {
		var otherVal,
			newValues,
			allowed;

		if ( newValXY !== this.value() ) {
			// A slide can be canceled by returning false from the slide callback
			allowed = this._trigger( "slide", event, {
				handle: this.handles[ index ],
				value: newValXY
			} );
			if ( allowed !== false ) {
				this.value( newValXY );
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValueXY ) {
		if ( arguments.length ) {
/* 			this.options.value = this._trimAlignValue( newValue ); */
			this.options.valueX = newValueXY.x;
			this.options.valueY = newValueXY.y;
			this._refreshValue();
/* 			this._change( null, 0 ); */
			return;
		}

		return this._value();
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var valX = this.options.valueX;
		var valY = this.options.valueY;
/* 		val = this._trimAlignValue( val ); */

		return {x: valX, y: valY};
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},

	_refreshValue: function() {
		var oRange = this.options.range,
			o = this.options,
			self = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			valPercentX,
			valPercentY,
			_set = {},
			lastValPercent,
			value,
			valueXY,
			valueMin,
			valueMax;


		valueXY = this.value();
		valueMin = this._valueMin();
		valueMax = this._valueMax();

		valPercentX = ( valueMax !== valueMin ) ?
				( valueXY.x - valueMin ) / ( valueMax - valueMin ) * 100 :
				0;
		valPercentY = ( valueMax !== valueMin ) ?
				( valueXY.y - valueMin ) / ( valueMax - valueMin ) * 100 :
				0;
		_set[ "left" ] = valPercentX + "%";
		_set[ "bottom" ] = valPercentY + "%";
		this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
	}
  
});
  
})(jQuery); 