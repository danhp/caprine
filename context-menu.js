'use strict';
const {Menu, BrowserWindow, shell} = require('electron');
const spellchecker = require('spellchecker');
const dictionary = require('./custom-dictionary');

exports.popup = (params, locale)=> {
	let suggestions;
	if (params.misspelledWord !== '') {
		suggestions = spellchecker.getCorrectionsForMisspelling(params.misspelledWord);
		suggestions = suggestions.slice(0, 4);
	}

	const suggestionsTpl = (() => {
		let tpl = [];

		if (suggestions && suggestions.length !== 0) {
			for (const s of suggestions) {
				tpl = tpl.concat({
					label: s,
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(s);
					}
				});
			}
		} else {
			tpl = [
				{
					label: 'No Guesses Found',
					enabled: false
				}
			];
		}

		return tpl;
	})();

	const misspelling = params.misspelledWord;
	const ignoreTpl = [
		{
			label: 'Ignore Spelling',
			click() {
				dictionary.ignoreWord(misspelling, locale);
				BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(misspelling);
			}
		}
	];

	const learnTpl = [
		{
			label: 'Learn Spelling',
			click() {
				dictionary.learnWord(misspelling, locale);
				BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(misspelling);
			}
		}
	];

	const unlearnTpl = [
		{
			label: 'Unlearn Spelling',
			click() {
				dictionary.unlearnWord(params.selectionText, locale);
				BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(params.selectionText);
			}
		}
	];

	// Truncate the selection if it's too long.
	let selection = params.selectionText;
	if (selection.length > 50) {
		selection = selection.substring(0, 50);
		selection = selection.concat('...');
	}

	const lookUpTpl = [
		{
			label: `Look up "${selection}"`,
			click() {
				BrowserWindow.getFocusedWindow().showDefinitionForSelection();
			}
		}
	];

	const searchTpl = [
		{
			label: 'Search with Google',
			click() {
				shell.openExternal(`https://www.google.ca/webhp#q=${params.selectionText}`);
			}
		}
	];

	const undoTpl = [
		{
			label: 'Undo',
			enabled: params.editFlags.canUndo,
			click() {
				BrowserWindow.getFocusedWindow().webContents.undo();
			}
		},
		{
			label: 'Redo',
			enabled: params.editFlags.canRedo,
			click() {
				BrowserWindow.getFocusedWindow().webContents.redo();
			}
		}
	];

	const editTpl = [
		{
			label: 'Cut',
			visible: params.isEditable,
			enabled: params.editFlags.canCut && params.inputFieldType !== 'password',
			click() {
				BrowserWindow.getFocusedWindow().webContents.cut();
			}
		},
		{
			label: 'Copy',
			enabled: params.editFlags.canCopy && params.inputFieldType !== 'password',
			click() {
				BrowserWindow.getFocusedWindow().webContents.copy();
			}
		},
		{
			label: 'Paste',
			visible: params.isEditable,
			enabled: params.editFlags.canPaste,
			click() {
				BrowserWindow.getFocusedWindow().webContents.paste();
			}
		},
		{
			label: 'Select All',
			visible: params.isEditable,
			enabled: params.editFlags.canSelectAll,
			click() {
				BrowserWindow.getFocusedWindow().webContents.selectAll();
			}
		}
	];

	const separatorTpl = [
		{
			type: 'separator'
		}
	];

	// Build the context menu
	let menuTpl = [];

	// Add in corrections for misspelled words.
	if (suggestions) {
		menuTpl = menuTpl.concat(suggestionsTpl);
		menuTpl = menuTpl.concat(separatorTpl);
	}

	// Add in dictionary manipulations
	if (params.misspelledWord !== '') {
		menuTpl = menuTpl.concat(ignoreTpl);
		menuTpl = menuTpl.concat(learnTpl);
		menuTpl = menuTpl.concat(separatorTpl);
	} else if (dictionary.isAdded(params.selectionText, locale)) {
		menuTpl = menuTpl.concat(unlearnTpl);
		menuTpl = menuTpl.concat(separatorTpl);
	}

	// Add in search functionality.
	if (params.selectionText !== '') {
		if (process.platform === 'darwin') {
			menuTpl = menuTpl.concat(lookUpTpl);
		}

		menuTpl = menuTpl.concat(searchTpl);
		menuTpl = menuTpl.concat(separatorTpl);
	}

	// Add in undo/redo.
	if (params.isEditable) {
		menuTpl = menuTpl.concat(undoTpl);
		menuTpl = menuTpl.concat(separatorTpl);
	}

	// Add in edit functionality.
	menuTpl = menuTpl.concat(editTpl);

	const menu = Menu.buildFromTemplate(menuTpl);
	menu.popup(BrowserWindow.getFocusedWindow(), params.x, params.y);
};
