/* ===========================================================
 * bootstrap-hint.js v1.1.0
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Code by Wianto Wie 
 * email ianplater75@gmail.com 
 * Copyright 2013 twitter-bootstrap-plugins, Inc.
 * Website http://twitter-bootstrap-plugins.blogspot.com/
 *
 * Detail info http://twitter-bootstrap-plugins.blogspot.com/2013/07/bootstrap-hint-for-twitter-bootstrap.html
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
!function ($) {

  "use strict"; // jshint ;_;

 /* hint CLASS DEFINITION
  * ====================== */
	var hintCounter = 0;
	var hintCounterShow = 0;
	var posMinX= 0,posMaxX= 0,posMinY= 0,posMaxY = 0;
	var hint = function (hintelement, options) {
		var $that = this;
		this.options		= options;
		this.forceHide 		= false;
		this.forceShow		= false;
		this.bubbleHover	= false;
		this.underMouse		= false;
		this.hintElement	= hintelement;
		this.hintBubble		= this.bubble();
		this.uniqueId		= this.getuniqueId('hint');
		this.hintElement.attr('data-uxid',this.uniqueId);
		
		var targetElement	= options.target || (options.target && options.target.replace(/.*(?=#[^\s]+$)/, ''))
        if (/#/.test(targetElement) && $(targetElement).length) {
			$(targetElement).appendTo(this.hintBubble.find('.hint-inner')).removeAttr('id');
		} else {
			var content 	= this.getContent();
            this.hintBubble.find('.hint-inner')[this.options.html ? 'html' : 'text'](content);
        }
		this.hintBubble[0].className = 'hint';
        this.hintBubble.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body); 
		
		this.hintBubble.bind('click', function() {
			var topBubble = $that.getBubbleRootParent();
			if (topBubble !='body') {	
				$.event.trigger('hintshowbyid'+topBubble);
			} else {
				$that.toTop();
			}
		})
		
		this.hintBubble.attr('data-bubble',this.uniqueId);
		var bubbleParent = this.getBubbleParent();
		this.hintBubble.attr('data-parent',bubbleParent);
		
		this.hintBubble.hover($.proxy(this.bubbleHoverIn,this), $.proxy(this.bubbleHoverOut,this));
		
		if (options.trigger != 'click') {
			this.hintElement.hover($.proxy(this.show,this),$.proxy(this.hide,this));
		} else {
			this.hintElement.css('cursor','pointer');
			this.hintElement.hover($.proxy(this.bubbleHoverIn,this), $.proxy(this.bubbleHoverOut,this));
			this.hintElement.bind('click',function(e){
				if ($that.isShown) {
					$that.forceShow= false;
					$that.forceHide= true;
					$that.hide();
				} else {
					$that.forceShow= true;
					$that.forceHide= false;
					$that.show();
				}
				e.preventDefault();
                e.stopPropagation();
			});
		}
		$(document).on('click.hint.remove'+this.uniqueId, $.proxy(this.hintRemove,this));
		
		$(document).on('mousemove.hint.mouse'+this.uniqueId,function(e){
			if (!$that.isShown) return;
			if ((e.pageX>posMinX && e.pageX< posMaxX) && (e.pageY>posMinY && e.pageY< posMaxY)) {
				if (options.trigger == 'click') $that.underMouse	= true;
			} else {
				$that.underMouse = false;
			}
		});
		this.hintElement.bind('onHintHide', function() {
			$that.checkHidden(); 
		})
		
		this.hintElement.bind('hintshowbyparent'+bubbleParent, function() {
			$that.toTop(); 
		})
		
		this.hintElement.bind('hintshowbyid'+this.uniqueId, function() {
			$that.toTop(); 
		})
  }
	hint.prototype = {
      constructor: hint
		, getuniqueId: function(prefix) {
			var id = hintCounter++;
			return prefix ? prefix + id : id;
		}
		, fixContent: function($ele){
			var elmTitle = $ele.attr('title') || $ele.data('content');
			if (typeof elmTitle == 'string') {
				$ele.data('content', '<div class="hint-content">'+elmTitle+'</div>');
				$ele.removeAttr('title');
			} else {
				$ele.data('content', '<div style="padding:8px;0px;"><div class="ajax-loading"></div></div>');
			}
		}
		
		, getContent: function() {
			var content, $e = this.hintElement, o = this.options;
			this.fixContent($e);
			var o = this.options;
			if (typeof o.content == 'string') {
				content = $e.data('content');
			} else if (typeof o.content == 'function') {
				content = o.content.call($e[0]);
			}
			 content = ('' + content).replace(/(^\s*|\s*$)/, "");
			 return content || o.fallback;
		}
		
		, bubble: function() {
			if (!this.$hintBubble) {
				this.$hintBubble = $('<div class="hint"></div>').html('<div class="hint-arrow"></div><div class="hint-arrow2"></div><div class="hint-inner"></div>');
			}
			return this.$hintBubble;
		}
		
		, bubbleHoverIn: function() {
			if (this.timeHide) clearTimeout(this.timeHide);
			this.bubbleHover = true;
		}
		
		, bubbleHoverOut: function() {
			this.bubbleHover = false;
			this.hide();
		}
		
		, hide: function () {
			if (!this.isShown) return;
			if (this.forceHide==true){
				this.bubbleHover= false;
				this.underMouse	= false;
				this.hintHide();
				return;
			}
			this.options.delayOut>0 ? this.hintHideDelay() : this.hintHide()
		}

		, hintHideDelay: function () {
			var $that = this;
			this.timeHide = setTimeout(function(){
				$that.hintHide();
			}, this.options.delayOut)
		}
		
		, hintHide: function () {
			if (!this.isShown) return;
			if (this.underMouse==false && this.bubbleHover==false) {
				this.isShown = false
				this.hintBubble.css({visibility: 'hidden'});
				hintCounterShow--;
				$.event.trigger('onHintHide');
			}
		}
		
		, hintRemove: function () {
			var domHintElm = $('*[data-uxid='+this.uniqueId+']')			
			if (!domHintElm.length) {
				this.hintDelete()
			}
			if (this.underMouse==false) {
				this.hintHide();
			}
		}
		
		, show: function () {
			if (this.isShown) return
			if (this.forceShow==true){
				this.hintShow();
				return;
			}
			this.options.delayIn>0 ? this.hintShowDelay() : this.hintShow()	
		}
		
		, hintShowDelay: function () {
			var $that = this;
			setTimeout(function(){
				$that.hintShow();
			}, this.options.delayIn)
		}
		
		, hintShow: function () {
			
			this.isShown = true;
			this.bubbleHover = false;
			this.hintBubble[0].className = 'hint';
			
			var pos = $.extend({}, this.hintElement.offset(), {
						width: this.hintElement[0].offsetWidth,
						height: this.hintElement[0].offsetHeight
					});
			this.options.gravity = this.autoBounds(200,'nw');
			var actualWidth = this.hintBubble[0].offsetWidth, actualHeight = this.hintBubble[0].offsetHeight;
					var gravity = (typeof this.options.gravity == 'function')
									? this.options.gravity.call(this.hintElement[0])
									: this.options.gravity;
					var parentTip = this.searchFixedParent(this.hintElement);
					if (parentTip.css('position')=='fixed') {
						this.hintBubble.css('position','fixed');
						pos.top = pos.top - $(document).scrollTop();
						pos.left = pos.left - $(document).scrollLeft();
					}
					var tp;
					switch (gravity.charAt(0)) {
						case 'n':
							tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
							break;
						case 's':
							tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
							break;
						case 'e':
							tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
							break;
						case 'w':
							tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
							break;
					}
					
					if (gravity.length == 2) {
						if (gravity.charAt(1) == 'w') {
							tp.left = pos.left + pos.width / 2 - 33;
						} else {
							tp.left = pos.left + pos.width / 2 - actualWidth + 33;
						}
					}
					
			
					this.hintBubble.css(tp).addClass('hint-' + gravity);
					
					if (this.options.fade) {
						this.hintBubble.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
					} else {
						this.hintBubble.css({visibility: 'visible', opacity: this.options.opacity});
					}
					
					this.toTop();
					
					hintCounterShow++;
					
					var margin = 10 ;
					if (hintCounterShow==1) {
						posMinX= tp.left-margin;
						posMaxX= tp.left+actualWidth+margin;
						posMinY= tp.top-margin;
						posMaxY = tp.top+actualHeight+margin;
					}
					if (hintCounterShow>1) {
						posMinX= (tp.left-margin < posMinX)? tp.left-margin : posMinX;
						posMaxX= (tp.left+actualWidth+margin > posMaxX)? tp.left+actualWidth+margin : posMaxX;
						posMinY= (tp.top-margin < posMinY ) ? tp.top-margin : posMinY;
						posMaxY = (tp.top+actualHeight+margin >posMaxY)? tp.top+actualHeight+margin:posMaxY;
					}
		}
		
		, toTop: function () {
			var zidx = 1010;
			var hintCount = $('.hint').length;
			$('body').find('.hint[data-parent!='+this.uniqueId+']').each(function(){
				var oldzidx = $(this).css('z-index');
				$(this).css('z-index',oldzidx-1);
			});
			this.hintBubble.css('z-index',zidx);
			$.event.trigger('hintshowbyparent'+this.uniqueId);
		}
		
		, hintDelete: function () {
			$(document).off('click.hint.remove'+this.uniqueId)
			$(document).off('mousemove.hint.mouse'+this.uniqueId)
			this.hintElement.unbind()
			this.hintElement.removeData()
			this.hintElement.empty()
			this.hintElement.remove()
				//hapus data elemen bubble
			this.hintBubble.unbind()
			this.hintBubble.removeData()
			this.hintBubble.empty()
			this.hintBubble.remove()
		}
		
		, autoBounds: function(margin, prefer) {
				var dir = { ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false) }
				var bound_top = $(document).scrollTop() + margin;
				var bound_left = $(document).scrollLeft() + margin;

				if ( this.hintElement.offset().top < bound_top) {
					dir.ns = 'n';
				}
				if ( this.hintElement.offset().left < bound_left ) {
					dir.ew = 'w';
				}
				if ( $(window).width() + $(document).scrollLeft() - this.hintElement.offset().left < margin ) {
					dir.ew = 'e';
				}
				if ( $(window).height() + $(document).scrollTop() - this.hintElement.offset().top < margin ) {
					dir.ns = 's';
				}
				return dir.ns + (dir.ew ? dir.ew : '');
		}
		
		, searchFixedParent: function(elm){
			var parentNya=elm;
			var i;
			for (i=0; i<20; i++){
				parentNya = parentNya.parent();
				var isJqueryObject = parentNya instanceof jQuery;
				if (isJqueryObject) {
					var tag = $(parentNya).prop('tagName');
					if (tag.toLowerCase() =='body') break;
					var fix = $(parentNya).css('position');
					if (fix.toLowerCase() =='fixed') break;
				} else $('body');
			}
			return parentNya;
		}
		
		, checkHidden: function(){
			var parentNya=this.hintElement;
			var i;
			for (i=0; i<20; i++){
				parentNya = parentNya.parent();
				var isJqueryObject = parentNya instanceof jQuery;
				if (isJqueryObject) {
					var tag = $(parentNya).prop('tagName');
					if (tag.toLowerCase() =='body') break;
					var visibility = $(parentNya).css('visibility');
					if (visibility.toLowerCase() =='hidden') {
						this.bubbleHover= false;
						this.underMouse	= false;
						this.hintHide();
						break;
					}
				}
			}
		}
		
		, getBubbleParent: function(){
			var $that		= this.hintElement;
			var bubbleElm 	= $that.closest('*[data-bubble]');
			var bubbleId	= (bubbleElm.length>0) ? bubbleElm.attr('data-bubble') : 'body';
			return bubbleId;
		}
		
		, getBubbleRootParent: function(){
			var thisElement = this.hintElement;
			var thisBubble	= this.hintBubble;
			var bubbleId 	= 'body';
			var bubbleExists= true;
			while (bubbleExists==true){
				thisBubble	= thisElement.closest('*[data-parent]');
				if (thisBubble.length) {
					bubbleId 	= thisBubble.attr('data-bubble');
					thisElement	= $('*[data-uxid='+bubbleId+']');
					bubbleExists= true;
				} else bubbleExists= false;
			}
			return bubbleId;
		}
  }


 /* HINT PLUGIN DEFINITION
  * ======================= */

	var old = $.fn.hint
	$.fn.hint = function (option) {
		var $elm		= $(this);
		var data		= $elm.data('hint');
		var opts		= $elm.data();
		var options = $.extend({}, $.fn.hint.defaults, typeof opts == 'object' && opts);
		if (data) {return; } else {$elm.data('hint', (data = new hint($elm, options)))};
	}

  $.fn.hint.defaults = {
		delayIn: 500,
        delayOut: 2000,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: true,
        offset: 0,
        opacity: 1,
        content: 'hint',
        trigger: 'hover',
  }

  $.fn.hint.Constructor = hint


 /* hint NO CONFLICT
  * ================= */

  $.fn.hint.noConflict = function () {
    $.fn.hint = old
    return this
  }
  
}(window.jQuery);
$(document).ready(function() {
	if($.fn.livequery) {
		$('*[data-toggle=hint]').livequery(function(){ 
			var $elm = $(this);
			$elm.hint();
		});
	}
});