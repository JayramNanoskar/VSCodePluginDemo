import * as fs from 'fs';
import * as path from 'path';
import { TSHelper } from './TSHelper';
import { RouteRegex } from './RouteRegex';

export class FileHelper {
	public static dirRootPath = "E:\\ANGULAR_POC_DEMO\\MY_APP1\\src\\app\\";

	public static camelCase(str: string) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index == 0 ? word.toLowerCase() : word.toUpperCase();
		}).replace(/\s+/g, '');
	}

	public static capitalizeWord(str: string) {
		return str.replace('-', ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase()).replace(/\s+/g, '');
	}

	public static namingConventionWithHyphen(strToConvert: string) {
		return strToConvert.replace(/[A-Z][a-z]*/g, str => '-' + str.toLowerCase() + '-')
			// Convert words to lower case and add hyphens around it (for stuff like "&")
			// .replace('--', '-') // remove double hyphens
			.replace(/--/g, '-') // remove double hyphens
			.replace(/(^-)|(-$)/g, ''); // remove hyphens at the beginning and the end
	}

	public static getComponentString(uiDetailsMap: Map<string, string>) {
		let dirPath: string = this.dirRootPath + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + "\\" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")!) + "\\" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")!) + ".component.ts";
		const fileData = fs.readFileSync(dirPath, "utf8");
		return fileData.toString();
	}

	public static getServiceString(uiDetailsMap: Map<string, string>) {
		let dirPath: string = this.dirRootPath + "\\" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + "\\" + "service\\" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + ".service.ts";
		const fileData = fs.readFileSync(dirPath, "utf8");
		return fileData.toString();
	}

	public static updateContainer(uiDetailsMap: Map<string, string>){
		let dest = this.dirRootPath + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("parentContainer")!) + "\\" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("parentContainer")!) + ".component.html";
		let content = "app-" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")!);
		let tag = "\n<" + content + ">"+"</" + content + ">";
		const fileData = fs.appendFile(dest, tag, ()=> console.log("Container Updated!!!"));
	}

	public static getAllFiles = function (dirPath: any, arrayOfFiles: any, uiDetailsMap: Map<string, string>) {
		let fileName = uiDetailsMap.get("componentName");
		const files = fs.readdirSync(dirPath);
		arrayOfFiles = arrayOfFiles || [];
		files.forEach(function (file: any) {
			if (fs.statSync(dirPath + "/" + file).isDirectory()) {
				arrayOfFiles = FileHelper.getAllFiles(dirPath + "/" + file, arrayOfFiles, uiDetailsMap);
			} else {
				if (fileName === file) {
					arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
				}
			}
		});
		return arrayOfFiles;
	};

	public static createFiles(result: any, uiDetailsMap: Map<string, string>) {
		let filename = FileHelper.namingConventionWithHyphen(uiDetailsMap.get("componentName")!);
		if (typeof result !== 'undefined' && result.length == 0) {
			var dirName = this.dirRootPath + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + "\\" + filename;
			if (!fs.existsSync(dirName)) {
				fs.mkdirSync(dirName);
				console.debug("Folder created successfully" + dirName);
			}
			let serviceClass = FileHelper.capitalizeWord(uiDetailsMap.get("moduleName")!) + "Service";

			let serStr = "private " + FileHelper.camelCase(serviceClass) + " : " + serviceClass;
			let content: string = 'import{Component,OnInit} from "@angular/core";' +
				'\nimport {FormBuilder, FormGroup, FormArray, FormControl, Validators,FormsModule, ReactiveFormsModule} from "@angular/forms";' +
				'\nimport {' + serviceClass + '} from "../service/' + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + '.service";' +
				'\nimport {FormEntry} from "../modals/formEntry";' +
				'\nimport {Router} from \'@angular/router\';' +
				'\nimport {registerComponent} from "../../app-component-registry";' +
				'\n@registerComponent\n@Component({\n\tselector:"app-' + filename + '",\n\ttemplateUrl:"./' + filename + '.component.html",\n\tstyleUrls:["./' + filename + '.component.css"]\n})' +
				'\nexport class ' + FileHelper.capitalizeWord(uiDetailsMap.get("componentName")!) + 'Component implements OnInit{' +
				'\n\tprivate formFieldsData: FormEntry = new FormEntry();' +
				'\n\tprivate allDataObj:FormEntry = new FormEntry();'+
				'\n\tconstructor(' + serStr + ',private router: Router) { \n\t}\n\tngOnInit(): void {'+
				'\n\tthis.'+FileHelper.capitalizeWord(uiDetailsMap.get("componentName")!) + 'Form.valueChanges.subscribe(form => {'+
				'\n\t\tsessionStorage.setItem("'+FileHelper.capitalizeWord(uiDetailsMap.get("componentName")!) + 'ComponentForm", JSON.stringify(form));'+
				'\n\t});\n\t}\n}';

			let compClass = FileHelper.capitalizeWord(uiDetailsMap.get("componentName")!) + "Component";
			let modulename = FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!);
			let appModImpStr = "\nimport { " + compClass + " } from './" + modulename + "/" + filename + "/" + filename + ".component';"
			let appModDecStr = "\n\t\t" + compClass + ",";
			let appModuleData = FileHelper.getAppModuleString(uiDetailsMap);
			let modifiedAppModuleData = TSHelper.updateAppModuleString(appModImpStr, appModDecStr, appModuleData, true);

			fs.writeFileSync(this.dirRootPath + "app.module.ts", modifiedAppModuleData);
			fs.writeFileSync(dirName + "\\" + filename + ".component.ts", content);
			fs.writeFileSync(dirName + "\\" + filename + ".component.spec.ts", '');
			fs.writeFileSync(dirName + "\\" + filename + ".component.css", '');
			fs.writeFileSync(dirName + "\\" + filename + ".component.html", '');
			let componentPath = "./" + FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!) + "/" + filename + "/" + filename + ".component";
			this.createRouteJSONFile(compClass, componentPath);
		}
	}

	public static createModule(result: any, uiDetailsMap: Map<string, string>) {
		let filename = uiDetailsMap.get("moduleName")!;
		if (typeof result !== 'undefined' && result.length == 0) {
			var dirName = this.dirRootPath + FileHelper.namingConventionWithHyphen(filename);
			if (!fs.existsSync(dirName)) {
				fs.mkdirSync(dirName);
				console.debug("Folder created successfully");
			}
			var serviceDirName = this.dirRootPath + FileHelper.namingConventionWithHyphen(filename) + "\\service";
			if (!fs.existsSync(serviceDirName)) {
				fs.mkdirSync(serviceDirName);
				console.debug("Service Folder created successfully");
				let serviceContent: string = 'import{Injectable}from"@angular/core";' +
					'\nimport{HttpClient}from"@angular/common/http";' +
					'\nimport {FormEntry} from "../modals/formEntry";' +
					'\n@Injectable({\n\tprovidedIn:"root"\n})' +
					'\nexport class ' + FileHelper.capitalizeWord(filename) + 'Service{\n\tconstructor(private httpClient:HttpClient){\n\t}\n}';
				let serviceSpecContent: string = 'import{TestBed}from "@angular/core/testing";\nimport{' + filename + 'Service}from "./' + filename + '.service";\ndescribe("' + filename + 'Service",()=>{\nlet service:' + filename + 'Service;beforeEach(()=>{\n\tTestBed.configureTestingModule({\n});\n\tservice=TestBed.inject(' + filename + 'Service)\n});\nit("should be created",()=>{\n\texpect(service).toBeTruthy()\n})});';

				fs.writeFileSync(serviceDirName + "\\" + FileHelper.namingConventionWithHyphen(filename) + ".service.ts", serviceContent);
				fs.writeFileSync(serviceDirName + "\\" + FileHelper.namingConventionWithHyphen(filename) + ".service.spec.ts", serviceSpecContent);
			}
			var modalDirName = this.dirRootPath + FileHelper.namingConventionWithHyphen(filename) + "\\modals";
			if (!fs.existsSync(modalDirName)) {
				fs.mkdirSync(modalDirName);
				console.debug("Model Folder created successfully");
				let modalContent = "export class FormEntry {\n\tpublic constructor(init?: Partial<FormEntry>) {" +
					"\n\t\tObject.assign(this, init);\n\t}\n}";
				fs.writeFileSync(modalDirName + "\\formEntry.ts", modalContent);

				let modulename = FileHelper.namingConventionWithHyphen(uiDetailsMap.get("moduleName")!);
				let appModImpStr = "\nimport { FormEntry } from './" + modulename + "/modals/formEntry';";
				let appModDecStr = "\n\t\tFormEntry,";
				let appModuleData = FileHelper.getAppModuleString(uiDetailsMap);
				let modifiedAppModuleData = TSHelper.updateAppModuleString(appModImpStr, appModDecStr, appModuleData, false);

				fs.writeFileSync(this.dirRootPath + "app.module.ts", modifiedAppModuleData);


			}
			let moduleContent: string = 'import{NgModule}from "@angular/core";' +
				'\nimport{CommonModule}from "@angular/common";' +
				'\nimport{' + filename + 'RoutingModule}from "./' + filename + '-module-routing.module";' +
				'\n@NgModule({\n\tdeclarations:[],\n\timports:[CommonModule,' + filename + 'RoutingModule\n]\n})\nexport class ' + filename + 'Module { }';
			let moduleRoutingContent: string = 'import{NgModule}from "@angular/core";\nimport{Routes,RouterModule}from "@angular/router";\nconst routes:Routes=[];\n\n@NgModule({\n\timports:[RouterModule.forChild(routes)],\n\texports:[RouterModule]\n})\n\nexport class TestModuleRoutingModule{};'

			fs.writeFileSync(dirName + "\\" + FileHelper.namingConventionWithHyphen(filename) + "-routing.module.ts", moduleRoutingContent);
			fs.writeFileSync(dirName + "\\" + FileHelper.namingConventionWithHyphen(filename) + ".module.ts", moduleContent);
		}
	}

	public static getAppModuleString(uiDetailsMap: Map<string, string>) {
		let dirPath: string = this.dirRootPath + "app.module.ts";
		const fileData = fs.readFileSync(dirPath, "utf8");
		return fileData.toString();
	}

	public static createRouteJSONFile(name: string, path: string) {
		let routeJSONFilePath = "E:";
		let routeFile = routeJSONFilePath + "\\" + "routes.json";

		try {
			if (!fs.existsSync(routeFile)) {
				fs.writeFileSync(routeFile, '[]');
			}
		} catch (err) {
			console.error("Error occurred while creating route json file : " + err);
		}

		const routes = require(routeJSONFilePath + "\\" + "routes");

		let route = {
			componentName: name,
			filePath: path
		};

		routes.push(route);

		fs.writeFile(routeFile, JSON.stringify(routes), (err: any) => {
			if (err) throw err;
			console.log("Route information writing completed in route json file.");
		});

	}

	public static updateComponentRoute(routes: any) {
		let filePath = this.dirRootPath + 'app-routing.module.ts';
		let fileContent = fs.readFileSync(filePath, "utf8");
		var routeJSON = JSON.parse(routes);

		let routeArray = [];
		let importStatement: string = '';

		for (var attributename in routeJSON) {

			let route = {
				componentName: routeJSON[attributename].componentName,
				path: routeJSON[attributename].path
			};

			importStatement = importStatement + 'import { ' + routeJSON[attributename].componentName + ' } from "' + routeJSON[attributename].filePath + '";\n';

			routeArray.push(route);
		}
		console.log(JSON.stringify(routeArray));
		console.log(importStatement);

		let modifiedAppModuleData = RouteRegex.updateRouteModuleString(fileContent, routeJSON, false);

		fs.writeFileSync(filePath, modifiedAppModuleData);

	}

}