'use strict';

const prom = require('prom-client');
const pm2 = require('pm2');

function pm2exec(cmd, ...args) {
  return new Promise((resolve, reject) => {
    pm2[cmd](...args, (err, resp) => (err ? reject(err) : resolve(resp)));
  });
}

function requestNeighboursData(instancesData) {
  const targetInstanceId = Number(process.env.pm_id);
  const data = { topic: 'get_prom_register', data: { targetInstanceId } };
  const promisesList = Object.values(instancesData).reduce((acc, instance) => {
    if (instance.pm_id !== targetInstanceId) {
      acc.push(pm2exec('sendDataToProcessId', instance.pm_id, data));
    }

    return acc;
  }, []);

  return Promise.all(promisesList);
}

function getAggregatedRegistry(instancesData) {
  const registryPromise = new Promise(async (resolve, reject) => {
    const instanceId = Number(process.env.pm_id);
    const instancesCount = instancesData.length;
    const registersPerInstance = [];
    let registersReady = 1;

    registersPerInstance[instanceId] = prom.register.getMetricsAsJSON();

    try {
      const bus = await pm2exec('launchBus');

      bus.on(`process:${instanceId}`, packet => {
        registersPerInstance[packet.data.instanceId] = packet.data.register;
        registersReady++;

        // We can't use registersPerInstance.lenght instead of registersReady because array fills randomly
        // and this can cause false positive result
        if (registersReady === instancesCount) {
          resolve(prom.AggregatorRegistry.aggregate(registersPerInstance));
        }
      });
    } catch (e) {
      reject(e);
    }
  });

  // this line must be situated after the registryPromise declaration
  requestNeighboursData(instancesData);

  return registryPromise;
}

// Listener
// No need to require pm2 here, however the listener must be running pm2 scope
process.on('message', packet => {
  if (packet.topic === 'get_prom_register') {
    process.send({
      type: `process:${packet.data.targetInstanceId}`,
      data: {
        instanceId: Number(process.env.pm_id),
        register: prom.register.getMetricsAsJSON(),
        success: true,
      },
    });
  }
});

module.exports = async (req, res) => {
  let responceData;

  try {
    await pm2exec('connect', false);

    const instancesData = await pm2exec('list');
    const register = await getAggregatedRegistry(instancesData);

    responceData = register.metrics();
  } catch (err) {
    console.error(err);
  } finally {
    res.set('Content-Type', prom.register.contentType);
    res.end(responceData);
    pm2.disconnect();
  }
};
