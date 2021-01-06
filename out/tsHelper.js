"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSHelper = void 0;
const FileHelper_1 = require("./FileHelper");
class TSHelper {
    static updateTypeScriptFile(data, htmlString, uiDetailsMap, tsStringArray) {
        if (data.style !== null && data.style !== undefined && data.style.trim() !== "") {
            return tsStringArray;
        }
        if (!tsStringArray[0]) {
            tsStringArray.splice(0, 1, FileHelper_1.FileHelper.getComponentString(uiDetailsMap));
            let commonAttr = "\n\t" + FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("componentName")) + "Form: FormGroup;\n\tonSubmit(form) {\n\t\t\n\t}\n";
            tsStringArray.splice(0, 1, TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), commonAttr, tsStringArray[0]));
            let consParam = "private formBuilder: FormBuilder";
            tsStringArray.splice(0, 1, TSHelper.addInConstructorParamenter(consParam, tsStringArray[0], uiDetailsMap));
            let consDet = "\n\tthis." + FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("componentName")) + "Form = this.formBuilder.group({ \n\t });";
            tsStringArray.splice(0, 1, TSHelper.addFormGroupInConstructor(consDet, tsStringArray[0]));
        }
        if (!tsStringArray[1]) {
            tsStringArray.splice(1, 1, FileHelper_1.FileHelper.getServiceString(uiDetailsMap));
        }
        let retStringArray = ["", ""];
        if (data.controlType) {
            if (data.dataType && data.dataType.replace(/\s/g, "").toLowerCase() === "custom") {
                retStringArray = TSHelper.updateCustomComponentChanges(data, tsStringArray, uiDetailsMap);
            }
            else {
                retStringArray = TSHelper.updateHTMLComponentChanges(data, tsStringArray, uiDetailsMap);
            }
            if (retStringArray[0] !== "") {
                tsStringArray.splice(0, 1, retStringArray[0]);
            }
            if (retStringArray[1] !== "") {
                tsStringArray.splice(1, 1, retStringArray[1]);
            }
        }
        return tsStringArray;
    }
    static updateHTMLComponentChanges(data, tsStringArray, uiDetailsMap) {
        let modStrArray = ["", ""];
        let compStr = "";
        let serStr = "";
        let bindingStr = "";
        var tp = data.controlType.replace(/\s/g, "").toLowerCase();
        switch (tp) {
            case "inputbox":
                bindingStr = "\n\t\t" + data.controlId + ": new FormControl(''),";
                compStr = TSHelper.updateFormBinding(uiDetailsMap.get("componentName"), bindingStr, tsStringArray[0]);
                break;
            case "dropdown":
                let url = data.serviceCall;
                if (url) {
                    url = url.replace(/\s/g, "");
                }
                let cnt = "\n\t\t" + data.controlId + "List = this.get" + data.controlId + "List();\n\t" +
                    "get" + data.controlId + "List() {\n\t\tthis." + uiDetailsMap.get("moduleName") + "Service.get" + data.controlId + "List().subscribe(" +
                    "\n\t\t\tresponse =>this.handleSuccessfulResponse" + data.controlId + "(response),\n\t\t);\n\t}" +
                    "\n\thandleSuccessfulResponse" + data.controlId + "(response){\n\t\tthis." + data.controlId + "List=response;\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), cnt, tsStringArray[0]);
                bindingStr = data.controlId + ": new FormControl(''),";
                compStr = TSHelper.updateFormBinding(uiDetailsMap.get("componentName"), bindingStr, compStr);
                let cont = "\n\tget" + data.controlId + "List(){\n\t\t" +
                    "return this.httpClient.get('" + url + "');\n\t}";
                serStr = TSHelper.updateServiceTsFileString(uiDetailsMap.get("componentName"), cont, data, uiDetailsMap.get("moduleName"), tsStringArray[1]);
                break;
            case "button":
                let cntB = "\n\ton" + tp + "Clicked($node,form){\n\t\tconsole.log('Button Clicked.')\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), cntB, tsStringArray[0]);
                break;
            case "submit":
                let urlStr = data.serviceCall;
                if (urlStr) {
                    urlStr = urlStr.replace(/\s/g, "");
                }
                let cntS = "\n\ton" + tp + "Clicked($node,form){\n\t\tconsole.log('Submit Button Clicked.');" +
                    "\n\t\tthis.formFieldsData = new FormEntry(this." + FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("componentName")) + "Form.value);" +
                    "\n\t\tthis." + uiDetailsMap.get("moduleName") + "Service.post" + data.controlId + "Data(this.formFieldsData,'" + urlStr + "').subscribe(" +
                    "data => {\n\t\t\tform.reset();\n\t\t\talert(\"Form Submitted Successfully.\");" +
                    "\n\t\t});\n\t\treturn true;" +
                    "\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), cntS, tsStringArray[0]);
                let contS = "\n\tpost" + data.controlId + "Data(formEntry: FormEntry, url:string){\n\t\t" +
                    "return this.httpClient.post('" + urlStr + "',formEntry);\n\t}";
                serStr = TSHelper.updateServiceTsFileString(uiDetailsMap.get("componentName"), contS, data, uiDetailsMap.get("moduleName"), tsStringArray[1]);
                break;
            case "radio":
                if (data.children) {
                    bindingStr = "\n\t\t" + data.controlId + ": new FormControl(''),";
                    compStr = TSHelper.updateFormBinding(uiDetailsMap.get("componentName"), bindingStr, tsStringArray[0]);
                }
                break;
            case "checkbox":
                if (data.children) {
                    let cntS = "\n\t\t@ViewChildren(\"" + data.name + "Checkboxes\") " + data.name + "Checkboxes: QueryList<ElementRef>;" +
                        "\n\t\tonChange" + data.name + "(name: string, isChecked: boolean){" +
                        "\n\t\t\tconst checkedVals = (this." + FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("componentName")) + "Form.controls." + data.controlId + " as FormArray);" +
                        "\n\t\t\tif (isChecked) {\n\t\t\t\tcheckedVals.push(new FormControl(name));" +
                        "\n\t\t\t} else {\n\t\t\t\tconst index = checkedVals.controls.findIndex(x => x.value === name);" +
                        "\n\t\t\t\tcheckedVals.removeAt(index);\n\t\t\t}\n\t\t}" +
                        "\n\t\treset" + data.name + "Checkbox(){" +
                        "\n\t\t\tthis." + data.name + "Checkboxes.forEach((element) => {" +
                        "\n\t\t\t\telement.nativeElement.checked = false;\n\t\t\t});\n\t\t}";
                    compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), cntS, tsStringArray[0]);
                    bindingStr = "\n\t\t" + data.controlId + ": this.formBuilder.array([]),";
                    compStr = TSHelper.updateFormBinding(uiDetailsMap.get("componentName"), bindingStr, compStr);
                    let importMap = new Map();
                    importMap.set("Common", "\nimport{ViewChildren,QueryList,ElementRef} from \"@angular/core\";");
                    let appModImpStr = "";
                    compStr = TSHelper.updateImportInComponent(importMap, appModImpStr, compStr);
                }
                break;
            default:
                console.log('Default case');
        }
        if (compStr !== "") {
            modStrArray.splice(0, 1, compStr);
        }
        if (serStr !== "") {
            modStrArray.splice(1, 1, serStr);
        }
        return modStrArray;
    }
    static updateCustomComponentChanges(data, tsStringArray, uiDetailsMap) {
        let modStrArray = ["", ""];
        let compStr = "";
        let serStr = "";
        var tp = data.controlType.replace(/\s/g, "").toLowerCase();
        let serContent = "";
        let tsContent = "";
        let serviceName = FileHelper_1.FileHelper.camelCase(FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("moduleName")) + "Service");
        let urlArray = data.serviceCall;
        let url = [];
        if (urlArray) {
            urlArray = urlArray.replace(/\s/g, "");
            url = urlArray.split("|");
        }
        let fieldId = data.controlId.replace(/\s/g, "");
        switch (tp) {
            case "table":
                tsContent = "\n\t" + fieldId + "ColumnHeader = this.get" + fieldId + "ColumnHeader();" +
                    "\n\t" + fieldId + "TableData = this.get" + fieldId + "TableData();" +
                    "\n\tis" + fieldId + "DataLoaded = false;" +
                    "\n\tget" + fieldId + "ColumnHeader(){\n\t\treturn this." + serviceName + ".get" + fieldId + "ColumnHeader().subscribe(\n\t\t\t" +
                    "response =>this.handleSuccessfulResponse" + fieldId + "Header(response)\n\t\t);\n\t}" +
                    "\n\thandleSuccessfulResponse" + fieldId + "Header(response){\n\t\tthis." + fieldId + "ColumnHeader=response;\n\t}" +
                    "\n\tget" + fieldId + "TableData(){\n\t\treturn this." + serviceName + ".get" + fieldId + "TableData().subscribe(\n\t\t\t" +
                    "response =>this.handleSuccessfulResponse" + data.controlId + "Data(response)\n\t\t);\n\t}" +
                    "\n\thandleSuccessfulResponse" + fieldId + "Data(response){\n\t\tthis." + fieldId + "TableData=response;" +
                    "\n\t\t\tthis.is" + fieldId + "DataLoaded = true;\n\t}" +
                    "\n\ton" + fieldId + "RowClicked($node){\n\t\tconsole.log('Row Clicked.')\n\t}" +
                    "\n\ton" + fieldId + "DeleteClicked($node){\n\t\tconsole.log('Delete Clicked.')\n\t}" +
                    "\n\ton" + fieldId + "SortClicked($node){\n\t\tconsole.log('Sort Clicked.')\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), tsContent, tsStringArray[0]);
                serContent = "\n\tget" + fieldId + "ColumnHeader(){\n\t\t" +
                    "return this.httpClient.get('" + url[0] + "');\n\t}" +
                    "\n\tget" + fieldId + "TableData(){\n\t\t" +
                    "return this.httpClient.get('" + url[1] + "');\n\t}";
                serStr = TSHelper.updateServiceTsFileString(uiDetailsMap.get("componentName"), serContent, data, uiDetailsMap.get("moduleName"), tsStringArray[1]);
                break;
            case "menulist":
                tsContent = "\n\t" + fieldId + "ListData= this.get" + fieldId + "ListData();\n\tis" + fieldId + "DataLoaded = false;" +
                    "\n\tget" + fieldId + "ListData(){\n\t\treturn this." + serviceName + ".get" + fieldId + "ListData().subscribe(\n\t\t\t" +
                    "response =>this.handleResponse" + fieldId + "Data(response)\n\t\t);\n\t}" +
                    "\n\thandleResponse" + fieldId + "Data(response){\n\t\tthis." + fieldId + "ListData=response;" +
                    "\n\t\t\tthis.is" + fieldId + "DataLoaded = true;\n\t}" +
                    "\n\t" + fieldId + "ClickHandler($node){\n\t\tconsole.log('Link Clicked.');" +
                    "\n\tthis.router.navigateByUrl($node);\n\t}";
                serContent = "\n\tget" + fieldId + "ListData(){\n\t\t" +
                    "return this.httpClient.get('" + url[0] + "');\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), tsContent, tsStringArray[0]);
                serStr = TSHelper.updateServiceTsFileString(uiDetailsMap.get("componentName"), serContent, data, uiDetailsMap.get("moduleName"), tsStringArray[1]);
                break;
            case "tabs":
                tsContent = "\n\t" + fieldId + "TabsData= this.get" + fieldId + "TabsData();\n\tis" + fieldId + "TabsDataLoaded = false;" +
                    "\n\t" + fieldId + "TabsList : Tab[] = [];\n\t" + fieldId + "NamesList : string[] = [];\n\t" + fieldId + "SelectedTabNo = 0;" +
                    "\n\tget" + fieldId + "TabsData(){\n\t\treturn this." + serviceName + ".get" + fieldId + "TabsData().subscribe(\n\t\t\t" +
                    "response =>this.handleResponse" + fieldId + "TabsData(response)\n\t\t);\n\t}" +
                    "\n\thandleResponse" + fieldId + "TabsData(response){\n\t\tthis." + fieldId + "TabsList = [];" + "\n\t\tresponse.forEach(element => {" +
                    "\n\t\t\tthis." + fieldId + "NamesList.push(element.componentName);" +
                    "\n\t\t\tthis." + fieldId + "TabsList.push(new Tab(element.componentName, element.title, element.tabData));\n\t\t});" +
                    "\n\t\t\tthis.is" + fieldId + "TabsDataLoaded = true;\n\t}" +
                    "\n\ton" + fieldId + "TabChanged($node){\n\t\tconsole.log('Tab Clicked event in Parent Component.');" +
                    "\n\t\t/*this.router.navigateByUrl($node);*/\n\t}" +
                    "\n\ton" + fieldId + "SaveAllClicked($node,form){" +
                    "\n\t\tconsole.log('Submit Parent SubmitvButton Clicked.');" +
                    "\n\t\tthis." + fieldId + "NamesList.forEach( (element) => {" +
                    "\n\t\t\t/*Object.defineProperty(this.allDataObj, element, {value : new FormEntry(JSON.parse(sessionStorage.getItem(element+'Form'))),writable: true,	enumerable: true});*/" +
                    "\n\t\t\tthis.allDataObj = Object.assign(this.allDataObj, new FormEntry(JSON.parse(sessionStorage.getItem(element+'Form'))));" +
                    "\n\t\t});" +
                    "\n\t\tthis." + serviceName + ".postAll" + fieldId + "Data(this.allDataObj,'http://localhost:8080/submitAllTabData').subscribe(data => {" +
                    "\n\t\t\tform.reset();\n\t\t});\n\t\treturn true;" +
                    "\n\t}";
                serContent = "\n\tget" + fieldId + "TabsData(){\n\t\t" +
                    "return this.httpClient.get('" + url[0] + "');\n\t}" +
                    "\n\tpostAll" + fieldId + "Data(formEntry: FormEntry, url:string){\n\t\t" +
                    "return this.httpClient.post(url,formEntry);\n\t}";
                compStr = TSHelper.modifyTSFileString(uiDetailsMap.get("componentName"), tsContent, tsStringArray[0]);
                serStr = TSHelper.updateServiceTsFileString(uiDetailsMap.get("componentName"), serContent, data, uiDetailsMap.get("moduleName"), tsStringArray[1]);
                let consData = "this.get" + fieldId + "TabsData();";
                compStr = TSHelper.addFormGroupInConstructor(consData, compStr);
                let importMap = new Map();
                importMap.set("Tab", "\nimport {Tab} from \"../../sharedComponent/tabs/tab.model\";");
                importMap.set("registerComponent", "\nimport {registerComponent} from '../../app-component-registry';");
                let modulename = FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName"));
                let appModImpStr = "\n\n\n@registerComponent";
                compStr = TSHelper.updateImportInComponent(importMap, appModImpStr, compStr);
                break;
            default:
                console.log('Default case');
        }
        if (compStr !== "") {
            modStrArray.splice(0, 1, compStr);
        }
        if (serStr !== "") {
            modStrArray.splice(1, 1, serStr);
        }
        return modStrArray;
    }
    static modifyTSFileString(componentName, content, fileContent) {
        var txt = fileContent;
        var matchText = fileContent.match(/^.*class.*{.*/gm);
        if (typeof matchText !== 'undefined' && matchText !== null) {
            txt = fileContent.replace(matchText[0], matchText[0] + "\n" + content + "\n");
        }
        return txt;
    }
    static updateFormBinding(componentName, content, fileContent) {
        var txt = fileContent;
        var matchText = fileContent.match(/^.*this\.formBuilder\.group.*\({.*/gm);
        if (typeof matchText !== 'undefined' && matchText !== null) {
            txt = fileContent.replace(matchText[0], matchText[0] + content);
        }
        return txt;
    }
    static updateServiceTsFileString(compName, content, data, moduleName, fileContent) {
        let fileAsStr = fileContent;
        try {
            let fileText = "";
            var i = fileAsStr.lastIndexOf('}');
            if (i !== -1) {
                let text1 = fileAsStr.substr(0, i);
                let text2 = fileAsStr.substr(i);
                fileText = fileAsStr.substr(0, i) + content + fileAsStr.substr(i);
                fileAsStr = fileAsStr.replace(text1, text1 + content);
            }
        }
        catch (err) {
            console.log(err);
        }
        return fileAsStr;
    }
    static addInConstructorParamenter(content, fileContent, uiDetailsMap) {
        let serviceClass = FileHelper_1.FileHelper.capitalizeWord(uiDetailsMap.get("moduleName")) + "Service";
        let serStr = "private " + FileHelper_1.FileHelper.camelCase(serviceClass) + " : " + serviceClass;
        return fileContent.replace(serStr, serStr + "," + content);
    }
    static addFormGroupInConstructor(content, fileContent) {
        var txt = fileContent;
        var matchText = fileContent.match(/^.*FormBuilder.*{.*/gm);
        if (typeof matchText !== 'undefined' && matchText !== null) {
            txt = fileContent.replace(matchText[0], matchText[0] + "\n" + content + "\n");
        }
        return txt;
    }
    static updateImportInComponent(importMap, appModImpStr, compStr) {
        var txt = compStr;
        importMap.forEach((value, key) => {
            var val = new RegExp("^import.*" + key + ".*}", "gm");
            var foundImport = compStr.match(val);
            if (foundImport === null) {
                var matchText = compStr.match(/^.*{.*OnInit.*/gm);
                if (typeof matchText !== 'undefined' && matchText !== null) {
                    txt = compStr.replace(matchText[0], matchText[0] + value);
                    compStr = txt;
                }
            }
        });
        var matchTextMethod = compStr.match(/^.*@Component.*/gm);
        if (appModImpStr && typeof matchTextMethod !== 'undefined' && matchTextMethod !== null) {
            txt = compStr.replace(matchTextMethod[0], appModImpStr + matchTextMethod[0]);
        }
        return txt;
    }
    static updateAppModuleString(content, content2, fileContent, onlyImport) {
        var txt = fileContent;
        var checkval = content2.trim().replace(',', '');
        let valTemp = "^import.*" + checkval + ".*}";
        var val = new RegExp(valTemp, "gm");
        var check = fileContent.match(val);
        if (check === null) {
            var matchText = fileContent.match(/^.*{.*PageNotFoundComponent.*/gm);
            var matchText2 = fileContent.match(/^.*declarations:.*/gm);
            if (typeof matchText !== 'undefined' && matchText !== null) {
                txt = fileContent.replace(matchText[0], matchText[0] + content);
            }
            if (onlyImport && typeof matchText2 !== 'undefined' && matchText2 !== null) {
                txt = txt.replace(matchText2[0], matchText2[0] + content2);
            }
        }
        return txt;
    }
}
exports.TSHelper = TSHelper;
//# sourceMappingURL=TSHelper.js.map