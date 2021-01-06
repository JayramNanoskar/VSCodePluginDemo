import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const options: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Open',
		filters: {
		   'Text files': ['csv'],
		   'All files': ['*']
		   }
   };

	let acceptInput = vscode.commands.registerCommand('uigenerator.acceptInput', () => {
	   vscode.window.showOpenDialog(options).then(fileUri => {
		if (fileUri && fileUri[0]) {
			debugger;
			const filePath = fileUri[0].fsPath;
			function readFile() {
				try {
					vscode.window.showInformationMessage("Parsing CSV file.");
					return fs.readFileSync(filePath, 'utf-8');
				}
				catch (err) {
					vscode.window.showErrorMessage("CSV file could not be read");
					throw err;
				}
			}
			const csv = readFile();
			const arrays =  <any[][]>(csv.split("\n").map(user => user.split(",")));
			const len = arrays.length;
			let componentName = "";
			let moduleName = "";
			let HTMLString = "";
			let col = '1';
			arrays.forEach((element,index) => {
				if(index === 0){
					moduleName = element[1];
				}else if(index === 1){
					componentName = element[1];
				}else if(index == 2){
					col= element[1].replace(/\s/g, "");
					HTMLString = createLayout(element,len);
			   	}else if(index > 3){
					HTMLString = generateCodeSnippet(element,index-3, HTMLString,col);
					debugger;
					updateTypeScriptFile(element,index-3, HTMLString,col,componentName);
			   	}
			});

			debugger;
			writeToHTML(HTMLString,componentName);
		   }
	   });
	});

	function createLayout(data:any[],totElem : number){
		let colClass="col-sm-12";
		let colCount = data[1].replace(/\s/g, "");
		switch (colCount){
			case '1':
			  colClass="col-sm-12";
			  break;
			case '2':
			  colClass="col-sm-6";
			  break;
			case '3': 
				colClass="col-sm-4";
				break;
			default: 
				colClass="col-sm-3";
		  }
		let gridSize=colCount/2;
		let totRow = totElem/gridSize + 1;
		let layoutSnippet = "<div class=\"container\">\n\t<div class=\"row\">\n\t\t<h2>Search Investigation</h2>"+
    	"\n\t</div>\n\t<form [formGroup]=\"searchForm\" (ngSubmit)=\"onSubmit()\">";
		for(let i=1;i<=totRow;i++){
			for(let col=1;col<=colCount;col++){
				if(col == 1){
					layoutSnippet = layoutSnippet + "\n\t<div class=\"form-group row\" id=\"row"+i+"\">";
					layoutSnippet = layoutSnippet + "\n\t\t<div class=\""+colClass+"\" id=\"row"+i+"_col"+col+"\">\n\n\n\t</div>";
				}else{
					layoutSnippet = layoutSnippet + "\n\t\t<div class=\""+colClass+"\" id=\"row"+i+"_col"+col+"\">\n\n\n\t</div>";
				}
			}
			layoutSnippet = layoutSnippet + "\n\t</div>";
		}
		layoutSnippet = layoutSnippet + "\n</form>\n</div>";
		return layoutSnippet;
	}

	function writeToHTML(fileText : string, componentName:string){
		debugger;
		let setting: vscode.Uri = vscode.Uri.parse("file:///" + "D:\\MY_ANGULAR_POC\\MY_APP\\src\\app\\app-main-content\\app-main-content.component.html");
		vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
			vscode.window.showTextDocument(a, 1, false).then(e => {
				e.edit(edit => {
					debugger;
					edit.insert( new vscode.Position(0, 0), fileText);
				});
				e.document.save();
				vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			});
		}, (error: any) => {	
			console.error(error);
			return false;
		});
		

	//const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'safsa.txt'));
/*vscode.workspace.openTextDocument(setting).then(document => {
    const edit = new vscode.WorkspaceEdit();
    edit.insert(setting, new vscode.Position(0, 0), fileText);
    return vscode.workspace.applyEdit(edit).then(success => {
        if (success) {
            vscode.window.showTextDocument(document);
        } else {
            vscode.window.showInformationMessage('Error!');
        }
    });
});
*/		
	}


	
	function updateTypeScriptFile(data:any[],index : number,htmlString:string, col:string, componentName:string){
		if(data[2]){
		var tp = data[2].replace(/\s/g, "").toLowerCase();
		switch (tp){
			case "dropdown":
				console.log('Dropdown Changes for TypeScript');
				setTimeout(function () {
					modifyTSFile(componentName,"items = [{id:'1',viewValue:'Option1'},{id:'2',viewValue:'Option2'},{id:'3',viewValue:'Option3'}]; ")
				}, 2000);
				
				//updateServiceForDropDown();
			break;
		default: 
			console.log('Default case');
		}
	}
	}

	function generateCodeSnippet(data:any[],index : number,htmlString:string, col:string){
		debugger;
		let divIds = getDivIdBySequence(data[0],col);	
		let htmlControlsText = getHtmlTextByType(data);
		htmlString = addControls(htmlString,htmlControlsText, divIds);
		return htmlString;
	}
	
	context.subscriptions.push(acceptInput);
}

function addControls(htmlString : string,htmlControlsText:string[], divIds:string[]){
	let regexString = "^.*"+divIds[0]+".*>.*";
	var regex = new RegExp(regexString, "gm");
	var matchText = htmlString.match(regex);
	var temp = "";
	if (typeof matchText !== 'undefined' && matchText !== null) {
		temp = htmlString.replace(regex, matchText[0]+"\n"+htmlControlsText[0]+"\n");
	}

	let regexString1 = "^.*"+divIds[1]+".*>.*";
	var regex1 = new RegExp(regexString1, "gm");
	var matchText1 = temp.match(regex);
	var temp1 = "";
	if (typeof matchText1 !== 'undefined' && matchText1 !== null) {
		temp1 = temp.replace(regex1, matchText1[0]+"\n"+htmlControlsText[1]+"\n");
	}
	return temp1 == ""?htmlString:temp1;
}

function getHtmlTextByType(data:any[]){
	let label ="<label for=\"labelFor\" class='col-form-label'>"+data[1]+"</label>";
	let datepicker = "";
	let htmlTexts: string[] = [];
	if(data[1] !== ""){
		htmlTexts.push(label);
	}
	if(data[2]){
		var tp = data[2].replace(/\s/g, "").toLowerCase();
		switch (tp){
			case "inputbox":
				htmlTexts.push("<input type='text' id='"+data[3]+"' name='elementname' value='"+data[7]+"' class=\"form-control inputfield\">");
				break;
			case "dropdown":
				htmlTexts.push("<select placeholder=\"Placeholder\" id=\""+data[3]+"\" class=\"form-control inputfield\" name=\""+data[4]+"\">"+
				"\n\t<option *ngFor=\"let item of items\" >"+
				"\n\t\t{{item.viewValue}}"+
				"\n\t</option>"+
				"\n</select>");
				break;
			case "datepicker": 
				break;
			default: 
				console.log('Default case');
		}
	}else{
        htmlTexts.push("");
    }
	return htmlTexts;
}

function getDivIdBySequence(seq:string, col:string){
	let num = Number(seq);
	let den = Number(col)/2;
	let rem = num%den;
	let quo = ~~(num/den);
	let rowNo = 0;
	let colNo = 0;
	let ids:string[]=[];
	if(rem === 0){
		rowNo = quo;
		colNo = Number(col)- 1;
	}else{
		rowNo = quo + 1;
		colNo = rem;
	}
	ids.push("row"+rowNo+"_col"+colNo);
	ids.push("row"+rowNo+"_col"+(colNo+1));
	return ids;
}

function modifyTSFile(componentName:string, content:string){
	/*var currentlyOpenTabfilePath = vscode.window.activeTextEditor?vscode.window.activeTextEditor.document.fileName:'';
	var pos = currentlyOpenTabfilePath.lastIndexOf(".");
	currentlyOpenTabfilePath = currentlyOpenTabfilePath.substr(0, pos < 0 ? currentlyOpenTabfilePath.length : pos) + ".txt";
	let setting: vscode.Uri = vscode.Uri.parse("file:///" + currentlyOpenTabfilePath);
	*/
	debugger;
	let setting: vscode.Uri = vscode.Uri.parse("file:///" + "D:\\MY_ANGULAR_POC\\MY_APP\\src\\app\\app-main-content\\app-main-content.component.ts");
		vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
			if(!a.isClosed){
			vscode.window.showTextDocument(a, 1, false).then(e => {
				e.edit(edit => {
					debugger;
					let fileText = e.document.getText();
				var matchText = fileText.match(/^.*class.*{.*/gm);
				if (typeof matchText !== 'undefined' && matchText !== null) {
					var txt = fileText.replace(/^.*class.*{.*/gm, matchText[0]+"\n"+content+"\n");

					var firstLine = e.document.lineAt(0);
					var lastLine = e.document.lineAt(e.document.lineCount - 1);
					var textRange = new vscode.Range(0,
						firstLine.range.start.character,
						e.document.lineCount - 1,
						lastLine.range.end.character);
					edit.replace(textRange, txt);
				}
				});
				e.document.save();
				vscode.commands.executeCommand('workbench.action.closeActiveEditor');	
			});
		}
		//	a.save();
		}, (error: any) => {	
			console.error(error);
			return false;
		});
		
return true;
}


// this method is called when your extension is deactivated
export function deactivate() {}
