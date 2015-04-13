$(document).ready( function () {
	/**************************************************************************/
	/************************Slider big-rule***********************************/
	/**************************************************************************/
	/*****Эффекты анимаций*****/
	// t: current time, b: begInnIng value, c: change In value, d: duration
	jQuery.extend( jQuery.easing, {
		easeInCubic: function (x, t, b, c, d) {
			return Math.pow(x, 3);
		},
		easeInQuad: function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeOutCubic: function (x, t, b, c, d) { 
			return c*((t=t/d-1)*t*t + 1) + b;
		}
	});
	//при изменении размеров окна, некоторые глобальные переменные необходимо обновить
	$(window).resize(function() {
		offsetToFirstEl = elements.offset();		//смещение к первому элементу в маленькой линейке
		maxCountEls = Math.floor($("#main-rule #big-rule").width()/widthEl); 	//количество элементов маленькой линейке, которые помещаются на экран
		maxCountSlides = Math.floor($("#info-panel").width()/sizeSlide);		//количество элементов большого слайдера, которые помещаются на экран
	});
	
	var elements = $("#rule .rule-element"); //элементы линейки
	var widthEl = elements.width();			 //ширина одного элемента
	var maxCountEls = Math.floor($("#main-rule #big-rule").width()/widthEl); //максимальное число, которое может поместиться на экран
	var countEls = $("#rule .rule-element").length;	//всего элементов линейки
	var position = 0;								//текущая позиция слайдера
	
	/*don't using, yet*/
	var heightEl = elements.height();		 //высота одного элемента
	var offsetToFirstEl = elements.offset(); //смещение к первому элементу
	/****************/

	managmentArrow(position, countEls, parseInt(countEls-maxCountEls)/3, "#main-rule #left-arrow", "#main-rule #right-arrow");	//выключение стрелок
	/*событие по клику на стрелку линейки*/
	$("#main-rule .rule-arrow").on("click", function() {
		if(!$(this).hasClass("disable-arrow")) {				//если стрелка включена
			position = ($(this).attr("id") == "left-arrow")? position-1 : position + 1;	//если правая стрелка увеличить позицию, иначе уменьшить
			elements.animate({left:widthEl*(-position)*3}, "fast", "easeOutCubic"); //переместить на 3 элемента
			managmentArrow(position, countEls, parseInt(countEls-maxCountEls)/3, "#main-rule #left-arrow", "#main-rule #right-arrow");//выключить стрелки 
		}
	});
	/*Функция, которая следит за стрелками линейки*/
	function managmentArrow(position, count, max, leftArrow, rightArrow) {
		if (position <= 0) {
			$(leftArrow).addClass("disable-arrow");
		} else {
			$(leftArrow).removeClass("disable-arrow");
		}
		if (position >= max) {
			$(rightArrow).addClass("disable-arrow");
		} else {
			$(rightArrow).removeClass("disable-arrow");
		}
	}
	/**********************************************************************************/

	/**************************************************************************/
	/***********Слайдер по информационным элементам****************************/
	/**************************************************************************/
	var slides = $("#info-slide-container .info-element");
	var countSlides = slides.length;
	var sizeSlide = slides.outerWidth(true);
	var maxCountSlides = Math.floor($("#info-panel").width()/sizeSlide);
	var pad = parseInt($("#info-slide-container").css('padding-left'));

	var positionSlide = 0;
	//выключение стрелок для перелистывания
	managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );
	/*Перелистывание при наведении на элемент года*/
	$("#rule .rule-element").on("mouseover", function() {
		var year = $(this).text();
		var slide = $(".info-element[year='"+year+"']");
		var number = $(".info-element").index(slide);
		var offset = sizeSlide*number;
		var center = Math.floor((maxCountSlides)/2);
		if (number != -1) {
			positionSlide = number;
			slides.clearQueue();
			slides.animate({left:-offset }, "slow", "easeOutQuart");
	    	managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );
		}
	});

	/*Перелистывание при прокручивании колеса мыши*/
	$('#info-panel').on('mousewheel DOMMouseScroll', function(event){
		var wheelData = event.originalEvent.detail ? event.originalEvent.detail * -1 : event.originalEvent.wheelDelta / 40;
    	if (wheelData > 0) {
	    	if(positionSlide <= parseInt(countSlides-maxCountSlides)) {
	    		positionSlide++;
				slides.clearQueue();
	    		managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );
	    		slides.animate({left: (sizeSlide)*(-positionSlide)}, "slow", "easeOutCubic");
	    	}
		}
   		else {
	        if(positionSlide >=0) {
	    		positionSlide--;
				slides.clearQueue();
	    		managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );
	    		slides.animate({left: sizeSlide*(-positionSlide)}, "slow", "easeOutCubic");
	    	}
    	}
	});
	/*Перелистывание по нажатии на стрелки*/
	$('#slide-arrow-left, #slide-arrow-right').on("click", function() {
		if(!$(this).hasClass("disable-arrow")) {
			positionSlide = ($(this).attr("id") == "slide-arrow-left")? positionSlide-1 : positionSlide+1;
			slides.clearQueue();
			managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );
			slides.animate({left: -positionSlide*sizeSlide}, "slow", "easeOutCubic");
		}
	});

	/**********************************************************************************/
	/*********************Добавление элементов выбора месяца***************************/
	/**********************************************************************************/

	var nextAngle = 0;//глобальное поле для задания угла следующего элемента
	var divEl = [];	//массив элементов месяцев
	//соответствия аттрибутов месяцев
	var conformityMonth = {
		jan: "Январь",
		feb: "Февраль",
		mar: "Март",
		apr: "Апрель",
		may: "Май",
		jun: "Июнь",
		jul: "Июль",
		aug: "Август",
		sep: "Сентябрь",
		oct: "Октябрь",
		nov: "Ноябрь",
		dec: "Декабрь"
	};
	/*Класс с информацией и обработкой элемента выбора месяца
	* parent - родительский элемент, в который вкладывается элемент месяца (это body для элементов месяца) 
	* classEl - CSS класс элемента (.month-element)
	* attrEl - аттрибут элемента, описывающий месяц (month=<месяц>)
	*/
	function MonthElement(parent, classEl, attrEl) {
		this.width = parent.width()/2;
		this.height = parent.height()/2;
		this.offset = {	top: parent.offset().top + this.height,
						left: parent.offset().left + this.width};
		this.classEl = classEl;
		this.attrEl = attrEl;
		this.angle = 0;
		this.jObj = null;
	}
	//методы класса MonthElement
	MonthElement.prototype = {
		//добавляет элемент в DOM
		add: function (parent) {
			parent.append("<div class='"+this.classEl+"' "+this.attrEl+"></div>"); //добавление
			this.jObj = $('.' + this.classEl + "["+this.attrEl+"]");				//получение jQuery объекта
			this.jObj.attr("data-tooltip", conformityMonth[this.jObj.attr("month")]);
			//this.jObj.append("<span class='tool-tip' data-tooltip='"+this.jObj.attr('month')+"'>"+this.jObj.attr('month')+"</span>");
			this.jObj.offset(this.offset);	//смещение к центру 
			this.angle = nextAngle*Math.PI/ 180;	//угол наклона элемента в радианах
			nextAngle += 30;

			var r = this.height*2;								//радиус
			this.y = this.offset.top - Math.sin(this.angle)*r;	//смещение по у = centerY - sin(alpha)*r
			this.x = Math.cos(this.angle)*r + this.offset.left;	//смещение по x = centerX + cos(alpha)*r
			//Аттрибуты для обработки анимации
			this.jObj.attr("x",this.x);
			this.jObj.attr("y", this.y);	
			this.jObj.attr("w", this.width);	
			this.jObj.attr("h", this.height);
			this.jObj.attr("centerX", this.offset.left);	
			this.jObj.attr("centerY", this.offset.top);	
		},
		//Анимированный выход элементов
		start: function () {
			//функция, которая вызывается на каждом шаге прохождения анимации
			//эта функция работает находит соседний элемент месяца и цепляет на него анимацию, которая вызовет эту функцию, на определенном шаге
			var func = function(now, fx) {
						if (fx.pos > 0.5) {
							var el = $(this).next(".month-element");
							var x = el.attr("x");
							el.removeAttr("x");
							var y = el.attr("y");
							el.removeAttr("y");
							var w = el.attr("w");
							el.removeAttr("w");
							var h = el.attr("h");
							el.removeAttr("h");
							el.animate({top: y, left: x, width: w, height: h}, { 
								duration: 400, 
								easing: "easeOutCubic",
								step: func							
							});
						}
					};
			this.jObj.animate({top: this.y, left: this.x, width: this.width, height: this.height}, 
				{ 
					duration: 400, 
					easing: "easeOutCubic",
					step: func							
				});
		},
		//Анимированное уход элементов и удаление их
		end: function() {
			//функция аналогична выхода элементов
			var func = function(now, fx) {
						if (fx.pos > 0.2) {
							var el = $(this).prev(".month-element");
							var x = el.attr("centerX");
							var y = el.attr("centerY");
							el.animate({top: y, left: x, width: 0, height: 0}, { 
								duration: 200, 
								easing: "easeInCubic",
								complete: function() {
							  		$(this).remove();
							  	},
								step: func							
							});
						}
					};
			this.jObj.animate({	top: this.offset.top,
								left: this.offset.left,
								width: 0,
								height: 0
							  },
							  {
							  	duration: 100,
							  	easing: "easeInCubic",
							  	complete: function() {
							  		$(this).remove();
							  	},
							  	step: func
							  });
		} 
	};
	/**********************************
	/*событие нажатия на элемент года
	***********************************/
	$("#rule .rule-element").on("mousedown", function() {
		var flag = true; //флаг, который запрещает многократный вызов события окончании CSS анимации
		var year = "";	//аттрибут года на выбранном элементе
		//Событие, которое определяет конец CSS анимации
		$(this).on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function(e) {
			if (flag) {
				divEl = [];
				year = $(this).text();
				var listMonth = $(".info-element[year='"+year+"']");	//формирование списка инфо элементов с определенным годом
				for(var i = 0; i< listMonth.length; i++) {
					divEl.push(new MonthElement($(this), "month-element", "month="+listMonth.eq(i).attr("month"))); //создание объектов элементов месяца, и добавление их в массив
					divEl[i].add($("body"));
				}
				divEl[0].start();		//запуск анимации выхода элементов месяца
				nextAngle = 0;	
				/*********************
				* после того, как элементы будут выведены, цепляется анимация наведения курсора мыши
				***********************/
				$(".month-element").on("mouseover", function() {
					//для браузера Хром селектор :hover работает некоректно, поэтому стили цепляются вручную
					if(navigator.userAgent.search("Chrome") > -1) {
						$(this).addClass("month-element-hover");
						$(this).append("<span class='month-element-after'>"+$(this).attr("data-tooltip")+"</span>");
						$(this).find(":first-child").css({opacity: 1, visibility: "visible"});				
					}
					var month = $(this).attr("month");									//берем аттрибут месяца на элементе
					var slide = $(".info-element[year='"+year+"'][month='"+month+"']");	//ищем по аттрибуту месяца и года все элементы
					var number = $(".info-element").index(slide);						//находим индекс этого элемента в общем наборе
					var offset = sizeSlide*number;										//смещение к этому элементу 
					var center = Math.floor((maxCountSlides)/2);						//пока не используется
					if (number != -1) {
						positionSlide = number;											//сохраняем позицию
						slides.clearQueue();											//чистим очеред анимаций
						slides.animate({left:-offset }, "slow", "easeOutQuart");		//смещаемся на выбранный элемент
				    	managmentArrow(positionSlide, countSlides, countSlides - maxCountSlides, "#slide-arrow-left", "#slide-arrow-right" );//откл/вкл стрелки
					}
				}); 
				/**************************
				*Событие по уходу курсора с элемента
				***************************/
				$(".month-element").on("mouseleave", function() {
					//для ухром нужно удалить руками стили
					if(navigator.userAgent.search("Chrome") > -1) {
						$(this).removeClass("month-element-hover");
						$(this).find(":first-child").css({opacity: 0, visibility: "hidden"});
						$(this).find(":first-child").remove();
					}
				});
				//опять же для хрома, чтобы при перемещении курсора с зажатой ЛКМ не тащился с ней элемент
				$("body").on("dragstart", function() {return false;});			
			}
			flag = false;
		});
		
	});
	/*********************************
	*	событие отпуска мыши слушается на всем документе, 
	*потому что можно нажать и увести курсор с элемента, 
	*и отпуск не сработает
	********************************/
	$(document).on("mouseup", function() {
		$("#rule .rule-element").off("transitionend webkitTransitionEnd oTransitionEnd otransitionend");
		if(divEl.length != 0) {
			divEl[divEl.length-1].end();			//запуск анимации ухода элементов
			//удаление событий		
			$(".month-element").off("mouseover");	
			$(".month-element").off("mouseleave");
			$("body").off("dragstart");
		}
	});

	/**********************************************************************************/

	/********************************************************************************
	**********************Кнопка "Подробнее"*****************************************
	*********************************************************************************/
	$(".info-detail").on("click", function () {
		var el = $(this).parent().clone();
		el = parseInfoModal(el);
		$("#modal-window").css({visibility:"visible", opacity: 0}).prepend(el);
		$("#modal-window").animate({opacity: 1}, 400, "easeOutCubic");
		el.css({top: $("#modal-window").height()});
		el.animate({top:0}, 600, "easeOutCubic");
	});

	function parseInfoModal(el) {
		el.removeClass("info-element");
		el.addClass("info-modal");
		el.removeAttr("style");
		el.find(".info-detail").remove();
		el.append("<div id='modal-close'></div>");
		return el;
	}

	$("#modal-window").delegate("#modal-close", "click", function() {
		$(this).parent().animate({top: $("#modal-window").height()}, 400, "easeInCubic", function() {
			$(this).remove();
		});
		$("#modal-window").animate({opacity: 0}, 400, "easeInCubic", function() {
			$(this).css({visibility: "hidden", opacity: 1})
		});
	});

	$("#modal-arrow-left, #modal-arrow-right").on("click", function() {
		var infoModal = $(this).parent().find(".info-modal");
		var widthModal = infoModal.width();
		var offsetModal = infoModal.offset();
		var year = infoModal.attr("year");
		var month = infoModal.attr("month");
		var currentSlide = $(".info-element[year="+year+"][month="+month+"]");
		var numberSlide = slides.index(currentSlide);
		var newSlide = null;
		var sign = ($(this).attr("id") == "modal-arrow-right")? -1 : 1;
		numberSlide -= sign;
		if (numberSlide < 0) {
			numberSlide = slides.length-1;
		} else if (numberSlide > slides.length-1) {
			numberSlide = 0;
		}
		console.log(numberSlide);
		newSlide = parseInfoModal(slides.eq(numberSlide).clone());
		
		$("#modal-window").prepend(newSlide);
		newSlide.css({
			left: newSlide.offset().left-widthModal*sign, 
			display: "none"
		});
		infoModal.animate({
			left: offsetModal.left + widthModal*sign, opacity: 0
		}, 400, "easeInCubic", function() {
			$(this).remove();
			newSlide.css({display: "block"});
			newSlide.animate({
				left: 0
			}, 600, "easeOutCubic");
		});	
	});
	/**********************************************************************************/
});
