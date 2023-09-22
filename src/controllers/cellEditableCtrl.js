import locale from '../locale/locale';
import { replaceHtml } from '../utils/util';
import { modelHTML } from './constant';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';

// 通过选区控制单元格是否可编辑
const cellEditableCtrl = {
    editable: false,// 是否可编辑
    selectRange: [], // 框选的单元格range
    createDialog: function(){
        let _this = this;

        const _locale = locale();
        const ceText = _locale.cellEditable;
        const buttonText = _locale.button;

        $("#luckysheet-cellEditable-dialog").remove();

        $("body").append(replaceHtml(modelHTML, {
            "id": "luckysheet-cellEditable-dialog",
            "addclass": "luckysheet-cellEditable-dialog",
            "title": ceText.selectCellRange,
            "content": `<input readonly="readonly" placeholder="${ceText.selectCellRange2}"/>`,
            "botton":  `<button id="luckysheet-cellEditable-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button id="luckysheet-cellEditable-dialog-close" class="btn btn-default">${buttonText.close}</button>`,
            "style": "z-index:100003"
        }));
        let $t = $("#luckysheet-cellEditable-dialog")
                .find(".luckysheet-modal-dialog-content")
                .css("min-width", 300)
                .end(),
            myh = $t.outerHeight(),
            myw = $t.outerWidth();
        let winw = $(window).width(), winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        $("#luckysheet-cellEditable-dialog").css({
            "left": (winw + scrollLeft - myw) / 2,
            "top": (winh + scrollTop - myh) / 3
        }).show();

        _this.dataAllocation();
    },
    init: function() {

        // 确认按钮
        $(document).off("click.ceRangeConfirm").on("click.ceRangeConfirm", "#luckysheet-cellEditable-dialog-confirm", function(e) {
            $("#luckysheet-cellEditable-dialog").hide();
        })

        // 取消按钮
        $(document).off("click.ceRangeClose").on("click.ceRangeClose", "#luckysheet-cellEditable-dialog-close", function(e) {
            $("#luckysheet-cellEditable-dialog").hide();
        });

    },
    dataAllocation: function(){
        let _this = this;

        //单元格范围
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rangeTxt = getRangetxt(Store.currentSheetIndex, range, Store.currentSheetIndex);
        $("#luckysheet-cellEditable-dialog .luckysheet-modal-dialog-content input").val(rangeTxt);
    },
    getTxtByRange: function(range){

    },
    getRangeByTxt: function(txt){

    },
    cellFocus: function(r, c, clickMode){

    },
}

export default cellEditableCtrl;
