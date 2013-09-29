var speedSlider  = 500;     // скорость смены слайда на главной странице
var periodSlider = 5000;    // период автоматической смены слайда на главной страницы ("0" - автоматическая смена отключена)

var speedScroll  = 500;     // скорость скроллинга по форме заказа

var timerSlider = null;

var availableCities = [
    'Москва',
    'Санкт-Петербург',
    'Волгоград',
    'Воронеж',
    'Иваново',
    'Калининград',
    'Калуга',
    'Нижний Новгород',
    'Хабаровск'
];

(function($) {

    $(document).ready(function() {

        // слайдер
        $('.slider').each(function() {
            var curSlider = $(this);
            curSlider.data('curIndex', 0);
            curSlider.data('disableAnimation', true);
            var curSize = curSlider.find('ul li').length;
            var ctrlHTML = '';
            for (var i = 0; i < curSize; i++) {
                ctrlHTML += '<a href="#"></a>';
            }
            curSlider.find('.slider-ctrl').html(ctrlHTML);
            curSlider.find('.slider-ctrl a:first').addClass('active');
            curSlider.find('.slider-ctrl a').click(function() {
                window.clearTimeout(timerSlider);
                timerSlider = null;

                var curSlider = $(this).parents().filter('.slider');
                if (curSlider.data('disableAnimation')) {
                    var curIndex = curSlider.data('curIndex');
                    var newIndex = curSlider.find('.slider-ctrl a').index($(this));

                    curSlider.data('curIndex', newIndex);
                    curSlider.data('disableAnimation', false);
                    curSlider.find('.slider-ctrl a.active').removeClass('active');
                    curSlider.find('.slider-ctrl a').eq(newIndex).addClass('active');
                    curSlider.find('ul li').eq(curIndex).fadeOut(speedSlider, function() {
                        curSlider.find('ul li').eq(newIndex).fadeIn(speedSlider, function() {
                            curSlider.data('disableAnimation', true);
                            if (periodSlider > 0) {
                                timerSlider = window.setTimeout(sliderNext, periodSlider);
                            }
                        });
                    });
                }

                return false;
            });
            if (periodSlider > 0) {
                timerSlider = window.setTimeout(sliderNext, periodSlider);
            }
        });

        // корректировка фотографий для поддержки старых браузеров
        $('.consultant-photo').each(function() {
            $(this).css({'background': 'url(' + $(this).find('img').attr('src') + ')'});
            $(this).find('img').hide();
        });

        // пример открытия окна при нажатии на "В корзину"
        $('.catalogue-item-buy a').live('click', function() {
            var curLink = $(this);
            var curItem = curLink.parent().parent().parent();
            if (curLink.hasClass('incart')) { // если повторное добавление текущего товара в корзину
                $('.header-cart-summ span').html(Number($('.header-cart-summ span').html()) + Number(curItem.find('.catalogue-item-price span').html()));
            } else { // если первое добавление текущего товара в корзину
                var curText = curLink.attr('rel');
                curLink.attr('rel', curLink.html());
                curLink.html(curText);
                curLink.addClass('incart');
                if ($('.window').length == 0) {
                    windowOpen($('.incart-window').html());
                }
                if ($('.header-cart-summ').length == 1) {
                    $('.header-cart-summ span').html(Number($('.header-cart-summ span').html()) + Number(curItem.find('.catalogue-item-price span').html()));
                    $('.header-cart-link span').html(Number($('.header-cart-link span').html()) + 1);
                } else {
                    $('.header-cart-link a').html('Корзина');
                    $('.header-cart-link').append(' <strong>(<span>1</span>)</strong>');
                    $('.header-cart-link').after('<div class="header-cart-summ"><span>' + curItem.find('.catalogue-item-price span').html() + '</span> руб.</div>');
                }
            }
            return false;
        });

        // раскрытие корзины
        $('.header-cart-full').hover(
            function() {
                $('.header-cart-content').stop().show().css({'top': 114, 'opacity': .5}).animate({'top': 64, 'opacity': 1}, 300);
                return false;
            },

            function() {
                $('.header-cart-content').stop().hide();
                return false;
            }
        );

        // выбор количества в корзине
        $('.cart-count-select div').click(function() {
            if (!$(this).parent().hasClass('cart-count-select-disabled')) {
                $('.cart-count-select-open').removeClass('cart-count-select-open');
                $(this).parent().addClass('cart-count-select-open');
            }
        });

        $('.cart-count-select ul li').click(function() {
            var curOption = $(this);
            var curSelect = curOption.parent().parent();
            curSelect.find('input').val(curOption.attr('rel'));
            curSelect.find('div').html(curOption.attr('rel'));
            curSelect.find('li.active').removeClass('active');
            curOption.addClass('active');
            curSelect.removeClass('cart-count-select-open');
            var curItem = curSelect.parents().filter('.cart-row');
            curItem.find('.cart-cost span').html(Number(curItem.find('.cart-price span').html()) * Number(curOption.attr('rel')));
            recalcCost();
        });

        $(document).click(function(e) {
            if ($(e.target).parents().filter('.cart-count-select').length == 0) {
                $('.cart-count-select-open').removeClass('cart-count-select-open');
            }
        });

        // удаление позиции из корзины
        $('.cart-delete a').click(function() {
            $(this).parents().filter('.cart-row').slideUp(function() {
                $(this).remove();
                recalcCost();
            });
            return false;
        });

        // купон
        $('.cart-coupon-input input').focus(function() {
            $('.cart-coupon-input label').css({'display': 'none'});
        });

        $('.cart-coupon-submit a').click(function() {
            var curCoupon = $('.cart-coupon-input input').val();
            if (curCoupon == 'CP-RTSIE-GOEYXE') {
                $('.cart-coupon-input .valid').css({'display': 'block'});
                $('.cart-cost-coupon').parent().addClass('cart-cost-with-coupon');
            } else {
                $('.cart-coupon-input .error').css({'display': 'block'});
                $('.cart-cost-coupon').parent().removeClass('cart-cost-with-coupon');
            }
            return false;
        });

        // пример открытия окна при нажатии на фото на странице продукта
        $('.product-side-big .catalogue-item-photo a').click(function() {
            windowOpen($('.product-window').html());
            return false;
        });

        // отправка рецепта на e-mail
        $('.product-ctrl-email-link').click(function() {
            $('.product-email-window').stop(true, true);
            if ($('.product-email-window:visible').length == 1) {
                $('.product-email-window').stop().fadeOut();
            } else {
                $('.product-email-window-form').show();
                $('.product-email-window-send').hide();
                $('.product-email-input input').val('');
                $('.product-email-window').stop().show().css({'bottom': 88, 'opacity': .5}).animate({'bottom': 38, 'opacity': 1}, 300);
            }
            return false;
        });

        $('.product-email-close, .product-email-window-cancel a').click(function() {
            $('.product-email-window').fadeOut();
            return false;
        });

        $(document).click(function(e) {
            if ($(e.target).parents().filter('.product-ctrl-email').length == 0) {
                $('.product-email-window').fadeOut();
            }
        });

        $('.product-email-window-form form').validate({
            messages: {
                email: 'Это обязательное поле!'
            },
            submitHandler: function(form) {
                // здесь можно вставить обращение к скрипту, который отправит сообщение на указанный e-mail
                $('.product-email-window-form').hide();
                $('.product-email-window-send').show();
            }
        });

        // заказ обратного звонка
        $('.consultant-callback-link').click(function() {
            $('.consultant-window').stop(true, true);
            if ($('.consultant-window:visible').length == 1) {
                $('.consultant-window').stop().fadeOut();
            } else {
                $('.consultant-window-form').show();
                $('.consultant-window-send').hide();
                $('.consultant-input input').val('');
                $('.consultant-window').stop().show().css({'top': 70, 'opacity': .5}).animate({'top': 20, 'opacity': 1}, 300);
            }
            return false;
        });

        $('.consultant-close').click(function() {
            $('.consultant-window').fadeOut();
            return false;
        });

        $(document).click(function(e) {
            if ($(e.target).parents().filter('.consultant-callback').length == 0) {
                $('.consultant-window').fadeOut();
            }
        });

        $('.consultant-window-form form').validate({
            messages: {
                name: 'Это обязательное поле!',
                phone: 'Это обязательное поле!'
            },
            submitHandler: function(form) {
                // здесь можно вставить обращение к скрипту, который отправит сообщение о заказе обратного звонка
                $('.consultant-window-form').hide();
                $('.consultant-window-send').show();
            }
        });

        // быстрый заказ
        $('.product-side-block-order-link').click(function() {
            $('.product-quick').stop(true, true);
            if ($('.product-quick:visible').length == 1) {
                $('.product-quick').stop().fadeOut();
            } else {
                $('.product-quick').stop().show().css({'left': 226, 'opacity': .5}).animate({'left': 176, 'opacity': 1}, 300);
            }
            return false;
        });

        $('.product-quick-close, .product-quick-window-cancel a').click(function() {
            $('.product-quick').fadeOut();
            return false;
        });

        $(document).click(function(e) {
            if ($(e.target).parents().filter('.product-side-block-order').length == 0) {
                $('.product-quick').fadeOut();
            }
        });

        $('.product-quick-form form').validate({
            messages: {
                phone: 'Это обязательное поле!'
            }
        });

        // форма авторизации
        $('.order-user-input input').each(function() {
            if ($(this).val() == '') {
                $(this).parent().find('span').css({'display': 'block'});
            }
        });

        $('.order-user-input input').focus(function() {
            $(this).parent().find('span').css({'display': 'none'});
        });

        $('.order-user-input input').blur(function() {
            if ($(this).val() == '') {
                $(this).parent().find('span').css({'display': 'block'});
            }
        });

        $('.order-form-hint').each(function() {
            $(this).css({'margin-top': -($(this).height() + 25) / 2});
        });

        // форма заказа
        $('.order-form form').validate({
            messages: {
                name: 'Это обязательное поле!',
                lastname: 'Это обязательное поле!',
                phone: 'Это обязательное поле!',
                email: 'Это обязательное поле!',
                city: 'Это обязательное поле!',
                address: 'Вы забыли указать адрес!<br />Куда доставить ваш заказ?'
            },
            invalidHandler: function(form, validator) {
                validator.showErrors();
                if ($('.order-form form .error:first').length > 0) {
                    $('.order-form-steps').data('scrollAnimation', true);
                    $.scrollTo('.order-form form .error:visible:first', {offset: {'top': -92}, duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                }
            },
            submitHandler: function(form) {
                var curStep = $('.order-steps li').index($('.order-steps li.curr'));
                switch(curStep) {
                    case 0:
                        $('.order-steps li').removeClass('curr');
                        $('.order-steps li').eq(0).addClass('prev');
                        $('.order-steps li').eq(1).addClass('prev curr');
                        $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-delivery').html() + '</div>');
                        $('.order-form form input[name="city"]').autocomplete({
                            source: function(request, response) {
                                var matcher = new RegExp('^' + $.ui.autocomplete.escapeRegex( request.term ), 'i');
                                response($.grep(availableCities, function(item) {
                                    return matcher.test(item);
                                }));
                            }
                        });
                        $('.order-form form input[name="city"]').bind('change', function() {
                            if ($('.order-form form .order-form-group-delivery-list').length == 1) {
                                if ($('input[name="city"]').val() == 'Москва') {
                                    $('.order-form form .order-form-group-delivery-list:first').html($('#order-form-delivery-moscow .order-form-group-delivery-list').html());
                                } else {
                                    $('.order-form form .order-form-group-delivery-list:first').html($('#order-form-delivery-other .order-form-group-delivery-list').html());
                                }
                            } else {
                                if ($('input[name="city"]').val() == 'Москва') {
                                    $('.order-form form .order-form-group:last').append($('#order-form-delivery-moscow').html());
                                } else {
                                    $('.order-form form .order-form-group:last').append($('#order-form-delivery-other').html());
                                }
                                $('.order-form form .order-form-group-delivery-list').slideDown();
                            }
                        });
                        $('.order-form-next').prev().slideDown(function() {
                            $('.order-form-steps').data('scrollAnimation', true);
                            $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                        });
                        break;
                    case 1:
                        $('.order-steps li').removeClass('curr');
                        $('.order-steps li').eq(1).addClass('prev');
                        $('.order-steps li').eq(2).addClass('prev curr');
                        $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-pay').html() + '</div>');
                        $('.order-form-next').prev().find('.order-form-group-delivery-list').css({'display': 'block'});
                        $('.order-form-next').prev().slideDown(function() {
                            $('.order-form-steps').data('scrollAnimation', true);
                            $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                        });
                        break;
                    case 2:
                        $('.order-steps li').removeClass('curr');
                        $('.order-steps li').eq(2).addClass('prev');
                        $('.order-steps li').eq(3).addClass('prev curr');
                        $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-confirm').html() + '</div>');
                        $('.order-form-next').prev().slideDown(function() {
                            $('.order-form-steps').data('scrollAnimation', true);
                            $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                            $('.order-form-next').fadeOut(function() { $('.order-form-next').remove(); } );
                        });
                        break;
                    case 3:
                        form.submit();
                        break;
                }
            }
        });

        window.setInterval(function() {
            $('.order-form-input label:visible').each(function() {
                $(this).css({'margin-top': -($(this).height() + 25) / 2});
            });
        }, 10);

        $('.order-delivery-radio input:checked').parent().parent().addClass('active checked');

        $('.order-form form .order-delivery-item').live('click', function() {
            var curItem = $(this);
            if (!curItem.hasClass('checked')) {
                var curGroup = curItem.parent();
                curGroup.find('.order-delivery-item').stop(true, true);

                curGroup.find('.order-delivery-item.checked').animate({'background-color': '#fff', 'border-color': '#dbdbdb'});
                curGroup.find('.order-delivery-item.checked .order-delivery-radio').css({'background-position': 'left top'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-name').animate({'color': '#383838'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-text').animate({'color': '#7e7e7e'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-price').animate({'color': '#7e7e7e'});

                curItem.animate({'background-color': '#fdf4e1', 'border-color': '#fdf4e1'});
                curItem.find('.order-delivery-radio').css({'background-position': 'left -32px'});
                curItem.find('.order-delivery-item-name').animate({'color': '#2c8374'});
                curItem.find('.order-delivery-item-text').animate({'color': '#626262'});
                curItem.find('.order-delivery-item-price').animate({'color': '#2c8374'});

                curGroup.find('.order-delivery-item.checked').removeClass('checked');
                curItem.addClass('checked');

                curItem.find('input').prop('checked', true);
            }
        });

        if ($('.order-form').length == 1) {
            $('.order-steps li div').click(function() {
                var curStep = $(this).parent();
                if (curStep.hasClass('prev') || curStep.hasClass('curr')) {
                    var curIndex = $('.order-steps li').index(curStep);
                    $.scrollTo('.order-form form .order-form-group:eq(' + curIndex + ')', {offset: {'top': -92}, duration: speedScroll});
                }
            });
        }

        if ($('.order-form').length == 0) {
            $('.order-steps li div').css({'cursor': 'default'});
        }

        // окно восстановления пароля
        $('.order-user-row-link-forgot').click(function() {
            windowOpen($('.window-email').html());

            $('.window-email-cancel a, .window-email-error-back a').bind('click', function() {
                windowClose();
                return false;
            });

            $('.window-email-form form').submit(function() {
                // здесь проверка на e-mail
                if ($('.window .window-email-input input').val() == 'ivanova.inna@yandex.ru') {
                    $('.window .window-email-success a').html($('.window .window-email-input input').val());
                    $('.window .window-email-success a').attr('href', 'mailto:' + $('.window .window-email-input input').val());
                    $('.window .window-email-form').hide();
                    $('.window .window-email-success').show();
                } else {
                    $('.window .window-email-error-text a').html($('.window .window-email-input input').val());
                    $('.window .window-email-error-text a').attr('href', 'mailto:' + $('.window .window-email-input input').val());
                    $('.window .window-email-form').hide();
                    $('.window .window-email-error').show();
                }

                return false;
            });

            return false;
        });

        // окно авторизации
        $('.top-line-login a').click(function() {
            windowOpen($('.login-window').html());
            return false;
        });

        $('.window .login-window-cancel a').live('click', function() {
            windowClose();
            return false;
        });

        $('.window .login-form-forgot-link a').live('click', function() {
            $('.window .login-form-forgot').show();
            recalcWindow();
            return false;
        });

        $('.window .login-form-sms').live('click', function() {
            if ($(this).parent().find('input').val() == '12FA') {
                $('.window .login-form-forgot-valid').show();
                recalcWindow();
            }
            return false;
        });

        $('.news-load-link a').live('click', function() {
            var curLink = $(this);
            curLink.parent().before('<div class="news-load"></div>');
            $('.news-load:last').load(curLink.attr('href'), function() {
                $('.news-load:last').slideDown();
                curLink.parent().remove();
            });
            return false;
        });

        // форма в кабинете
        $('.cabinet-form form').validate({
            messages: {
                name: 'Это обязательное поле!',
                email: 'Это обязательное поле!'
            }
        });

        // окно смены телефона
        $('.window .login-form-right-phone a').live('click', function() {
            windowClose();
            windowOpen($('.phone-window').html());
            return false;
        });

        $('.catalogue-item-discount').each(function() {
            var curItemTop = $(this).parent();
            if (curItemTop.hasClass('catalogue-item-top')) {
                var curItemCatalogue = curItemTop.parent();
                var curIndexTop = curItemCatalogue.find('.catalogue-item-top').index(curItemTop);
                var nextItemCatalogue = curItemCatalogue.next();
                $(this).height(curItemCatalogue.height() + nextItemCatalogue.height() - 23)
            } else {
                $(this).height(curItemTop.height() + 15)
            }
        });

    });

    // переход к следующему слайду
    function sliderNext() {
        window.clearTimeout(timerSlider);
        timerSlider = null;

        var curSlider = $('.slider');
        if (curSlider.data('disableAnimation')) {
            var curIndex = curSlider.data('curIndex');
            var newIndex = curIndex + 1;
            if (newIndex == curSlider.find('ul li').length) {
                newIndex = 0;
            }

            curSlider.data('curIndex', newIndex);
            curSlider.data('disableAnimation', false);
            curSlider.find('.slider-ctrl a.active').removeClass('active');
            curSlider.find('.slider-ctrl a').eq(newIndex).addClass('active');
            curSlider.find('ul li').eq(curIndex).fadeOut(speedSlider, function() {
                curSlider.find('ul li').eq(newIndex).fadeIn(speedSlider, function() {
                    curSlider.data('disableAnimation', true);
                    if (periodSlider > 0) {
                        timerSlider = window.setTimeout(sliderNext, periodSlider);
                    }
                });
            });
        }
    }

    // пересчет стоимости в корзине
    function recalcCost() {
        var curSumm = 0;
        var curCount = 0;
        $('.cart-row').each(function() {
            if (!$(this).hasClass('cart-row-discount') && !$(this).hasClass('cart-row-gift')) {
                curSumm += Number($(this).find('.cart-cost span:visible:first').html());
                curCount += Number($(this).find('.cart-count input').val());
            }
        });
        if ($('.cart-row-discount').length == 1) {
            $('.cart-row-discount .cart-cost span:visible:first span').html('-' + Math.round(curSumm * (Number($('.cart-row-discount .cart-info-name span').html()) / 100)));
        }
        $('.cart-ctrl-summ-count').html(curCount);
        $('.cart-ctrl-summ-cost').html(curSumm - Math.round(curSumm * (Number($('.cart-row-discount .cart-info-name span').html()) / 100)));
    }

    // открытие окна
    function windowOpen(contentWindow) {
        var windowWidth  = $(window).width();
        var windowHeight = $(window).height();
        var curScrollTop = $(window).scrollTop();

        $('body').css({'width': windowWidth, 'height': windowHeight, 'overflow': 'hidden'});
        $(window).scrollTop(0);
        $('.wrapper').css({'top': -curScrollTop});
        $('.wrapper').data('scrollTop', curScrollTop);

        $('body').append('<div class="window"><div class="window-overlay"></div><div class="window-container">' + contentWindow + '<a href="#" class="window-close"></a></div></div>')
        recalcWindow();

        $('.window-overlay').click(function() {
            windowClose();
        });

        $('.window-close').click(function() {
            windowClose();
            return false;
        });

        $('body').bind('keypress keydown', keyDownBody);
    }

    // функция обновления позиции окна
    function recalcWindow() {
        var windowWidth  = $(window).width();
        var windowHeight = $(window).height();
        if ($('.window-container').width() < windowWidth) {
            $('.window-container').css({'margin-left': -$('.window-container').width() / 2});
        } else {
            $('.window-container').css({'left': 0});
        }
        if ($('.window-container').height() < windowHeight) {
            $('.window-container').css({'margin-top': -$('.window-container').height() / 2});
        } else {
            $('.window-container').css({'top': 20});
            $('.window-overlay').css({'min-height': $('.window-container').height() + 40});
        }
    }

    // обработка Esc после открытия окна
    function keyDownBody(e) {
        if (e.keyCode == 27) {
            windowClose();
        }
    }

    // закрытие окна
    function windowClose() {
        $('body').unbind('keypress keydown', keyDownBody);
        $('.window').remove();
        $('.wrapper').css({'top': 'auto'});
        $('body').css({'width': 'auto', 'height': '100%', 'overflow': 'auto'});
        var curScrollTop = $('.wrapper').data('scrollTop');
        $(window).scrollTop(curScrollTop);
    }

    // обработка скроллинга
    $(window).bind('load resize scroll', function() {
        if ($('.order-form').length == 1) {
            var curScroll = $(window).scrollTop();
            var curTopSteps = $('.order-steps').offset().top - 10;
            if (curTopSteps < curScroll) {
                $('.order-steps').addClass('order-steps-fixed');
                $('.side').addClass('side-fix');
                $('.side').css({'left': $('.middle').offset().left + $('.middle').width() - 243});
            } else {
                $('.order-steps').removeClass('order-steps-fixed');
                $('.side').removeClass('side-fix');
                $('.side').css({'left': 'auto'});
            }
        }
    });

    // скроллинг по форме заказа
    $(window).load(function() {
        if ($('.order-form').length == 1) {
            $.scrollTo('.order-form', {duration: speedScroll});
        }
    });

})(jQuery);