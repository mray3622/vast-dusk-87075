module.exports = {
  calculate: function(orderId) {
    var ratings = ["Good", "Fair", "Poor"];
    var i = Math.floor(Math.random() * ratings.length);

    return ratings[i];
  }
};
