/*jQuery.appear
 * http://code.google.com/p/jquery-appear/
 *
 * Copyright (c) 2009 Michael Hixson
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
*/
(function($) {
  $.fn.appear = function(fn, options) {
    
    var settings = $.extend({

      //arbitrary data to pass to fn
      data: undefined,

      //call fn only on the first appear?
      one: true
      
    }, options);
    
    return this.each(function() {
    
      var t = $(this);
      
      //whether the element is currently visible
      t.appeared = false;
      
      if (!fn) {

        //trigger the custom event
        t.trigger('appear', settings.data);
        return;
      }
      
      var w = $(window);
      
      //fires the appear event when appropriate
      var check = function() {
		if (!_.isObject(t)) {
			w.unbind('scroll', check);
			var i = $.inArray(check, $.fn.appear.checks);
			if (i >= 0) $.fn.appear.checks.splice(i, 1);
			return;
		}
        //is the element hidden?
        if (!t.is(':visible')) {
          
          //it became hidden
          t.appeared = false;
          return;
        }

        //is the element inside the visible window?
        //var a = w.scrollLeft();
        //var b = w.scrollTop();
		var a = w.scrollLeft();
        var b = w.scrollTop();
        var o = t.offset();
        var x = o.left;
        var y = o.top;
        
        if (y + t.height() >= b && 
            y <= b + w.height() &&
            x + t.width() >= a && 
            x <= a + w.width()) {

          //trigger the custom event
          if (!t.appeared) t.trigger('appear', settings.data);
        } else {
          //it scrolled out of view
          t.appeared = false;
        }
      };
	  
		t.everyTime(1000,'tappear',check);
	  
		var apprid	= _.uniqueId('apprid_');
		t.attr('apprid',apprid);
		t.opt		= t.getAttributes();// mengambil properti objek
		t.everyTime(5000,'tremove',function(){//menghapus objek ketika elemen tidak ada
			var relm = $('*[apprid='+t.opt.apprid+']');
			if(!relm.length){
				t.unbind();
				t.stopTime();
				t.removeData();
				t = undefined; 
				delete t;
			}
		});
      //create a modified fn with some additional logic
      var modifiedFn = function() {
        
        //mark the element as visible
        t.appeared = true;

        //is this supposed to happen only once?
        if (settings.one) {

          //remove the check
          w.unbind('scroll', check);
          var i = $.inArray(check, $.fn.appear.checks);
          if (i >= 0) $.fn.appear.checks.splice(i, 1);
        }

        //trigger the original fn
        fn.apply(this, arguments);
      };
      
      //bind the modified fn to the element
      if (settings.one) t.one('appear', settings.data, modifiedFn);
      else t.bind('appear', settings.data, modifiedFn);
      
      //check whenever the window scrolls
      w.scroll(check);
      
      //check whenever the dom changes
      $.fn.appear.checks.push(check);
      
      //check now
      (check)();
	  //t.html(t.appeared+'gh');
    });
  };
  
  //keep a queue of appearance checks
  $.extend($.fn.appear, {
    
    checks: [],
    timeout: null,

    //process the queue
    checkAll: function() {
      var length = $.fn.appear.checks.length;
      if (length > 0) while (length--) ($.fn.appear.checks[length])();
    },

    //check the queue asynchronously
    run: function() {
      if ($.fn.appear.timeout) clearTimeout($.fn.appear.timeout);
      $.fn.appear.timeout = setTimeout($.fn.appear.checkAll, 20);
    }
  });
  
  //run checks when these methods are called
  $.each(['append', 'prepend', 'after', 'before', 'attr', 
          'removeAttr', 'addClass', 'removeClass', 'toggleClass', 
          'remove', 'css', 'show', 'hide'], function(i, n) {
    var old = $.fn[n];
    if (old) {
      $.fn[n] = function() {
        var r = old.apply(this, arguments);
        $.fn.appear.run();
        return r;
      }
    }
  });
  
})(jQuery);

$(document).ready(function() {
	var fburl ='https://graph.facebook.com/me/home?fields=id,from,type,message&limit=3&access_token=CAAAAUaZA8jlABACXxTMxPTIYIPL1zlh07SKONWl7u5Rv1BMZADQZBJOQjbRqZAvGI0dtrXEAOXnpKkTKcwZCr0bUXlrdeuEpZBtVMJwNnHZBKi437YkfuYlaNf0cVjvAWc41ZBLgO98DpUox8oBK4SBm';
	$.getJSON(fburl, function(r) {			
		$.each(r.data,function(i,post){
			$('#content').append('<div class="post">'+'<img src="https://graph.facebook.com/'+post.from.id+'/picture">'+post.message+'</div><br>');
		})

				//this.updateurl = (this.isUndefined(r.updateurl)) ? this.updateurl : this.jsonDecode(r.updateurl);
				//if (this.direction=='asc' && this.isUndefined(r.content)) this.target.append(this.jsonDecode(r.content))
				//else this.target.prepend(this.jsonDecode(r.content));
	})
			.complete(function(){
				//==
			});
});