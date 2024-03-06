const { ServiceBroker } = require('molecular');
const ApiService = require('molecular-web');




const broker = new ServiceBroker();

// Load API Gateway
broker.createService(ApiService);

// Start server
broker.start();