import path from 'path';
import fs from 'fs';
import svgr from '@svgr/core';
import { fileURLToPath } from 'url';

import helpers from '../utils/helpers';
import importVariantIcons from './iconImporter';
import logs, { errorLogBold, errorLogItalic } from '../utils/chalkLogs';
import nativeTemplate from '../utils/nativeTransformTemplate';
import webTemplate from '../utils/webTransformTemplate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.join(__dirname, '../');
const importDir: string = process.env.IMPORT_DIR || '';
const iconDir: string = process.env.ICON_DIR || '';

const importPath = path.join(rootPath, importDir, '../');
const iconsPath = path.join(rootPath, iconDir, '/');
const iconBarrelPath = path.join(rootPath, iconDir, '../');

const defaultVariantName = process.env.DEFAULT_VARIANT_NAME;
const variantOneName = process.env.VARIANT_ONE;
const variantTwoName = process.env.VARIANT_TWO;

const SVGOConfig = {
	plugins: [
		'removeXMLNS',
		'inlineStyles',
		{
			name: 'preset-default',
		},
	],
};

const SVGRConfig = {
	icon: true,
	typescript: true,
	svgProps: {
		viewBox: '{`0 0 ${props.width} ${props.height}`}',
		fill: '{props.color}',
		width: '{props.width}',
		height: '{props.height}',
	},
	plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
	svgoConfig: SVGOConfig,
};

const transformSvgToComponent = async (dir) => {
	try {
		const files = fs.readdirSync(dir, { encoding: 'utf-8' });

		for (const file of files) {
			const filePath = dir + file;

			try {
				const svgs = fs.readFileSync(filePath, { encoding: 'utf-8' });
				const cmptName = helpers.formatNames(file);
				if (cmptName.includes(defaultVariantName)) {
					const nativeVariantOneIcons = await svgr.transform(svgs, {
						native: true,
						template: nativeTemplate,
						...SVGRConfig,
					});
					helpers.writeToFile(
						`${iconsPath}${cmptName}.tsx`,
						nativeVariantOneIcons
					);
				} else {
					const defaultIcon = await svgr.transform(svgs, {
						native: true,
						template: nativeTemplate,
						...SVGRConfig,
					});
					helpers.writeToFile(`${iconsPath}${cmptName}.tsx`, defaultIcon);
				}

				if (cmptName.includes(variantOneName)) {
					const webVariantOneIcon = await svgr.transform(svgs, {
						template: webTemplate,
						...SVGRConfig,
					});
					helpers.writeToFile(`${iconsPath}${cmptName}.ts`, webVariantOneIcon);
				} else {
					const defaultWebIcon = await svgr.transform(svgs, {
						template: webTemplate,
						...SVGRConfig,
					});
				}
			} catch (error) {
				console.log(errorLogBold(error));
				process.exit(1);
			}
		}
	} catch (error) {
		console.log(logs.errorLogBold(error));
		process.exit(9);
	}
};

const writeBarrelFile = (files, data) => {
	helpers.writeBarrelFile(
		files,
		data
			.map(
				(file) =>
					`import { default as ${
						/^\d/.test(file) ? `Svg${file}` : file
					}} from './${file}';\n`
			)
			.join('') +
			'\nexport default {\n' +
			data.map((file) => `${file},\n`).join('') +
			'};\n',
		(error) => {
			if (error) throw error;
			console.log(errorLogBold(error));
		}
	);
};

const execute = async () => {
	try {
		if (fs.existsSync(importDir)) {
			helpers.createDirectory(importPath);
		}
		if (
			fs.existsSync(importDir) &&
			!fs.readdirSync(importDir, { withFileTypes: true })
		) {
			await importVariantIcons.variantConverter();
		}

		await transformSvgToComponent(importPath)
			.then(() => {
				const exportEntries = fs
					.readdirSync(iconsPath)
					.map((filepath) => path.basename(filepath, path.extname(filepath)))
					.filter((name) => name !== 'index' && !name.endsWith('.web'));
				writeBarrelFile(iconBarrelPath, exportEntries);
			})
			.catch((e) => {
				console.log(errorLogItalic(e));
			});
	} catch (error) {
		console.log(errorLogBold(error));
		process.exit(1);
	}
};

export default { execute };
