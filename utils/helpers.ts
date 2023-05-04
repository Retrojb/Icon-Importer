// noinspection TypeScriptValidateTypes

import fs from 'fs';
import chalk from 'chalk';
import mkdirp from 'mkdirp';
import lodash from 'lodash';

const { upperFirst, camelCase } = lodash;

const createDirectory = (path: string) => {
	try {
		fs.accessSync(path, fs.constants.X_OK);
	} catch (error) {
		console.log(chalk.red(`Success: Directory created at ${path}`));
		mkdirp.sync(path);
	}
};

const deleteDirectory = (dir) => {
	fs.rmdirSync(dir, (err) => {
		if (err) throw err;
		console.log(chalk.yellow(`${dir} has successfully been deleted`));
	});
};

const removeDirContent = async (dir) => {
	try {
		console.log(chalk.green(`Success: removing content from ${dir}`));
		fs.rmSync(dir, { recursive: true });
		console.log(chalk.yellow(` Content of ${dir} has been removed`));
	} catch (error) {
		console.log(chalk.red(`Error: Removing content from ${dir}`));
	}
};
const writeToFile = (filename, data, p: (error) => void) => {
	fs.writeFileSync(filename, data, (error) => {
		if (error) throw error;
		console.log(chalk.green(`File has been saved: ${filename}`));
	});
};

const writeBarrelFile = (path, data) => {
	fs.writeFileSync(path, data);
};

const formatNames = (names) => {
	if (names.includes('.svg')) {
		const removeFileTypeName = names.split('.svg').join('');
		const camelCaseName = camelCase ? camelCase(removeFileTypeName) : '';
		return upperFirst ? upperFirst(camelCaseName) : '';
	}
};

export default {
	createDirectory,
	deleteDirectory,
	removeDirContent,
	writeToFile,
	writeBarrelFile,
	formatNames,
};
