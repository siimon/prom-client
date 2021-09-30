import { Pushgateway } from './index';

const pushGateway = new Pushgateway('');
pushGateway.push({ jobName: '' }).then(({ resp, body }) => {
	console.log(resp);
	console.log(body);
});

pushGateway.pushAdd({ jobName: '' }).then(({ resp, body }) => {
	console.log(resp);
	console.log(body);
});

pushGateway.delete({ jobName: '' }).then(({ resp, body }) => {
	console.log(resp);
	console.log(body);
});
