var pg = require('pg');
var q = require('q');

module.exports = {
	DecisionProvider: decisionProvider
};

function decisionProvider(url) {
	var connectionString = url || process.env.DATABASE_URL || 'postgres://localhost:5432/demo_2rr';
	
	this.save = save;
	this.getHistory = getHistory;
	this.getLastCreditRating = getLastCreditRating;
	this.getLastDecision = getLastDecision;
	this.getRecentOrders = getRecentOrders;

	function save(decision) {
		var deferred = q.defer();

		pg.connect(connectionString, function(err, client, done) {
			var query = "INSERT INTO decision_history VALUES ($1, $2, $3, $4, $5, $6)";
			var decidedOnDate = new Date();
			var parameters = [
				decision.orderId,
				decision.orderAmount,
				decision.accountId,
				decision.creditRating,
				decision.paymentTerm,
				decidedOnDate
			];

			client.query(query, parameters, function(e) {
				done();
				if (e) {
					console.error(e);
					deferred.reject(e);
				}
				else {
					deferred.resolve(decidedOnDate);
				}
			});
		});	

		return deferred.promise;
	}

	function getHistory(accountId) {
		var deferred = q.defer();

		pg.connect(connectionString, function(err, client, done) {
			var query = "SELECT * FROM decision_history WHERE accountId = $1";

			client.query(query, [accountId], function(err, result) {
				done();
				if (err) {
					console.error(err);
					deferred.reject(err);
				}
				else {
					deferred.resolve(result.rows);
				}
			});
		});

		return deferred.promise;
	}

	function getLastDecision(accountId) {
		var deferred = q.defer();

		pg.connect(connectionString, function(err, client, done) {
			var query = "SELECT * FROM decision_history WHERE accountId = $1 ORDER BY decidedondate DESC LIMIT 1";

			client.query(query, [accountId], function(err, result) {
				done();
				if (err || result.rows.length === 0) {
					console.error(err);
					deferred.reject(err);
				}
				else {
					deferred.resolve(result.rows[0]);
				}
			});
		});

		return deferred.promise;
	}

	function getLastCreditRating(accountId) {
		var deferred = q.defer();

		pg.connect(connectionString, function(err, client, done) {
			var query = "SELECT creditrating FROM decision_history WHERE accountId = $1 ORDER BY decidedondate DESC LIMIT 1";

			client.query(query, [accountId], function(err, result) {
				done();
				if (err || result.rows.length === 0) {
					console.error(err);
					deferred.reject(err);
				}
				else {
					deferred.resolve(result.rows[0]['creditrating']);
				}
			});
		});

		return deferred.promise;
	}

	function getRecentOrders() {
		var deferred = q.defer();

		pg.connect(connectionString, function(err, client, done) {
			var query = "SELECT o.orderId FROM (SELECT DISTINCT ON (orderId) orderId, decidedondate FROM decision_history) o ORDER BY decidedondate DESC LIMIT 5";

			client.query(query, [], function(err, result) {
				done();
				if (err) {
					console.error(err);
					deferred.reject(err);
				}
				else {
					deferred.resolve(result.rows);
				}
			});
		});

		return deferred.promise;
	}
}
