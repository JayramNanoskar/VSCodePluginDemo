"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRegex = void 0;
class RouteRegex {
    static updateRouteModuleString(fileContent, routeJSON, onlyImport) {
        var jsonService = routeJSON;
        var match1Text = fileContent.match(/^const.*Routes.*=.*\[/gm);
        var match2Text = fileContent.match(/^.*{.*RouterModule.*from.*/gm);
        var txt = fileContent;
        let importContent = "";
        let routeContent = "";
        jsonService.forEach((jsonSer) => {
            let comName = jsonSer.filePath.substring(jsonSer.filePath.lastIndexOf("/"));
            let valTemp = "^import.*{.*" + jsonSer.componentName + ".*}";
            let val = new RegExp(valTemp, "gm");
            let check = fileContent.match(val);
            if (check === null) {
                importContent += "\nimport { " + jsonSer.componentName + " } from '" + jsonSer.filePath + "';";
                let exp = /\'/ig;
                let comp = jsonSer.componentName.replace(exp, "");
                routeContent += "\n\t{ path: '" + jsonSer.path + "', component: " + comp + "},";
            }
        });
        if (typeof match2Text !== 'undefined' && match2Text !== null) {
            txt = fileContent.replace(match2Text[0], match2Text[0] + importContent);
            fileContent = txt;
        }
        if (typeof match1Text !== 'undefined' && match1Text !== null) {
            txt = fileContent.replace(match1Text[0], match1Text[0] + routeContent);
        }
        return txt;
    }
    static capitalizeWord(str) {
        return str.replace('.', ' ').replace('-', ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase()).replace(/\s+/g, '');
    }
}
exports.RouteRegex = RouteRegex;
//# sourceMappingURL=RouteRegex.js.map