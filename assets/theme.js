(function($){
var $ = jQuery = $;

theme.strings = {
  addressError: "Error looking up that address",
  addressNoResults: "No results for that address",
  addressQueryLimit: "You have exceeded the Google API usage limit. Consider upgrading to a \u003ca href=\"https:\/\/developers.google.com\/maps\/premium\/usage-limits\"\u003ePremium Plan\u003c\/a\u003e.",
  authError: "There was a problem authenticating your Google Maps API Key."
}

theme.icons = {
  left: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  right: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  close: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
  chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>',
  chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  chevronDown: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/><path d="M0-.75h24v24H0z" fill="none"/></svg>',
  tick: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
};

theme.Sections = new function(){
  var _ = this;

  _._instances = [];
  _._sections = [];

  _.init = function(){
    $(document).on('shopify:section:load', function(e){
      // load a new section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionLoad(target);
      }
    }).on('shopify:section:unload', function(e){
      // unload existing section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionUnload(target);
      }
    });
  }

  // register a type of section
  _.register = function(type, section){
    _._sections.push({ type: type, section: section });
    $('[data-section-type="'+type+'"]').each(function(){
      _.sectionLoad(this);
    });
  }

  // load in a section
  _.sectionLoad = function(target){
    var target = target;
    var section = _._sectionForTarget(target);
    if(section !== false) {
      _._instances.push({
        target: target,
        section: section
      });
      section.onSectionLoad(target);
      $(target).on('shopify:block:select', function(e){
        _._callWith(section, 'onBlockSelect', e.target);
      }).on('shopify:block:deselect', function(e){
        _._callWith(section, 'onBlockDeselect', e.target);
      });
    }
  }

  // unload a section
  _.sectionUnload = function(target){
    var instanceIndex = -1;
    for(var i=0; i<_._instances.length; i++) {
      if(_._instances[i].target == target) {
        instanceIndex = i;
      }
    }
    if(instanceIndex > -1) {
      $(target).off('shopify:block:select shopify:block:deselect');
      _._callWith(_._instances[instanceIndex].section, 'onSectionUnload', target);
      _._instances.splice(instanceIndex);
    }
  }

  // helpers
  _._callWith = function(object, method, param) {
    if(typeof object[method] === 'function') {
      object[method](param);
    }
  }

  _._themeSectionTargetFromShopifySectionTarget = function(target){
    var $target = $('[data-section-type]:first', target);
    if($target.length > 0) {
      return $target[0];
    } else {
      return false;
    }
  }

  _._sectionForTarget = function(target) {
    var type = $(target).attr('data-section-type');
    for(var i=0; i<_._sections.length; i++) {
      if(_._sections[i].type == type) {
        return _._sections[i].section;
      }
    }
    return false;
  }
}

theme.FeaturedProductSection = new function(){
  var _ = this;
  this.namespace = '.featured-product';

  this.onSectionLoad = function(target){
    $('select[name="id"]', target).trigger('optionate');

    // set cursor image on move
    var $cursor = $('.product-collage__cursor', target);
    var collageEl = $('.product-collage', target)[0];
    $(target).on('mousemove' + this.namespace, '.product-collage--multiple-images', function(e){
      var collageViewportOffset = collageEl.getBoundingClientRect();
      var cursorOffsetX = Math.round(e.clientX - collageViewportOffset.left);
      var cursorOffsetY = Math.round(e.clientY - collageViewportOffset.top);
      var trans = ['translate(', cursorOffsetX, 'px, ', cursorOffsetY, 'px)'].join('');
      if(cursorOffsetX > collageViewportOffset.width / 2) {
        $cursor.css('transform', trans);
      } else {
        $cursor.css('transform', trans + ' rotate(180deg)');
      }
    });

    // set class on hover
    $(target).on('mouseenter' + this.namespace + ' mouseleave' + this.namespace, '.product-collage--multiple-images', function(e){
      $(this).toggleClass('product-collage--hover', e.type == 'mouseenter');
    });
    // remove hover after tap
    $(target).on('touchend' + this.namespace, '.product-collage--multiple-images', function(e){
      setTimeout((function(){
        $(this).removeClass('product-collage--hover');
      }).bind(this), 50);
    });

    // set focus on scroll
    if($('.product-collage--multiple-images', target).length) {
      // event must cover all of this section type
      $(window).on('scroll' + this.namespace, this.setFocus);
      this.setFocus();
    }

    // swipe
    var swipeStartX = 0,
        swipeStartY = 0,
        triggerDistance = 100,
        triggerAxisRatio = 1,
        swiped = false;
    $('.product-collage--multiple-images', target).on('touchstart' + this.namespace, function(e){
      swipeStartX = e.originalEvent.touches[0].pageX;
      swipeStartY = e.originalEvent.touches[0].pageY;
      swiped = false;
    });
    $('.product-collage--multiple-images', target).on('touchmove' + this.namespace, function(e){
      if(!swiped) {
        var dx = e.originalEvent.touches[0].pageX - swipeStartX;
        var dy = e.originalEvent.touches[0].pageY - swipeStartY;
        if(Math.abs(dx) > triggerDistance && Math.abs(dx) > Math.abs(dy) * triggerAxisRatio) {
          if(dx > 0) {
            _.goToNextImage($(this).closest('.product-collage'));
          } else {
            _.goToPreviousImage($(this).closest('.product-collage'));
          }
          swiped = true;
        }
      }
    });

    // show next image
    var collageClickTimeout = -1;
    $(target).on('click' + this.namespace, '.product-collage--multiple-images .product-collage__next', function(e){
      _.goToNextImage($(this).closest('.product-collage'));
      return false;
    });

    // show previous image
    $(target).on('click' + this.namespace, '.product-collage--multiple-images .product-collage__prev', function(e){
      _.goToPreviousImage($(this).closest('.product-collage'));
      return false;
    });

    // limit height of collage to tallest (apply to all sections of this type)
    this.setCollageHeights();
    $(window).on('resize' + this.namespace, this.setCollageHeights);

    // variant images
    $('.gallery', target).on('variantImageSelected' + this.namespace, function(e, data){
      // get image src
      var variantSrc = data.featured_image.src.split('?')[0].replace(/http[s]?:/, '');

      // locate matching thumbnail
      var $thumb = $(this).find('.product-collage__image[data-full-size-url^="' + variantSrc + '"]:not(.active):first');
      if($thumb.length) {
        $thumb.addClass('active').siblings('.active').removeClass('active');
      }
    });
  };

  this.setFocus = function() {
    $('.product-collage').each(function(){
      var midPoint = $(window).scrollTop() + $(window).height() / 2;
      var lower = $(this).offset().top;
      var upper = lower + $(this).outerHeight(true);
      $(this).toggleClass('product-collage--focus', midPoint > lower && midPoint < upper);
    });
  }

  this.setCollageHeights = function(){
    $('.product-collage').each(function(){
      var tallestImage = 0;
      $(this).find('.rimage-outer-wrapper, .placeholder-svg').each(function(){
        var h = $(this).height();
        if(tallestImage < h) {
          tallestImage = h;
        }
      });
      $(this).height(tallestImage);
      // inner is square
      var $inner = $('.product-collage__inner', this);
      var offset = ($inner.width() - tallestImage) / (-2);
      $inner.css('transform', 'translate3d(0, '+Math.round(offset)+'px, 0)');
    });
  }

  this.collageClickTimeout = -1;

  this.goToNextImage = function($collage) {
    var $active = $collage.find('.product-collage__image.active').removeClass('active');
    $active.removeClass('active');
    if($active.next().length) {
      $active.next().addClass('active');
    } else {
      $active.prevAll().last().addClass('active');
    }
  }

  this.goToPreviousImage = function($collage) {
    var $active = $collage.find('.product-collage__image.active').removeClass('active');
    if($active.prev().length) {
      $active.prev().addClass('active');
    } else {
      $active.nextAll().last().addClass('active');
    }
  }

  this.onSectionUnload = function(target){
    $(window).off(this.namespace);
    $(target).off(this.namespace);
    $('.gallery', target).off(this.namespace);
    theme.OptionManager.unloadProductOptions($('select[name="id"]', target));
    $('.slideshow', target).slick('unslick');
  }
}

theme.ProductTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.initToggleTargets();

    /// Main product dropdown
    $('select[name="id"]', target).trigger('optionate');

    /// Slideshows
    $('.slideshow', target).each(function(){
      $(this).on('init', function(){
        $('.lazyload--manual', this).removeClass('.lazyload--manual').addClass('lazyload');
      }).slick({
        autoplay: $(this).hasClass('auto-play'),
        fade: false,
        infinite: true,
        useTransform: true,
        prevArrow: '<button type="button" class="slick-prev">'+theme.icons.chevronLeft+'</button>',
        nextArrow: '<button type="button" class="slick-next">'+theme.icons.chevronRight+'</button>',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              arrows: false,
              dots: true
            }
          }
        ],
        autoplaySpeed: 7000 // milliseconds to wait between slides
      });
    });

    theme.ProductBlockManager.loadImages(target);

    

    // click review rating under title
    $('.theme-product-reviews', target).on('click', 'a', function(){
      $('html,body').animate({
        scrollTop: $($(this).attr('href')).offset().top
      }, 1000);
      return false;
    });
  }

  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick').off('init');
    theme.OptionManager.unloadProductOptions($('select[name="id"]', target));
    $('.theme-product-reviews', target).off('click');
    $('.size-chart-link', target).off('click');
  }
}

theme.BlogTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.initToggleTargets();
  }
}

theme.CartTemplateSection = new function(){
  var _ = this;
  this.updateCart = function(params){
    if(_.cartXhr) {
      _.cartXhr.abort();
    }
    _.cartXhr = $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: params,
      dataType: 'json',
      success: function(data){
        // subtotal
        $('#cartform .subtotal').html(
          $('<span class="theme-money">').html(Shopify.formatMoney(data.total_price, theme.money_format))
        );
        // each line item
        $('#cartform .item .line-total[data-line]').each(function(){
          // line price
          var linePrice = data.items[$(this).data('line') - 1].line_price;
          $(this).html(
            $('<span class="theme-money">').html(Shopify.formatMoney(linePrice, theme.money_format))
          );
          // minus visibility
          var quantity = data.items[$(this).data('line') - 1].quantity;
          var $item = $(this).closest('.item');
          $item.find('.quantity-down').toggleClass('unusable', quantity < 2);
          var $input = $item.find('input');
          if($input.val() != quantity.toString()) {
            $input.val(quantity).data('previousValue', quantity.toString());
            var msg = "You can only have {{ quantity }} in your cart";
            msg = msg.replace(['{', '{ quantity }', '}'].join(''), quantity);
            theme.showQuickPopup(msg, $input.closest('.quantity'));
          }
          // plus visibility
          if($input.data('max') !== 'undefined' && $input.val() == $input.data('max')) {
            $item.find('.quantity-up').addClass('unusable');
          } else {
            $item.find('.quantity-up').removeClass('unusable');
          }
        });

        
      },
      error: function(data){
        console.log('Error processing update');
        console.log(data);
      }
    });
  }

  this.onSectionLoad = function(container){
    // terms and conditions checkbox
    if($('#cartform input#terms', container).length > 0) {
      $(document).on('click.cartTemplateSection', '#cartform [name="checkout"], .additional-checkout-buttons input, a[href="/checkout"]', function() {
        if($('#cartform input#terms:checked').length == 0) {
          alert("You must agree to the terms and conditions before continuing.");
          return false;
        }
      });
    }

    if($(container).data('ajax-update')) {
      $(container).on('keyup.cartTemplateSection change.cartTemplateSection', '.quantity-container input', function(){
        if($(this).data('previousValue') && $(this).data('previousValue') == $(this).val()){
          return;
        }
        if($(this).val().length == 0 || $(this).val() == '0') {
          return;
        }
        _.updateCart({
          line: $(this).data('line'),
          quantity: $(this).val()
        });
        $(this).data('previousValue', $(this).val());
      });

      $(container).on('click.cartTemplateSection', '.quantity-down, .quantity-up', function(e){
        var $input = $(this).closest('.quantity').find('input');
        if($(this).hasClass('quantity-down')) {
          $input.val(parseInt($input.val()) - 1).trigger('change');
        } else {
          $input.val(parseInt($input.val()) + 1).trigger('change');
        }
        return false;
      });
    }

    $(container).on('click.cartTemplateSection', 'button[data-toggle-shipping]', function(){
      $('#shipping-calculator').toggle();
      var alt = $(this).data('toggle-html');
      $(this).data('toggle-html', $(this).html());
      $(this).html(alt);
      return false;
    });
  }

  this.onSectionUnload = function(container){
    $(document).off('.cartTemplateSection');
    $(container).off('.cartTemplateSection');
  }
}

theme.CollectionTemplateSection = new function(){
  this.onSectionLoad = function(target){
    theme.initToggleTargets();

    /// Stream/grid view - saved setting
    if($('#view-as-stream, #view-as-tiles', target).length > 0 && theme.getGridStreamChoice() != null) {
      if(theme.getGridStreamChoice() == 'stream') {
        $('#view-as-stream').trigger('click');
      } else {
        $('#view-as-tiles').trigger('click');
      }
    }

    /// Stream view
    // awaken images
    if($('.collection-listing-stream', target).length) {
      theme.awakenImagesFromSlumber($('.collection-listing-stream', target));
    }
    // process dropdowns
    $('.collection-listing-stream select[name="id"]', target).trigger('optionate');

    /// Collection sorting
    var $sortBy = $('#sort-by', target);
    if($sortBy.length > 0) {
      var queryParams = {};
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
          }
        }
      }
      $sortBy.val($sortBy.data('initval')).on('change', function() {
        queryParams.sort_by = $(this).val();
        location.search = $.param(queryParams);
      });
    }

    /// If a tag is active in a group, other tags within that group must be links to that tag only, within that group.
    $('.multi-tag-row .tags', target).each(function(){
      var $active = $(this).find('li.active');
      $(this).find('li:not(.active) a').each(function(){
        var href = $(this).attr('href');
        $active.each(function(){
          var tag = $(this).data('tag');
          href = href.replace('+'+tag, '').replace(tag+'+', ''); //Collection
          href = href.replace('%2B'+tag, '').replace(tag+'%2B', ''); //Vendor
        });
        $(this).attr('href', href);
      });
    });

    theme.ProductBlockManager.loadImages(target);

    
  }

  this.onSectionUnload = function(target){
    $('#sort-by', target).off('change');

    // Clear grid/stream preference
    theme.saveGridStreamChoice(null);
  }
}

theme.SlideshowSection = new function(){
  this.onSectionLoad = function(target){
    /// Slideshows
    $('.slideshow', target).each(function(){
      $(this).on('init', function(){
        $('.lazyload--manual', this).removeClass('.lazyload--manual').addClass('lazyload');
      }).slick({
        autoplay: $(this).hasClass('auto-play'),
        fade: false,
        infinite: true,
        useTransform: true,
        prevArrow: '<button type="button" class="slick-prev">'+theme.icons.chevronLeft+'</button>',
        nextArrow: '<button type="button" class="slick-next">'+theme.icons.chevronRight+'</button>',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              arrows: false,
              dots: true
            }
          }
        ],
        autoplaySpeed: 7000 // milliseconds to wait between slides
      });
    });

    theme.resizeScalingTextFromColumn(target);
  }

  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick').off('init');
  }

  this.onBlockSelect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickGoTo', $(target).data('slick-index'))
      .slick('slickPause');
  }

  this.onBlockDeselect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickPlay');
  }
}

theme.InstagramSection = new function(){
  this.onSectionLoad = function(target){
    $('.willstagram:not(.willstagram-placeholder)', target).each(function(){
      var user_id = $(this).data('user_id');
      var tag = $(this).data('tag');
      var access_token = $(this).data('access_token');
      var count = $(this).data('count') || 10;
      var $willstagram = $(this);
      var url = '';
      if(typeof user_id != 'undefined') {
        url = 'https://api.instagram.com/v1/users/' + user_id + '/media/recent?count='+count;
      } else if(typeof tag != 'undefined') {
        url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?count='+count;
      }
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: url
        + (typeof access_token == 'undefined'? '' : ('&access_token='+access_token)),
        success: function(res) {
          if(typeof res.data != 'undefined') {
            var $itemContainer = $('<div class="items">').appendTo($willstagram);
            var limit = Math.min(20, res.data.length);
            for(var i = 0; i < limit; i++) {
              var photo_url = res.data[i].images.standard_resolution.url.replace('http:', '');
              var link = res.data[i].link;
              var caption = res.data[i].caption != null ? res.data[i].caption.text : '';
              $itemContainer.append('<div class="item"><a target="_blank" href="'+link+'"><img src="'+photo_url+'" /></a><div class="desc">'+caption+'</div></div>');
            }
            $willstagram.trigger('loaded.willstagram');
          } else if(typeof res.meta !== 'undefined' && typeof res.meta.error_message !== 'undefined') {
            $willstagram.append('<div class="willstagram__error">'+res.meta.error_message+'</div>');
          }
      	}
      });
    });

    $('.willstagram-placeholder', target).trigger('loaded.willstagram');
  }
}

// Lightbox
theme.fbOpts = { overlayColor: '#fff', padding: 1, margin: 60, overlayOpacity: 0.9 };

// Loading third party scripts
theme.scriptsLoaded = [];
theme.loadScriptOnce = function(src, callback, beforeRun) {
  if(theme.scriptsLoaded.indexOf(src) < 0) {
    theme.scriptsLoaded.push(src);
    var tag = document.createElement('script');
    tag.src = src;

    if(beforeRun) {
      tag.async = false;
      beforeRun();
    }

    if(typeof callback == 'function') {
      if (tag.readyState) { // IE, incl. IE9
        tag.onreadystatechange = function() {
          if (tag.readyState == "loaded" || tag.readyState == "complete") {
            tag.onreadystatechange = null;
            callback();
          }
        };
      } else {
        tag.onload = function() { // Other browsers
          callback();
        };
      }
    }

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return true;
  } else {
    if(typeof callback == 'function') {
      callback();
    }
    return false;
  }
}

// Manage videos
theme.VideoManager = new function(){
  var _ = this;

  // Youtube
  _.youtubeVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="youtube"]:not(.video--init)'
  };

  _.youtubeApiReady = function() {
    _.youtubeVars.apiReady = true;
    _._loadYoutubeVideos();
  }

  _._loadYoutubeVideos = function(container) {
    if($(_.youtubeVars.toProcessSelector, container).length) {
      if(_.youtubeVars.apiReady) {
        // play those videos
        $(_.youtubeVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.youtubeVars.incrementor++;
          var containerId = 'theme-yt-video-'+_.youtubeVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var player = new YT.Player(containerId, {
            height: '390',
            width: '640',
            videoId: $(this).data('video-id'),
            playerVars: {
              iv_load_policy: 3,
              modestbranding: 1,
              autoplay: !!$(this).data('video-autoplay') ? 1 : 0,
              rel: 0
            },
            events: {
              onReady: _._onYoutubePlayerReady,
              onStateChange: _._onYoutubePlayerStateChange
            }
          });
          _.youtubeVars.videoData[player.h.id] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player
          };
        });
      } else {
        // load api
        theme.loadScriptOnce('https://www.youtube.com/iframe_api');
      }
    }
  }

  _._onYoutubePlayerReady = function(event) {
    event.target.setPlaybackQuality('hd1080');
  }

  _._onYoutubePlayerStateChange = function(event) {
  }

  _._getYoutubeVideoData = function(event) {
    return _.youtubeVars.videoData[event.target.h.id];
  }

  _._unloadYoutubeVideos = function(container) {
    for(var dataKey in _.youtubeVars.videoData) {
      var data = _.youtubeVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.destroy();
        delete _.youtubeVars.videoData[dataKey];
        return;
      }
    }
  }

  // Vimeo
  _.vimeoVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="vimeo"]:not(.video--init)'
  };

  _.vimeoApiReady = function() {
    _.vimeoVars.apiReady = true;
    _._loadVimeoVideos();
  }

  _._loadVimeoVideos = function(container) {
    if($(_.vimeoVars.toProcessSelector, container).length) {
      if(_.vimeoVars.apiReady) {
        // play those videos
        $(_.vimeoVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.vimeoVars.incrementor++;
          var $this = $(this);
          var containerId = 'theme-vi-video-'+_.vimeoVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var autoplay = !!$(this).data('video-autoplay');
          var player = new Vimeo.Player(containerId, {
            id: $(this).data('video-id'),
            width: 640,
            loop: false,
            autoplay: autoplay
          });
          player.ready().then(function(){
            if(player.element && player.element.width && player.element.height) {
              var ratio = parseInt(player.element.height) / parseInt(player.element.width);
              $this.css('padding-bottom', (ratio*100) + '%');
            }
          });
          _.vimeoVars.videoData[containerId] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player,
            autoPlay: autoplay
          };
        });
      } else {
        // load api
        if(window.define) {
          // workaround for third parties using RequireJS
          theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function(){
            _.vimeoVars.apiReady = true;
            _._loadVimeoVideos();
            window.define = window.tempDefine;
          }, function(){
            window.tempDefine = window.define;
            window.define = null;
          });
        } else {
          theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function(){
            _.vimeoVars.apiReady = true;
            _._loadVimeoVideos();
          });
        }
      }
    }
  }

  _._unloadVimeoVideos = function(container) {
    for(var dataKey in _.vimeoVars.videoData) {
      var data = _.vimeoVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.unload();
        delete _.vimeoVars.videoData[dataKey];
        return;
      }
    }
  }

  // Compatibility with Sections
  this.onSectionLoad = function(container){
    _._loadYoutubeVideos(container);
    _._loadVimeoVideos(container);

    // play button
    $('.video-container__play', container).on('click', function(evt){
      evt.preventDefault();
      // reveal
      var $cover = $(this).closest('.video-container__cover').addClass('video-container__cover--playing');
      // play
      var id = $cover.next().attr('id');
      if(id.indexOf('theme-yt-video') === 0) {
        _.youtubeVars.videoData[id].player.playVideo();
      } else {
        _.vimeoVars.videoData[id].player.play();
      }
    });
  }

  this.onSectionUnload = function(container){
    $('.video-container__play', container).off('click');
    _._unloadYoutubeVideos(container);
    _._unloadVimeoVideos(container);
  }
}

// Youtube API callback
window.onYouTubeIframeAPIReady = function() {
  theme.VideoManager.youtubeApiReady();
}

theme.TextImageOverlaySection = new function(){
  var _ = this;

  this.checkAllImageOverlays = function(){
    $('.full-width-image[data-section-type="text-image-overlay"]').each(function(){
      _.checkImageOverlay(this);
    });
  }

  this.checkImageOverlay = function(container){
    var $container = $(container);
    var textHeight = $('.overlay-text .inner', $container).outerHeight() + 40;
    var imageHeight = $('.rimage-outer-wrapper', $container).outerHeight();
    var $bg = $('.img-cont', $container);
    if(textHeight > imageHeight) {
      $bg.css('min-height', textHeight);
    } else {
      $bg.css('min-height', '');
    }
  }

  this.onSectionLoad = function(container){
    this.checkImageOverlay(container);
    $(window).on('load.textImageOverlaySection debouncedresize.textImageOverlaySection', this.checkAllImageOverlays);
  }

  this.onSectionUnload = function(container){
    $(window).off('.textImageOverlaySection');
  }
}

theme.CustomRowSection = new function(){
  this.onSectionLoad = function(container){
    theme.VideoManager.onSectionLoad(container);
  }

  this.onSectionUnload = function(container){
    theme.VideoManager.onSectionUnload(container);
  }
}

theme.CollageWithTextSection = new function(){
  this.onSectionLoad = function(container){
    var $collage = $('.micro-collage', container);
    $collage.on('mouseenter mouseleave', 'a', function(e){
      $collage.toggleClass('micro-collage--link-hover', e.type == 'mouseenter');
    });
  }

  this.onSectionUnload = function(container){
    $('.micro-collage', container).off('mouseenter mouseleave');
  }
}

theme.FeaturedCollectionSection = new function(){
  this.onSectionLoad = function(container){
    

    theme.loadCarousels(container);

    theme.ProductBlockManager.loadImages(container);
  }

  this.onSectionUnload = function(container){
    theme.unloadCarousels(container);
  }
}

theme.FeaturedCollectionsSection = new function(){
  this.onSectionLoad = function(container){
    theme.loadCarousels(container);

    theme.ProductBlockManager.loadImages(container);
  }

  this.onSectionUnload = function(container){
    theme.unloadCarousels(container);
  }
}

theme.MapSection = new function(){
  var _ = this;
  _.config = {
    zoom: 14,
    styles: {
      default: [],
      silver: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}],
      retro: [{"elementType":"geometry","stylers":[{"color":"#ebe3cd"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#523735"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f1e6"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#c9b2a6"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.stroke","stylers":[{"color":"#dcd2be"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#ae9e90"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#93817c"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#a5b076"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#447530"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#f5f1e6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#fdfcf8"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#f8c967"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#e9bc62"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#e98d58"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"color":"#db8555"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#806b63"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"transit.line","elementType":"labels.text.fill","stylers":[{"color":"#8f7d77"}]},{"featureType":"transit.line","elementType":"labels.text.stroke","stylers":[{"color":"#ebe3cd"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#b9d3c2"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#92998d"}]}],
      dark: [{"elementType":"geometry","stylers":[{"color":"#212121"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#3c3c3c"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}],
      night: [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}],
      aubergine: [{"elementType":"geometry","stylers":[{"color":"#1d2c4d"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#8ec3b9"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#1a3646"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#64779e"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#334e87"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#023e58"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#283d6a"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#6f9ba5"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#023e58"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#3C7680"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#304a7d"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2c6675"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#255763"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#b0d5ce"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"color":"#023e58"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"color":"#283d6a"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#3a4762"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#0e1626"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#4e6d70"}]}]
    }
  };
  _.apiStatus = null;
  _.mapsToLoad = [];

  this.geolocate = function($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  this.createMap = function(container) {
    var $map = $('.map-section__map-container', container);

    return _.geolocate($map)
      .then(
        function(results) {
          var mapOptions = {
            zoom: _.config.zoom,
            styles: _.config.styles[_.style],
            center: results[0].geometry.location,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            zoomControl: true
          };

          _.map = new google.maps.Map($map[0], mapOptions);
          _.center = _.map.getCenter();

          var marker = new google.maps.Marker({
            map: _.map,
            position: _.center,
            clickable: false
          });

          google.maps.event.addDomListener(window, 'resize', function() {
            google.maps.event.trigger(_.map, 'resize');
            _.map.setCenter(_.center);
          });
        }.bind(this)
      )
      .fail(function() {
        var errorMessage;

        switch (status) {
          case 'ZERO_RESULTS':
            errorMessage = theme.strings.addressNoResults;
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = theme.strings.addressQueryLimit;
            break;
          default:
            errorMessage = theme.strings.addressError;
            break;
        }

        // Only show error in the theme editor
        if (Shopify.designMode) {
          var $mapContainer = $map.parents('.map-section');

          $mapContainer.addClass('page-width map-section--load-error');
          $mapContainer
            .find('.map-section__wrapper')
            .html(
              '<div class="errors text-center">' + errorMessage + '</div>'
            );
        }
      });
  }

  this.onSectionLoad = function(target){
    var $container = $(target);
    // Global function called by Google on auth errors
    window.gm_authFailure = function() {
      if (!Shopify.designMode) return;

      theme.$container.addClass('page-width map-section--load-error');
      theme.$container
        .find('.map-section__wrapper')
        .html(
          '<div class="errors text-center">' + theme.strings.authError + '</div>'
        );
    }

    // create maps
    var key = $container.data('api-key');
    _.style = $container.data('map-style');

    if (typeof key !== 'string' || key === '') {
      return;
    }

    if (_.apiStatus === 'loaded') {
      // Check if the script has previously been loaded with this key
      var $script = $('script[src*="' + key + '&"]');
      if ($script.length === 0) {
        $.getScript(
          'https://maps.googleapis.com/maps/api/js?key=' + key
        ).then(function() {
          _.apiStatus = 'loaded';
          _.createMap($container);
        });
      } else {
        _.createMap($container);
      }
    } else {
      _.mapsToLoad.push($container);

      if (_.apiStatus !== 'loading') {
        _.apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript(
            'https://maps.googleapis.com/maps/api/js?key=' + key
          ).then(function() {
            _.apiStatus = 'loaded';
            // API has loaded, load all Map instances in queue
            $.each(_.mapsToLoad, function(index, mapContainer) {
              _.createMap(mapContainer);
            });
          });
        }
      }
    }
  }

  this.onSectionUnload = function(target){
    if (typeof window.google !== 'undefined') {
      google.maps.event.clearListeners(this.map, 'resize');
    }
  }
}

theme.ListCollectionsTemplateSection = new function(){
  this.onSectionLoad = function(container){
    theme.ProductBlockManager.loadImages(container);
  }
}

// A section that contains other sections, e.g. story page
theme.NestedSectionsSection = new function(){
  this.onSectionLoad = function(container){
    // load child sections
    $('[data-nested-section-type]', container).each(function(){
      var type = $(this).attr('data-nested-section-type');
      var section = null;
      for(var i=0; i<theme.Sections._sections.length; i++) {
        if(theme.Sections._sections[i].type == type) {
          section = theme.Sections._sections[i].section;
        }
      }
      if(section) {
        theme.Sections._instances.push({
          target: this,
          section: section
        });
        section.onSectionLoad(this);
      }
    });
  }

  this.onSectionUnload = function(container){
    // unload child sections
    $('[data-nested-section-type]', container).each(function(){
      theme.Sections.sectionUnload(this);
    });
  }

  this.onBlockSelect = function(target){
    // scroll to block
    $(window).scrollTop($(target).offset().top - 100);
  }
}

theme.HeaderSection = new function(){
  this.onSectionLoad = function(container){
    /// Expand to current page
    if($('#main-nav.autoexpand', container).length) {
      theme.recursiveNavClicker();
    }

    $('.contains-dropdown__toggle', container).on('click', function(){
      $(this).parent().toggleClass('contains-dropdown--active');
      return false;
    });
  }

  this.onSectionUnload = function(container){
    $('.contains-dropdown__toggle', container).off('click');
  }
}

theme.FooterSection = new function(){
  this.onSectionLoad = function(container){
  }
}

// Manage option dropdowns
theme.productData = {};
theme.OptionManager = new function(){
  var _ = this;

  _._getVariantOptionElement = function(variant, $container) {
    return $container.find('select[name="id"] option[value="' + variant.id + '"]');
  };

  _.selectors = {
    container: '.product-detail',
    gallery: '.gallery',
    priceArea: '.price-area',
    submitButton: 'input[type=submit], button[type=submit]',
    multiOption: '.option-selectors'
  };

  _.strings = {
    priceNonExistent: "Unavailable",
    priceSoldOut: '[PRICE] <span class="productlabel soldout"><span>'+"Sold Out"+'</span></span>',
    buttonDefault: "Add to Cart",
    buttonNoStock: "Out of stock",
    buttonNoVariant: "Unavailable"
  };

  _._getString = function(key, variant){
    var string = _.strings[key];
    if(variant) {
      string = string.replace('[PRICE]', '<span class="theme-money">'+Shopify.formatMoney(variant.price, theme.money_format)+'</span>');
    }
    return string;
  }

  _.getProductData = function($form) {
    var productId = $form.data('product-id');
    var data = null;
    if(!theme.productData[productId]) {
      theme.productData[productId] = JSON.parse(document.getElementById('ProductJson-' + productId).innerHTML);
    }
    data = theme.productData[productId];
    if(!data) {
      console.log('Product data missing (id: '+$form.data('product-id')+')');
    }
    return data;
  }

  _.addVariantUrlToHistory = function(variant) {
    if(variant) {
      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    }
  }

  _.updateSku = function(variant, $container){
    $container.find('.sku .sku__value').html( variant ? variant.sku : '' );
    $container.find('.sku').toggleClass('sku--no-sku', !variant || !variant.sku);
  }

  _.updateBarcode = function(variant, $container){
    $container.find('.barcode .barcode__value').html( variant ? variant.barcode : '' );
    $container.find('.barcode').toggleClass('barcode--no-barcode', !variant || !variant.barcode);
  }

  _.updateBackorder = function(variant, $container){
    var $backorder = $container.find('.backorder');
    if($backorder.length) {
      if (variant && variant.available) {
        if (variant.inventory_management && _._getVariantOptionElement(variant, $container).data('stock') == 'out') {
          var productData = _.getProductData($backorder.closest('form'));
          $backorder.find('.selected-variant').html(productData.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - '+variant.title) );
          $backorder.show();
        } else {
          $backorder.hide();
        }
      } else {
        $backorder.hide();
      }
    }
  }

  _.updatePrice = function(variant, $container) {
    var $priceArea = $container.find(_.selectors.priceArea);
    $priceArea.removeClass('on-sale');

    if(variant && variant.available == true) {
      var $newPriceArea = $('<div>');
      if(variant.compare_at_price > variant.price) {
        $('<span class="was-price theme-money">').html(Shopify.formatMoney(variant.compare_at_price, theme.money_format)).appendTo($newPriceArea);
        $newPriceArea.append(' ');
        $priceArea.addClass('on-sale');
      }
      $('<span class="current-price theme-money">').html(Shopify.formatMoney(variant.price, theme.money_format)).appendTo($newPriceArea);
      $priceArea.html($newPriceArea.html());
    } else {
      if(variant) {
        $priceArea.html(_._getString('priceSoldOut', variant));
      } else {
        $priceArea.html(_._getString('priceNonExistent', variant));
      }
    }
  }

  _._updateButtonText = function($button, string, variant) {
    $button.each(function(){
      var newVal;
      newVal = _._getString('button' + string, variant);
      if(newVal !== false) {
        if($(this).is('input')) {
          $(this).val(newVal);
        } else {
          $(this).html(newVal);
        }
      }
    });
  }

  _.updateButtons = function(variant, $container) {
    var $button = $container.find(_.selectors.submitButton);

    if(variant && variant.available == true) {
      $button.removeAttr('disabled');
      _._updateButtonText($button, 'Default', variant);
    } else {
      $button.attr('disabled', 'disabled');
      if(variant) {
        _._updateButtonText($button, 'NoStock', variant);
      } else {
        _._updateButtonText($button, 'NoVariant', variant);
      }
    }
  }

  _.updateContainerStatusClasses = function(variant, $container) {
    $container.toggleClass('variant-status--unavailable', !variant.available);
    $container.toggleClass('variant-status--backorder', variant.available
      && variant.inventory_management
      && _._getVariantOptionElement(variant, $container).data('stock') == 'out');
    $container.toggleClass('variant-status--on-sale', variant.available
      && variant.compare_at_price > variant.price);
  }

  _.initProductOptions = function(originalSelect) {
    $(originalSelect).not('.theme-init').addClass('theme-init').each(function(){
      var $originalSelect = $(this);
      var productData = _.getProductData($originalSelect.closest('form'));

      // change state for original dropdown
      $originalSelect.on('change firstrun', function(e, variant){
        if($(this).is('input[type=radio]:not(:checked)')) {
          return; // handle radios - only update for checked
        }
        var variant = variant;
        if(!variant && variant !== false) {
          for(var i=0; i<productData.variants.length; i++) {
            if(productData.variants[i].id == $(this).val()) {
              variant = productData.variants[i];
            }
          }
        }
        var $container = $(this).closest(_.selectors.container);

        // update price
        _.updatePrice(variant, $container);

        // update buttons
        _.updateButtons(variant, $container);

        // variant images
        if (variant && variant.featured_image) {
          $container.find(_.selectors.gallery).trigger('variantImageSelected', variant);
        }

        // extra details
        _.updateBarcode(variant, $container);
        _.updateSku(variant, $container);
        _.updateBackorder(variant, $container);
        _.updateContainerStatusClasses(variant, $container);

        // variant urls
        var $form = $(this).closest('form');
        if($form.data('enable-history-state') && e.type == 'change') {
          _.addVariantUrlToHistory(variant);
        }

        // multi-currency
        if(typeof Currency != 'undefined' && typeof Currency.convertAll != 'undefined' && $('[name=currencies]').length) {
          Currency.convertAll(shopCurrency, $('[name=currencies]').first().val(), theme.money_container);
          $('.selected-currency').text(Currency.currentCurrency);
        }
      });

      // split-options wrapper
      $originalSelect.closest(_.selectors.container).find(_.selectors.multiOption).on('change', 'select', function(){
        var selectedOptions = [];
        $(this).closest(_.selectors.multiOption).find('select').each(function(){
          selectedOptions.push($(this).val());
        });
        // find variant
        var variant = false;
        for(var i=0; i<productData.variants.length; i++) {
          var v = productData.variants[i];
          var matchCount = 0;
          for(var j=0; j<selectedOptions.length; j++) {
            if(v.options[j] == selectedOptions[j]) {
              matchCount++;
            }
          }
          if(matchCount == selectedOptions.length) {
            variant = v;
            break;
          }
        }
        // trigger change
        if(variant) {
          $originalSelect.val(variant.id);
        }
        $originalSelect.trigger('change', variant);
      });

      // first-run
      $originalSelect.trigger('firstrun');
    });
  }

  _.unloadProductOptions = function(originalSelect) {
    $(originalSelect).off('change firstrun');
    $(originalSelect).closest(_.selectors.container).find(_.selectors.multiOption).off('change');
  }
}

theme.loadCarousels = function(container) {
  /// Carousels
  $('.carousel', container).each(function(){
    var $this = $(this);
    // next & prev arrows
    $this.closest('.collection-slider').on('click.themeCarousel', '.prev, .next', function(e){
      e.preventDefault();
      var carousel = $(this).closest('.collection-slider').find('.owl-carousel').data('owlCarousel');
      if($(this).hasClass('prev')) {
        carousel.prev();
      } else {
        carousel.next();
      }
    });
    // create options
    var carouselOptions;
    if($(this).hasClass('fixed-mode')) {
      carouselOptions = {
        margin: 16,
        loop: false,
        autoWidth: false,
        items: 5,
        center: false,
        nav: false,
        dots: false,
        responsive: {
          0: {
            items: 1
          },
          480: {
            items: 2
          },
          767: {
            items: 2
          },
          1000: {
            items: 3
          }
        }
      };
    } else {
      carouselOptions = {
        margin: 0,
        loop: true,
        autoWidth: true,
        items: 4,
        center: true,
        nav: false,
        dots: false
      };
    }
    // init carousel
    var loadCarousel = function(){
      // run after carousel is initialised
      $this.on('initialized.owl.carousel', function(){
        // lazysizes
        $this.find('.lazyload--manual').removeClass('.lazyload--manual').addClass('lazyload');
        // ensure clones are processed from scratch
        theme.ProductBlockManager.loadImages($this.closest('[data-section-type]'));
        // recalculate widths, after the above's async calls
        setTimeout(function(){
          $this.data('owlCarousel')._invalidated.width = true;
          $this.trigger('refresh.owl.carousel');
        }, 10);
      });
      // run after carousel is initialised or resized
      $this.on('initialized.owl.carousel resized.owl.carousel', function(evt){
        // layout fixes
        setTimeout(function(){
          // fixes
          var currentWidth = $this.find('.owl-stage').width();
          if(currentWidth > $this.width()) {
            $this.find('.owl-stage').css({
              width: currentWidth + 40, // fix rounding error
              paddingLeft: '',
              margin: ''
            });
          } else {
            // centre-align using css, if not full
            $this.find('.owl-stage').css({
              width: currentWidth + 40, // fix rounding error
              paddingLeft: 40, // offset rounding error fix
              margin: '0 auto',
              transform: ''
            });
          }
        }, 10);
        // previous/next button visibility
        $(this).closest('.collection-slider').find('.prev, .next').toggleClass('owl-btn-disabled', evt.item.count <= evt.page.size);
      }).owlCarousel(carouselOptions);
    };
    loadCarousel();
  });
}

theme.unloadCarousels = function(container) {
  $('.collection-slider', container).off('.themeCarousel');
  $('.slick-slider', container).slick('unslick');
}

/// Text that scales down - scale it up/down based on column width
theme.resizeScalingTextFromColumn = function(container) {
  var container = container;
  if(typeof container === 'undefined') {
    container = $('body');
  }
  $('.scaled-text', container).each(function(){
    var $base = $(this).closest('.scaled-text-base');
    var naturalContainerWidth = 1080,
        mult = 1;
    if($base.data('scaled-text-multiplier')) {
      mult = parseFloat($base.data('scaled-text-multiplier'));
    }
    var scale = mult * $base.width() / naturalContainerWidth; // largest container size
    $(this).css('font-size', (scale * 100) + '%');
  });
};

// run asap
theme.resizeScalingTextFromColumn();



// Show a quick generic text popup above an element
theme.showQuickPopup = function(message, $origin){
  var $popup = $('<div>').addClass('simple-popup');
  var offs = $origin.offset();
  $popup.html(message).css({ 'left':offs.left, 'top':offs.top }).hide();
  $('body').append($popup);
  $popup.css('margin-top', - $popup.outerHeight() - 10);
  $popup.fadeIn(200).delay(3500).fadeOut(400, function(){
    $(this).remove();
  });
};

theme.saveGridStreamChoice = function(type) {
  var cfg = { expires:1, path:'/', domain:window.location.hostname };
  $.cookie('gridstream', type, cfg);
}

theme.getGridStreamChoice = function() {
  return $.cookie('gridstream');
}

// Enables any images inside a container
theme.awakenImagesFromSlumber = function($cont) {
  $cont.find('.lazyload--manual:not(.lazyload)').addClass('lazyload');
};

// Sort out expanded nav. Recursively.
theme.recursiveNavClicker = function(sanity) {
  if(typeof sanity == 'undefined') {
    sanity = 0;
  }
  var $topLI = $('#main-nav.autoexpand > .multi-level-nav > div:last > ul > li:has(.active)').first();
  if($topLI.length > 0) {
    var $child = $topLI.children('a');
    if(!$child.hasClass('expanded')) {
      $child.trigger('clickinstant');
      if(sanity < 100) {
        theme.recursiveNavClicker(sanity + 1);
      }
    }
  }
  return false;
}

// Process product block layout
theme.ProductBlockManager = new function(){
  var _ = this;

  _.loadImages = function(container){
    var container = container;
    if(typeof container === 'undefined') {
      container = $('body');
    }

    _.afterImagesResized(container);
  }

  _.afterImagesResized = function(container){
    var container = container;
    if(typeof container === 'undefined') {
      container = $('body');
    }

    // Titles must not get wider than image, when in variable-width mode
    $('.product-list:not(.fixed-mode) .product-block:not(.fixed-width):not(.onboarding)').each(function(){
      var w = $('.image-cont .primary-image img', this).width() - 10; // matches margin on parent
      var $inner = $('.product-info .inner', this);
      $inner.width(
        Math.max($(window).width() > 350 ? 140 : 100, w)
      );
    }).closest('.owl-carousel').trigger('refresh.owl.carousel resize.owl.carousel');

    // All titles must line up
    $('.collection-listing .product-list', container).each(function(){
      if($(window).width() >= 768 || $(this).closest('.carousel').length > 0 ) {
        var tallest = 0;
        $(this).find('.product-block.detail-mode-permanent .image-cont .primary-image img').each(function(){
          if($(this).height() > tallest) tallest = $(this).height();
        });
        $(this).find('.product-block.detail-mode-permanent .image-cont .primary-image').css('min-height', tallest);
      } else {
        $(this).find('.product-block.detail-mode-permanent .image-cont .primary-image').css('min-height', '');
      }
    });

    _.alignProductBlockHeights(container);
  }

  _.alignProductBlockHeights = function(container) {
    var container = container;
    if(typeof container === 'undefined') {
      container = $('body');
    }

    // All product blocks must be the same height, for quick-buy alignment
    $('.collection-listing .product-list', container).each(function(){
      if($(window).width() >= 768 || $(this).closest('.carousel').length > 0 ) {
        var tallest = 0;
        $(this).find('.product-block .block-inner .product-link').each(function(){
          if($(this).height() > tallest) tallest = $(this).height();
        });
        $(this).find('.product-block .block-inner').css('min-height', tallest);
      } else {
        $(this).find('.product-block .block-inner').css('min-height', '');
      }
    });
  }
}

theme.initToggleTargets = function(container) {
  $('a[data-toggle-target]:not(.toggle-init)', container).addClass('toggle-init').each(function(){
    var $target = $($(this).data('toggle-target'));
    $(this).find('.state').html( ($target.is(':visible') && !$target.hasClass('height-hidden')) ? '-' : '+' );
  });
}

// dom ready
$(function($){
  var $ = $; // keep this ref local

  //Return elements that have an ancestor/parent matching the supplied selector
  $.fn.hasAncestor = function(a) {
    return this.filter(function() {
      return $(this).closest(a).length > 0;
    });
  };

  //Side up and remove
  $.fn.slideUpAndRemove = function(speed){
    if(typeof speed == 'undefined') speed = 200;
    $(this).each(function(){
      $(this).slideUp(speed, function(){
        $(this).remove();
      });
    });
  }

  /// Reusable function to expand/contract a div
  $(document).on('click', 'a[data-toggle-target]', function(e){
    var $target = $($(this).data('toggle-target'));
    if($target.hasClass('height-hidden')) {
      $target.hide().removeClass('height-hidden');
    }
    $(this).find('.state').html( $target.is(':visible') ? '+' : '-' );
    $target.slideToggle(200);
    e.preventDefault();
  });

  //Redirect dropdowns
  $(document).on('change', 'select.navdrop', function(){
    window.location = $(this).val();
  });

  //General purpose lightbox
  $('a[rel="fancybox"]').fancybox($.extend({}, theme.fbOpts, { titleShow: false }));

  /// NAV

  //Handle expanding nav
  $(document).on('click clickinstant', '.multi-level-nav a.has-children', function(e){
    var navAnimSpeed = 200;
    if(e.type == 'clickinstant') {
      navAnimSpeed = 0;
    }

    //Mobile main nav?
    if($(this).closest('#main-nav').length == 1 && $('#main-nav').css('position') == 'fixed') {
      if($(this).parent().hasClass('mobile-expanded')) {
        $(this).removeAttr('aria-expanded');
        $(this).siblings('ul').slideUp(navAnimSpeed, function(){
          $(this).css('display','').parent().removeClass('mobile-expanded');
        });

      } else {
        $(this).siblings('ul').slideDown(navAnimSpeed, function(){
          $(this).css('display','');
        }).parent().addClass('mobile-expanded');
        $(this).attr('aria-expanded', 'true');
      }
    } else {
      //Large menu
      //Not for list titles
      if($(this).hasClass('listing-title')) return true;

      //Set some useful vars
      var $tierEl = $(this).closest('[class^="tier-"]');
      var $tierCont = $tierEl.parent();
      var targetTierNum = parseInt($tierEl.attr('class').split('-')[1]) + 1;
      var targetTierClass = 'tier-' + targetTierNum;
      var $targetTierEl = $tierCont.children('.' + targetTierClass);

      ///Remove nav for all tiers higher than this one
      $tierCont.children().each(function(){
        if(parseInt($(this).attr('class').split('-')[1]) >= targetTierNum) {
          $(this).slideUpAndRemove(navAnimSpeed);
        }
      });

      //Are we expanding or collapsing
      if($(this).hasClass('expanded')) {
        //Collapsing. Reset state
        $(this).removeClass('expanded').removeAttr('aria-expanded').removeAttr('aria-controls').find('.exp span').html('+');
      } else {
        ///Show nav
        //Reset other nav items at this level
        $tierEl.find('a.expanded').removeClass('expanded').removeAttr('aria-expanded').find('.exp span').html('+');
        //If next tier div doesn't exist, make it
        if($targetTierEl.length == 0) {
          $targetTierEl = $('<div />').addClass(targetTierClass).attr('id', 'menu-' + targetTierClass).appendTo($tierCont).hide();
        }
        $targetTierEl.empty().stop().append($(this).siblings('ul').clone().attr('style','')).slideDown(navAnimSpeed, function(){
          $(this).css('height', ''); //Clear height
        });
        //Mark as expanded
        $(this).addClass('expanded').attr('aria-expanded', 'true').attr('aria-controls', 'menu-' + targetTierClass).find('.exp span').html('-');
      }
    }
    return false;
  });

  /// Mobile nav
  $(document).on('click', '.mobile-nav-toggle', function(e){
    e.preventDefault();
    $('body').toggleClass('reveal-mobile-nav');
    $('#main-nav div[class^="tier-"]:not(.tier-1)').remove(); //Remove any expanded rows
  });
  $('<a href="#" class="mobile-nav-toggle" id="mobile-nav-return"></a>').appendTo('body');

  /// View modes for collection page
  $(document).on('click', '#view-as-tiles', function(){
    if(!$(this).hasClass('active')) {
      $(this).addClass('active');
      $('#view-as-stream').removeClass('active');
      theme.saveGridStreamChoice('grid');
      var $listing = $('.collection-listing-stream').removeClass('collection-listing-stream').addClass('collection-listing');
      $(window).trigger('debouncedresize');
    }
    return false;
  });

  $(document).on('click', '#view-as-stream', function(){
    if(!$(this).hasClass('active')) {
      $(this).addClass('active');
      $('#view-as-tiles').removeClass('active');
      theme.saveGridStreamChoice('stream');
      var $listing = $('.collection-listing').removeClass('collection-listing').addClass('collection-listing-stream');
      //All images enabled in this view (do before optionate, in case it switches images)
      theme.awakenImagesFromSlumber($listing);
      //Close any open doodads & reset 'style=' styling to default
      $listing.find('.product-block').stop().each(function(){
        if($(this).hasClass('expanded')) {
          $(this).removeClass('expanded');
        }
        $(this).add($(this).find('.product-detail').stop()).removeAttr('style', '');
        $(this).find('select[name="id"]').trigger('optionate');
      });
    }
    return false;
  });

  

  /// Collection slider
  jQuery.fn.reverse = [].reverse; //Genius deserves credit: http://stackoverflow.com/questions/1394020/jquery-each-backwards


  /// Event for initialising options
  $(document).on('optionate', 'select[name="id"]', function(){
    theme.OptionManager.initProductOptions(this);

    // show box-style options
    var $form = $(this).closest('form');
    var $clickies = $form.find('[data-make-box]').addClass('has-clickyboxes').find('select').clickyBoxes();

    // If only one variant option, add sold-out states to box-options
    if($clickies.length == 1) {
      var productData = theme.OptionManager.getProductData($form);

      if(productData.options.length == 1) {
        for(var i=0; i<productData.variants.length; i++) {
          if(!productData.variants[i].available) {
            $('.selector-wrapper .has-clickyboxes .clickyboxes li:eq('+i+') a', $form).addClass('unavailable');
          }
        }
      }
    }
  });

  /// Galleries (inc. product page)
  $(document).on('variantImageSelected', '.gallery', function(e, data){
    // get image src
    var variantSrc = data.featured_image.src.split('?')[0].replace(/http[s]?:/, '');

    // locate matching thumbnail
    // desktop
    var $thumb = $(this).find('.thumbnails a[data-full-size-url^="' + variantSrc + '"]:first');
    $thumb.trigger('select');

    // mobile
    var $toShow = $(this).find('.mobile-slideshow .slick-slide:not(.slick-cloned)[data-full-size-url^="' + variantSrc + '"]').first().closest('.slide');
    var idx = $toShow.index('.slick-slide:not(.slick-cloned)');
    if(idx >= 0) {
      $toShow.closest('.slick-slider').slick('slickGoTo', idx);
    }
  });

  $(document).on('click select', '.gallery .thumbnails a', function(e){
    var newMainImageURL = $(this).attr('href');
    var $mainImageArea = $(this).closest('.gallery').find('.main-image');
    var $mainATag = $mainImageArea.find('a');
    // If this is a change in main image...
    if($mainATag.data('full-size-url') != $(this).data('full-size-url')) {
      // Set active class
      $(this).addClass('active').siblings().removeClass('active');
      // Set data/attributes
      $mainATag
        .attr('title', $(this).attr('title'))
        .data('full-size-url', $(this).data('full-size-url'));
      // Set href if on product page
      if($(this).closest('.inner').length == 0) {
        $mainATag.attr('href', $(this).attr('href'));
      }
      // Set main image
      var $newImg = $(this).children().clone();
      $newImg.find('img').removeClass('lazyautosizes lazyloaded fade-in').addClass('lazyload');
      $mainATag.empty().append($newImg);
      $mainATag.closest('.inner').trigger('changedsize');
    }
    e.preventDefault();
  });

    /// Product page
    $(document).on('click', '.product-detail .gallery .main-image a.shows-lightbox', function(){

        //Create list of imgs to box, so prev/next works
        var $thumbs = $(this).closest('.gallery').find('.thumbnails');
        if($thumbs.length > 0) {
            //Create dupes, rejig, launch matching link
            var $boxObjs = $thumbs.clone();
            $('body > .t-lightbox-thumbs').remove(); //Tidy
            $boxObjs.addClass('t-lightbox-thumbs').hide().appendTo('body').find('a').each(function(){
                $(this).attr('href', $(this).attr('data-full-size-url'));
            }).attr('rel', 'gallery').fancybox($.extend({}, theme.fbOpts, { cyclic: true })).filter('[href="' + $(this).attr('href') + '"]').trigger('click');
        } else {
            //Create dupe of self and launch - thumbs may be hidden
            $(this).clone().fancybox($.extend({}, theme.fbOpts, { cyclic: true })).trigger('click');
        }
        return false;
    });

    


  // load any images that aren't inside a section
  var $nonSectionedProductLists = $('.product-list, .collection-listing').filter(function(){
    return $(this).closest('[data-section-type]').length == 0;
  });
  if($nonSectionedProductLists.length) {
    theme.ProductBlockManager.loadImages($nonSectionedProductLists);
  }
  $(window).on('debouncedresize', function(){
    setTimeout(function(){
      theme.ProductBlockManager.afterImagesResized(); // empty param req
    }, 100); // after third party stuff
  });

  

  /// On page load and section reload
  $(document).on('ready shopify:section:load', function(e){

    /// Style any text-only links nicely
    $('.user-content a:not(:has(img)):not(.text-link)', e.target).addClass('text-link');


    /// Show lightbox for scaled-down images
    var imageKeys = ['_pico.','_icon.','_thumb.','_small.','_compact.','_medium.','_large.','_grande.'];
    $('.lightboximages img[src]', e.target).each(function(){
      if(!$(this).parent().is('a')) {
        var imgurl = $(this).attr('src');
        for(var i = 0; i < imageKeys.length; i++) {
          if(imgurl.indexOf(imageKeys[i]) > -1) {
            imgurl = imgurl.replace(imageKeys[i], '.');
            break;
          }
        }
        var $wrapa = $('<a>').attr('href', imgurl).addClass('fancyboximg');
        $(this).wrap($wrapa);
        $(this).parent().fancybox(theme.fbOpts);
      }
    });

  }); // endof ready/section:reload


  /// Instagram carousel
  $(document).on('loaded.willstagram', '.willstagram', function(){
    $(this).find('.items').owlCarousel({
      margin: $(this).hasClass('willstagram--no-margins') ? 0 : 16,
      loop: false,
      items: 5,
      center: false,
      nav: false,
      dots: false,
      responsive : {
        0: {
          items: 2
        },
        480: {
          items: 3
        },
        767: {
          items: 4
        },
        1000: {
          items: 5
        }
      }
    });
  });

  //Quantity inputs - select when focus
  $(document).on('focusin click', 'input.select-on-focus', function(){
    $(this).select();
  }).on('mouseup', 'input.select-on-focus', function(e){
    e.preventDefault(); //Prevent mouseup killing select()
  });

  // forms don't all have correct label attributes
  $('#template label').each(function(){
    var $sibinputs = $(this).siblings('input:not([type="submit"]), textarea');
    if($sibinputs.length == 1 && $sibinputs.attr('id').length > 0) {
      $(this).attr('for', $sibinputs.attr('id'));
    }
  });

    /// Main search input
    $(document).on('click', '#pageheader .search-box .search-form .search-box-label', function(e){
      $('#pageheader .search-box input[type="text"]').focus();
      return false;
    });
    $(document).on('focusin focusout', '#pageheader .search-box input[type="text"]', function(e){
      $(this).closest('.search-box').toggleClass('focus', e.type == 'focusin');
    });
    $(document).on('mousedown', '#pageheader .search-box button', function(e){
      $(this).click();
    });


    /// Live search
    var preLoadLoadGif = $('<img src="//cdn.shopify.com/s/files/1/0680/5680/9749/t/2/assets/ajax-load.gif?v=62939699503414190391668723171" />');
    var searchTimeoutThrottle = 500;
    var searchTimeoutID = -1;
    var currReqObj = null;
    $(document).on('keyup change', '#pageheader .search-box input[type="text"]', function(){
      var $resultsBox = $('#pageheader .search-box .results-box');
      if($resultsBox.length == 0) {
        $resultsBox = $('<div class="results-box" />').appendTo('#pageheader .search-box .search-form');
      }

      //Only search if search string longer than 2, and it has changed
      if($(this).val().length > 2 && $(this).val() != $(this).data('oldval')) {
        //Reset previous value
        $(this).data('oldval', $(this).val());

        // Kill outstanding ajax request
        if(currReqObj != null) currReqObj.abort();

        // Kill previous search
        clearTimeout(searchTimeoutID);

        var $form = $(this).closest('form');

        //Search term
        var term = '*' + $form.find('input[name="q"]').val() + '*';

        //Types
        var types = $form.find('input[name="type"]').val();

        //URL for full search page
        var linkURL = $form.attr('action') + '?type=' + types + '&q=' + term;

        //Show loading
        $resultsBox.html('<div class="load"></div>');

        // Do next search (in X milliseconds)
        searchTimeoutID = setTimeout(function(){
          //Ajax hit on search page
          currReqObj = $.ajax({
            url: $form.attr('action'),
            data: {
              type: types,
              view: 'json',
              q: term,
            },
            dataType: "json",
            success: function(data){
              currReqObj = null;
              if(data.results_total == 0) {
                //No results
                $resultsBox.html('<div class="note">'+ "No results found" +'</div>');
              } else {
                //Numerous results
                $resultsBox.empty();
                $.each(data.results, function(index, item){
                  var $row = $('<a></a>').attr('href', item.url);
                  $row.append('<div class="img"><img src="' + item.thumb + '" /></div>');
                  $row.append(item.title);
                  $resultsBox.append($row);
                });
                $resultsBox.append([
                  '<a href="', linkURL, '" class="note">',
                  "See all results",
                  ' (', data.results_total, ')</a>'].join(''));
              }
            }
          });
        }, searchTimeoutThrottle);
      } else if ($(this).val().length <= 2) {
        //Deleted text? Clear results
        $resultsBox.empty();
      }
    });
    $(document).on('focusin', '#pageheader .search-box input[type="text"]', function(){
      // show existing results
      $('#pageheader .search-box .results-box').show();
    });
    $(document).on('click', '#pageheader .search-box input[type="text"]', function(e){
      $('#pageheader .search-box .results-box').show();
      return false; // prevent body from receiving click event
    });
    $('body').bind('click', function(){
        //Click anywhere on page, hide results
        $('#pageheader .search-box .results-box').hide();
    });

    //Search box should mimic live search string: products only, partial match
    $(document).on('submit', '.search-form, #search-form, .mobile-search', function(e){
      var val = $(this).find('input[name="q"]').val();
      if(val.length > 0) {
        e.preventDefault();
        var term = '*' + val + '*';
        var type = $(this).find('input[name="type"]').val() || '';
        var linkURL = $(this).attr('action') + '?type=' + type + '&q=' + term;
        window.location = linkURL;
      }
    });

    /// Resize scaling text after resize & load
    $(window).on('load debouncedresize', function(){
      theme.resizeScalingTextFromColumn(); // req empty param
    });

    /// Show newsletter signup response, if not errors
    if($('.signup-form .signup-form__response').length && $('.signup-form .signup-form__response .error').length == 0) {
      $.fancybox($.extend({}, theme.fbOpts, {
        titleShow: false,
        content: $('.signup-form .signup-form__response:first').clone()
          .addClass('fully-spaced-row container')
          .wrap('<div>').parent().html()
      }));
    }

  /// Custom share buttons
  $(document).on('click', '.sharing a', function(e){
    var $parent = $(this).parent();
    if($parent.hasClass('twitter')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 575,
          height = 450,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Twitter', opts);

    } else if($parent.hasClass('facebook')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 626,
          height = 256,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Facebook', opts);

    } else if($parent.hasClass('pinterest')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 700,
          height = 550,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Pinterest', opts);

    } else if($parent.hasClass('google')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 550,
          height = 450,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Google+', opts);

    }
  });

  /// Responsive tables
  $('.responsive-table').on('click', '.responsive-table__cell-head', function(){
    if($(window).width()<768) {
      $(this).closest('tr').toggleClass('expanded');
      return false;
    }
  });

  /// Register all sections
  theme.Sections.init();
  theme.Sections.register('slideshow', theme.SlideshowSection);
  theme.Sections.register('instagram', theme.InstagramSection);
  theme.Sections.register('video', theme.VideoManager);
  theme.Sections.register('featured-collection', theme.FeaturedCollectionSection);
  theme.Sections.register('featured-collections', theme.FeaturedCollectionsSection);
  theme.Sections.register('text-image-overlay', theme.TextImageOverlaySection);
  theme.Sections.register('map', theme.MapSection);
  theme.Sections.register('custom-row', theme.CustomRowSection);
  theme.Sections.register('collage-with-text', theme.CollageWithTextSection);
  theme.Sections.register('featured-product', theme.FeaturedProductSection);
  theme.Sections.register('header', theme.HeaderSection);
  theme.Sections.register('footer', theme.FooterSection);
  theme.Sections.register('product-template', theme.ProductTemplateSection);
  theme.Sections.register('collection-template', theme.CollectionTemplateSection);
  theme.Sections.register('blog-template', theme.BlogTemplateSection);
  theme.Sections.register('cart-template', theme.CartTemplateSection);
  theme.Sections.register('list-collections-template', theme.ListCollectionsTemplateSection);
  theme.Sections.register('page-list-collections-template', theme.ListCollectionsTemplateSection);
  theme.Sections.register('nested-sections', theme.NestedSectionsSection);
});

})(theme.jQuery);
