'use strict';
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const ignoredWordsPath = path.join(electron.app.getPath('userData'), 'ignored-words.json');
const addedWordsPath = path.join(electron.app.getPath('userData'), 'added-words.json');

function readData(path) {
	try {
		return JSON.parse(fs.readFileSync(path, 'utf8'));
	} catch (err) {
		return {};
	}
}

function writeData(path, data) {
	fs.writeFileSync(path, JSON.stringify(data));
}

exports.ignoreWord = (word, locale) => {
	const ignoredWords = readData(ignoredWordsPath);
	if (ignoredWords[locale]) {
		ignoredWords[locale].push(word);
	} else {
		ignoredWords[locale] = [word];
	}
	writeData(ignoredWordsPath, ignoredWords);
};

exports.learnWord = (word, locale) => {
	const addedWords = readData(addedWordsPath);
	if (addedWords[locale]) {
		addedWords[locale].push(word);
	} else {
		addedWords[locale] = [word];
	}
	writeData(addedWordsPath, addedWords);
};

exports.unlearnWord = (word, locale) => {
	const addedWords = readData(addedWordsPath);
	if (addedWords[locale]) {
		const index = addedWords[locale].indexOf(word);
		if (index >= 0) {
			addedWords[locale].splice(index, 1);
		}
	} else {
		addedWords[locale] = [];
	}
	writeData(addedWordsPath, addedWords);
};

exports.isIgnored = (word, locale) => {
	const ignoredWords = readData(ignoredWordsPath)[locale];

	return ignoredWords && ignoredWords.includes(word);
};

exports.isAdded = (word, locale) => {
	const addedWords = readData(addedWordsPath)[locale];

	return addedWords && addedWords.includes(word);
};
