import { replaceHtml } from "../utils/util";
import { modelHTML } from "./constant";
import locale from "../locale/locale";
import Store from '../store';
import { getSheetIndex } from '../methods/get';
import server from './server';
import { luckysheetrefreshgrid } from '../global/refresh';

// 下拉选项
const option = {label: '', value: ''};

// 下拉列表（参照）: 浮层显示top10；浮层里面显示按钮，点击更多显示
const selectListCtrl = {
  mode: 'local',// 本地or远程
  type: 'single',// 单选or多选
  options: new Array(3).fill(option), // 下拉选项
  selectList: null, // 存放最终的配置数据
  createOptionsList: function () {
    let selectOptions = '';
    this.options.forEach((item, index) => {
        selectOptions += `<div class="layui-form-item select-item-option">
                            <span class="move-icon iconfont-luckysheet2 luckysheet2-iconfont-drag"></span>
                            <div class="layui-input-inline">
                                <input type="text" name="label-${index}" class="layui-input" placeholder="请输入选项名称">
                            </div>
                            <div class="layui-input-inline">
                                <input type="text" name="value-${index}" class="layui-input" placeholder="请输入选项值">
                            </div>
                            <span class="delete-icon iconfont-luckysheet luckysheet-iconfont-shanchu" data-idx="${index}"></span>
                        </div>`
    })
    $('#luckysheet-insertSelect-dialog #select-options-form').html(selectOptions)

  },
  createDialog: function () {
    let _this = this;

    const _locale = locale();
    const toolbarText = _locale.toolbar;
    const buttonText = _locale.button;

    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-insertSelect-dialog").remove();

    let localDataContent = `<div id="local-data-wrap">
                                <div class="layui-form" id="type-wrap">
                                    <input type="radio" name="type" value="single" title="单选" lay-filter="type-radio-filter" checked>
                                    <input type="radio" name="type" value="multi" lay-filter="type-radio-filter" title="多选">
                                </div>
                                <form class="layui-form" id="select-options-form" action="" lay-filter="select-options-filter">

                                </form>
                                <div id="add-btn-wrap">
                                    <span class="add-icon iconfont-luckysheet luckysheet-iconfont-jia"></span><span>新增选项</span>
                                </div>
                            </div>`

    let content = `<div class="box">
                        <div class="layui-tab layui-tab-brief">
                            <ul class="layui-tab-title">
                                <li class="layui-this">本地数据</li>
                                <li>远程数据</li>
                            </ul>
                            <div class="layui-tab-content">
                                <div class="layui-tab-item layui-show">
                                    ${localDataContent}
                                </div>
                                <div class="layui-tab-item">内容-2</div>
                            </div>
                        </div>
                    </div>`;

    $("body").append(
      replaceHtml(modelHTML, {
        id: "luckysheet-insertSelect-dialog",
        addclass: "luckysheet-insertSelect-dialog",
        title: toolbarText.insertSelect,
        content: content,
        botton: `<button id="luckysheet-insertSelect-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${buttonText.cancel}</button>`,
        style: "z-index:100003",
      })
    );

    layui.use('form', function(){
        var form = layui.form; // 只有执行了这一步，部分表单元素才会自动修饰成功
        form.render();
    });

    let $t = $("#luckysheet-insertSelect-dialog")
        .find(".luckysheet-modal-dialog-content")
        .css("min-width", 360)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-insertSelect-dialog")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();
  },
  init: function () {
    let _this = this;
    _this.createOptionsList()


    $('#luckysheet-insertSelect-dialog .select-item-option .delete-icon').off("click.selectDelete").on("click.selectDelete",  function(e) {
        let idx = $(e.currentTarget).attr('data-idx');
        console.log('xxx', idx)
        _this.options.splice(idx, 1);
        // 重新创建下拉选项并且绑定事件
        _this.init();
    })

    layui.use(function(){
        var form = layui.form;

        $(document).off("click.selectAdd").on("click.selectAdd", "#luckysheet-insertSelect-dialog #add-btn-wrap", function(e){
            var data = form.val('select-options-filter');
            _this.saveOptionsData(data);
            _this.options.push(option);
            // 重新创建下拉选项并且绑定事件
            _this.init();
        })


        form.on('radio(type-radio-filter)', function(data){
            console.log(data)
            _this.type = data.value;
        })

        // 表单数据赋值
        form.val('select-options-filter', _this.options2FormData());

         //确认按钮
        $(document).off("click.confirm").on("click.confirm", "#luckysheet-insertSelect-dialog-confirm", function(e){
            debugger;
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let rowIndex = last.row_focus || last.row[0];
            let colIndex = last.column_focus || last.column[0];

            // 获取表单数据
            var data = form.val('select-options-filter');
            console.log(data)
            _this.saveOptionsData(data);

            let item = {
                options: _this.options
            }

            let historySelectList = $.extend(true, {}, _this.selectList);
            let currentSelectList = $.extend(true, {}, _this.selectList);

            currentSelectList[rowIndex + "_" + colIndex] = item;

            _this.ref(
                historySelectList,
                currentSelectList,
                Store.currentSheetIndex
            );

        })
    })
  },
  saveOptionsData: function(data) {
    var _this = this;
    var len = _this.options.length;
    _this.options = []
    for (var i = 0; i < len; i++) {
        let op = {};
        op.label = data[`label-${i}`]
        op.value = data[`value-${i}`];
        _this.options.push(op);
    }
  },
  options2FormData: function() {
    var _this = this;
    var len = _this.options.length;
    var obj = {};
    for (var i = 0; i < len; i++) {
        let op = _this.options[i];
        obj[`label-${i}`] = op.label;
        obj[`value-${i}`] = op.value;
    }
    return obj;
  },
  cellFocus: function(r, c){

  },
  ref: function(historySelectList, currentSelectList, sheetIndex){
    let _this = this;

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        let redo = {};
        redo["type"] = "updateSelectList";
        redo["sheetIndex"] = sheetIndex;
        redo["historySelectList"] = historySelectList;
        redo["currentSelectList"] = currentSelectList;
        Store.jfredo.push(redo);
    }
    debugger;
    _this.currentSelectList = currentSelectList;
    Store.luckysheetfile[getSheetIndex(sheetIndex)].selectList = currentSelectList;

    // 共享编辑模式
    if(server.allowUpdate){
        server.saveParam("all", sheetIndex, currentSelectList, { "k": "selectList" });
    }

    setTimeout(function () {
        luckysheetrefreshgrid();
    }, 1);
},
};

export default selectListCtrl;
