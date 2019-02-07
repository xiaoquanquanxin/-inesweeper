function CoreElement(options) {
	options = options || {};
	var tagName = options.tagName || 'div';
	this.element = document.createElement(tagName);
	this.classList = this.element.classList;
	var _this = this;
	(options.classList || []).forEach(function (t) {
		if (t) {
			_this.classList.add(t);
		}
	});
	this.element.core = this;
}

//  DOM
CoreElement.prototype.appendTo = function (aim) {
	if (aim instanceof Element && aim !== this.element) {
		aim.appendChild(this.element);
	} else if (aim instanceof CoreElement) {
		aim.element.appendChild(this.element);
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.appendTo\n错误原因：错误的DOM目标对象或无法添加自身');
	}
	return this;
};
CoreElement.prototype.removeFrom = function (aim) {
	if (aim instanceof Element && aim !== this.element) {
		if (this.element.parentNode === aim) {
			aim.removeChild(this.element);
		} else {
			throw new Error('\n错误记录：CoreElement.prototype.removeFrom\n错误原因：目标对象不为父级元素');
		}
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.removeFrom\n错误原因：错误的DOM目标对象或无法移除自身');
	}
	return this;
};
CoreElement.prototype.getNextElement = function () {
	return this.element.nextElementSibling;
};
CoreElement.prototype.getParentElement = function () {
	return this.element.parentNode;
};
CoreElement.prototype.isLastChildren = function () {
	return this.element.parentNode.lastChild === this.element;
};
//  CLASS
CoreElement.prototype.addClass = function (cssName) {
	if (typeof cssName === 'string') {
		this.element.classList.add(cssName)
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.addClass\n错误原因：添加css类名必须为字符串');
	}
	return this;
};
CoreElement.prototype.removeClass = function (cssName) {
	if (cssName === undefined) {
		this.element.classList.value = '';
	} else if (typeof cssName === 'string') {
		this.element.classList.remove(cssName)
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.removeClass\n错误原因：删除css类名必须为字符串');
	}
	return this;
};
CoreElement.prototype.hasClass = function (cssName) {
	if (typeof cssName === 'string') {
		return Array.prototype.some.call(this.element.classList, function (t) {
			return t === cssName;
		});
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.hasClass\n错误原因：查询css类名必须为字符串');
	}
};
//  CSS
CoreElement.prototype.css = function (cssName, cssValue) {
	if (typeof cssName === 'string') {
		if (typeof cssValue === 'string') {
			this.element.style[cssName] = cssValue;
		} else if (cssValue === undefined) {
			return getComputedStyle(this.element)[cssName];
		} else {
			throw new Error('\n错误记录：CoreElement.prototype.css\n错误原因：参数cssValue错误');
		}
	} else {
		throw new Error('\n错误记录：CoreElement.prototype.css\n错误原因：无法识别的参数');
	}
	return this;
};
CoreElement.prototype.html = function (html) {
	this.element.innerHTML = html;
};

/**
 * CreateCell
 * */
function CreateCell(options) {
	options = options || {};
	CoreElement.call(this, options);
	this.positionData = options.positionData;
}

(function () {
	function Temp() {
	}

	Temp.prototype = CoreElement.prototype;
	CreateCell.prototype = new Temp();

	CreateCell.prototype.getRelated = function () {
		//  确定关系，地雷数量
		//  ↖，↑，↗，←，→，↙，↓，↘
		var arr = new Array(8);
		var posData = this.positionData;
		//  行
		var rows = posData.rows;
		var cols = posData.cols;

		arr[0] = this.getCell({rows: rows - 1, cols: cols - 1});
		arr[1] = this.getCell({rows: rows - 1, cols: cols});
		arr[2] = this.getCell({rows: rows - 1, cols: cols + 1});
		arr[3] = this.getCell({rows: rows, cols: cols - 1});
		arr[4] = this.getCell({rows: rows, cols: cols + 1});
		arr[5] = this.getCell({rows: rows + 1, cols: cols - 1});
		arr[6] = this.getCell({rows: rows + 1, cols: cols});
		arr[7] = this.getCell({rows: rows + 1, cols: cols + 1});
		this.relatedList = arr;
	};
	CreateCell.prototype.getCell = function (posData) {
		var item = false;
		Core.cellPositionData.forEach(function (t, i) {
			if (posData.rows === t.rows && posData.cols === t.cols) {
				item = Core.cellList[i];
			}
		});
		if (item.isCleared) {
			return false;
		}
		return item;
	};

	//  计算当前格子的数字
	CreateCell.prototype.statistics = function () {
		this.boomNum = this.relatedList.reduce(function (prev, next) {
			return prev + (next.isBoom ? 1 : 0)
		}, 0);
		this.addClass('normal');
		this.boomNum && this.html(this.boomNum);
		this.css('color', Core.cellPointColorList[this.boomNum]);
	}
}());


(function (w) {
	var core = {};
	core.initDataMap = {
		'easy': {
			rows: 10,
			cols: 10,
			total: 10,                                           //  雷数
			cellNum: 0,                                         //  格子数
			safeNum: 0,                                         //  非雷格子数
		},
		'normal': {
			rows: 16,
			cols: 16,
			total: 40,                                           //  雷数
			cellNum: 0,                                         //  格子数
			safeNum: 0,                                         //  非雷格子数
		},
		'hard': {
			rows: 16,
			cols: 30,
			total: 99,                                           //  雷数
			cellNum: 0,                                         //  格子数
			safeNum: 0,                                         //  非雷格子数
		},
		'crazy': {
			rows: 24,
			cols: 40,
			total: 189,                                           //  雷数
			cellNum: 0,                                         //  格子数
			safeNum: 0,                                         //  非雷格子数
		},
	};
	core.initData = core.initDataMap['easy'];
	core.isCheat = false;
	core.cellList = [];                                     //  cell的集合
	core.cellPositionData = [];                                 //  cell的position的集合
	core.boomList = [];                                     //  雷的集合
	core.cellPointColorList = ['', 'blue', 'green', 'orange', 'red', 'purple', 'brown', 'dark', 'grey'];
	w.Core = core;
}(window));
//  †※