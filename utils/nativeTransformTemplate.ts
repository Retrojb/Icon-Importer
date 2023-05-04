const nativeTransformTemplate = (
	{ imports, interfaces, componentName, props, jsx, exports },
	{ tpl }
) => {
	return tpl`
		${imports}

		function ${componentName}(props: SvgProps) {
			return ${jsx};
		}
		${componentName}.defaultProps = {
			width: "24",
			height: "24",
			fill: "#000000"
		}
		${exports}
	`;
};

export default nativeTransformTemplate;
