var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info'
});

/* GET home page. */
router.get('/', function(req, res, next) {	
	client.search({
    	index: 'rappi',
    	type: 'item',
    	q: req.query.q
	}).then(function(resp) {	
    	res.render('find',  { difItems: resp.hits.hits });
	}, function(err) {
    	console.trace(err.message);
	});
  	
});

module.exports = router;
