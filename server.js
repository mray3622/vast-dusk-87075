var Hapi = require('hapi');
var joi = require('joi');
var creditDecision = require('./credit-decision');
var creditRating = require('./credit-rating');

// initialize http listener on a default port
var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

// establish route for serving up schema.json
server.route({
  method: 'GET',
  path: '/schema',
  handler: function(request, reply) {
    reply(require('./schema'));
  }
});

// establish route for serving up swagger schema.json
server.route({
  method: 'GET',
  path: '/swaggerschema',
  handler: function(request, reply) {
    reply(require('./swaggerschema'));
  }
});

// establish route for the creditrating of the  /order resource
server.route({
  method: 'GET',
  path: '/account/{accountId}/creditrating',
  handler: function(request, reply) {
    // calculate the credit rating based on this order
    var result = creditRating.calculate(request.params.accountId);

    reply(result);
  }
});

// establish route for the /creditdecision resource, including some light validation
server.route({
  method: 'POST',
  path: '/paymentTerms',
  config: {
    validate: {
      payload: {
        orderAmount: joi.number().required(),
        creditRating: joi.string().required().allow('Good', 'Fair', 'Poor')
      }
    }
  },
  handler: function(request, reply) {
    // evaluate the credit decision, determing the payment terms
    var result = creditDecision.evaluate(request.payload);

    // respond to the caller with just the payment term
    reply(result.paymentTerm);
  }
});

// start the server
server.start(function() {
  console.log('Server started on ' + server.info.uri);
});
