
// --- 전역 공통 변수
// 아래 값들 대신 직접 $객체를 사용해도 상관없습니다.

// global $변수 선언
var Win, // $(window)
    Wiw, // $(window).width()
    Wih, // $(window).height()
    Doc, // $(document)
    Doh, // $(document).height()
    Html, // $('html , body')
    Body // $('body')
;

// custom $변수 선언
var Dimd,	 // $('.dimd_all')
    Wrap,	 // $('.wrap')
    Fnb,     // $('.fnb')
    Dst,	// 현재 $(document).scrollTop()
	LockSt = 0 // 스크롤을 막는 시점의  $(document).scrollTop()
;

// custom state 초기화
var IS_dimdOn = false, // 현재 dimd가 열려있으면 true , 닫혀있으면 false
	IS_selectOn = false, // 현재 select가 열려있으면 true, 닫혀있으면 false
	IS_iphone = !!window.navigator.userAgent.match(/iPhone/gi)
;

// --- 전역 공통 기능
// 마지막(READY_afterSet)에서 실행해줄 동작 모음
var EndAction = {
    actions : [],

    // EndAction.sub
    sub : function(fn){
        this.actions.push(fn)
    },

    // EndAction.act
    act : function(){
        var _this = this;
        for(var i = 0, l = _this.actions.length; i < l; ++i){
            (function(i){
                setTimeout(function(){
                    _this.actions[i]();
                },0);
            })(i)
        };
    },

};

var preventEvent = function(e){
	e.preventDefault();
	e.stopPropagation();
};

// 스크롤 잠김
var ACT_scrollLock = function() {
    LockSt = Doc.scrollTop();
    Body.css('top',-LockSt);
    Body.addClass('lock');
    Html.on('scroll', preventEvent);

};

// 스크롤 잠김 해제
var ACT_scrollUnlock = function() {
    Body.removeClass('lock');
    Body.css('top',0)
    Doc.scrollTop(LockSt);
    Html.off('scroll', preventEvent);

};



// 딤드 호출
var ACT_dimdOn = function(option){
    switch (option) {
        case 'clear': {
            Dimd.addClass('clear');
            Dimd.attr('no-scroll-lock', true);
            // Fnb.addClass('z5000');
            // $('.btn_wrap, [class*=sticky_], [class*=fixed_]').addClass('z5000');
            break;
        }
        // case ... {}
        default:{
            Dimd.removeClass().addClass('dimd_all trs');
            if(!$('body').hasClass('lock')){
                ACT_scrollLock();
            }
        };
    };

    // Dimd.fadeIn();
    Dimd.addClass('show');
    IS_dimdOn = true;
    if(!Dimd.hasClass('clear')){
        $('.app').length && $.lalang.appDim();//앱화면 딤활성화,플롯팅제거
    }
};



// dimd를 내리면서 sub된 액션을 함께 실행
var SUB_dimdOff;
var ACT_dimdOff = (function(){

    var actions = [];

    var action = function(){
        Dimd.removeClass('show');
        console.log(Dimd.hasClass('clear'));
        Dimd.hasClass('clear') || ACT_scrollUnlock();
        Dimd.removeAttr('no-scroll-lock');

        for(var i = 0, l = actions.length; i < l; ++i){
            actions[i]();
        };

        IS_dimdOn = false;

        if(Dimd.hasClass('clear')){
            Fnb.removeClass('z5000');
            $('.btn_wrap, [class*=sticky_], [class*=fixed_]').removeClass('z5000');
        }
        $('.app').length && $.lalang.appReleaseDim();//앱화면 딤활성화,플롯팅제거
        console.log('Dim remove');
    };

    // dimdoff될때의 기능 추가 subscribe
    SUB_dimdOff = function(fn){
        actions.push(fn);
    };

    EndAction.sub(function(){
        setTimeout(function(){
            Dimd.addClass('trs');
        },300);
    });

    return action;

})();

// 현재 fnb가 숨겨져있으면 true , 보이면 false return
var ACT_isFnbHide = function(){
	return !(Fnb.length) || !($('.fnb').length) || Fnb.hasClass('hide');
};

// 스크롤이 맨 위면 1로, 맨 아래면 맨 아래 -1로 보정. (아이폰 이슈이지만 일단 전체로 적용)
var ScrollCorrection = {

    els : [
        $('.pop_cont .tab_wrap'),
		$('.modal_content'),
        // $('.popup .pop_cont'),
    ],

    // ScrollCorrection.act
    act : function(els){
        var _this = this;

    	els.each(function(i){
    		var el = els.eq(i);
            if(el.attr('scrollCorrection-done')){return}

    		el.scrollTop(1);
    		el.on('scroll', function(){

    			if(el.scrollTop() == 0){
    				el.scrollTop(1);
    			}else if (el.scrollTop() == el.prop('scrollHeight') - el.outerHeight()){
    				el.scrollTop(el.scrollTop()-1);
    			};

    		});
            el.attr('scrollCorrection-done' , true);
    	});
    },

    // ScrollCorrection.first
    first : function(){
        var _this = this;
        for(var i = 0, l = _this.els.length; i < l; ++i){
    		if(_this.els[i].length){
    			_this.act(_this.els[i]);
    		};
    	};
    },
}


// 이미지, 동작을 받고 해당 이미지가 모두 로드된것을 확인후 동작을 실행
var ACT_imageReady = function(image, fn){
    if(image.length){
        var l = image.length;
        var n = 0;

        for(var i = 0 ; i < l ; ++i){
            if(image.eq(i)[0].complete){
                ++n == l && fn();
            }else{
                image.eq(i)[0].addEventListener('load', function(){
                    ++n == l && fn();
                });
            };
        };
    }else{fn()};
};

// 새로운 버전의 이미지로딩 체크
var IMG_loadingChk = function(imgSelector){
    return new Promise(function(resolve, reject){
        var total = imgSelector.length;

        if(!total){
            reject(new Error("No images"));
            return;
        }

        return function f(image, new_arr) {
            var imgArr =  Array.prototype.slice.call(image);

            imgArr.forEach(function(img, index) {
                console.log('이미지 ' + index + ' - 반복문 시작');
                if (img.complete) {
                    console.log('이미지 로드가 되었습니다.')
                    new_arr.push({
                        loaded : img.complete,
                        width: img.clientWidth,
                        height: img.clientHeight
                    })
                } else {
                    console.log('이미지 로드가 실패했습니다.')
                    $(img).on('load', function() {
                        f([img], new_arr);
                    }).on('error', function(){
                        console.log('이미지 로드 에러!');
                        reject();
                    });
                }

                if(total === new_arr.length){
                    console.log('이미지 로딩 완료');
                    resolve(new_arr);
                }
            });
        }(imgSelector, [])
    });
}


// READY_beforeSet , READY_afterSet 셋팅 함수 (READY는 최하단에 위치)

// global $변수 값 지정 : element
var SET_beforeMounted = function() {
    Win = $(window);
    Doc = $(document);
    Html = $('html , body');
    Body = $('body');
    Wrap = $('.wrap');
};

// global $변수 값 지정 :
var SET_globalSizeValue = function() {
    Wiw = Win.innerWidth();
    Wih = Win.innerHeight();
    Dst = Doc.scrollTop();
    Doh = Doc.innerHeight();
};

// custom 요소 삽입
var SET_appendElements = function() {
    Body.append($("<div class='dimd_all'></div>"));
};

// custom 선택자 초기화
var SET_afterMounted = function() {
    Dimd = $('.dimd_all');
    Fnb = $('nav.fnb');
};

// 기본적으로 사용할 액션
var SET_commonActions = function() {
    Dimd.on('click', function(){
        if($('.pop_agree, .main_event, pop_app').length) return false;
        if($('.pop_option', $('[option-receive^=option_website]')).hasClass('show')) return false;
        console.log('dim off');
        ACT_dimdOff();
    });
	Win.on('resize' , SET_globalSizeValue);
	Win.on('scroll', function(){Dst = Doc.scrollTop();});
};

// href가 #인 a들 preventEvent
var PreventDefaultHyperLink = {
    // PreventDefaultHyperLink.set
    set : function(){
        var aTags = $("a[href='#']");
        for(var i = 0 , l = aTags.length; i < l; ++i){
            (function(i){
                var a = aTags.eq(i);
                a.attr('href','javascript:');
            })(i);
        };
    },
};


// --- init UI
// 기능들 주요 설명은 하단에 기재

var SET_existing = function(){

    var LALANG_accordion = $('[data-js=accordion]');

    lalangAccordion(LALANG_accordion);


    /* 아코디언 */
    function lalangAccordion( target, options ) {

      if( target == undefined || target == null ) return false;

      var containerName = 'lalangAccordion';
      var KEY_anchor = '[data-js=acc_anchor]';
      var KEY_panel = '[data-js=acc_panel]';


      function Setting() {

          $.each(target, function(){
              var self = $(this);
              self.data( containerName , $.extend({
                  container : self,
                  anchor : self.find( KEY_anchor ),
                  panel : self.find( KEY_panel ),
                  activeClass : 'active',
                  // activeIndex : 0,
                  collapsible : false,

              }, options, self.data()));

              var option = self.data( containerName );

              AccInit( option );

          });

      };

      function AccInit( obj ) {

          // obj.anchor.removeClass( obj.activeClass ).eq( obj.activeIndex ).addClass( obj.activeClass );
          // obj.panel.hide().eq( obj.activeIndex ).show();

          //   obj.panel.stop(true).slideDown(0);

          EndAction.sub(function(){
              obj.panel.stop(true).slideUp(0);
              obj.anchor.filter('.' + obj.activeClass).next( KEY_panel ).show();
              AccEvents( obj );
          });

      }

      function AccEvents( obj ) {
          obj.anchor.on('click' + '.' + containerName, function( event ){
              event.preventDefault();
              AccMotion( obj, $(this) );
          });
      }

      function AccIndex(list, iter){

          for (var i = 0; i < list.length; i++) {
              if (iter(list[i])) return i;
          }

      }

      function AccMotion( obj, current ) {
          var idx = AccIndex(obj.anchor, function( key ) { return key === current.get(0) } );

          if (!obj.collapsible) {

              current.toggleClass( obj.activeClass );
              obj.panel.eq( idx ).stop(true).slideToggle();

          } else {

              // Basic
              obj.anchor.removeClass( obj.activeClass ).eq( idx ).addClass( obj.activeClass );
              obj.panel.stop(true).slideUp().eq( idx ).stop(true).slideDown();

          }
      }


      Setting();
  }
};


// 모달 팝업

var ModalPopup = {
    call : null,
    connect : null,
    receive : null,

    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    posAndSize : function(){
        this.receive.css({
            'width' : Wiw - 80,
            'top' : Wih/2 - this.receive.height()/2,
        });
    },

    show: function(el){
        $(el).addClass('show');
        ACT_dimdOn();
    },

    hide: function(el, opt){
        $(el).closest('.modal, .pop_app').removeClass('show');
        if(!opt.dimmed){
            ACT_dimdOff();
        }
    },

    // ModalPopup.bind
    bind : function(){
        var _this = this;

        $('[modal-call]').on('click', function(){});
        Doc.on('click', '[modal-call]', function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('modal-call');
            _this.receive = $("[modal-receive=" + _this.connect + "]");

            ACT_dimdOn();
            //_this.posAndSize();

            console.log(_this.receive);
            _this.receive.addClass('show');

        });

        Doc.on('click', '.modal [class*=close] , .modal .btn', function(){
            if($(this).closest('.pop_agree, .main_event, pop_app').length) return false;

            ACT_dimdOff();
        });

        Dimd.on('click', function(){
            if(!$('.main_event').hasClass('show')) return false;
            $('.main_event.show').removeClass('show');
            $(".dimd_all.show").removeClass('show');
            console.log('call here');
            Body.removeClass('lock');
        });

        SUB_dimdOff(function(){
            if($('.modal.show').length > 1){
                $('.modal.show').removeClass('show');
            }else{
                _this.receive && _this.receive.removeClass('show');
            }
            _this.resetProp();

            $('.pop_app').length && $('.pop_app').removeClass('show');  /* 앱유도 팝업 */
        });

    },

    // ModalPopup.set
    set : function(){

        var _this = this;
        var modals = $('.modal');
        var defaultPop = ['.stop_sale', '.page_loader'];

        /* 디폴트 팝업 */
        defaultPop.forEach(function(el){
            if($(el).length){
                ACT_dimdOn();
                $(el).addClass('show');
            }
        });

        if(!modals.length || modals.hasClass('pop_agree') ||  modals.hasClass('main_event')){return};

        for(var i = 0 , l = modals.length; i < l; ++i){
            _this.receive = modals.eq(i);

            if(_this.receive.hasClass('open')){
                ACT_dimdOn();
                _this.receive.addClass('show');
                //_this.posAndSize();
                return;
            }
        };
    },

};


// 툴팁

var Tooltip = {
    call : null,
    connect : null,
    receive : null,
    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    // Tooltip.closeAll
    closeAll : function(){
        $('.tooltip').removeClass('show');
    },

    //Tooltip.bind
    bind : function(){
        var _this = this;

        $('[tooltip-call]').each(function(){
            var cate = $(this).parents('li').find('.cate');
            cate.length ? $(this).addClass('menu') : $(this).addClass('menu2')
        });

        Doc.on('click', '[tooltip-call]' , function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('tooltip-call');
            _this.receive = $("[tooltip-receive="+ _this.connect +"]");

            ACT_dimdOn('clear');
            Dimd.addClass('z110');

            _this.receive.addClass('show');

            if(_this.receive.closest('.ajax_layer').length){
                var ypos = _this.call.position().top + $('.ajax_layer .content').scrollTop();
            }else{
                var ypos = _this.call.offset().top;
            }

            _this.receive.css({
                'top' : ypos  +  _this.call.height() + 10,
                'left' : Wiw/2 - _this.call.width() > _this.call.offset().left ? 20 : Wiw - _this.receive.outerWidth() - 20,
            });
        });

        Doc.on('click', '[tooltip-receive] > .btn_close3', function(){
            ACT_dimdOff();
        });

    },

    //Tooltip.set
    set : function(){
        var _this = this;

        var tooltip = $('.tooltip');
        if(!tooltip.length){return};

        SUB_dimdOff(function(){
            _this.receive && _this.receive.removeAttr('style');
            _this.receive && _this.receive.removeClass('show');
            _this.resetProp();
            Dimd.removeClass('z140');
        });

    },

};


// 셀렉트옵션 창

var OptionSelect = {
    call : null,
    connect : null,
    receive : null,
    popOption : null,
    plusArea : null,
    noItem : null,
    items : null,
    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    // OptionSelect.bind
    bind : function(){
        var _this = this;

        Doc.on('click', '[option-call]' , function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('option-call');
            _this.receive = $("[option-receive="+ _this.connect + "]");
            _this.plusArea = $("[option-plus="+ _this.connect + "]");
            _this.popOption = _this.receive.find('.pop_option');
            _this.noItem = _this.receive.find('.none_click');
            _this.items = _this.popOption.find('ul li a');

            _this.popOption.parents('.option_select')[0].style.willChange = 'auto';

            console.log(_this.connect);
            
            /*if(_this.receive.attr('option-receive') === 'sort_child1' || _this.receive.attr('option-receive') === 'sort_child2'){*/
            if(_this.receive.filter('[option-receive^=sort_child]').length > 0){
                $('.pop_option', _this.receive).addClass('z5000');
                Body.append($("<div class='dimd_all mask show z3030'></div>"));
            }else{
                if(_this.connect === 'fnb'){
                    $('.'+_this.connect).addClass('z5000');
                }
                if(_this.receive.hasClass('plus')){
                    // _this.items.removeClass('on');
                    _this.plusArea.children().length ? _this.noItem.addClass('hide') : _this.noItem.removeClass('hide');
                };
                ACT_dimdOn();
            }

            _this.popOption.addClass('show');
        });

        Doc.on('click', '[option-receive] li a', function(){
            var item = $(this);
            _this.items.removeClass('on');
            item.addClass('on');

            //if(item.closest('.option_select').attr('option-receive') === 'sort_child1' || item.closest('.option_select').attr('option-receive') === 'sort_child2'){
            if(item.closest('.option_select').filter('[option-receive^=sort_child]').length > 0){
                item.closest('.pop_option').removeClass('show');
                $(".dimd_all.mask").remove();
            }else if(item.closest('.option_select').filter('[option-receive^=option_website]').length > 0){
                item.closest('.pop_option').removeClass('show');
                $(".dimd_all.show").removeClass('show');
            }else{
                ACT_dimdOff();
            }
        });

        Doc.on('click touchend', '.dimd_all.mask', function(){
            $('.pop_option.show').removeClass('show');
            $(".dimd_all.mask").remove();
        });

        Dimd.on('click', function(){
            if(!$('.pop_option').hasClass('show')) return false;
            $('.pop_option.show').removeClass('show');
            $(".dimd_all.show").removeClass('show');
        });

        SUB_dimdOff(function(){
            _this.receive && _this.popOption.removeClass('show');
            _this.resetProp();

            setTimeout(function(){
                $('.fnb').hasClass('z5000') && $('.fnb').removeClass('z5000');
            }, 300);
        });

    },
    set : function(){},
};


// 탭 UI 구성

var TabArea = {
    tabWrap : null,
    tabMenu : null,
    tabContents : null,
    tabInnerAction : [],

    //TabArea.sub
    sub : function(fn){
        // console.log('sub' , fn);
        this.tabInnerAction.push(fn)
    },

    startInnerAction : function(){
        var _this = this;
        setTimeout(function(){
            for(var i = 0, l = _this.tabInnerAction.length; i < l; ++i){
                _this.tabInnerAction[i]();
            };
        })
    },

    // TabArea.bind
    bind :function(){
        var _this = this;

        Doc.on('click', '.tab_menu a', function(){
            var a = $(this);
            var idx = a.parent('li').index();
            var tabBtn = a.closest('.tab_btn');

            _this.tabWrap = a.closest('.tab_wrap');
            _this.tabMenus = _this.tabWrap.children('.tscroll_mask').length ? _this.tabWrap.children('.tscroll_mask').find('.tab_menu a') : _this.tabWrap.children('.tab_menu').find('a');
            _this.tabContents = _this.tabWrap.children('.tab_cont');
            _this.tabMenus.removeClass('on');
            a.addClass('on');

            // tab이 ajax인지 아닌지 판단하는 기준은 "탭 컨텐츠의 길이가 1개 이상" 일때 입니다.
            if(_this.tabContents.length > 1){
                // _this.tabContents.removeClass('show').addClass('hide');
                _this.tabContents.removeClass('active')
                // var $tabContent = _this.tabContents.eq(a.parent('li').index()).addClass('show').removeClass('hide');
                var $tabContent = _this.tabContents.eq(a.parent('li').index()).addClass('active');

                // If you have a slider in your tab content, call Sliders.update ()
                setTimeout(function(){
                    _this.tabContents.removeClass('show').addClass('hide');
                    var $tabContent = _this.tabContents.eq(a.parent('li').index()).addClass('show').removeClass('hide');
                    IframeHeight.set($tabContent.find('iframe'));

                    if(tabBtn.length){
                        $('.btn_box', tabBtn).removeClass('active');
                        $('.btn_box', tabBtn).eq(a.parent('li').index()).addClass('active');
                    }
                },100);
            }else{
                // _this.tabContents.addClass('show').removeClass('hide');
                _this.tabContents.addClass('active');
            };

            if(_this.tabContents.children('.sorting')){
                var activeContents = _this.tabContents.filter('.active');
                activeContents.find('.sorting').length && FilterButton.set(activeContents, idx);
            }
        });
    },

    // TabArea.set
    set : function(){
        var _this = this;
        var tabs = $('.tab_wrap');
        if(!tabs.length){return};

        console.log('set');

        tabs.each(function(i){
            var tab = tabs.eq(i);
            if(tab.attr('tabArea-done')){return};
            var menu = tab.children('.tscroll_mask').length ? tab.children('.tscroll_mask').find('.tab_menu a') : tab.children('.tab_menu').find('a');
            var contents = tab.children('.tab_cont');

            // contents.addClass('show');
            _this.startInnerAction();
            // contents.removeClass('show');

            // menu.eq(0).click();
            tab.attr('tabArea-done', true);
        });

    },

}

// .ul_size width를 직속 하위 요소 width 합으로 맞춰줌
var SET_ulSize = function() {

    // 잠정 폐지
    return;

    var sizes = $('.ul_size');
    if(!sizes.length){return};

    sizes.each(function(i){

        var size = sizes.eq(i),
        items = size.children('li'),
        total = 0;

        items.each(function(i){
            items.eq(i).width(items.eq(i).width()+1);
            total = total + items.eq(i).outerWidth(true);
        });

        size.width(total);

        if(!size.width() < Wiw - 20){
            size.css('padding-right', 20);
        };

    });

};

var HideScrollbar = {

    // HideScrollbar.set
    set : function(){
        // 잠정 폐지
        return;
        var tscrolls = $('.tscroll');

        if(!tscrolls.length){return};

        // if(!IS_iphone || !tscrolls.length){return};

        tscrolls.each(function(i){
            var tscroll = tscrolls.eq(i);
            if(tscroll.attr('tscroll-done')){return};
            var classList = tscroll.attr('class').split(/\s+/);
            var mask = $('<div class="tscroll_mask"></div>');

            tscroll.wrap(mask);

            for(var i = 0, l = classList.length; i < l; ++i){
                if(classList[i].match('sticky_step')){
                    mask = tscroll.closest('.tscroll_mask');
                    tscroll.removeClass(classList[i]);
                    mask.addClass(classList[i]);
                };
            }

            tscroll.attr('tscroll-done',true);
        });

    },

}



// sns 공유하기 on, off

var SnsButton = {
    popsns : null,
    close : null,
    snsItems : null,
    urlCopy : null,
    itemsLength : null,
    isOn : false,
    isUrlOn : false,

    // SnsButton.bind
    bind : function(){
        var _this = this;

        Doc.on('click', '.btn_sns, .btn_post', function(){

            if(_this.isOn){return};
            _this.isOn = true;

            // if(!_this.popsns){
            //     _this.popsns = $('.pop_sns');
            //     _this.close = _this.popsns.find('button.btn_close4');
            //     _this.snsItems = _this.popsns.find('.sns_items button');
            //     _this.itemsLength = _this.popsns.find('.sns_items > button').length;
            // };

            var objTtl = $(this).attr('class').substring($(this).attr('class').lastIndexOf('_')+1, $(this).attr('class').length);
                _this.popobj = $('.pop_' + objTtl);
                _this.close = _this.popobj.find('button.btn_close4');
                _this.snsItems = _this.popobj.find('button');
                _this.itemsLength = _this.popobj.find('button').length;

            Tooltip.closeAll();
            ACT_dimdOn();
            _this.popobj.addClass('show');
            _this.close.removeClass('hide');

            for(var i = 0; i < _this.itemsLength; ++i){
                (function(i){
                    setTimeout(function(){
                        _this.isOn && _this.snsItems.eq(i).addClass('active');
                    },i * 80);
                })(i);
            };
        });

        Doc.on('click', '.pop_sns .btn_close4, .pop_post .btn_close4' , ACT_dimdOff);

        Doc.on('click', '.pop_sns .sns_url' , function(){
            _this.isUrlOn = true;
            _this.urlCopy = _this.popobj.find('.copy_end');
            _this.snsItems.removeClass('active');
            _this.urlCopy.addClass('show');
            _this.close.addClass('hide');

            setTimeout(function(){
                if(_this.isUrlOn){
                    _this.urlCopy.removeClass('show');
                    ACT_dimdOff();
                    _this.isUrlOn = false;
                };
            },2000);
        });

        SUB_dimdOff(function(){
            if(!_this.isOn){return};

            _this.popobj && _this.popobj.removeClass('show');
            _this.urlCopy && _this.urlCopy.removeClass('show');
            _this.snsItems && _this.snsItems.removeClass('active');
            _this.isOn = false;
            _this.isUrlOn = false;
        });


    },
}

var CheckboxLike = {
    call : null,
    connect : null,
    receive : null,

    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    set : function(){
        var inputs = $('label input'),
            _this = this;

        if(!inputs.length){return};

        inputs.each(function(i){

            var input = inputs.eq(i);
            if(input.attr('checkboxLike-done')){return};
            var label = input.parents('label');

            if(input.is(':checked')){
                label.addClass('checked');
            }else if(label.hasClass('checked')){
                input.attr('checked', true);
            };

            input.on('change', function(){
                input.attr('type') == 'radio' && $("input[name=" + input.attr('name') + "]").parents('label').removeClass('checked');
                input.is(':checked') ? label.addClass('checked') : label.removeClass('checked');
            });

            if(label.attr('data-target')){
                _this.connect = label.hasClass('checked') && label.attr('data-target');
                $("[data-content=" + _this.connect + "]").show();

                var is_nested = label.closest('[data-content]').length;
                is_nested && $("[data-content=" + label.attr('data-target') + "]").addClass('nested');

                CheckboxLike.bind();
            }

            input.attr('checkboxLike-done', true);

        });
    },
    bind : function(){
        var _this = this;
        Doc.on('click', '[data-target]', function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('data-target');
            _this.receive = $("[data-content=" + _this.connect + "]");

            var is_nested = _this.call.closest('[data-content]').length;
            
            if(is_nested){
                _this.call.closest('[data-content]').find('[data-content]').hide();

            }else{
                $('[data-content]').not('.nested').hide();
            }
            _this.receive.show();

            _this.resetProp();
        });
    },
};

var InputPlaceholder = {
    // InputPlaceholder.bind
    bind : function(){
        Doc.on('change',"input[type='date'],input[type='time']", function(){
            var _this = $(this);
            _this.val() ? _this.addClass('placehide') : _this.removeClass('placehide');
        });
    },
}

var TicketResult = {
    // TicketResult.set
    set :function(){
        var ticket = $('.ticket_result');
        if(!ticket.length){return};

        var items = ticket.children('li');

        items.each(function(i){
            var item = items.eq(i);
            if(item.attr('ticketResult-done')){return};
            var btn = item.find('.more_close');
            var more = item.find('.ticket_more');
            var seller = more.find('span.seller');

            more.attr('data-height', more.outerHeight());
            more.css({
                'height' : '40px',
            });

            setTimeout(function(){
                more.addClass('trs');
                btn.addClass('trs');
                seller.addClass('trs');
            });

            btn.on('click',function(){
                if(more.hasClass('open')){
                    more.removeClass('open');
                    more.css('height', '40px');
                }else{
                    more.addClass('open');
                    more.css('height', more.attr('data-height'));
                };
            });

            item.attr('ticketResult-done', true);

        });

    },
}

var ReviewUser = {
    // Reveiwuser.bind
    bind : function(){
        Doc.on('click', '.review_item .btn_txt.more', function(){
            var _this = $(this);
            var txt = _this.parents('.txt_area').children('.txt');
            txt.addClass('on');
            _this.css('display','none');
        });
    },
}


var ReviewProduct = {
    // ReviewProduct.set
    set  : function(){
        var info = $('.product_cont .prd_info');
        if(!info.length){return};
        var detail = $('.product_detail');
        var image = info.find('img');
        var buttonZoom = detail.find('button.zoom');
        var buttonContentMore = detail.find('.prd_more button');
        var white = detail.find('.white_shadow');

        if(image.length){
            buttonZoom.css('display','none');

            Win.on('scroll', function(){
                var st = Doc.scrollTop(),
                top = detail.offset().top - 85,
                bottom = detail.height() + detail.offset().top -140;
                buttonZoom.css(st > top && st < bottom ? {'display':'block'} : {'display':'none'});
            });
        };
    },
}


var RankingButton = {
    set : function(){
        var keyword = $('.keyword_list');
        if(!keyword.length || keyword.attr('rankingButton-done')){return};

        var nowview = keyword.find('.now_view'),
        button = nowview.find('button'),
        ol = keyword.find('.rank');

        ol.slideUp(0);

        button.on('click', function(){
            if(keyword.hasClass('open')){
                keyword.removeClass('open');
                ol.stop().slideUp();
                button.addClass('btn_unfold');
                button.removeClass('btn_fold');
            }else{
                keyword.addClass('open');
                ol.stop().slideDown();
                button.removeClass('btn_unfold');
                button.addClass('btn_fold');
            };
        });

        keyword.attr('rankingButton-done', true);
    },
}



var FoldArea = {

    toggle: null,

    bind: function(){
        var _this = this;

        Doc.on('click', '.fold_area .fold_button', function(e){
            var area = $(this).closest('.fold_area');
            var isOpen = area.hasClass('open');
            var target = area.children('.fold_target');
            var parentDocument = parent.document
            var $tabContent = $(parentDocument).find('.sch_box .tab_cont.active');

            if(area.attr('foldlist-done') === "true"){
                isOpen ? area.addClass('close').removeClass('open') : area.addClass('open').removeClass('close');
                _this.toggle(area);

                setTimeout(function(){
                    IframeHeight.resize($tabContent.find('iframe'));
                }, 200);
            }else{
                if(isOpen){
                    area.addClass('close').removeClass('open');
                    target.height(target.attr('fold-height') || 0);
                }else{
                    area.addClass('open').removeClass('close');
                    target.height(target.attr('max-height'));
                };
            }
        });
    },

    set : function(){
        var allFolds = $('.fold_area'),
            i;

        if(!allFolds.length){return};

        for(i=0; i<allFolds.length; i++){
            (function(j){
                var foldArea = allFolds.eq(j),
                    foldlist_Done = foldArea.attr('foldlist-done'),
                    isOpen = foldArea.hasClass('open');

                if(foldArea.attr('foldArea-done')){return}

                if(foldlist_Done !== undefined && foldlist_Done === "false"){
                    isOpen ? foldArea.removeClass('close') : foldArea.addClass('close');
                    toggleList(foldArea);
                    foldArea.attr('foldlist-done' , true);
                }else{
                    isOpen ? foldArea.removeClass('close') : foldArea.addClass('close');
                    // $.isReady ? imageDelay(foldArea) : EndAction.sub(imageDelay);
                    imageDelay(foldArea);
                    foldArea.attr('foldArea-done' , true);
                }
            })(i);
        };

        function imageDelay(foldArea){

            var foldTarget = foldArea.children('.fold_target'),
                foldButton = foldArea.children('.fold_button'),
                maxHeight = 0,
                minHeight = foldTarget.attr('fold-height') || 0,
                isOpen = foldArea.hasClass('open'),
                images = foldTarget.find('img');

            // console.log('images', images);    

            IMG_loadingChk(images).then(function(result){
                _setHeight();
            }).catch(function(err){
                _setHeight();
            });

            function _setHeight(){

                maxHeight = $('.fold_inner', foldTarget).length ? $('.fold_inner', foldTarget).height() : foldTarget.height();

                if(minHeight >= maxHeight){
                    foldButton.css('display','none');
                    $('.white_shadow').css('display','none');
                    return;
                };

                // product화면에서는 transition X
                foldTarget.parents('.product_cont').length || foldTarget.addClass('trs');

                if(isOpen){
                    foldTarget.height(maxHeight);
                    foldArea.removeClass('close');
                }else{
                    foldTarget.height(minHeight);
                    foldArea.addClass('close');
                };

                foldTarget.attr('max-height' , maxHeight);

                foldButton.css('display','block');
            }
        }

        function toggleList(foldArea){
            var foldList = foldArea.find('li'),
                foldButton = foldArea.children('.fold_button'),
                num = 3;

            foldList.length > num ? foldButton.css('display','block') : foldButton.css('display', 'none');

            if(foldArea.hasClass('close')){
                foldList.eq(num-1).nextAll().css('display', 'none');
            }else{
                foldList.eq(num-1).nextAll().css('display', 'block');
            }
        }

        this.toggle = toggleList;
    }

}

var ClassHandlr = {
    bind: function(){
        Doc.on('click', '.btn_like , .btn_bookmark ,.btn_bookmark2' , function(){
            $(this).toggleClass('on');
        });

        Doc.on('click', '.route_select button:not(.btn_swap)', function (){
            $('.route_select button').removeClass('active');
            $(this).addClass('active');
        });
    },

}



var Sliders = {

    // SLider.set
    set : function(){
        var sliders = $('.slider_wrap');
        if(!sliders.length){return};

        sliders.each(function(i){

            var slider = $(this);

            if(slider.attr('slider-done')){return};
            // var items = sliders.children('.slider_item');
            var items = $('.slider_item', slider);

            var sliderOptions = slider.attr('slider-option') ? slider.attr('slider-option').split(' ') : [];
            var	direction = 'left';
            var current = 0;

            slider.on('beforeChange', function(e,a,c,n){current  = n});
            slider.on('swipe', function(e,a,c){direction = c});
            slider.on('afterChange', function(e,a,c){});

            var options = {
                arrows : false,
                dots: true,
                dotsClass: 'slick-dots',
                lazyLoad: 'ondemand',
                infinite : false,
                autoplay : true,
                activeClass : 'slider_active',
                mobileFirst : true,
            };

            for(var i = 0, l = sliderOptions.length; i < l; ++i){

                switch (sliderOptions[i]) {

                    // slider-option='banner' 배너옵션들 적용
                    case 'banner' : {
                        options = $.extend({}, options, {
                            infinite: true,
                            autoplay: true,
                            arrows: false,
                            dots: true,
                            dotsClass: 'slick-dots',
                            slidesToShow: 1,
                            variableWidth: false
                        });
                        sliderOptions[i] == null;
                        break;
                    };

                    // slider-option='viewer' : 생성된 arrow가 일정 시간을 기준으로 활성화/비활성화 설정
                    case 'viewer' : {
                        options = $.extend({}, options, {
                            arrows : true,
                        });
                        var prevButton, nextButton;
                        var max = items.length;
                        var count = 3;
                        var isSettime = false;

                        var arrowOn = function(){
                            count = 3;
                            prevButton.removeClass('hide');
                            nextButton.removeClass('hide');
                        }

                        var arrowInterval = setInterval(function(){
                            --count;
                            if(count <= 0){
                                prevButton.addClass('hide');
                                nextButton.addClass('hide');
                            };
                        },1000);

                        slider.on('beforeChange', function(e,a,c){
                            if(!current){current = 0};
                            if(current == 0){
                                prevButton.attr('disabled', true);
                                nextButton.attr('disabled', false);
                            }else if(current == max-1){
                                prevButton.attr('disabled', false);
                                nextButton.attr('disabled', true);
                            }else{
                                prevButton.attr('disabled', false);
                                nextButton.attr('disabled', false);
                            }
                            arrowOn();
                        });

                        slider.on('click', function(){
                            arrowOn();
                        });

                        slider.on('init', function(){
                            prevButton = slider.find('button.slick-prev');
                            nextButton = slider.find('button.slick-next');
                            slider.trigger('beforeChange');
                            ScrollCorrection.act(items);

                            setTimeout(function() {
                                prevButton.addClass('trs');
                                nextButton.addClass('trs');
                            },0);
                        });

                        sliderOptions[i] == null;

                        break;
                    };

                    // slider-option='flytext' : 슬라이드가 변경될때 글자가 날아오는 효과.
                    case 'flytext' : {

                        var flytextTargets = items.find('.txt > *');

                        if(!flytextTargets.length){return};

                        flytextTargets.addClass('flytext');
                        flytextTargets.addClass('hide');

                        slider.on('afterChange', function(e,a){
                            var c = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
                            var txts = items.eq(c).find('.txt > *');
                            var others = items.not(items.eq(c)).find('.txt > *');

                            txts.addClass(direction);

                            for(var i = 0; i < txts.length; ++i){
                                (function(i){
                                    setTimeout(function(){
                                        txts.eq(i).addClass('trs');
                                        txts.eq(i).removeClass('hide');
                                        txts.eq(i).removeClass(direction);
                                    },i * 100);
                                })(i);
                            };

                            others.addClass('hide');
                            others.removeClass('trs');

                        });

                        slider.trigger('afterChange');

                        sliderOptions[i] == null;
                        break;
                    };

                    //slider-option='fullsize' : slider_item들의 넓이가 slider_wrap과 같아짐
                    // case 'fullsize' : {
                    //     var fullsize = function() {
                    //         var items = slider.find('.slider_item');
                    //         items.width(slider.width());
                    //     };
                    //     console.log('fullsize', fullsize());
                    //     Win.on('resize', fullsize)
                    //     slider.on('afterChange', fullsize);

                    //     sliderOptions[i] == null;
                    //     break;
                    // };
                };

            };

            // for(var key of sliderOptions){
            sliderOptions.forEach(function(key){
                if(key.match(/=/gi)){
                    var split = key.split('='),
                        prop = split[0],
                        value = split[1];

                    value = value == '0' ? 0 : value;
                    options[prop] = value;
                }else{
                    options[key] = true;
                }
            });

            // slider.slick(options);
            if(slider.closest('.band_banner, .main_event').length){
                items.length > 1 ? slider.slick(options) : slider.closest('.band_banner, .main_event').addClass('single');
            }else{

                slider.slick(options);
                if(items.length===1 && options.dots){
                    slider.addClass('slick-dotted');
            
                    var dot = $('<ul />').addClass(options.dotsClass);
                    dot.append($('<li />').append('<button type="button" data-role="none" role="button">1</button>'));
                    dot.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');
                    dot.appendTo(slider);
                }
            }

            slider.attr('slider-done', true);
        });
    },

    update: function($slider){
        $slider.slick('setPosition');
    }
}


var FixedSticky = {

    // FixedSticky.set
    set : function(){
        var fixsticky = $('[class*=fixed_]');
        var sellertalk = $('.sellertalk');
        if(!fixsticky.length){return};

        sellertalk.length && sellertalk.addClass('op1');

        fixsticky.each(function(){
            var _this = $(this);
            var bodyPos;

            if(_this.attr('fixsticky-done')){return}

            if($('body').hasClass('lock')){
                bodyPos = parseInt($('body').css('top'));
            }

            var thisHeight = _this.outerHeight();
            var thisTop = parseInt(_this.css('top'));

            _this.addClass('pos_relative');
            var offset = _this.offset();

            var calcValue = offset.top - (thisTop * 2);

            if(bodyPos!==undefined && Math.abs(bodyPos) > Math.abs(calcValue)){
                calcValue = Math.abs(bodyPos-calcValue);
            }

            _this.removeClass('pos_relative');

            // _this.css('opacity', 1);

            var isShow = false;

            Win.on('scroll', function(){
                if(Dst < 0){
                    return;
                }else if(Dst >= calcValue && !isShow){
                    _this.addClass('on');
                    sellertalk.fadeIn(300);
                    isShow = true;
                }else if(Dst < calcValue && isShow){
                    _this.removeClass('on');
                    sellertalk.fadeOut(300);
                    isShow = false;
                }else{
                    return;
                }

            });

            (Dst < calcValue && isShow) ? sellertalk.fadeIn(0) : sellertalk.fadeOut(0);

            _this.attr('fixsticky-done' , true);
        });

    }
}

var FixedStickyReverse = {

    set : function(){
        var agent = navigator.userAgent.toLowerCase(),
            ie = navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1 || (agent.indexOf("msie") != -1);

        var stickyElement = $('[class*=sticky_]').hasClass('revers') && $('[class*=sticky_]');

        if(!stickyElement.length){return};

        stickyElement.each(function(){
            var stickyOffset = $(this).height();
            var $header = $('.wrap > header');

            Win.on('scroll.sticky', function(){
                var scrollTop = $(this).scrollTop();

                if( scrollTop > stickyOffset ){
                    $header.removeClass('revers');
                    $('.app').length && $.lalang.appCallColorScript("0xffffff");
                } else {
                    $header.addClass('revers');
                    
                    if($('body').hasClass('lock')) return false;
                    $('.app').length && $.lalang.appCallColorScript("0xfe583e");
                };
            });
        });
    }
}

var FilterButton = {
    // FilterButton.set
    set : function(container, idx){
        var filters = $('.r_btn_box');
        var $container = $(container);

        if(!filters.length || filters.hasClass('sellertalk')){return};
        filters.each(function(i){
            var filter = filters.eq(i);

            filter.addClass('op1');

            var sorting = $container.length ? container.find('.sorting') : $('.sorting');

            if(sorting.length && sorting.is(':visible')){
                setTimeout(function(){
                    Win.off('scroll.filter');
                    Win.on('scroll.filter', function(){
                        Dst = Doc.scrollTop();
                        if(Dst > sorting.offset().top){
                            filter.fadeIn(300);
                        }else{
                            filter.fadeOut(300);
                        }
                    });
                },0);

                Dst > sorting.offset().top ? filter.fadeIn(0) : filter.fadeOut(0);

            }else{
                setTimeout(function(){
                    Win.off('scroll.common');
                    Win.on('scroll.common', function(){
                        Dst = Doc.scrollTop();
                        if(Dst > $('header').height()){
                            filter.fadeIn(300);
                        }else{
                            filter.fadeOut(300);
                        }
                    });
                },0);

                Dst > $('header').height()? filter.fadeIn(0) : filter.fadeOut(0);
            }

            filter.attr('filterButton-done', true);

        });
    },
}

var InfinityScroll = {

    set : function(){

        Win.on('scroll', function(){
            var $window = $(this);
            var scrollTop = $window.scrollTop();
            var windowHeight = $window.height();
            var documentHeight = $(document).height();
            var spaceHeight = $('.footer').length ? $('.footer').height() : 100;

            console.log('spaceHeight', spaceHeight);

            if(scrollTop + windowHeight + spaceHeight > documentHeight){
                console.log('load more...');
            }
        });
    }

}

var Popup = {
    call : null,
    connect : null,
    receive : null,
    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    // Popup.bind
    bind : function(){
        var _this = this;
        var fnbIdx = $('a.on', Fnb).index();

        // $('[popup-call]').on('click', function(){});
        Doc.on('click', '[popup-call]', function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('popup-call');
            _this.receive = $("[popup-receive=" + _this.connect + "]");

            if(_this.connect === 'category' && _this.receive.hasClass('show')){
                $('.ajax_layer.category [class*=btn_close]').trigger('click');
                $(this).removeClass('on');
                // $('a', Fnb).eq(fnbIdx).addClass('on');

                return false;
            }

            if(!$('body').hasClass('lock')){
                ACT_scrollLock();
            }

            _this.receive.addClass('show');

            if(_this.connect == 'category'){
                $('a', Fnb).eq(fnbIdx).removeClass('on');
                _this.call.addClass('on');
                _this.receive.siblings('.fnb').addClass('level2');
            }
            if(_this.connect !== 'category'){
                Fnb.addClass('hide');
            }

        });

        Doc.on('click', '.popup [class*=btn_close], .ajax_layer.category [class*=btn_close]' , function(){

            _this.receive = _this.receive || $(this).parents('.popup');
            _this.receive.removeClass('show');
            if(_this.connect == 'category'){
                _this.receive.siblings('.fnb').removeClass('level2');
                $("[popup-call=category]").removeClass('on');
                fnbIdx < 0 ? $('a', Fnb).removeClass('on') : $('a', Fnb).eq(fnbIdx).addClass('on');
            }
            _this.resetProp();

            if(_this.connect !== 'category'){
               Fnb.removeClass('hide');
            }

            if(!$('popup.show').length){
                ACT_scrollUnlock();
            }
        });

    },

    //Popup.set
    set: function(){
        var popups = $('.popup');
        if(!popups.length){return};
        ScrollCorrection.act(popups.children('.pop_cont'));
    }

};

var ScrollDeltaChange = {

    // ScrollDeltaChange.bind
    bind: function(){
        jQuery.event.special.scrolldelta = {
            delegateType: "scroll",
            bindType: "scroll",
            handle: function (e) {
                var handleObj = e.handleObj;
                var targetData = jQuery.data(e.target);
                var ret = null;
                var elem = e.target;
                var isDoc = elem === document;
                var oldTop = targetData.top || 0;
                var oldLeft = targetData.left || 0;
                targetData.top = isDoc ? elem.documentElement.scrollTop + elem.body.scrollTop : elem.scrollTop;
                targetData.left = isDoc ? elem.documentElement.scrollLeft + elem.body.scrollLeft : elem.scrollLeft;
                e.scrollTopDelta = targetData.top - oldTop;
                e.scrollTop = targetData.top;
                e.scrollLeftDelta = targetData.left - oldLeft;
                e.scrollLeft = targetData.left;
                e.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                e.type = handleObj.type;
                return ret;
            },
        };

        Win.on('scrolldelta', function(e){
            var targets = $('.delta_scroll');

            if(Dst <= 0){
                targets.removeClass('delta_scroll_down');
                targets.addClass('delta_scroll_up');
                return;
            }else if(Dst +  Wih + 114 >= Doc.innerHeight()){// 114? => 아이폰에서 사파리 위, 아래 가변적인 높이보정
                targets.addClass('delta_scroll_down');
                targets.removeClass('delta_scroll_up');;
                return;
            }

            if(e.scrollTopDelta > 0){
                targets.addClass('delta_scroll_down');
                targets.removeClass('delta_scroll_up');
            }else{
                targets.removeClass('delta_scroll_down');
                targets.addClass('delta_scroll_up');
            };

        });

    },
}

var RadioLike = {

    // RadioLike.set
    set : function(){
        var radios = $('.radio_like');
        if(!radios.length){return};

        radios.each(function(i){
            var radio = radios.eq(i);
            if(radio.attr('radioLike-done')){return};
            var items = radio.find('.radio_item');
            var className = radio.attr('radio-class') || 'on';

            items.on('click', function(){
                items.removeClass(className);
                $(this).addClass(className);
            });
            radio.attr('radioLike-done', true);
        });

    },

}

var BottomMiniAlert = {
    call : null,
    connect : null,
    receive : null,
    timer : 0,

    // BottomMiniAlert.bind
    bind : function(){
        var _this = this;
        // $(`[dimalert-call]`).on('click',function(){});
        Doc.on('click', '[dimalert-call]', function(){
            if(_this.receive){return};
            _this.call = $(this);
            _this.connect = _this.call.attr('dimalert-call');
            _this.receive = $("[dimalert-receive=" + _this.connect + "]");
            _this.receive.addClass('show');

            setTimeout(function(){
                _this.receive.removeClass('show');
                _this.receive = null;
            },1000);

        });
    },
};

var ParallaxImageBanner = {
    // ParallaxImageBanner.set
    set : function(){
        var banners = $('.banner_parallax');
        if(!banners.length){return};

        banners.each(function(i){
            var banner = banners.eq(i);
            if(banner.attr('parallaxImageBanner-done')){return};
            var image = banner.find('img');

            ACT_imageReady(image, function(){
                var bh = banner.height();
                var ih = image.height();
                if(bh >= ih){return};

                var st = banner.offset().top;
                var unit = (ih - bh) / 100;
                var percent = Wih + bh;

                Win.on('scroll', function(){
                    if(Dst > st - Wih && Dst < st + bh){
                        // image.css('transform',`translateY(-${unit * (Math.abs(st - Dst - Wih)) / percent * 100}px)`);
                        image.css('transform',"translateY(-" + unit * (Math.abs(st - Dst - Wih)) / percent * 100 + "px");
                    };
                });
            });

            banner.attr('parallaxImageBanner-done', true);

        });
    },
};

var ReviewStarPoint = {
    set : function(){
        var wraps = $('.review_point_input'),
            pixelRatio = window.devicePixelRatio;

        if(!wraps.length){return};

        wraps.each(function(idx){
            (function(j){
                var wrap = wraps.eq(j);
                if(wrap.attr('reviewStarPoint-done')){return};

                handleStarPoint(wrap);

                wrap.attr('reviewStarPoint-done',true);

            })(idx);
        });

        function handleStarPoint(wrap){

            var number = wrap.find("input[type='number']");
            var score = $('<span class="score"></span>');
            var max = +number.attr('max');
            var min = +number.attr('min');
            var list = $("\n<ul>\n " + (function () {
                var str = '';
                for (var i = 0; i < max; ++i) {
                    str += "<li></li>";
                }
                return str;
            })() + "\n</ul>\n");

            var lis = list.find('li');
            lis.width(100/max+'%');
            var liW = lis.width();

            score.width((number.val())*(100/max)+'%');
            wrap.append(list);
            wrap.append(score);

            var standard = 0;
            var now = 0;
            var ratio = 100/max;

            if(pixelRatio > 1){
                lis.on('touchstart', function(e){
                    handleGestureStart.call(this);
                });

                lis.on('touchmove' , function(e){
                    handleGestureMove.call(this);
                });
            }else{
                lis.on('click', function(e){
                    handleGestureStart.call(this);
                });
            }

            function handleGestureStart(){
                var idx = $(this).index() + 1;

                if(idx < min){return}
                number.val(idx);
                score.width((number.val())*ratio+'%');

                console.log(event.type);

                if (event.type === 'touchstart') {
                    standard = event.touches[0].pageX;
                }else{
                    standard = event.clientX;
                }
            }

            function handleGestureMove(){

                if(now >= liW && number.val() > min){
                    standard = standard - liW;
                    number.val(number.val()-1);
                    score.width(number.val()*ratio+'%');
                }else if(now <= -liW && number.val() < max){
                    standard = standard + liW;
                    number.val((+number.val())+1);
                    score.width(number.val()*ratio+'%');
                };

                console.log(event.type);

                now = standard - event.touches[0].pageX;
            }

        }
    }
};

var GoTop = {

    // GoTop.bind
    bind :function(){
        Doc.on('click', '.gotop', function(){
            Html.animate({
                scrollTop : 0
            },300);
        });
    }
}

var GotoTarget = {
    call : null,
    connect : null,
    receive : null,

    resetProp : function(){
        this.call = null;
        this.connect = null;
        this.receive = null;
    },

    // GotoTarget.bind
    bind : function(){
        var _this = this;
        Doc.on('click', '[goto-call]', function(){
            _this.call = $(this);
            _this.connect = _this.call.attr('goto-call');
            _this.receive = $("[goto-receive=" + _this.connect + "]");

            var $accordion = _this.receive.closest('[data-js=accordion]');

            if($accordion && !$accordion.find('[data-js=acc_panel]').is(':visible')){
                $accordion.find('[data-js=acc_anchor]').addClass('active');
                $accordion.find('[data-js=acc_panel]').show();
            }

            Html.stop(true).animate({
                scrollTop : _this.receive.offset().top - 50
            },300);
            _this.resetProp();
        });

        !$('.hotel_info').length && TabOnScroll.bind();
    },
}

// Activate tabs according to scroll position
var TabOnScroll = {
    call: null,
    connect: null,
    receive: $('[goto-receive]'),

    bind: function(){
        var _this = this;

        _this.receive.each(function(i){
            var $self = $(this);
            var ypos = $self.offset().top - 60;

            Win.on('scroll', function(){
                if(ypos<Dst){
                    _this.connect = $self.attr('goto-receive');
                    _this.call = $("[goto-call=" + _this.connect + "]");

                    $('[goto-call]').removeClass('on');
                    _this.call.addClass('on');
                }
            });

            Win.on('resize', function(){
                ypos = $self.offset().top - 60;
            });

        })
    }
}

var RadialMotion = {
    receive: $('[data-observer]'),

    set: function(){
        if(this.receive.length){
            var IO = new IntersectionObserver(function(entries){
                entries.forEach(function(entry){
                    if(entry.intersectionRatio >= 0.7){
                        var $target = $(entry.target).find('.p_list');
                        $target.addClass('active');

                        if($(entry.target).closest('.rewards').length){
                            var $target2 = $(entry.target).find('.ico_moa2');
                            $target2.length && $target2.addClass('on');
                        }
                    }
                });

            }, {
                root: null,
                threshold: [0.7]
            });

            var elements = [].slice.call(this.receive);

            elements.forEach(function(element){
                IO.observe(element);
            });
        }
    }
}

var RollingList = {

    // RollingList.set
    set : function(){
        var rollings = $('.rolling');
        if(!rollings.length){return};

        rollings.each(function(idx){
            var wrap = rollings.eq(idx);
            if(wrap.attr('rollingList-done')){return};
            var list = wrap.is('ul , ol') ? wrap : wrap.find('ul , ol');
            var items = list.find('li');
            var max = items.length;
            var count = 0;
            var itemHeight = items.height();

            setInterval(function(){
                items = list.find('li');
                var copy = items.eq(0).clone();
                list.append(copy);
                list.animate({
                    'margin-top' : -itemHeight,
                }, 300 , function(){
                    list.css('margin-top', 0);
                    items.eq(0).remove();
                });
                if(count >= max){
                    count = 0;
                }
                ++count;
            },3000);

            wrap.attr('rollingList-done', true);
        });
    },
}

var PaymentOption = {

    // PaymentOption.bind
    bind : function(){
        Doc.on('click','.opt_bar .opt_toggle', function(){
            var optionWrap = $(this).closest('.opt_bar');
            optionWrap.toggleClass('active');
        });
    },

    // PaymentOption.set
    set : function(){
        var optBar = $('.opt_bar');
        if(!optBar.length){return}
        var optWrap = optBar.find('.opt_wrap');
        var optArea = optBar.find('.opt_area');
        optArea.css('max-height', Math.floor(Wih/2) - 120);
    },

}

/*
 * Scroll Floating, Scroll Hash anchor Method
 * 작성일 : 2019.08.26
 * 수정일 : 2019.10.18
 * 작성자 : 이수연 과장
 */

// Scroll Function
$(window).on('scroll',floatingPosition);

// Scroll Floating Position Function
function floatingPosition(scrollCurrent){
  scrollCurrent = $(this).scrollTop();
  var floating = $('.quik_btn');

  if(scrollCurrent > 150){
    if($('.btn_wrap').length >= 1){
      floating.addClass('on on_btn');
    } else{
      floating.addClass('on');
      $('.right_btn.moving').length>0 && $('.right_btn.moving').addClass("active");
      $('.quik_btn .btn_back2').length>0 && $('.quick_plus').addClass("active");
    };
  } else {
    floating.removeClass('on');
    $('.right_btn.moving').length>0 && $('.right_btn.moving').removeClass("active");
    $('.quik_btn .btn_back2').length>0 && $('.quick_plus').removeClass("active");
  };
};

var IframeHeight = {

    // iframeHeight.set
    set : function($container){
        if( $container == undefined) {
            $container = $('.total_search .tab_cont.active iframe').eq(0);
        }
        var iframeArea = $($container);
        if(!iframeArea.length){return}

        iframeArea.attr('src', iframeArea.attr('src'));

        iframeArea.on('load', function(){
            var iframeContentWindow = $container.contentWindow;
            var height = $container.contents().height();
            var iframe_wrap = $container.contents().find('.r_iframe_wrap');
            var width = $('.wrap').width();

            iframe_wrap.css('width', width);
            iframeArea.css('height', height);

            console.log('height', height);
        });
    },
    resize: function(container){
        var iframeArea = $(container);
        var height = container.contents().find(".r_iframe_wrap").height();

        console.log('height', height);
        iframeArea.css('height', height)
    }
}

// --- control panel


/*
 * Search Module
 * 작성일 : 2019.09.25
 * 작성자 : 이수연 과장
 */
var SearchMethod = (function(){
    var basic = function($container){
        $container.each(function(){
            var evtTarget = $(this),
                evtTargetLable = evtTarget.attr('placeholder'),
                btn_remove = evtTarget.siblings('.btn_del2'),
                btn_search = evtTarget.siblings('.btn_search'),
                evtTargetCate;

                if(evtTarget.closest('.total_search').length){
                    return false
                }

                // Init
                evtTarget.attr('placeholder','')
                evtTarget.after('<label>'+ evtTargetLable +'</label>');

                // Input text에 카테고리가 있는 경우
                if(evtTarget.parent().hasClass('menu')){
                    evtTargetCate = evtTarget.siblings('.cate');
                    evtTarget.css('width','calc(100% - ' + (evtTargetCate.width() + 36) +'px)');
                    evtTarget.siblings('label').css('left',evtTargetCate.innerWidth() + 5).css('width','calc(100% - ' + (evtTargetCate.innerWidth() + 50) +'px)')
                };

                // Input text에 값이 있는 경우
                if(!evtTarget.val() == ""){
                    evtTarget.siblings('label').hide();
                } else{
                    btn_remove.hide();
                };

                // FocusIn
                evtTarget.on('focus', function(){
                    btn_remove.show();
                    $(this).siblings('label').hide();
                })

                // FocusOut
                evtTarget.on('blur', function(){
                    if(evtTarget.val() == ""){
                        $(this).siblings('label').show();
                        btn_remove.hide();
                        evtTarget.val('');
                    };
                })

                // Search Click Handler
                btn_search.on('click', function(){
                    console.log(evtTarget.val());
                });

                // Remove Handler
                btn_remove.on('click',function(){
                    $(this).siblings('label').show();
                    btn_remove.hide();
                    evtTarget.val('');
                });
        });
    },

    rolling = function($container, $delay, data){
        var ph_arr = [],
            i = 0, timer,
            evtTarget = $container,
            evtTargetCate,
            evtTargetLable = evtTarget.siblings('label'),
            btn_remove = evtTarget.siblings('.btn_del2');

        // 배열에 Placeholder 텍스트 Data 담기
        $.each(data,function(key,value) {
        	ph_arr.push(value);
        });

     	// Init
     	evtTarget.attr('placeholder','')
        evtTargetLable.text(ph_arr[0]);

        if(evtTarget.parent().hasClass('menu')){
            evtTargetCate = evtTarget.siblings('.cate');
        }

    	 // FocusIn
    	evtTarget.on('focus', function(){
            clearInterval(timer);
        })

      	// FocusOut
    	evtTarget.on('blur', function(){
            if(evtTarget.val() == ""){
                timer = setInterval(search_ani_interval, $delay);
            };
		})

        // Remove Handler
        btn_remove.on('click',function(){
            timer = setInterval(search_ani_interval, $delay);
        });

        var timer = setInterval(search_ani_interval, $delay);

        function search_ani_interval(){
            var aniStart = 10,
                animEnd = 0,
                aniDefault = -10;
            if(evtTarget.parent().hasClass('menu')){
                var aniStart = evtTargetCate.innerWidth() + 15,
                    animEnd = evtTargetCate.innerWidth() + 5,
                    aniDefault = evtTargetCate.innerWidth() - 10;
            }
            evtTargetLable.animate({
              left:aniDefault,
              opacity:0
            }, 1500, function(){
              if(i >= ph_arr.length-1){
                i = 0
              } else {
                i++
              }
              $(this).text(ph_arr[i]);
              $(this).css('left',aniStart).animate({
                opacity:1,
                left:animEnd
              }, 500);
            });
        };
    };
    return { basic : basic};
})();

/*
 * Scrap Import Module 추가
 * 작성일 : 2019.08.28
 * 작성자 : 이수연 과장
 */
var scrapImport = (function(){
    var module = function($container){
        var scrapSelect = $container,
            scrapInput = scrapSelect.find('input[type=checkbox]'),
            _this, title, chkId, create_btn, limited=3, selected_cnt=0;

        if(!$container.length) return false;

        scrapInput.on('change',function(){
            _this = $(this),
            title = _this.siblings('.tit').text(),
            chkId = _this.attr('id'),
            create_btn = '<button type="button" name="button" class="btn_ico del" data-receive='+chkId+'><span>'+ title +'</span></button>';

            // 체크박스를 선택할 때 Select List의 존재 여부를 확인 / 없으면 그려준다. /있으면 체크박스 타이틀 버튼이 추가된다.
            if(scrapSelect.find('.select_list').find('button').length <= 1 && scrapInput.is(':checked') == false){
                // 모든 체크박스가 해제되었을 때 Select List의 존재 여부를 확인 / 있으면 지워준다.
                create_btn = '';
                scrapSelect.find('.select_list').remove();
                selected_cnt--;
                // console.log('마지막 선택 해제');
            } else {
                if(scrapSelect.find('.select_list').length < 1){
                    scrapSelect.append('<div class="select_list tscroll"><div class=""></div></div>');
                    scrapSelect.find('.select_list').children('div').children('button').remove();
                    scrapSelect.find('.select_list').children('div').append(create_btn);
                    selected_cnt++;
                    // console.log('처음 선택 설정');
                } else {
                    // 해당 체크박스의 체크가 해제되면 같은 키워드 삭제한다.
                    if(_this.is(':checked') == false){
                        scrapSelect.find('.select_list').find('button[data-receive='+chkId+']').remove();
                        selected_cnt--;
                        // console.log('두번째부터 선택 해제');
                    } else {
                        if(selected_cnt >= limited){
                            _this.prop('checked', false);
                            _this.closest('label').removeClass('checked');
                            selected_cnt = limited;
                            return false;
                        }else{
                            scrapSelect.find('.select_list').children('div').find('button[data-receive='+chkId+']').remove();
                            scrapSelect.find('.select_list').children('div').append(create_btn);
                            selected_cnt++;
                            // console.log('두번째부터 선택 설정');
                        }
                    };
                };
            };
        });

        Doc.on('keyup', 'input[type=search]', function(){
            $(this).val().length ? $('.auto_sch').css('display','block') : $('.auto_sch').css('display','none');
            $(this).val().length ? $('.auto_sch').next().css('display','none') : $('.auto_sch').next().css('display','block');
        })

        Doc.on('click', '.sch_input .btn_del2', function(){
            $('.auto_sch').css('display', 'none');
            $('.auto_sch').next().css('display','block');
        })

        Doc.on('click', '.sch_city_list.recent .btn_del', function(){
            var _this = $(this);
            var _checkbox = _this.closest('li').find('input[type=checkbox]');
            var _chkId = _checkbox.attr('id');

            if(_checkbox.is(':checked')){
                scrapSelect.find('.select_list').find('button[data-receive='+_chkId+']').remove();
                _checkbox.prop('checked', false);
                _checkbox.closest('label').removeClass('checked');
                selected_cnt--;
            }
            console.log('selected_cnt', selected_cnt);
        });

        Doc.on('click', '.select_list button', function(){
            var inputChk = '#' + $(this).attr('data-receive');

            $(inputChk).attr('checked',false)
            $(inputChk).parent('label').removeClass('checked');
            $(this).remove();
            selected_cnt--;

            if($(this).siblings().length == 0){
                $(this).closest('.select_list').remove();
            }
        });
    }
    return { module : module};
})();

/*
 * Sortable Module, Mobule Item 추가
 * 작성일 : 2019.08.28
 * 작성자 : 이수연 과장
 */
/* global $, Sortable Module */
var sortable = (function(){
    var module = function ($container, $handle, option){
      // Sortable Function
      var nestedSortables = [].slice.call($container);
      for (var i = 0; i < nestedSortables.length; i++) {
        var config = {
            group:{
              name : 'shared'
            },
            animation: 150,
            easing: "cubic-bezier(1, 0, 0, 1)",
            fallbackOnBody: true,
            swapThreshold: 0.65,
            handle: $handle,
            delay: 100,
            ghostClass: 'sortable-background-class'
        }  
        var settings = option ? $.extend({}, config, option) : config;
        new Sortable(nestedSortables[i], settings);
      }
    }
    return { module : module};
}());

var mapToggleFn = (function(){
    var bStartEvent = false,
        nMoveType = -1,
        htTouchInfo = { //touchstart 시점의 좌표와 시간을 저장하기
            nStartX : -1,
            nStartY : -1,
            nStartTime : 0
        },
        $document, firstY, moveY, direction,
        $map = $('.map_wrap'),
        $price = $('.marker', $map),

        //수평 방향을 판단하는 기준 기울기
        nHSlope = ((window.innerHeight / 2) / window.innerWidth).toFixed(2) * 1;

    function initTouchInfo() { //터치 정보들의 값을 초기화하는 함수
        htTouchInfo.nStartX = -1;
        htTouchInfo.nStartY = -1;
        htTouchInfo.nStartTime = 0;
    }

    //touchstart 좌표값과 비교하여 현재 사용자의 움직임을 판단하는 함수
    function getMoveType(x, y) {
        //0은 수평방향, 1은 수직방향
        var nMoveType = -1;

        var nX = Math.abs(htTouchInfo.nStartX - x);
        var nY = Math.abs(htTouchInfo.nStartY - y);
        var nDis = nX + nY;
        //현재 움직인 거리가 기준 거리보다 작을 땐 방향을 판단하지 않는다.
        if(nDis < 25) { return nMoveType }

        var nSlope = parseFloat((nY / nX).toFixed(2), 10);

        if(nSlope > nHSlope) {
            nMoveType = 1;
        } else {
            nMoveType = 0;
        }

        return nMoveType;
    }

    function getDevice(){
        var check = false;
        (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    return {
        init: function(){
            $document = $(document);

            if (getDevice()){
                $document.bind( 'touchstart', this.onTouchStart.bind(this) );
                $price.bind('click', function(){
                    !$map.hasClass('open') && $map.addClass('open');
                })
            }
        },

        onTouchStart: function(e){
            // console.log( 'touchstart', e );

            initTouchInfo(); //터치 정보를 초기화한다.
            nMoveType = -1; //이전 터치에 대해 분석한 움직임의 방향도 초기화한다.

            htTouchInfo.nStartX = e.originalEvent.changedTouches[0].pageX;
            htTouchInfo.nStartY = e.originalEvent.changedTouches[0].pageY;
            htTouchInfo.nStartTime = e.originalEvent.timeStamp;
            bStartEvent = true;

            var touches;
            touches = e.originalEvent.touches[0];
            firstY = e.originalEvent.touches[0].pageY;
            this.bindEvents();
        },

        onTouchMove: function(e){
            if(!bStartEvent) {
                return
            }
            var nX = e.originalEvent.changedTouches[0].pageX;
            var nY = e.originalEvent.changedTouches[0].pageY;

            //현재 touchmMove에서 사용자 터치에 대한 움직임을 판단한다.
            nMoveType = getMoveType(nX, nY);

            if(nMoveType === 1){
                if (getDevice()) moveY = e.originalEvent.touches[0].pageY;
                var diff = Math.abs(moveY - firstY);
                firstY > moveY ? direction = 'UP' : direction = 'DOWN';

                direction === 'UP' && console.log('touch up--------');
                (direction === 'DOWN' && diff > 30) && $map.removeClass('open');
            }
        },

        onTouchEnd: function(e){
            if(!bStartEvent) {
                return
            }

            if(nMoveType < 0) {
                var nX = e.originalEvent.changedTouches[0].pageX;
                var nY = e.originalEvent.changedTouches[0].pageY;
                nMoveType = getMoveType(nX, nY);
            }

            bStartEvent = false;
            nMoveType = -1; //분석한 움직임의 방향도 초기화한다.
            initTouchInfo(); //터치 정보를 초기화한다.

            firstY = null;
            moveY = null;
        },

        bindEvents: function(){
            if (getDevice()){
                $document.bind( 'touchmove', this.onTouchMove );
                $document.bind( 'touchend', this.onTouchEnd );
            }
        },
        unbindEvents: function(){
            if (getDevice()){
                $document.unbind( 'touchmove', this.onTouchMove );
                $document.unbind( 'touchend', this.onTouchEnd );
            }
        }
    }
}());

/* 스크롤 페이드 모션 */
var scrollFadeMotion = (function(){
    var init = function(container){

        var $container = $(container);
        var $title = $container.find('.today_box');
        var $scrollList = $container.find('.today_list .ul_size');
        var limit = 0.008;

        $scrollList.on('scroll', function(){
            var scrollLeft = $(this).scrollLeft();
            var sensitivity = scrollLeft*limit;

            $title.css('opacity', 1-sensitivity);
        })
    }

    return {
        init: init
    }
}());

/* 앱 대응 Grid 수정 */
var addAppGrid = (function(){
    var appEl = '.ios',
        isHeader = false,
        headerHeight,
        dataNative = '[data-native]';

    var init = function(target){

        dataNative = target || '[data-native]';

        // console.log('$(dataNative)', $(dataNative));

        $(dataNative).length && $(dataNative).each(function(){
            var _target = $(this);
            var _isPopup = _target.closest('.popup, .ajax_layer, .ifrm_pop').length;

            /* 팝업 적용 */
            _isPopup && setPopup(_target);

            /* 페이지 적용 */
            !_isPopup && setPages(_target);
        });
    }

    /* 팝업 설정 */
    var setPopup = function(target){
        var data = getDataHeight();
        var targetEl =  target;
        var isStatus = targetEl[0].dataset.native == 'status';
        var styled = targetEl.length && getComputedStyle(targetEl[0]);

        if(isStatus){
            // .popup에 적용
            targetEl.hasClass('popup') && targetEl.css('padding-top', data._statusHeight+'px');
            
            // .head에 적용
            if(targetEl.hasClass('head') || targetEl.hasClass('sticky_step1')){
                var paddingVal = parseInt(targetEl.css('padding-top'));
                styled.position == 'absolute' ? targetEl.css('top', data._statusHeight+'px') : targetEl.css('padding-top', (paddingVal+data._statusHeight)+'px');

            } 
        }

        console.log('PopUp');
    }

    /* 페이지 설정 */
    var setPages = function(target){
        var data = getDataHeight();
        var targetEl =  target;
        var isGnbSticky = targetEl[0].dataset.native == 'gnbsticky';
        var isStatus = targetEl[0].dataset.native == 'status';
        var isFixed = targetEl.is('[class*=fixed_]');
        var isSticky = targetEl.is('[class*=sticky_]') || getComputedStyle(targetEl[0]).position == 'sticky' || getComputedStyle(targetEl[0]).position == '-webkit-sticky';

        // if(targetEl[0].nodeName === 'HEADER'){
        //     isHeader = true;
        //     headerHeight = parseInt($('header').height());
        // }

        if($('header').length){
            headerHeight = parseInt($('header').height());
        }

        // Gnb가 있는 경우
        if(isGnbSticky){
            // 메인 fixed_step2 요소에 적용
            isFixed && targetEl.css('top', data._gnbStickyHeight+'px');

            // 서브메인 Sticky Header에 적용
            if(isSticky){
                targetEl.css('top', data._gnbStickyHeight+'px');
            }

            // 서브메인에 fixed_step3 요소에 적용
            if(isFixed && targetEl.hasClass('fixed_step3')){
                var fixedTop = data._gnbStickyHeight + headerHeight;
                targetEl.css('top', fixedTop+'px');
            }
        }

        // Gnb가 없는 full팝업, 서브페이지
        if(isStatus){
            // 서브페이지 Sticky Header에 적용
            // if(isHeader && isSticky){
            //     targetEl.css('top', data._statusHeight+'px');
            // }

            // 서브페이지 sticky_step2 요소에 적용
            if(isSticky && targetEl.hasClass('sticky_step2')){
                var fixedTop = data._statusHeight + headerHeight;
                targetEl.css('top', fixedTop+'px');
            }

            // 서브페이지 fixed_step2 요소에 적용
            if(isFixed && targetEl.hasClass('fixed_step2')){
                var fixedTop = data._statusHeight + headerHeight;
                targetEl.css('top', fixedTop+'px');
            }
        }

        console.log('Pages');
    }

    /* data- 높이값 가져오기 */
    var getDataHeight = function(){
        var _statusHeight = parseInt($(appEl)[0].dataset.status);
        var _gnbHeight = parseInt($(appEl)[0].dataset.gnbheight);
        var _gnbStickyHeight = parseInt($(appEl)[0].dataset.gnbstickyheight);

        return {
            _statusHeight: _statusHeight,
            _gnbHeight: _gnbHeight,
            _gnbStickyHeight: _gnbStickyHeight
        }
    }

    return {
        init: init
    }

}());

var popMessage = (function(){
    var message = '.fnb_message';

    return {
        show: function(){
			$(message).length && $(message).addClass('show');

			setTimeout(function(){
				$(message).hasClass('show') && $(message).removeClass('show');
			}, 2000)
        }
    }

}());

/* 최신여행에세이 Swiper */
var newCarousel = (function(){

    return {
        init : function(){

            var nav = $('.navCarousel .swiper-slide a');
            var navCarousel = new Swiper('.navCarousel', {
                slidesPerView: 'auto',
                wrapperClass: 'navs',
                slideClass: 'swiper-slide',
                pagination: false,
                setWrapperSize: true,
                loop: false
            });

            var navContainer = new Swiper('.navContainer', {
                slideClass: 'tab_cont',
                spaceBetween: 0,
                loop: false,
                pagination: false,
                lazy : {
                    loadOnTransitionStart : true,
                    loadPrevNext : true
                },
                on: {
                    slideChange: function () {
                        var idx = this.activeIndex;
                        setNavIdx( navCarousel, idx )
                    }
                }
            });


            function setNavIdx( swiper, num ) {
                nav.removeClass('on').parent().eq( num ).find('a').addClass('on');
                swiper.slideTo( num , 300);
            }

            nav.on({
                'click' : function(){
                    var idx = $(this).parent().index();
                    setNavIdx( navContainer, idx );
                }
            })
        }
    }
}());

var fn_goScrollTop = (function(){
    var inputArr = ['.wrap input[type=text]', '.wrap textarea', '.popup.s_main input[type=search]'],
        ua = window.navigator.userAgent.toLowerCase(),
        ypos = 0,
        ios = /iphone|ipod|ipad/.test(ua);

    function init(){
        inputArr.forEach(function(input){
            if($('.ios').length && $(input).length){
                $(input).bind('focus', function(){
                    ypos = $(window).scrollTop();
                    console.log('ypos', ypos);
                });
                $(input).bind('blur', function(){
                    $(window).scrollTop(ypos);
                });
            }
        });    
    }

    return {
        init: init
    }
}());

// --- control panel

// 페이지에서 기본적으로 사용할 요소들을 추가하고, 정의
var READY_beforeSet = function(){

    SET_beforeMounted(); // 공통적으로 사용할 $객체 변수화 1 (주로 마크업된 element)

    SET_appendElements(); // 공통적으로 사용할 element document에 추가

    SET_globalSizeValue(); // 공통적으로 사용할 값 변수화

    SET_afterMounted(); // 공통적으로 사용할 $객체 변수화 2 (주로 동적 추가된 element)

    SET_commonActions(); // 기본적으로 사용할 액션 정리

};


// 페이지에서 필요한 기능들 단위 리스트
var READY_customSet = function() {

    // NOTE: 190724 노트
    // 1. 일반 이벤트바인딩을 전부 document 하위 셀렉터에게 주는것으로 교체했습니다.
    // 2. 구성 해주는 함수 (ex : SET_slider 로드시 실행하여 슬라이드를 구성) 들의 함수를 ajax등의 이유로 다시 실행해도,
    //    기존에 이미 구성된 요소를 무시하게 수정하여 중복으로 처리하지 않고 새로운 요소에 대해서만 구성합니다.

    // NOTE: 190729 노트
    // 1. 기존 SET_.. 으로 통합된 기능을 분리해서 크게 bind, set으로 나눴습니다.
    //    bind는 document에 거는것으로 이 함수내에서 한번만 실행하고, set은 ajax를 통해서 해당 기능을 불러올때마다 같이 실행해주셔야합니다.

	SET_existing(); //기존에 가져와서 사용한 코드들 (현재 아코디언 관련)

    ModalPopup.bind(); //모달 팝업 설정
    ModalPopup.set();

	Popup.bind(); //팝업이 있는 페이지에 팝업 기능 추가
    Popup.set();

    Tooltip.bind(); //툴팁 버튼을 누르면 툴팁 표시 및 닫기 설정
    Tooltip.set();

    OptionSelect.bind(); //하단에서 올라오는옵션 셀렉트 창 설정

    BottomMiniAlert.bind();// 하단에서 조건부로 보이는 작은 alert창 설정

	Sliders.set(); //slick기반 슬라이더 구성

    SnsButton.bind();//공유 버튼을 누르면 공유 목록 표시. 및 닫기
    // SnsButton.set()

	CheckboxLike.set(); // input이 checked되면 감싼 label에 클래스주는 기능

    InputPlaceholder.bind(); // input type이 date, time인경우 placeholder 표시관련 기능

    //항공일 때는 화면 진입 시 foldarea bind 안 함
    if(!document.getElementById("fCateCd")){
		FoldArea.bind();// 긴 컨텐츠를 접고, 이후 펼칠수 있는 컨텐츠의 UI구성
		FoldArea.set();
    }

	TabArea.bind(); // 탭 UI를 구성.
    // TabArea.set();

	// HideScrollbar.set(); //대상의 스크롤바를 가리는 기능 부여 (아이폰 한정 => 현재 전체적용) //잠정폐지

	ReviewProduct.set(); //review화면에서 사용되는옵션. (지금은 zoom버튼 스크롤 기능만)

	ReviewUser.bind(); //사용자가 남긴 긴 말줄임 리뷰 펼치기 기능

	// HalfList.set(); // 왼쪽,오른쪽의 세로 길이가 동일한 ui구성시 사용 //잠정 폐지

	// 아코디언 기능은 기본적으로 SET_existing에 들어있는 accordion을 사용하되 일부는 제작
	TicketResult.set(); // 티겟 화면에서의 아코디언 기능
	RankingButton.set(); // 인기 검색어의 아코디언 기능

    FixedSticky.set(); // fixed_ 클래스를 sticky처럼 보이게 하는 기능
    FixedStickyReverse.set();

	FilterButton.set();

	ClassHandlr.bind(); // 선택한 셀렉터들에게 클래스 추가, 제거, 토글하는 기능들 부여

	ScrollCorrection.first(); // 선택한 셀렉터들에게 스크롤 보정을 추가함(IOS 스크롤 버벅임 관련)

    ScrollDeltaChange.bind(); // 스크롤방향이 위 아래인지 감지하고 타겟에게 up, down클래스 부여

    RadioLike.set(); // 대상에게 radio버튼같은 속성을 부여 (on 클래스 조절)

    ParallaxImageBanner.set();// 페럴렉스 배너 제작

    ReviewStarPoint.set(); // 사용자에게서 별점 입력받는 인풋 제작

    GoTop.bind() // 타겟을 누르면 문서 스크롤을 0으로 이동

    GotoTarget.bind() //call을 누르면 receive의 위치로 이동

    RollingList.set(); // 시간에따라 롤링되는 타겟 제작

    // NOTE: 190725 라랭팩 추가...

    PaymentOption.bind(); // 결제 정보가 아래에서 슉 나오는 기능
    PaymentOption.set();

    SearchMethod.basic($('.sch_input').find('input[type=search]'));
    
    // scrapImport.module($('[data-area="city"]'));
    // scrapImport.module($('.tab_wrap[data-area="city2"]'));

    // IOS Statusbar 대응
    $('.app.ios').length && addAppGrid.init();

    //최신여행에세이 Swiper
    if($('.navCarousel').length){
		var agent = navigator.userAgent.toLowerCase();
        if((navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)){// ie일 경우	
			$('.navContainer .tab_cont').hide();
			$('.navContainer .tab_cont:first-child').show();
			$('.navCarousel .swiper-wrapper.navs li').on('click',function(e){
				$('.navCarousel .swiper-wrapper.navs li a').removeClass('on');
				$(this).find('a').addClass('on');
				$('.navContainer .tab_cont').hide();
				var idx=$(this).index();
				$('.navContainer .tab_cont').eq(idx).show();
                e.preventDefault();                
                var $images = $('.wrap .swiper-lazy');
                $images.length && $images.lazyload();     // lazyload 적용            
			});
            var $images = $('.wrap .swiper-lazy');
            $images.length && $images.lazyload();     // lazyload 적용            
    }else{// ie가 아닌 경우			 
			newCarousel.init();
		}
	}

    var $images = $('.wrap .ajax_lazy');
    $images.length && $images.lazyload();     // lazyload 적용
    
    scrollFadeMotion.init('.today_benefit');

    IframeHeight.set();
    RadialMotion.set();
    // InfinityScroll.set();

    fn_goScrollTop.init();

    var safeAreaInsetBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab"));
    if(safeAreaInsetBottom > 0){
        $('.wrap').addClass('iphonex');
    }
};

// 페이지 로드 마지막 단계 기능 리스트
var READY_afterSet = function(){

    PreventDefaultHyperLink.set(); // href가 #인 a태그들의 기본 이벤트를 제거.

    EndAction.act();// 마지막에 실행해줄 액션 모음

    Win.trigger('scroll');// 설정 완료후 scroll 한번 실행
    Win.trigger('resize');// 설정 완료후 resize 한번 실행

	// setTimeout(function(){Body.css('opacity',1)},1) // body의 opacity를 0에서 1로 비동기로 변경하면서 화면 표시 (스크립트로 화면 조정하는것 로드시 화면 정돈 안된것 잠시 보이게 되는 것 보정)

};

var DOMreadyInit = function(){
    READY_beforeSet(); // 페이지에서 기본적으로 사용할 요소들을 추가하고, 정의
    READY_customSet(); // 페이지에서 필요한 기능들 단위 리스트
    READY_afterSet(); // 페이지 로드 마지막 단계 기능 리스트
};

$(document).ready(DOMreadyInit);

var LALANG_ajaxActions = function(){
    // NOTE: 190729 : 노트
    //      ajax시 실행할 하나의 함수묶음입니다.

    // TabArea.set();
    PreventDefaultHyperLink.set();
    HideScrollbar.set();
    CheckboxLike.set();
    TicketResult.set();
    RankingButton.set();
    FoldArea.set();
    // HalfList.set();
    Sliders.set();
    FixedSticky.set();
    FilterButton.set();
    RadioLike.set();
    ParallaxImageBanner.set();
    ReviewStarPoint.set();
    RollingList.set();
    PaymentOption.set();
    // Popup.set();
    SET_existing();
    InfinityScroll.set();
    Tooltip.bind(); //툴팁 버튼을 누르면 툴팁 표시 및 닫기 설정
    Tooltip.set();
    EndAction.act()
};

$(document).on('ready', function(e){
    /*
    * Star Rating Module
    * 작성일 : 2019.09.09
    * 작성자 : 이수연 과장
    */
	$('.review_rating_wrap input[type=checkbox]').on('click', function(e){
        $('.review_rating_wrap input[type=checkbox] + label').off();
        $(this).prop('checked', true);
		if(!$(this).is(':checked')){
			$(this).nextAll('input[type=checkbox]').prop('checked', false);
		} else {
			$(this).nextAll('input[type=checkbox]').prop('checked', false);
			$(this).prevAll('input[type=checkbox]').prop('checked', true);
		}
	});
	$('.review_rating_wrap input[type=checkbox] + label').on('mouseover', function(e){
        $(this).prev().prop('checked', true);
		if(!$(this).prev().is(':checked')){
			$(this).prev().nextAll('input[type=checkbox]').prop('checked', false);
		} else {
			$(this).prev().nextAll('input[type=checkbox]').prop('checked', false);
			$(this).prev().prevAll('input[type=checkbox]').prop('checked', true);
		}
	});
	$('.review_rating_wrap').on('touchmove',function(event){
		var e = event.originalEvent,
			moveTouchX = e.targetTouches[0].pageX,
			startPositionX = $(this).offset().left,
			arr = [],
            labelWidth = $('.review_rating_wrap input[type=checkbox] + label').width();

		$.each($('.review_rating_wrap input[type=checkbox]'),function(index, item){
            arr.push(Math.floor($(item).offset().left));
            console.log('call here..');
		})
		for(var i = 0; i < arr.length; i++){
			if(moveTouchX > arr[i]  && moveTouchX < arr[i] + labelWidth){
				$(this).find('input[type=checkbox]').eq(i).trigger('click');
			}
		}
	});
    $('.review_rating_wrap').on('touchend',function(){
        console.log('터치 아웃');
    });

    Doc.on('click','a', function(e){
        var hash = this.hash,
            scroll_wrap;

        if(hash == "#top"){
            scroll_wrap = Html;
            hash_top = 0;
            scroll_wrap.animate({
                scrollTop: hash_top
            }, 'fast');
            e.preventDefault();
        };

        if($(this).hasClass('btn_plus')){
            var $quickPlus = $(this).closest('.quick_plus');
            if($quickPlus.hasClass('open')){
                $quickPlus.removeClass('open');
                ACT_dimdOff();
            }else{
                $quickPlus.addClass('open');
                ACT_dimdOn();
            }

            SUB_dimdOff(function(){
                $('.quick_plus').removeClass('open');
            });
        }
    });
});
