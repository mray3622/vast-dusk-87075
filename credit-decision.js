module.exports = {
  /*
    0 to 5000 - Good gets 60, Fair gets 30, Poor gets 15.
  */
  evaluate: function(order) {
    // default our order to COD
    order.paymentTerm = 'COD';

    // a credit rating was provided, let's evaluate it
    if (order.creditRating) {
      order.creditRating = order.creditRating.toLowerCase();

      if (order.creditRating == 'good') {
        order.paymentTerm = '60 Days';
      }
      else if (order.creditRating == 'fair') {
        order.paymentTerm = '30 Days';
      }
      else if (order.creditRating == 'poor') {
        order.paymentTerm = '15 Days';
      }
    }

    // persist our order to the data store of choice
    //orderProvider.save(order);

    return order;
  }
};
