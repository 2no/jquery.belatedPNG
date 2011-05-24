/**
* DD_belatedPNG: Adds IE6 support: PNG images for CSS background-image and HTML <IMG/>.
* Author: Drew Diller
* Email: drew.diller@gmail.com
* URL: http://www.dillerdesign.com/experiment/DD_belatedPNG/
* Version: 0.0.8a
* Licensed under the MIT License: http://dillerdesign.com/experiment/DD_belatedPNG/#license
*
* Example usage:
* DD_belatedPNG.fix('.png_bg'); // argument is a CSS selector
* DD_belatedPNG.fixPng( someNode ); // argument is an HTMLDomElement
**/

/*
PLEASE READ:
Absolutely everything in this script is SILLY.  I know this.  IE's rendering of certain pixels doesn't make sense, so neither does this code!
*/

/**
* jquery.belatedPNG: Adds IE6/7/8 support: PNG images for CSS background-image and HTML <IMG/>.
* Author: Kazunori Ninomiya
* Email: Kazunori.Ninomiya@gmail.com
* Version: 0.0.4
* Licensed under the MIT License: http://dillerdesign.com/experiment/DD_belatedPNG/#license
*
* Example usage:
* $('.png_bg').fixPng();
**/

(function($) {
	var doc = document;
	var DD_belatedPNG = {
		ns: 'DD_belatedPNG',
		imgSize: {},
		delay: 10,
		nodesFixed: 0,
		createVmlNameSpace: function () {
			if (doc.namespaces && !doc.namespaces[this.ns]) {
				doc.namespaces.add(this.ns, 'urn:schemas-microsoft-com:vml');
			}
		},
		createVmlStyleSheet: function () {
			var screenStyleSheet, printStyleSheet;
			screenStyleSheet = doc.createElement('style');
			screenStyleSheet.setAttribute('media', 'screen');
			doc.documentElement.firstChild.insertBefore(screenStyleSheet, doc.documentElement.firstChild.firstChild);
			if (screenStyleSheet.styleSheet) {
				var selector = !doc.documentMode || doc.documentMode < 8
					? this.ns + '\\:*' : this.ns + '\\:shape, ' + this.ns + '\\:fill';
				screenStyleSheet = screenStyleSheet.styleSheet;
				screenStyleSheet.addRule(selector, 'behavior:url(#default#VML);');
				screenStyleSheet.addRule(this.ns + '\\:shape', 'position:absolute;');
				screenStyleSheet.addRule('img.' + this.ns + '_sizeFinder', [
					'behavior:none',
					'border:none',
					'position:absolute',
					'z-index:-1',
					'top:-10000px',
					'visibility:hidden'
				].join(';'));
				this.screenStyleSheet = screenStyleSheet;
				printStyleSheet = doc.createElement('style');
				printStyleSheet.setAttribute('media', 'print');
				doc.documentElement.firstChild.insertBefore(printStyleSheet, doc.documentElement.firstChild.firstChild);
				printStyleSheet = printStyleSheet.styleSheet;
				printStyleSheet.addRule(selector, 'display: none !important;');
				printStyleSheet.addRule('img.' + this.ns + '_sizeFinder', 'display: none !important;');
			}
		},
		readPropertyChange: function () {
			var el, display, v;
			el = event.srcElement;
			if (!el.vmlInitiated) {
				return;
			}
			var propName = event.propertyName;
			if (propName.search('background') != -1 || propName.search('border') != -1) {
				DD_belatedPNG.applyVML(el);
			}
			if (propName == 'style.display') {
				display = (el.currentStyle.display == 'none') ? 'none' : 'block';
				for (v in el.vml) {
					if (el.vml.hasOwnProperty(v)) {
						el.vml[v].shape.style.display = display;
					}
				}
			}
			if (propName.search('filter') != -1) {
				DD_belatedPNG.vmlOpacity(el);
			}
		},
		vmlOpacity: function (el) {
			if (el.currentStyle.filter.search('lpha') != -1) {
				var trans = el.currentStyle.filter;
				trans = parseInt(trans.substring(trans.lastIndexOf('=') + 1,
												 trans.lastIndexOf(')')), 10) / 100;
				el.vml.color.shape.style.filter = el.currentStyle.filter;
				el.vml.image.fill.opacity = trans;
			}
		},
		handlePseudoHover: function (el) {
			setTimeout(function () {
				DD_belatedPNG.applyVML(el);
			}, 1);
		},
		applyVML: function (el) {
			el.runtimeStyle.cssText = '';
			this.vmlFill(el);
			this.vmlOffsets(el);
			this.vmlOpacity(el);
			if (el.isImg) {
				this.copyImageBorders(el);
			}
		},
		attachHandlers: function (el) {
			var self, handlers, handler, moreForAs, a, h;
			self = this;
			handlers = {resize: 'vmlOffsets', move: 'vmlOffsets'};
			if (el.nodeName == 'A') {
				moreForAs = {
					mouseleave: 'handlePseudoHover',
					mouseenter: 'handlePseudoHover',
					focus: 'handlePseudoHover',
					blur: 'handlePseudoHover'
				};
				for (a in moreForAs) {			
					if (moreForAs.hasOwnProperty(a)) {
						handlers[a] = moreForAs[a];
					}
				}
			}
			for (h in handlers) {
				if (handlers.hasOwnProperty(h)) {
					handler = function () {
						self[handlers[h]](el);
					};
					el.attachEvent('on' + h, handler);
				}
			}
			el.attachEvent('onpropertychange', this.readPropertyChange);
		},
		giveLayout: function (el) {
			el.style.zoom = 1;
			if (el.currentStyle.position == 'static') {
				el.style.position = 'relative';
			}
		},
		copyImageBorders: function (el) {
			var styles, s;
			styles = {
				'borderStyle': true,
				'borderWidth': true,
				'borderColor': true
			};
			for (s in styles) {
				if (styles.hasOwnProperty(s)) {
					el.vml.color.shape.style[s] = el.currentStyle[s];
				}
			}
		},
		vmlFill: function (el) {
			if (!el.currentStyle) {
				return;
			}
			else {
				var elStyle, noImg, lib, v, img, imgLoaded;
				elStyle = el.currentStyle;
			}
			for (v in el.vml) {
				if (el.vml.hasOwnProperty(v)) {
					el.vml[v].shape.style.zIndex = elStyle.zIndex;
				}
			}
			el.runtimeStyle.backgroundColor = '';
			el.runtimeStyle.backgroundImage = '';
			noImg = true;
			if (elStyle.backgroundImage != 'none' || el.isImg) {
				if (!el.isImg) {
					el.vmlBg = elStyle.backgroundImage;
					el.vmlBg = el.vmlBg.substr(5, el.vmlBg.lastIndexOf('")')-5);
				}
				else {
					el.vmlBg = el.src;
				}
				lib = this;
				if (!lib.imgSize[el.vmlBg]) {
					img = doc.createElement('img');
					lib.imgSize[el.vmlBg] = img;
					img.className = lib.ns + '_sizeFinder';
					img.runtimeStyle.cssText = [
						'behavior:none',
						'position:absolute',
						'left:-10000px',
						'top:-10000px',
						'border:none',
						'margin:0',
						'padding:0'
					].join(';');
					imgLoaded = function () {
						this.width = this.offsetWidth;
						this.height = this.offsetHeight;
						lib.vmlOffsets(el);
					};
					img.attachEvent('onload', imgLoaded);
					img.src = el.vmlBg;
					img.removeAttribute('width');
					img.removeAttribute('height');
					doc.body.insertBefore(img, doc.body.firstChild);
				}
				el.vml.image.fill.src = el.vmlBg;
				noImg = false;
			}
			el.vml.image.fill.on = !noImg;
			el.vml.image.fill.color = 'none';
			el.vml.color.shape.style.backgroundColor = elStyle.backgroundColor;
			el.runtimeStyle.backgroundImage = 'none';
			el.runtimeStyle.backgroundColor = 'transparent';
		},
		vmlOffsets: function (el) {
			var thisStyle, size, fudge, makeVisible, bg, bgR, dC, altC, b, c, v;
			thisStyle = el.currentStyle;
			size = {
				'W':el.clientWidth+1,
				'H':el.clientHeight+1,
				'w':this.imgSize[el.vmlBg].width,
				'h':this.imgSize[el.vmlBg].height,
				'L':el.offsetLeft, 'T':el.offsetTop,
				'bLW':el.clientLeft,
				'bTW':el.clientTop
			};
			fudge = (size.L + size.bLW == 1) ? 1 : 0;
			makeVisible = function (vml, l, t, w, h, o) {
				vml.coordsize = w+','+h;
				vml.coordorigin = o+','+o;
				vml.path = 'm0,0l'+w+',0l'+w+','+h+'l0,'+h+' xe';
				vml.style.width = w + 'px';
				vml.style.height = h + 'px';
				vml.style.left = l + 'px';
				vml.style.top = t + 'px';
			};
			makeVisible(el.vml.color.shape,
						(size.L + (el.isImg ? 0 : size.bLW)),
						(size.T + (el.isImg ? 0 : size.bTW)),
						(size.W-1), (size.H-1), 0);
			makeVisible(el.vml.image.shape,
						(size.L + size.bLW),
						(size.T + size.bTW),
						(size.W), (size.H), 1);
			bg = {'X':0, 'Y':0};
			if (el.isImg) {
				bg.X = parseInt(thisStyle.paddingLeft, 10) + 1;
				bg.Y = parseInt(thisStyle.paddingTop, 10) + 1;
			}
			else {
				for (b in bg) {
					if (bg.hasOwnProperty(b)) {
						this.figurePercentage(bg, size, b, thisStyle['backgroundPosition'+b]);
					}
				}
			}
			el.vml.image.fill.position = (bg.X/size.W) + ',' + (bg.Y/size.H);
			bgR = thisStyle.backgroundRepeat;
			dC = {'T':1, 'R':size.W+fudge, 'B':size.H, 'L':1+fudge};
			altC = { 'X': {'b1': 'L', 'b2': 'R', 'd': 'W'}, 'Y': {'b1': 'T', 'b2': 'B', 'd': 'H'} };
			if (bgR != 'repeat') {
				c = {'T':(bg.Y), 'R':(bg.X+size.w), 'B':(bg.Y+size.h), 'L':(bg.X)};
				if (bgR.search('repeat-') != -1) {
					v = bgR.split('repeat-')[1].toUpperCase();
					c[altC[v].b1] = 1;
					c[altC[v].b2] = size[altC[v].d];
				}
				if (c.B > size.H) {
					c.B = size.H;
				}
				el.vml.image.shape.style.clip = 'rect('+c.T+'px '+(c.R+fudge)+'px '+c.B+'px '+(c.L+fudge)+'px)';
			}
			else {
				el.vml.image.shape.style.clip = 'rect('+dC.T+'px '+dC.R+'px '+dC.B+'px '+dC.L+'px)';
			}
		},
		figurePercentage: function (bg, size, axis, position) {
			var horizontal, fraction;
			fraction = true;
			horizontal = (axis == 'X');
			switch(position) {
				case 'left':
				case 'top':
					bg[axis] = 0;
					break;
				case 'center':
					bg[axis] = 0.5;
					break;
				case 'right':
				case 'bottom':
					bg[axis] = 1;
					break;
				default:
					position.search('%') != -1
						? bg[axis] = parseInt(position, 10) / 100
						: fraction = false;
			}
			bg[axis] = Math.ceil(fraction ? ((size[horizontal?'W': 'H'] * bg[axis])
				- (size[horizontal?'w': 'h'] * bg[axis])) : parseInt(position, 10));
			if (bg[axis] % 2 === 0) {
				bg[axis]++;
			}
			return bg[axis];
		},
		fixPng: function (el) {
			var lib, els, nodeStr, v, e;
			if (el.nodeName == 'BODY' || el.nodeName == 'TD' || el.nodeName == 'TR') {
				return;
			}
			el.isImg = false;
			if (el.nodeName == 'IMG') {
				if(el.src.toLowerCase().search(/\.png$/) != -1) {
					el.isImg = true;
					el.style.visibility = 'hidden';
				}
				else {
					return;
				}
			}
			else if (el.currentStyle.backgroundImage.toLowerCase().search('.png') == -1) {
				return;
			}
			lib = DD_belatedPNG;
			el.vml = {color: {}, image: {}};
			els = {shape: {}, fill: {}};
			for (v in el.vml) {
				if (el.vml.hasOwnProperty(v)) {
					for (e in els) {
						if (els.hasOwnProperty(e)) {
							nodeStr = lib.ns + ':' + e;
							el.vml[v][e] = doc.createElement(nodeStr);
						}
					}
					el.vml[v].shape.stroked = false;
					if (el.nodeName == 'IMG') {
						var width  = el.width / 96 * 72;
						var height = el.height / 96 * 72;
						el.vml[v].fill.type = 'tile';
						el.vml[v].fill.size = width + 'pt,' + height + 'pt';
					}
					else if (el.currentStyle) {
						var elStyle = el.currentStyle;
						if (elStyle.backgroundImage != 'none') {
							var vmlBg = elStyle.backgroundImage;
							var img = doc.createElement("img");
							img.src = vmlBg.substr(5, vmlBg.lastIndexOf('")')-5);
							var run = img.runtimeStyle;
							var mem = { w: run.width, h: run.height };
							run.width  = 'auto';
							run.height = 'auto';
							w = img.width;
							h = img.height;
							run.width  = mem.w;
							run.height = mem.h;
							var width  = w / 96 * 72;
							var height = h / 96 * 72;
							el.vml[v].fill.type = 'tile';
							el.vml[v].fill.aspect = 'atleast';
							el.vml[v].fill.size = width + 'pt,' + height + 'pt';
						}
					}
					el.vml[v].shape.appendChild(el.vml[v].fill);
					el.parentNode.insertBefore(el.vml[v].shape, el);
				}
			}
			el.vml.image.shape.fillcolor = 'none';
			el.vml.color.fill.on = false;
			lib.attachHandlers(el);
			lib.giveLayout(el);
			lib.giveLayout(el.offsetParent);
			el.vmlInitiated = true;
			lib.applyVML(el);
		}
	};
	try {
		doc.execCommand("BackgroundImageCache", false, true);
	} catch(r) {}
	DD_belatedPNG.createVmlNameSpace();
	DD_belatedPNG.createVmlStyleSheet();
	
	$.extend($.fn, {
		fixPng: function() {
			if ([,] != 0) { // IE6/7/8
				$.each(this, function() {
					DD_belatedPNG.fixPng(this);
				});
			}
			return this;
		}
	});
})(jQuery);