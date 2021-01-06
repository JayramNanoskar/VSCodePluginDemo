"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const FileHelper_1 = require("./FileHelper");
const htmlHelper_1 = require("./htmlHelper");
const tsHelper_1 = require("./tsHelper");
function activate(context) {
    vscode.window.showInformationMessage("Inside activation Extension...........");
    const jsonDirectory = "E:\\JSON_SAMPLE";
    //Doesn't work for recursively in directory
    fs.watch(jsonDirectory, (eventType, filename) => {
        debugger;
        vscode.window.showInformationMessage("The file " + filename + " was modified!");
        vscode.window.showInformationMessage("The type of change was : " + eventType);
        //console.log("\nThe file", filename, "was modified!"); 
        //console.log("The type of change was:", eventType); 
        if (eventType == 'rename') {
            console.log("Processing File : " + filename);
            createComponentDetails(jsonDirectory + "\\" + filename);
        }
        //createComponentDetails(jsonDirectory + "\\"+filename);
    });
    console.log("watcher activated......");
    const options = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {
            'Text files': ['csv', 'json'],
            'All files': ['*']
        }
    };
    let acceptInput = vscode.commands.registerCommand('uigenerator.acceptInput', () => {
        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                const filePath = fileUri[0].fsPath;
                function readFile() {
                    debugger;
                    try {
                        vscode.window.showInformationMessage("Parsing JSON file.");
                        return fs.readFileSync(filePath, 'utf-8');
                    }
                    catch (err) {
                        vscode.window.showErrorMessage("JSON file could not be read");
                        throw err;
                    }
                }
                const jsonData = readFile();
                let uiDetailsMap = new Map();
                let jsonObj = JSON.parse(jsonData);
                if (jsonObj.Form[0].controls[0].controlType === "tabs") {
                    let tabJsonObj = JSON.parse(jsonData);
                    let tabsJSON = extractTabJson(tabJsonObj, uiDetailsMap);
                    createUIComponentsFromJSON(tabsJSON, uiDetailsMap);
                    delete jsonObj.Form[0].controls[0];
                    debugger;
                    //iterate controls and create component
                    // let parentContainer = tabJsonObj.Form[0].parentContainer;
                    // uiDetailsMap.set("parentContainer", parentContainer);
                    for (var t = 1; t < jsonObj.Form[0].controls.length; t++) {
                        let formJSON = jsonObj.Form[0];
                        let tabCompJSON = [];
                        tabCompJSON.length = 0;
                        formJSON.controls[t].moduleName = tabsJSON.Form[0].moduleName;
                        tabCompJSON.push(formJSON.controls[t]);
                        let formJsonTab = { "Form": tabCompJSON };
                        createUIComponentsFromJSON(formJsonTab, uiDetailsMap);
                    }
                    //create tab element for control[0,1,2....] by adding form key
                }
                else {
                    createUIComponentsFromJSON(jsonObj, uiDetailsMap);
                }
            }
        });
        vscode.window.showInformationMessage("Controls updated.");
    });
    function createComponentDetails(filePath) {
        debugger;
        console.log("Entering createComponentDetails ...." + filePath);
        vscode.window.showInformationMessage("Entering createComponentDetails ...." + filePath);
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        let uiDetailsMap = new Map();
        let jsonObj = JSON.parse(jsonData);
        if (jsonObj.Form[0].controls[0].controlType === "tabs") {
            let tabJsonObj = JSON.parse(jsonData);
            let tabsJSON = extractTabJson(tabJsonObj, uiDetailsMap);
            createUIComponentsFromJSON(tabsJSON, uiDetailsMap);
            delete jsonObj.Form[0].controls[0];
            //iterate controls and create component
            // let parentContainer = tabJsonObj.Form[0].parentContainer;
            // uiDetailsMap.set("parentContainer", parentContainer);
            for (var t = 1; t < jsonObj.Form[0].controls.length; t++) {
                let formJSON = jsonObj.Form[0];
                let tabCompJSON = [];
                tabCompJSON.length = 0;
                formJSON.controls[t].moduleName = tabsJSON.Form[0].moduleName;
                tabCompJSON.push(formJSON.controls[t]);
                let formJsonTab = { "Form": tabCompJSON };
                createUIComponentsFromJSON(formJsonTab, uiDetailsMap);
            }
            //create tab element for control[0,1,2....] by adding form key
        }
        else {
            createUIComponentsFromJSON(jsonObj, uiDetailsMap);
        }
    }
    function extractTabJson(jsonObj, uiDetailsMap) {
        let tabsJSON = [];
        var obj = jsonObj.Form[0];
        let controlsItem = obj['controls'];
        let tabControl = [];
        tabControl.push({ "sequence": "1", "label": "tabs", "controlType": controlsItem[0].controlType,
            "controlId": controlsItem[0].controlId,
            "dataType": controlsItem[0].dataType, "name": controlsItem[0].name, "serviceCall": controlsItem[0].serviceCall });
        tabsJSON.push({
            "moduleName": obj['moduleName'], "componentName": obj['componentName'],
            "gridColumn": obj['gridColumn'], "pageHeading": obj['pageHeading'], "formData": obj['formData'],
            controls: tabControl
        });
        let formJsonTab = { "Form": tabsJSON };
        return formJsonTab;
    }
    function createUIComponentsFromJSON(jsonObj, uiDetailsMap) {
        for (var t = 0; t < jsonObj.Form.length; t++) {
            var obj = jsonObj.Form[t];
            let HTMLString = "";
            let tempHTMLString = "";
            let tsStringArray = ["", ""];
            uiDetailsMap.set("col", "1");
            uiDetailsMap.set("formGroup", obj.controls[0].controlType);
            let hasStyleChecked = "false";
            let index = 0;
            vscode.window.showInformationMessage("Creating Controls.");
            let moduleName = obj['moduleName'];
            let componentName = obj['componentName'];
            let gridColumn = obj['gridColumn'];
            let pageHeading = obj['pageHeading'];
            let formData = obj['formData'];
            let controls = obj['controls'];
            let parentContainer = obj['parentContainer'];
            if (uiDetailsMap.get("parentContainer") == null) {
                uiDetailsMap.set("parentContainer", parentContainer);
            }
            if (index == 0) {
                uiDetailsMap.set("moduleName", FileHelper_1.FileHelper.camelCase(moduleName));
                const result = FileHelper_1.FileHelper.getAllFiles(FileHelper_1.FileHelper.dirRootPath, [], uiDetailsMap);
                FileHelper_1.FileHelper.createModule(result, uiDetailsMap);
                index++;
            }
            if (index == 1) {
                uiDetailsMap.set("componentName", FileHelper_1.FileHelper.camelCase(componentName));
                const result = FileHelper_1.FileHelper.getAllFiles(FileHelper_1.FileHelper.dirRootPath + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")) + "\\", [], uiDetailsMap);
                FileHelper_1.FileHelper.createFiles(result, uiDetailsMap);
                index++;
            }
            if (index == 2) {
                uiDetailsMap.set("col", gridColumn.replace(/\s/g, ""));
                // HTMLString = HTMLHelper.createLayout(gridColumn, uiDetailsMap);
                index++;
            }
            if (index == 3) {
                uiDetailsMap.set("pageHeading", pageHeading);
                index++;
            }
            if (index == 4) {
                uiDetailsMap.set("formDataURL", formData);
                index++;
            }
            if (index == 5) {
                let isFormRequired = true;
                let c = 0;
                for (let i = 0; i < controls.length; i++) {
                    if (controls[i].controlType == "panel") {
                        c++;
                        if (c > 1) {
                            isFormRequired = false;
                        }
                    }
                    if (jsonObj.Form[t].controls[i].children) {
                        uiDetailsMap.set("len", (jsonObj.Form[t].controls[i].children.length) + 1);
                    }
                    else {
                        uiDetailsMap.set("len", "1");
                    }
                    //uiDetailsMap.set("len", (jsonObj.Form[t].controls[i].children.length) + 1);
                    uiDetailsMap.set("sectionName", FileHelper_1.FileHelper.camelCase(controls[i].controlId));
                    if (!isFormRequired) {
                        tempHTMLString = "";
                        tempHTMLString += HTMLString;
                        HTMLString = tempHTMLString.replace('</form>', '\t#content#\n</form>');
                        tempHTMLString = HTMLString;
                        HTMLString = "";
                    }
                    HTMLString = htmlHelper_1.HTMLHelper.createLayout(gridColumn, uiDetailsMap, isFormRequired);
                    if (!isFormRequired) {
                        HTMLString = tempHTMLString.replace('#content#', HTMLString);
                    }
                    HTMLString = htmlHelper_1.HTMLHelper.generateCodeSnippet(controls[i], index - 3, HTMLString, uiDetailsMap, hasStyleChecked);
                    tsStringArray = tsHelper_1.TSHelper.updateTypeScriptFile(controls[i], HTMLString, uiDetailsMap, tsStringArray);
                    let innerControl = controls[i].children;
                    for (let j = 0; innerControl && j < innerControl.length; j++) {
                        HTMLString = htmlHelper_1.HTMLHelper.generateCodeSnippet(innerControl[j], index - 3, HTMLString, uiDetailsMap, hasStyleChecked);
                        tsStringArray = tsHelper_1.TSHelper.updateTypeScriptFile(innerControl[j], HTMLString, uiDetailsMap, tsStringArray);
                    }
                }
                index++;
            }
            writeToHTML(HTMLString, uiDetailsMap);
            writeToComp(tsStringArray[0], uiDetailsMap);
            writeToService(tsStringArray[1], uiDetailsMap);
            if (uiDetailsMap.get("parentContainer") != null) {
                FileHelper_1.FileHelper.updateContainer(uiDetailsMap);
            }
        }
    }
    let acceptRouteInput = vscode.commands.registerCommand('uigenerator.acceptRouteInput', () => {
        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                const filePath = fileUri[0].fsPath;
                function readFile() {
                    try {
                        vscode.window.showInformationMessage("Parsing JSON file.");
                        return fs.readFileSync(filePath, 'utf-8');
                    }
                    catch (err) {
                        vscode.window.showErrorMessage("JSON file could not be read");
                        throw err;
                    }
                }
                const routes = readFile();
                vscode.window.showInformationMessage("Creating Routes.");
                vscode.window.showInformationMessage("Routes : " + routes);
                FileHelper_1.FileHelper.updateComponentRoute(routes);
            }
        });
        vscode.window.showInformationMessage("Routes updated.");
    });
    function writeToHTML(fileText, uiDetailsMap) {
        return __awaiter(this, void 0, void 0, function* () {
            let dirPath = FileHelper_1.FileHelper.dirRootPath + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")) + "\\" + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")) + "\\" + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")) + ".component.html";
            yield fs.writeFileSync(dirPath, fileText, 'utf8');
        });
    }
    function writeToComp(fileText, uiDetailsMap) {
        return __awaiter(this, void 0, void 0, function* () {
            let dirPath = FileHelper_1.FileHelper.dirRootPath + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")) + "\\" + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")) + "\\" + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")) + ".component.ts";
            yield fs.promises.writeFile(dirPath, fileText, 'utf8');
        });
    }
    function writeToService(fileText, uiDetailsMap) {
        let dirPath = FileHelper_1.FileHelper.dirRootPath + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")) + "\\service\\" + FileHelper_1.FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")) + ".service.ts";
        fs.writeFileSync(dirPath, fileText, 'utf8');
    }
    context.subscriptions.push(acceptInput);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map