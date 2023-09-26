import locale from '../locale/locale';
import { transformRangeToAbsolute } from '../utils/util';
import Store from '../store';
import { getRangetxt } from '../methods/get';
import dataVerificationCtrl from './dataVerificationCtrl';
import { selectionCopyShow } from './select';
import sheetmanage from "./sheetmanage";
import editor from "../global/editor";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../global/refresh";

// 通过选区控制单元格是否可编辑
const cellEditableCtrl = {
    editableStatus: false,// 是否可编辑
    selectRange: [], // 框选的单元格range
    createDialog: function(editableStatus) {
        let _this = this;

        let dataSource = "0";
        let txt ='';

        _this.editableStatus = editableStatus;

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

        var _this = this;
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

            let d = editor.deepCopyFlowData(Store.flowdata);

            console.log('sheet data: ', d);

            console.log('Store.luckysheet_select_save', Store.luckysheet_select_save)

            for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                let row_st = Store.luckysheet_select_save[s]["row"][0],
                    row_ed = Store.luckysheet_select_save[s]["row"][1];
                let col_st = Store.luckysheet_select_save[s]["column"][0],
                    col_ed = Store.luckysheet_select_save[s]["column"][1];

                _this.updateEditableCell(d, _this.editableStatus, row_st, row_ed, col_st, col_ed);


            }
            jfrefreshgrid(d, Store.luckysheet_select_save);
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
    dataAllocation: function(){
        let _this = this;
        //单元格范围
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rangeTxt = getRangetxt(Store.currentSheetIndex, range, Store.currentSheetIndex);
        $("#luckysheet-dataVerificationRange-dialog .luckysheet-modal-dialog-content input").val(rangeTxt);
    },
    updateEditableCell: function(d, editableStatus, row_st, row_ed, col_st, col_ed) {
        if (d == null || editableStatus == null) {
            return;
        }

        for (let r = row_st; r <= row_ed; r++) {
            if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
                continue;
            }

            for (let c = col_st; c <= col_ed; c++) {
                let cell = d[r][c];
                if (!cell.customKey) {
                    cell.customKey = {};
                }
                cell.customKey.editable = editableStatus;
                console.log('cell', cell);
            }
        }


    }
}

export function checkCellEditable(d, r, c) {
    let cell = d[r][c];
    if (cell && cell.customKey && cell.customKey.editable === false) {
        return false;
    }
    return true;
}

export default cellEditableCtrl;
