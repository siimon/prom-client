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
	let labelString = '';
	const labelNames = getLabelNames(metric, defaultLabelNames);
	for (let index = 0; index < labelNames.length; index++) {
		const labelName = labelNames[index];
		if (labelName === 'quantile') {
			labelString += `\${val.labels.quantile != null ? \`quantile="\${escapeLabelValue(val.labels.quantile)}"\` : ''}`;
		} else if (labelName === 'le') {
			labelString += `\${val.labels.le != null ? \`le="\${escapeLabelValue(val.labels.le)}"\` : ''}`;
		} else {
			labelString += `${labelName}="\${val.labels['${labelName}'] ? escapeLabelValue(val.labels['${labelName}']) : escapeLabelValue('${defaultLabels[labelName]}')}"`;
		}
		if (index !== labelNames.length - 1 && labelString.length > 0) {
			labelString += ',';
		}
	}
	return labelString;
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
