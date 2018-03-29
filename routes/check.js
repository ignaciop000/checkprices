var express = require('express');
var router = express.Router();
var fs = require('fs'); 
var csv = require("fast-csv");


/* GET home page. */
router.get('/', function(req, res, next) {
	
	var stream = fs.createReadStream("public/prices/items_rappi_201803281750.csv");
	var map_items = [];
	csv
		.fromStream(stream, {headers : ["_type","balance_price","categories","corridor_id","corridor_name","description","discount","have_discount","id","is_available","name","price","real_price","store_id","store_name"]})
		.on("data", function(data){
			map_items[data.id] = [];
			data.date = '201803281750';
			map_items[data.id].push(data);
	 	})
	 	.on("end", function(){
	 		var stream2 = fs.createReadStream("public/prices/items_rappi_201803291142.csv");
	 		csv
				.fromStream(stream2, {headers : ["_type","balance_price","categories","corridor_id","corridor_name","description","discount","have_discount","id","is_available","name","price","real_price","store_id","store_name"]})
				.on("data", function(data){
					if (!map_items[data.id]) {
						map_items[data.id] = [];
					}
					data.date = '201803291142';
					map_items[data.id].push(data);					
			 	})
			 	.on("end", function(){
			    	console.log("-------------------------------------------------------");
			    	var difItems = [];
			    	for (key in map_items) {
			    		if (map_items[key].length != 2) {
			    			//console.log('*', key, map_items[key][0].name );
			    			difItems.push({'id':map_items[key][0].id,'name':'*'+map_items[key][0].name,'price':map_items[key][0].price});
			    		} else {
			    			if (map_items[key][0].price != map_items[key][1].price) {
			    				//console.log(key, map_items[key][0].name);
			    				difItems.push({'id':map_items[key][0].id,'name':map_items[key][0].name,'price':map_items[key][0].price});
			    			}
			    		}
			    	}			    	
			    	res.render('check', { difItems: difItems });
	    		});
		});

	
});
	
module.exports = router;
