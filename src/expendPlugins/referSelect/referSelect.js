import { computePosition } from '@floating-ui/dom'
import { generateRandomKey } from "../../utils/chartUtil";

// 参照下拉框组件
var ReferSelect = function (target, config) {
    debugger;
    this.target = $(target);
    this.config = config;
    this.options = this.config.options;
    console.log('this.options', this.options);
    this.dropDownWrapper = null;
    this.init();
}

ReferSelect.DEFAULTS = {};

ReferSelect.prototype.init = function () {
    this.createDropDown();
}

ReferSelect.prototype.createDropDown = function () {

    let refer_id = generateRandomKey("refer-select");

    var tpl = `<div class="refer-select-wrapper" id=${refer_id}></div>`;
    this.dropDownWrapper = $(tpl).css('width', this.target.outerWidth());

    this.dropDownWrapper.attr('id', refer_id);
    this.dropDownWrapper.appendTo(document.body);

    this.createOptions();

    // 在弹窗dom上添加自定义属性（方法）
    this.dropDownWrapper.__outsideClickEvent__ = e => {
        // 判断是否外部点击
        if (!$.contains(this.dropDownWrapper, e.target)) {
            this.destroy(); // 触发关闭方法
        }
    }

    setTimeout(() => {
        // 注册事件
        document.body.addEventListener('click', this.dropDownWrapper.__outsideClickEvent__);
    })

    computePosition(this.target[0], this.dropDownWrapper[0]).then(({x, y}) => {
        Object.assign(this.dropDownWrapper[0].style, {
          left: `${x}px`,
          top: `${y}px`,
        });
    });
}

ReferSelect.prototype.createOptions = function () {
    let optionsStr = ''
    $.each(this.options, (index, option) => {
        console.log('option', option)
        optionsStr += `<div class="refer-select-item" data-index=${index}>${option.label}</div>`
    })
    this.dropDownWrapper.html(optionsStr);

    this.dropDownWrapper.off('click.item').on('click.item', (e) => {
       let dataIdx = $(e.target).attr('data-index');
       this.config.onChange && this.config.onChange(this.options[dataIdx]);
    })

}

ReferSelect.prototype.destroy = function () {
    // 移除事件
    document.body.removeEventListener('click', this.dropDownWrapper.__outsideClickEvent__);
    // 删除属性
    delete this.dropDownWrapper.__outsideClickEvent__;
    this.dropDownWrapper.remove();
}

export default ReferSelect;
