import { computePosition } from '@floating-ui/dom'

// 参照下拉框组件
var ReferSelect = function (target, options) {
    debugger;
    this.target = $(target);
    this.dropDownWrapper;
    this.init();
}

ReferSelect.DEFAULTS = {};

ReferSelect.prototype.init = function () {
    this.createDropDown();
}

ReferSelect.prototype.createDropDown = function () {
    var tpl = `<div id="select-wrapper">test</div>`;
    this.dropDownWrapper = $(tpl);
    this.dropDownWrapper.appendTo(document.body);

    computePosition(this.target[0], this.dropDownWrapper[0]).then(({x, y}) => {
        Object.assign(this.dropDownWrapper[0].style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });

}


export default ReferSelect;
