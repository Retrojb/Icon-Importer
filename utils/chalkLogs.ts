import chalk from 'chalk';

export const errorLogBold = chalk.bold.red;
export const warnLogBold = chalk.bold.yellow;
export const successLogBold = chalk.bold.green;
export const infoLogBold = chalk.bold.blue;

export const errorLogItalic = chalk.italic.red;
export const warnLogItalic = chalk.italic.yellow;
export const successLogItalic = chalk.italic.green;
export const infoLogItalic = chalk.italic.blue;

export const errorLog = chalk.red;
export const warnLog = chalk.yellow;
export const successLog = chalk.green;
export const infoLog = chalk.blue;

export default {
	errorLogBold,
	errorLogItalic,
	errorLog,
	warnLogBold,
	warnLogItalic,
	warnLog,
	successLogBold,
	successLogItalic,
	successLog,
	infoLogBold,
	infoLogItalic,
	infoLog,
};
