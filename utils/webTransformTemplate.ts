const webTransformTemplate = (
	{ imports, interfaces, componentName, props, jsx, exports },
	{ tpl }
) => {
	return tpl`
		${imports}
		${interfaces}
		import { ReactSVGElement } from 'react';

		function ${componentName}(props: SVGProps<ReactSVGElement>) {
			return ${jsx};
		};

		${componentName}.defaultProps = {
            width: '24px',
            height: '24px',
            fill: '#000000'
		}

        ${exports};
	`;
};

export default webTransformTemplate;
