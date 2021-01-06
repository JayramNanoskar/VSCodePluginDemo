"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLHelper = void 0;
const FileHelper_1 = require("./FileHelper");
class HTMLHelper {
    static createLayout(data, uiDetailsMap, isFormRequired) {
        let colClass = "col-sm-12";
        let colCount = data.replace(/\s/g, "");
        switch (colCount) {
            case '1':
                colClass = "col-sm-12";
                break;
            case '2':
                colClass = "col-sm-6";
                break;
            case '3':
                colClass = "col-sm-4";
                break;
            default:
                colClass = "col-sm-3";
        }
        let gridSize = colCount == 1 ? 1 : colCount / 2;
        let totalRows = (Number)(uiDetailsMap.get("len"));
        let quo = totalRows % gridSize;
        let totRow = 0;
        if (quo == 0) {
            totRow = totalRows / gridSize;
        }
        else {
            totRow = totalRows / gridSize + 1;
        }
        let layoutSnippet = "";
        let sec = uiDetailsMap.get("sectionName");
        let formGroup = uiDetailsMap.get("formGroup");
        if (isFormRequired) {
            layoutSnippet = "<div class=\"container\">\n\t<div class=\"row\">\n\t\t<h2>pageHeading</h2>" +
                "\n\t</div>\n\t<form [formGroup]=\"" + FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("componentName")) + "Form\" #f=\"ngForm\" (ngSubmit)=\"onSubmit(f)\">";
        }
        for (let i = 1; i <= totRow; i++) {
            for (let col = 1; col <= colCount; col++) {
                if (formGroup == "tabs") {
                    col = col + 1;
                }
                if (col == 1) {
                    layoutSnippet = layoutSnippet + "\n\t\t<div class=\"form-group row\" id=\"row" + i + "\">";
                    layoutSnippet = layoutSnippet + "\n\t\t\t<div class=\"" + colClass + "\" id=\"" + sec + "_row" + i + "_col" + col + "\">\n\t\t\t</div>";
                }
                else {
                    layoutSnippet = layoutSnippet + "\n\t\t\t<div class=\"" + colClass + "\" id=\"" + sec + "_row" + i + "_col" + col + "\">\n\t\t\t</div>";
                }
            }
            if (formGroup != "tabs") {
                layoutSnippet = layoutSnippet + "\n\t\t</div>";
            }
        }
        if (isFormRequired) {
            layoutSnippet = layoutSnippet + "\n\t</form>\n</div>";
        }
        return layoutSnippet;
    }
    static generateCodeSnippet(data, index, htmlString, uiDetailsMap, hasStyleChecked) {
        let seq = data.sequence;
        let divIds = HTMLHelper.getDivIdBySequence(seq, uiDetailsMap.get("col"), uiDetailsMap.get("sectionName"));
        let htmlControlsText = HTMLHelper.getHtmlTextByType(data, htmlString);
        htmlString = HTMLHelper.addControls(htmlString, htmlControlsText, divIds, data.controlType, data.children);
        return htmlString.replace("pageHeading", uiDetailsMap.get("pageHeading"));
    }
    static getDivIdBySequence(seq, col, sec) {
        let num = Number(seq);
        let den = Number(col) / 2;
        let rem = num % den;
        let quo = ~~(num / den);
        let rowNo = 0;
        let colNo = 0;
        let ids = [];
        if (rem === 0) {
            rowNo = quo;
            colNo = Number(col) - 1;
        }
        else {
            rowNo = quo + 1;
            colNo = rem;
        }
        ids.push(sec + "_row" + rowNo + "_col" + colNo);
        ids.push(sec + "_row" + rowNo + "_col" + (colNo + 1));
        return ids;
    }
    static getHtmlTextByType(data, htmlString) {
        let htmlTexts = [];
        if (data.dataType && data.dataType.replace(/\s/g, "").toLowerCase() === "custom") {
            htmlTexts.push("");
            htmlTexts.push(HTMLHelper.getCustomControlsHTML(data, htmlString));
        }
        else {
            let label = "\t\t\t\t<label for=\"labelFor\" class='col-form-label'>" + data.label + "</label>";
            let datepicker = "";
            if ((data.controlType === "radio" && data.children) || (data.controlType === "checkbox" && data.children)) {
                htmlTexts.push(label);
            }
            else if (data.label !== "" && data.controlType !== "radio" && data.controlType !== "checkbox" && data.controlType !== "button" && data.controlType !== "submit") {
                htmlTexts.push(label);
            }
            if (data.controlType) {
                var tp = data.controlType.replace(/\s/g, "").toLowerCase();
                switch (tp) {
                    case "inputbox":
                        htmlTexts.push("\t\t\t\t<input type='text' id='" + data.controlId + "' name='" + data.controlId + "' value='' class=\"form-control inputfield\" formControlName='" + data.controlId + "'>");
                        break;
                    case "dropdown":
                        htmlTexts.push("\t\t\t\t<select placeholder=\"Placeholder\" id=\"" + data.controlId + "\" class=\"form-control inputfield\" name=\"" + data.controlId + "\" formControlName=" + data.controlId + ">" +
                            "\n\t\t\t\t\t<option *ngFor=\"let item of " + data.controlId + "List\" >" +
                            "\n\t\t\t\t\t\t{{item.viewValue}}" +
                            "\n\t\t\t\t\t</option>" +
                            "\n\t\t\t\t</select>");
                        break;
                    case "submit":
                        htmlTexts.push("\t\t\t\t<input type='submit' class='btn btn-primary btn-sm'  value='" + data.label + "'  (click)=\"on" + tp + "Clicked($event,f)\" >");
                        break;
                    case "button":
                        htmlTexts.push("\t\t\t\t<input type='button' class='btn btn-secondary btn-lg' value='" + data.label + "'  (click)=on" + tp + "Clicked($event,f) >");
                        break;
                    case "datepicker":
                        break;
                    case "radio":
                        let contRadioText = "";
                        for (let i = 0; i < data.children.length; i++) {
                            contRadioText += "\t\t\t\t<input type='radio' id='" + data.children[i].label + "' name='" + data.controlId + "' value='" + data.children[i].label + "' formControlName='" + data.controlId + "' ><label for=" + data.children[i].label + ">" + data.children[i].label + "</label><br>\n";
                        }
                        htmlTexts.push(contRadioText);
                        break;
                    case "checkbox":
                        let contCheckText = "";
                        for (let i = 0; i < data.children.length; i++) {
                            contCheckText += "\t\t\t\t<input type='checkbox' id='" + data.children[i].label + "' value='" + data.children[i].label + "' #" + data.name + "Checkboxes (change)=\"onChange" + data.children[i].name + "('" + data.children[i].controlId + "', $event.target.checked)\">\n\t\t\t\t<label for=" + data.children[i].label + ">" + data.children[i].label + "</label><br>\n";
                        }
                        htmlTexts.push(contCheckText);
                        break;
                    default:
                        console.debug('Default case');
                }
            }
            else {
                htmlTexts.push("");
            }
        }
        return htmlTexts;
    }
    static getCustomControlsHTML(data, htmlString) {
        let retStr = "";
        let fieldId = data.controlId.replace(/\s/g, "");
        if (data.controlType) {
            switch (data.controlType.replace(/\s/g, "").toLowerCase()) {
                case 'table':
                    retStr = "\n\t\t\t\t<div *ngIf=\"is" + fieldId + "DataLoaded\">" +
                        "\n\t\t\t\t\t<div class=\"form-group row\" id=\"row3tab\" style=\"margin-top: -10px;\">\n\t\t\t\t\t\t<div class=\"col-sm-12\" id=\"row3_col1tab\">" +
                        "\n\t\t\t\t\t\t<app-data-table [tableData]=\"" + fieldId + "TableData\" [columnHeader]=\"" + data.controlId + "ColumnHeader\" " +
                        "[sortingRequired]=\"true\" [defaultSortingColumn]=1 [searchRequired] = \"false\" " +
                        "(rowClickEvent)=\"on" + fieldId + "RowClicked($event)\" (customsortEvent)=\"on" + fieldId + "SortClicked($event)\" " +
                        "(deleteButtonEvent)=\"on" + fieldId + "DeleteClicked($event)\"></app-data-table>" +
                        "\n\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t</div>";
                    break;
                case 'tabs':
                    retStr = "\n\t\t\t\t<div *ngIf=\"is" + fieldId + "TabsDataLoaded\">" +
                        "\n\t\t\t\t\t<div class=\"form-group row\" id=\"row3tabs\" style=\"margin-top: -10px;margin-bottom: -10px;\">\n\t\t\t\t\t\t<div class=\"col-sm-12\" id=\"row3_col1tabs\">" +
                        "\n\t\t\t\t\t\t<app-tabs [tabs]=\"" + fieldId + "TabsList\" [selectedTab]=\"" + data.controlId + "SelectedTabNo\" " +
                        "(tabChangedEvent)=\"on" + fieldId + "TabChanged($event)\" ></app-tabs>" +
                        "\n\t\t\t\t</div>" +
                        "\n\t\t\t\t<div class=\"col-sm-12\" id=\"ro\">" +
                        "\n\t\t\t\t\t<input type='Button' class='btn btn-primary btn-sm'  value='SaveAll' " +
                        "\n\t\t\t\t\t (click)=\"on" + fieldId + "SaveAllClicked($event,f)\" >" +
                        "\n\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t</div>";
                    break;
                case 'menulist':
                    retStr = "\n\t\t\t\t<div *ngIf=\"is" + fieldId + "DataLoaded\">" +
                        "\n\t\t\t\t\t<app-menu-list [listData]=\"" + fieldId + "ListData\" " +
                        "(linkClickEvent)=\"" + fieldId + "ClickHandler($event)\"></app-menu-list>\n\t\t\t\t</div>";
                    break;
                case 'tree':
                    retStr = "Tree";
                    break;
                case "panel":
                    retStr = "";
                    let hasStyleChecked = "false";
                    let attr = "";
                    let fileContent = htmlString;
                    if (hasStyleChecked === "false" && data.style !== null && data.style !== undefined && data.style.trim() !== "") {
                        let choice = "";
                        attr = data.style.trim();
                        if (attr === "expanded") {
                            choice = "true";
                            hasStyleChecked = "true";
                        }
                        else if (attr === "collapsed") {
                            choice = "false";
                            hasStyleChecked = "true";
                        }
                        else if (attr === "none") {
                            hasStyleChecked = "true";
                            return retStr;
                        }
                        let check = fileContent.match(/<\/mat-expansion-panel.?>/gm);
                        let match1Text2 = fileContent.match(/<div.*row.*[\s\S].*pageHeading.*[\s\S].*/gm);
                        let match1Text = fileContent.match(/onSubmit\(f\).*/gm);
                        if (typeof match1Text !== 'undefined' && match1Text !== null && typeof match1Text2 !== 'undefined' && match1Text2 !== null) {
                            fileContent = fileContent.replace(match1Text2[0], "");
                        }
                        let newmatch1Text = fileContent.match(/<\/mat-expansion-panel.?>(?![\s\S]*\/mat-expansion-panel.?>)/gm); //last occ
                        let match2Text = fileContent.match(/<\/form>.*/gm);
                        if (check == null && typeof match1Text !== 'undefined' && match1Text !== null && typeof match2Text !== 'undefined' && match2Text !== null) {
                            let frontContent = "onSubmit\(f\)\">\n\t<mat-expansion-panel id='" + data.controlId + "' [expanded]='" + choice + "'>\n\t<mat-expansion-panel-header><div class=\"row\">\n\t\t<h2>" + data.label + "</h2>" +
                                "\n\t</div>\n\t</mat-expansion-panel-header>";
                            let backContent = "</mat-expansion-panel>\n</form>";
                            fileContent = fileContent.replace(match1Text[0], frontContent);
                            fileContent = fileContent.replace(match2Text[0], backContent);
                            return retStr = fileContent;
                        }
                        else if (check != null && typeof newmatch1Text !== 'undefined' && newmatch1Text !== null) {
                            let frontContent = "</mat-expansion-panel>\n\t<mat-expansion-panel id='" + data.controlId + "' [expanded]='" + choice + "'>\n\t<mat-expansion-panel-header><div class=\"row\">\n\t\t<h2>" + data.label + "</h2>" +
                                "\n\t</div>\n\t</mat-expansion-panel-header>";
                            let backContent = "\t</mat-expansion-panel>\n</form>";
                            let ind = fileContent.lastIndexOf(check[check.length - 1]);
                            fileContent = fileContent.substring(0, ind) + frontContent + fileContent.substring((ind + check[check.length - 1].length), (fileContent.length + frontContent.length));
                            fileContent = fileContent.replace('</form>', backContent);
                            return retStr = fileContent;
                        }
                    }
                    break;
                default:
                    retStr = "Default";
            }
        }
        return retStr;
    }
    static addControls(htmlString, htmlControlsText, divIds, ctrlType, parentId) {
        if (ctrlType && (ctrlType.replace(/\s/g, "").toLowerCase() === "table" || ctrlType.replace(/\s/g, "").toLowerCase() === "menulist" || ctrlType.replace(/\s/g, "").toLowerCase() === "tabs")) {
            let rowID = divIds[0].split("_");
            let rowRegexString = "^.*" + rowID[0] + ".*";
            var rowTemp = "";
            var rowRegex = new RegExp(rowRegexString, "gm");
            var rowMatchText = htmlString.match(rowRegex);
            if (typeof rowMatchText !== 'undefined' && rowMatchText !== null) {
                rowTemp = htmlString.replace(rowRegex, "\n" + htmlControlsText[1] + "\n" + rowMatchText[0]);
            }
            if (ctrlType.replace(/\s/g, "").toLowerCase() === "menulist") {
                rowTemp = rowTemp.replace("class=\"container\"", "");
            }
            if (ctrlType.replace(/\s/g, "").toLowerCase() === "tabs") {
                //rowTemp =  rowTemp.replace("class=\"container\"","");
                rowTemp = rowTemp.replace("<div class=\"row\">\n\t\t<h2>pageHeading</h2>\n\t</div>", "");
            }
            return !rowTemp ? htmlString : rowTemp;
        }
        else if (ctrlType && (ctrlType.replace(/\s/g, "").toLowerCase() === "button" || ctrlType.replace(/\s/g, "").toLowerCase() === "submit")) {
            let regexString = "^.*" + divIds[0] + ".*>.*";
            var regex = new RegExp(regexString, "gm");
            var matchText = htmlString.match(regex);
            var temp = "";
            if (typeof matchText !== 'undefined' && matchText !== null) {
                temp = htmlString.replace(regex, matchText[0] + "\n" + htmlControlsText[0]);
            }
            return !temp ? htmlString : temp;
        }
        else if (ctrlType && ctrlType.replace(/\s/g, "").toLowerCase() === "panel") {
            var rowTemp = "";
            return htmlControlsText[1];
        }
        else {
            let regexString = "^.*" + divIds[0] + ".*>.*";
            var regex = new RegExp(regexString, "gm");
            var matchText = htmlString.match(regex);
            var temp = "";
            if (typeof matchText !== 'undefined' && matchText !== null) {
                temp = htmlString.replace(regex, matchText[0] + "\n" + htmlControlsText[0]);
            }
            let regexString1 = "^.*" + divIds[1] + ".*>.*";
            var regex1 = new RegExp(regexString1, "gm");
            var matchText1 = temp.match(regex1);
            var temp1 = "";
            if (typeof matchText1 !== 'undefined' && matchText1 !== null) {
                temp1 = temp.replace(regex1, matchText1[0] + "\n" + htmlControlsText[1]);
            }
            return temp1 == "" ? htmlString : temp1;
        }
    }
}
exports.HTMLHelper = HTMLHelper;
//# sourceMappingURL=htmlHelper.js.map