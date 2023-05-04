import axios from 'axios';
import dotenv from 'dotenv';
import chalk from 'chalk';

const FIGMA_BASE_URL: string = 'https://api.figma.com/v1';
const FIGMA_ACCESS_TOKEN: string = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID: string = process.env.FILE_ID;
const FIGMA_PAGE_ID: string = process.env.PAGE_ID;

const errorLog = chalk.bold.red;
const warnLog = chalk.bold.yellow;
const successLog = chalk.bold.green;
const infoLog = chalk.italic.blue;

const Api = axios.create({
	baseURL: FIGMA_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		'X-Figma-Token': FIGMA_ACCESS_TOKEN,
	},
});

const getFigmaComponentSetsUrl = async () => {
	try {
		return await Api.get(`files/${FIGMA_FILE_ID}/component_sets`);
	} catch (error) {
		console.log(errorLog(`Error: Fetching from Figma`, error));
	}
};

const getFigmaComponentUrl = async () => {
	try {
		return await Api.get(`files/${FIGMA_FILE_ID}/`);
	} catch (error) {
		console.log(errorLog(`Error: Fetching from Figma`, error));
	}
};
export default { getFigmaComponentUrl, getFigmaComponentSetsUrl };
