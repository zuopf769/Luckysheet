import Store from "../store";
import sheetmanage from "./sheetmanage";
import { luckysheetrefreshgrid } from "../global/refresh";
import { getSheetIndex } from "../methods/get";
import server from './server';

export const COL_TYPES_MAP = {
    'SELECT': 'select'
}

export function columnTypeOperation() {

    // 右键功能键
    // 列类型为下拉列表类型
    $("#luckysheet-col-type-select").click(function (event) {
        console.log('luckysheet-col-type-select', '123')
        console.log(Store.luckysheetRightHeadClickIs)
        Store.luckysheetColumnType = COL_TYPES_MAP.SELECT;
        $("#luckysheet-dataVerification-btn-title").click();
        $("#luckysheet-rightclick-menu").hide();
    });
}

/**
 *
 * @param {*} colIndex 列
 * @param {*} beginIndex  从当前列的第几行开始进行设置
 * @param {*} colDataVerification 数据验证
 */
export function setColDataVerification2Config(colIndex, beginIndex, colDataVerification) {
    // let sheetFile = sheetmanage.getSheetByIndex();
    // let colDataVerification = sheetFile.config.colDataVerification;
    // if (!colDataVerification) {
    //     colDataVerification = {}
    //     sheetFile.config.colDataVerification = colDataVerification;
    // }

    let cfg = $.extend(true, {}, Store.config);
    if (cfg["colDataVerification"] == null) {
        cfg["colDataVerification"] = {};
    }

    cfg["colDataVerification"][`${colIndex}_${beginIndex}`] = colDataVerification;

    if (Store.clearjfundo) {
        Store.jfundo.length = 0;

        let redo = {};

        redo["type"] = "colDataVerificationChange";

        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["sheetIndex"] = Store.currentSheetIndex;

        Store.jfredo.push(redo);
    }

    // TODO  后端实时更新
    server.saveParam("cg", Store.currentSheetIndex, cfg["colDataVerification"], { k: "colDataVerification" });

    Store.config = cfg;
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

    setTimeout(function() {
        // luckysheetrefreshgrid();
    }, 1);
}
