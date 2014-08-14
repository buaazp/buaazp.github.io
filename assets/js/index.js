/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function(){
      setTimeout(function() {
        $('.page-side').affix({
          offset:{
            top:function(){
              var b=$(".page-side");
              var c=b.offset().top,d=parseInt(b.children(0).css("margin-top"),10),e=$("header").height();
              return this.top=c-e-d
            },
            bottom:function(){
              return this.bottom=$(".bs-docs-footer").outerHeight(!0)
            }
          }
        });
      }, 100);

      var expand = function(el) {
        $('.page-side > .toc li').each(function(useless, item) {
          if (!$(item).hasClass('toc-h1')) {
            $(item).hide();
          }
        });

        $(el).show();
        var item = $(el).prev();

        if (!$(el).hasClass('toc-h1')) {
          while (item.length && !item.hasClass('toc-h1')) {
            item.show();
            item = $(item).prev();
          }
        }
        item = $(el).next();
        while (item.length && !item.hasClass('toc-h1')) {
          item.show();
          item = $(item).next();
        }
      }

      $('.page-side > .toc').toc({
        'selectors': 'h1,h2,h3', //elements to use as headings
        'container': '.page-content', //element to find all selectors in
        'prefix': 'toc', //prefix for anchor tags and class names
        'onHighlight': expand,
        'highlightOnScroll': true, //add class to heading that is currently in focus
        'highlightOffset': 50, //offset to trigger the next headline
      });

      $('.page-side > .toc li').click(function() {
        expand(this);
      });
    });

}(jQuery));
