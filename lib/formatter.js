'use strict';

function getFormatter(metric, defaultLabels) {
	const defaultLabelNames = Object.keys(defaultLabels);
	const name = metric.name;
	const help = escapeString(metric.help);
	const type = metric.type;
	const labelsCode = getLabelsCode(metric, defaultLabelNames, defaultLabels);

	// eslint-disable-next-line no-new-func
	return new Function(
		'item',
		'escapeLabelValue',
		'getValueAsString',
		`
		const info = '# HELP ${name} ${help}\\n# TYPE ${name} ${type}\\n';
		let values = '';
		for (const val of item.values || []) {
		  val.labels = val.labels || {};
		  let metricName = val.metricName || '${name}';
		  const labels = \`${labelsCode}\`;
		  const hasLabels = labels.length > 0;
		  metricName += \`\${hasLabels ? '{' : ''}\${labels}\${hasLabels ? '}' : ''}\`;
		  let line = \`\${metricName} \${getValueAsString(val.value)}\`;
		  values += \`\${line}\\n\`;
		}
		return info + values;
	  	`,
	);
}

function getLabelsCode(metric, defaultLabelNames, defaultLabels) {
	const labelString = [];
	const labelNames = getLabelNames(metric, defaultLabelNames);
	for (let index = 0; index < labelNames.length; index++) {
		const comma = index > 0 ? ',' : '';
		const labelName = labelNames[index];
		if (labelName === 'quantile') {
			labelString.push(
				`\${val.labels.quantile != null ? \`${comma}quantile="\${escapeLabelValue(val.labels.quantile)}"\` : ''}`,
			);
		} else if (labelName === 'le') {
			labelString.push(
				`\${val.labels.le != null ? \`${comma}le="\${escapeLabelValue(val.labels.le)}"\` : ''}`,
			);
		} else {
			const defaultLabelValue = defaultLabels[labelName];
			if (typeof defaultLabelValue === 'undefined') {
				labelString.push(
					`\${val.labels['${labelName}'] != null ? \`${comma}${labelName}="\${escapeLabelValue(val.labels['${labelName}'])}"\` : ''}`,
				);
			} else {
				labelString.push(
					`${comma}${labelName}="\${escapeLabelValue(val.labels['${labelName}']  || '${defaultLabelValue}')}"`,
				);
			}
		}
	}
	return labelString.join('');
}

function getLabelNames(metric, defaultLabelNames) {
	const labelNames = [...metric.labelNames];
	for (const labelName of defaultLabelNames) {
		if (!labelNames.includes(labelName)) {
			labelNames.push(labelName);
		}
	}
	if (metric.type === 'summary') {
		labelNames.push('quantile');
	}
	if (metric.type === 'histogram') {
		labelNames.push('le');
	}
	return labelNames;
}

function escapeString(str) {
	return str.replace(/\n/g, '\\\\n').replace(/\\(?!n)/g, '\\\\\\\\');
}

module.exports = {
	getFormatter,
};
