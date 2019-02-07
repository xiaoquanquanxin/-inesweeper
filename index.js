window.onload = function () {
	var warp = document.getElementById('warp');
	//  主要
	var main = document.getElementById('main');
	//  行数
	var rows = document.getElementById('rows');
	//  列数
	var cols = document.getElementById('cols');
	//  剩余雷数
	var residue = document.getElementById('residue');
	//  总雷数
	var total = document.getElementById('total');

	function init(option, restart) {
		option = option || {rows: 10, cols: 10, total: 10};
		resetData(option, restart);
		createCell(option);
	}

	function resetData(option, restart) {
		rows.innerHTML = option.rows;
		cols.innerHTML = option.cols;
		option.cellNum = option.rows * option.cols;
		option.safeNum = option.cellNum - option.total;
		residue.innerHTML = 0;
		total.innerHTML = option.total;
		residue.innerHTML = option.total;
		var cells = option.rows * option.cols;
		if (!restart) {
			option.boomList = [];
			while (option.boomList.length < option.total) {
				var r = random(0, cells - 1);
				if (option.boomList.indexOf(r) === -1) {
					option.boomList.push(r);
				}
			}
			option.boomList.sort(function (x, y) {
				return x - y;
			});
		}
		Core.boomList = option.boomList;
		Core.cellList = [];
		Core.cellPositionData= [];
	}

	function createCell(option) {
		main.innerHTML = '';
		for (var i = 0; i < option.rows; i++) {
			var ul = new CreateCell({tagName: 'ul'});
			for (var j = 0; j < option.cols; j++) {
				var currentIndex = i * option.cols + j;
				var li = new CreateCell({tagName: 'li'});
				var positionData = {
					cols: j,
					rows: i,
				};
				var isBoom = (option.boomList.indexOf(currentIndex) !== -1);
				var div = new CreateCell({
					positionData: positionData,
					classList: [isBoom ? '' : '', 'cell']
				});
				div.isBoom = isBoom;
				div.isCell = true;
				Core.cellList.push(div);
				Core.cellPositionData.push(positionData);
				// div.html(j + ',' + i);
				div.appendTo(li);
				li.appendTo(ul);
			}
			ul.appendTo(main)
		}
	}


	function initEvent() {
		//  普通点击
		compatibility.eventListener(document, 'click', function (e) {
			var event = compatibility.event(e);
			var target = compatibility.target(event);
			var core = target.core || {};
			if (!core.isCell) {
				return;
			}
			if (core.isCleared) {
				return;
			}
			if (core.isLoged) {
				return;
			}
			if (core.isBoom) {
				endRound(true);
				return false;
			}
			loopLogic(core);
			console.log(Core.initData.safeNum);
			console.log(Core.cellList.reduce(function (prev, next) {
				return prev + (next.isCleared ? 1 : 0);
			}, 0));
			//  是否点光了
			if (Core.initData.safeNum === Core.cellList.reduce(function (prev, next) {
					return prev + (next.isCleared ? 1 : 0);
				}, 0)) {
				endRound();
			}
		});
		//  重新开始本局
		compatibility.eventListener(document.getElementById('newGame'), 'click', function (e) {
			init(Core.initData, true);
			Core.isCheat = false;
			resetBtn.innerHTML = '作弊';
		});
		//  作弊
		var resetBtn = document.getElementById('reset');
		compatibility.eventListener(resetBtn, 'click', function (e) {
			Core.cellList.forEach(function (t) {
				if (t.isBoom) {
					t.addClass('isBoom');
					if (Core.isCheat) {
						t.removeClass('isBoom');
					}
				}
			});
			Core.isCheat = !Core.isCheat;
			resetBtn.innerHTML = '作弊';
			if (Core.isCheat) {
				resetBtn.innerHTML = '谦虚';
			}
		});
		compatibility.eventListener(document.getElementById('easy'), 'click', function (e) {
			btnEvent(e, 'easy');
		});
		compatibility.eventListener(document.getElementById('normal'), 'click', function (e) {
			btnEvent(e, 'normal');
		});
		compatibility.eventListener(document.getElementById('hard'), 'click', function (e) {
			btnEvent(e, 'hard');
		});
		compatibility.eventListener(document.getElementById('crazy'), 'click', function (e) {
			btnEvent(e, 'crazy');
		});
		//  自定义
		compatibility.eventListener(document.getElementById('custom'), 'click', function (e) {
			var _rows = customVal(window.prompt('行数', '10'), 10);
			var _cols = customVal(window.prompt('列数,最大30', '10'), 10);
			_cols = Math.min(_cols, 30);
			var _total = customVal(window.prompt('雷数,最大[行*列*20%]', '10'), 10);
			_total = Math.min(_total, parseInt(_cols * _rows * 0.2));
			Core.initData = {
				rows: _rows,
				cols: _cols,
				total: _total,                                           //  雷数
				cellNum: 0,                                         //  格子数
				safeNum: 0,
			};
			init(Core.initData);
			warp.style.width = Math.max(_cols * document.querySelector('.cell').offsetWidth + 130, 450) + 'px';
		});
		//  右键
		compatibility.eventListener(document, 'contextmenu', function (e) {
			var event = compatibility.event(e);
			var target = compatibility.target(event);
			compatibility.preventDefault(e);
			var core = target.core || {};
			if (!core.isCell) {
				return;
			}
			if (core.isCleared) {
				return false;
			}
			core.html(core.isLoged ? '' : '†');
			residue.innerHTML = Number(residue.innerHTML) + (core.isLoged ? 1 : -1);
			core.isLoged = !core.isLoged;
		})
	}

	function btnEvent(e, level) {
		Core.initData = Core.initDataMap[level];
		init(Core.initData);
		warp.className = level;
		var event = compatibility.event(e);
		var target = compatibility.target(event);
		compatibility.callFn(Array.prototype.forEach, document.getElementsByClassName('current-btn'), [function (t) {
			t.classList.remove('current-btn');
		}]);
		target.classList.add('current-btn');
	}

	//  结束本局
	function endRound(isBoom) {
		Core.cellList.forEach(function (t) {
			t.isCleared = true;
			if (t.isBoom) {
				t.addClass('pass');
				t.html('※');
			}
		});
		setTimeout(function () {
			if (isBoom) {
				alert('点到雷了');
			} else {
				alert('恭喜通关');
			}
		}, 0);
	}

	//  逻辑判断
	function loopLogic(core) {
		/**
		 * logic
		 * */
		if (core === false) {
			return;
		}
		if (core.isCleared) {
			return;
		}
		if (core.isLoged) {
			return
		}
		core.isCleared = true;
		//  获取关系,但不计算关系
		core.getRelated();
		// console.log(core.relatedList);
		//  计算当前格子的数字
		core.statistics();
		//  只有点开是空的时候,才回去循环
		if (core.boomNum === 0) {
			core.isCleared = true;
			core.relatedList.forEach(function (t) {
				loopLogic(t);
			})
		}
	}

	//  自定义
	function customVal(val, def) {
		var _val = Number(val);
		if (isNaN(_val)) {
			return def
		}
		return _val;
	}

	init(Core.initData);
	initEvent();

	function random(x, y) {
		return parseInt(Math.random() * (y - x + 1)) + x;
	}
};