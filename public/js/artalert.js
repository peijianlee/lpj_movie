(function($){
	$.extend({
		publicStyle: {
			popupBgStyle: {
				backgroundColor: 'rgba(0,0,0,.5)',
				position: 'fixed',
				top: '0',
				left: '0',
				display: 'none',
				width: '100%',
				height: '100%',
				zIndex: '2010'
			}
		},
		artConfim: function (value, frameClass, lang, fn) {
			var eleBg = $('<div></div>').css(this.publicStyle.popupBgStyle).addClass('artconfirm_bg artconfirm_close')
			$('body').append(eleBg)
			$('.artconfirm_bg').fadeIn(300)
			var langArr = lang === 'zh_cn' ? ['提示框', '确定', '取消'] : ['Tip frame', 'Sure', 'Cancel']
			var eleFrame = $('<div><h6><i class="icon-info-sign mr10"></i>' 
				+ langArr[0] 
				+ '</h6><p>' 
				+ value 
				+ '</p><div class="frameFooter"><span>' 
				+ langArr[1] 
				+ '</span><span class="artconfirm_close">' 
				+ langArr[2] 
				+ '</span></div></div>').addClass(frameClass)
			$('body').append(eleFrame)
			$('.frameFooter span').click(function(){
				$('.'+frameClass + ', .artconfirm_bg').fadeOut( function(event){
					$(this).remove()
				})
				fn($(this).index())
			})
		},
		artTip: function (value, time) {
			var $body = $('body')
			$body.append('<div class="arttipbg"></div><div class="arttip">'+
				value+'</div>')
			$('.arttipbg').fadeIn('200')
			$('.arttip').animate({'opacity':1,'bottom':'40%'},500)
			if (time) {
				var autoTimeOut = setTimeout(function () {
					$.closeArtTip(null, 10)
				}, time)
			}
		},
		closeArtTip: function (value, closetime, fn) {
			if(value) $('.arttip').html(value)
			var closetime = closetime || 2000
			var timeOut = setTimeout(function(){
				$('.arttipbg').fadeIn('200',function(){
					$(this).remove()
				})
				$('.arttip').animate({'opacity':0,'bottom':'30%'},400,function(){
					$(this).remove()
				})
			}, closetime)
		},
		artAlert: function ( value, frameClass, lang, url, time ) {
			var artalert_close_enter = true
			var artalertBg = $('<div></div>').css( this.publicStyle.popupBgStyle ).addClass('artalert_bg artalert_close')
			$('body').append(artalertBg)
			$('.artalert_bg').fadeIn()
			var langArr = lang === 'zh_cn' ? ['信息提示框', '确定'] : ['tip frame', 'sure']
			var eleFrame = $('<div><h6><i class="icon-info-sign mr10"></i>' 
				+ langArr[0] 
				+ '</h6><p>' 
				+ value 
				+ '</p><div class="frameFooter"><span id="artAlertBtn" class="artalert_close">' 
				+ langArr[1] 
				+ '</span></div></div>').addClass(frameClass)
			$('body').append(eleFrame)
			$( '.' + frameClass ).animate({'opacity':1,'top':50},300)
			document.onkeydown = function (event) {
				var e = event || window.event || arguments.callee.caller.arguments[0];
				if (e && e.keyCode === 13) {
					if (artalert_close_enter) {
						$('.artalert_close:first').click();
						artalert_close_enter = false
						return false
					}
				}
			}
			$('.artalert_close').click(function(){
				$('.artalert_bg').fadeOut(300,function(){
					$(this).remove()
				})
				$('.' + frameClass).animate({'opacity':0,'top':'-10%'},300,function(){
					$(this).remove()
					location.href= url ? url : '/'
				})
			})
			if (time) {
				var artAlertBtn = document.getElementById('artAlertBtn'),
					closetime = time
				artAlertBtn.innerHTML = langArr[1] + ' ' + closetime
				function remainTime() {
					if (closetime === 0) $('.artalert_close').click()
					artAlertBtn.innerHTML = langArr[1] + ' ' + closetime--
					setTimeout(remainTime, 1000)
				}
				remainTime()
			}
		},
		/*--
			dom为数组,[0]为单选,[1]为全选,[2]为单选的父级
			event判断是否是全选的checkbox
		--*/
		checkBoxSelect: function (dom, fn) {
			CheckBox()
			$(dom[0] + ',' +dom[4]).bind({
				"click": function() { CheckBox() }
			})
			$(dom[1]).bind({
				"click": function(event) { CheckBox(event) }
			})
			function CheckBox (type) {
				var selectInfo = {
					sid: [],
					stitle: []
				}
				var allSelect = true
				$(dom[2]).each(function () {
					var checkBox = $(this).find('input[type="checkbox"]'),
						sid = $(this).attr('id'),
						stitle = $(this).attr('stitle')
					if (typeof type === 'object') {
						var isAllSelect = $(type.target).is(':checked')
						if (isAllSelect) {
							selectInfo.sid.push(sid)
							selectInfo.stitle.push(stitle)
							checkBox.prop('checked', isAllSelect)
						} else {
							checkBox.prop('checked', isAllSelect)
							allSelect = false
						}
					} else {
						if (checkBox.is(':checked')) {
							selectInfo.sid.push($(this).attr('id'))
							selectInfo.stitle.push($(this).attr('stitle'))
						} else {
							allSelect = false
						}
					}
				})
				$(dom[1]).prop('checked', allSelect)
				$(dom[3]).text(selectInfo.sid.length)
				return fn(selectInfo)
			}
		},
		vtLazyload: function() {
			//- lazyload https://zhuanlan.zhihu.com/p/24057749?refer=dreawer
			var n = 0,
				img = $(arguments[0])
				imgNum = img.length
			function Lazyload (event) {
				for (var i = n; i < imgNum; i++) {
					if (img.eq(i).offset().top < parseInt($(window).height()) + parseInt($(window).scrollTop())) {
						var src = img.eq(i).attr('data-src')
						img.eq(i).attr('src', src).removeAttr('data-src')
						n = i + 1
					}
				}
			}
			Lazyload()
			function Throttle(fun, delay, time) {
			    var timeout,
			        startTime = new Date()
			    return function() {
			        var context = this,
			            args = arguments,
			            curTime = new Date()
			        clearTimeout(timeout)
			        // 如果达到了规定的触发时间间隔，触发 handler
			        if (curTime - startTime >= time) {
			            fun.apply(context, args)
			            startTime = curTime
			            // 没达到触发间隔，重新设定定时器
			        } else {
			            timeout = setTimeout(fun, delay)
			        }
			    }
			}
			window.addEventListener('scroll', Throttle(Lazyload, arguments[1], arguments[2]))
		}
	})
}(jQuery))