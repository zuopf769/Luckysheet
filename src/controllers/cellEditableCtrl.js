import locale from '../locale/locale';
import { replaceHtml,transformRangeToAbsolute } from '../utils/util';
import { modelHTML } from './constant';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';
import dataVerificationCtrl from './dataVerificationCtrl';
import { selectionCopyShow } from './select';
import sheetmanage from "./sheetmanage";

// 通过选区控制单元格是否可编辑
const cellEditableCtrl = {
    editable: false,// 是否可编辑
    selectRange: [], // 框选的单元格range
    createDialog2: function(){
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

        _this.dataAllocation2();
    },
    createDialog: function() {
        let _this = this;

        let dataSource = "0";
        let txt ='';

        dataVerificationCtrl.rangeDialog(dataSource, txt);

        dataVerificationCtrl.selectRange = [];

        let range = dataVerificationCtrl.getRangeByTxt(txt);
        if(range.length > 0){
            for(let s = 0; s < range.length; s++){
                let r1 = range[s].row[0], r2 = range[s].row[1];
                let c1 = range[s].column[0], c2 = range[s].column[1];

                let row = Store.visibledatarow[r2],
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2],
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                dataVerificationCtrl.selectRange.push({
                    "left": col_pre,
                    "width": col - col_pre - 1,
                    "top": row_pre,
                    "height": row - row_pre - 1,
                    "left_move": col_pre,
                    "width_move": col - col_pre - 1,
                    "top_move": row_pre,
                    "height_move": row - row_pre - 1,
                    "row": [r1, r2],
                    "column": [c1, c2],
                    "row_focus": r1,
                    "column_focus": c1
                });
            }
        }

        selectionCopyShow(dataVerificationCtrl.selectRange);
        _this.dataAllocation();

    },
    init: function() {

        // 确认按钮
        // $(document).off("click.ceRangeConfirm").on("click.ceRangeConfirm", "#luckysheet-cellEditable-dialog-confirm", function(e) {
        //     $("#luckysheet-cellEditable-dialog").hide();
        // })

        // 取消按钮
        // $(document).off("click.ceRangeClose").on("click.ceRangeClose", "#luckysheet-cellEditable-dialog-close", function(e) {
        //     $("#luckysheet-cellEditable-dialog").hide();
        // });

        // 确认按钮
        $(document).off("click.luckysheetCellEditable.ceRangeConfirm").on("click.luckysheetCellEditable.ceRangeConfirm", "#luckysheet-dataVerificationRange-dialog-confirm", function(e) {

            let _locale = locale();
            let local_protection = _locale.protection;

            let sheetFile = sheetmanage.getSheetByIndex();
            console.log('sheetFile', sheetFile);

            let rangeText =  $("#luckysheet-dataVerificationRange-dialog .luckysheet-modal-dialog-content input").val();

            let range = dataVerificationCtrl.getRangeByTxt(rangeText);

            if(rangeText.length==0){
                alert(local_protection.rangeItemErrorRangeNull);
                return;
            }

            rangeText = transformRangeToAbsolute(rangeText);
            console.log('rangeText', rangeText)

            let fileEditable = sheetFile.config.editable;
            if (!fileEditable) {
                fileEditable = {}
                sheetFile.config.editable = {};
            }
            let allowRangeList = fileEditable.allowRangeList;
            if (!allowRangeList) {
                allowRangeList = [];
                fileEditable.allowRangeList = [];
            }
            fileEditable.allowRangeList.push(rangeText)

            $("#luckysheet-modal-dialog-mask").hide();
            // 因为大家都调用dataVerificationCtrl.rangeDialog，所以需要都关闭
            $("#luckysheet-dataVerificationRange-dialog").hide();
            $("#luckysheet-protection-rangeItem-dialog").hide();
            $("#luckysheet-cellEditable-dialog").hide();

            let emptyRange = [];
            selectionCopyShow(emptyRange);
        });
        // 关闭按钮
        $(document).off("click..ceRangeClose").on("click.luckysheetCellEditable.ceRangeClose", "#luckysheet-dataVerificationRange-dialog-close", function(e) {
            $("#luckysheet-modal-dialog-mask").hide();
            // 因为大家都调用dataVerificationCtrl.rangeDialog，所以需要都关闭
            $("#luckysheet-dataVerificationRange-dialog").hide();
            $("#luckysheet-protection-rangeItem-dialog").hide();
            $("#luckysheet-cellEditable-dialog").hide();

            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click.luckysheetCellEditable.luckysheetCellEditable", "#luckysheet-dataVerificationRange-dialog .luckysheet-modal-dialog-title-close", function(e) {
            $("#luckysheet-modal-dialog-mask").hide();
            // 因为大家都调用dataVerificationCtrl.rangeDialog，所以需要都关闭
            $("#luckysheet-dataVerificationRange-dialog").hide();
            $("#luckysheet-protection-rangeItem-dialog").hide();
            $("#luckysheet-cellEditable-dialog").hide();

            let range = [];
            selectionCopyShow(range);
        });

    },
    dataAllocation2: function(){
        let _this = this;

        //单元格范围
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rangeTxt = getRangetxt(Store.currentSheetIndex, range, Store.currentSheetIndex);
        $("#luckysheet-cellEditable-dialog .luckysheet-modal-dialog-content input").val(rangeTxt);
    },
    dataAllocation: function(){
        let _this = this;
        //单元格范围
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rangeTxt = getRangetxt(Store.currentSheetIndex, range, Store.currentSheetIndex);
        $("#luckysheet-dataVerificationRange-dialog .luckysheet-modal-dialog-content input").val(rangeTxt);
    }
}

export default cellEditableCtrl;
