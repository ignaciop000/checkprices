const fs = require('fs');
var csv = require("fast-csv");
const path = require('path');


var checkDir = 'public/prices';
var map_items = [];
var now = new Date();
var start = new Date(now.getFullYear(), 0, 0);
var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
var oneDay = 1000 * 60 * 60 * 24;
var day = Math.floor(diff / oneDay);
console.log('Day of year: ' + day);

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info'
});

fs.readdir(checkDir, (err, files) => {  
  	for (key in files) {
  		map_items = parseCsv(files[key], map_items);
   	}
  	//console.log(map_items);
  	for (item in map_items) {
	  	client.index({
	     index: 'rappi',
	     id: map_items[item].id,
	     type: 'item',
	     body: map_items[item]
	 }, function(err, resp, status) {
	 	if (err) {
	     console.log(err);	 	
	 	}
	 });
  }
})

function parseCsv(file, items) {
	console.log('Procesando',file);
	var ret;
	var stream = fs.createReadStream(checkDir+"/"+file);
	csv
		.fromStream(stream, {headers : ["_type","balance_price","categories","corridor_id","corridor_name","description","discount","have_discount","id","is_available","name","price","real_price","store_id","store_name"]})
		.on("data", function(data) {
			var item = map_items[data.id];
			if (item === undefined) {
				item = {};		
				item.price2018 = new Array(365);
				item.balance_price2018 = new Array(365);
				item.real_price2018 = new Array(365);
			}
			item.id = data.id;
			item.name = data.name;
			item.description = data.description;
			item.categories = data.categories;
			item.corridor_name = data.corridor_name;
			item.store_name = data.store_name;
			var index = path.basename(file, '.csv');			
			item.price2018[index] = data.price;		
			item.balance_price2018[index] = data.balance_price;			
			item.real_price2018[index] = data.real_price;			
			items[data.id] = item;
		})
		.on("end", function(){
			console.log('Fin',file);
			ret = true;
		});
	while(ret === undefined) {
    	require('deasync').runLoopOnce();
  	}
  	return items;
}

