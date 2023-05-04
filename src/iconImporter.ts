import axios from 'axios';
import chalk from 'chalk';
import path from 'path';
import lodash from 'lodash';
import { fileURLToPath } from 'url';

import api from '../utils/api';
import helpers from '../utils/helpers';

const { cloneDeep, kebabCase } = lodash;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.join(__dirname, '../');
const rawSvgImportPath = path.join(__dirname, '../');
const importDir = path.join(rootPath, rawSvgImportPath, '/');

const FIGMA_FILE_ID: string = '';
const FIGMA_PAGE_ID: string = '';

const errorLog = chalk.bold.red;
const warnLog = chalk.bold.yellow;
const successLog = chalk.bold.green;
const infoLog = chalk.italic.blue;

// TODO:  Move | moved these to the API page
const getFigmaComponentSetsUrl = async () => {
	try {
		return await api.get(`files/${FIGMA_FILE_ID}/component_sets`);
	} catch (error) {
		console.log(errorLog(`Error: Fetching from Figma`, error));
	}
};

// TODO: look up single component Figma API
// const getFigmaComponentUrl = async () => {
// 	try {
// 		return await api.get(`files/${FIGMA_FILE_ID}/`);
// 	} catch (error) {
// 		console.log(errorLog(`Error: Fetching from Figma`, error))
// 	}
// }

const getFigmaFrameNodeIds = async (nodeId) => {
	return api.get(`files/${FIGMA_FILE_ID}/nodes?id=${nodeId}`);
};

const getSvgImageData = async (icon) => {
	return await api.get(`images/${FIGMA_FILE_ID}/?ids=${icon.id}&format=svg`);
};

const findBySize = (size) => (element) => element.name.includes(size);

const variantSvgExporter = async () => {
	await helpers.createDirectory(importDir);
	const iconCmpts = [];

	try {
		const resp = await getFigmaComponentSetsUrl();
		const cmptSets = resp.data.meta.component_sets;

		const filteredCmptSets = cmptSets.filter((icons) => {
			return icons.containing_frame.pageId === FIGMA_PAGE_ID;
		});

		for (const cmptSet of filteredCmptSets) {
			const svgName = kebabCase ? kebabCase(cmptSet.name) : '';
			let frameNodeResp;

			try {
				frameNodeResp = await getFigmaFrameNodeIds(cmptSet.node_id);
			} catch (error) {
				console.log(errorLog(`ERROR: Fetching Figma Frame Nodes`, error));
			}

			const cmptNodes =
				frameNodeResp.data.nodes[cmptSet.node_id].document.children;

			if (cmptNodes.length > 2) {
				throw new Error(errorLog(`${svgName} has more than 2 variants`));
			}
			// TODO: change to take in user configured variant names;
			const defaultVariant: string = '' ? '' : '';
			const variantOne: string = 'Large' ? '' : '';
			const variantTwo: string = 'Small' ? '' : '';
			const defaultCmpt = cloneDeep?.(
				cmptNodes.find(findBySize(defaultVariant))
			);
			if (!defaultCmpt) {
				throw new Error(errorLog(`${svgName} missing ${variantOne}`));
			}
			defaultCmpt.name = svgName;

			const variantOneCmpt = cloneDeep?.(
				cmptNodes.find(findBySize(variantOne))
			);
			if (!variantOneCmpt) {
				throw new Error(
					errorLog(`${svgName} missing given variant: ${variantOne}`)
				);
			}
			variantOneCmpt.name = `${svgName}-${variantOne}`;

			const variantTwoCmpt = cloneDeep?.(
				cmptNodes.find(findBySize(variantTwo))
			);
			if (!variantTwoCmpt) {
				throw new Error(
					errorLog(`${svgName} missing given variant: ${variantTwo}`)
				);
			}
			variantTwoCmpt.name = `${svgName}-${variantTwo}`;
		}
		return iconCmpts;
	} catch (error) {
		console.log(errorLog('Variant Exporter Failed', error));
	}
};

const fetchSvgData = async (icons) => {
	// Rate limit required due to restrictions with Figma API.
	// Can only handle 20 request in a min otherwise it errors out
	const rateLimit = 19;
	const waitTime = 4500; // 45 sec between requests
	const startTime = new Date().toLocaleTimeString();
	const iconCount = icons.length;

	try {
		for (let i = 0; i < iconCount; i += rateLimit) {
			const svgImgReq = icons.slice(i, i + rateLimit).map(async (icon) => {
				const imgData = await getSvgImageData(icon);
				const iconData = await axios.get(imgData.data.images[icon.id]);

				await helpers.writeToFile(
					importDir + `${icon.name}.svg`,
					iconData.data,
					(error) => {
						if (error) throw error;
						console.log(successLog(`SVG ${icon.name}: has been saved`));
					}
				);

				await Promise.all(svgImgReq)
					.then(() => {
						return new Promise((resolve) => {
							setTimeout(() => {
								const endTime = new Date().toLocaleTimeString();
								console.log(infoLog(`Elapsed Time: ${endTime - startTime}`));
								resolve();
							}, waitTime);
						});
					})
					.catch((error) => {
						console.error(errorLog(error));
					});
			});
		}
	} catch (error) {
		console.log(errorLog(`Error fetching image data`, error));
	}
};

const variantConverter = async () => {
	await variantSvgExporter()
		.then((icons) => {
			fetchSvgData(icons);
		})
		.catch((error) => {
			console.error(errorLog(`Error executing variant converter`));
		});
};

export default { variantConverter };
