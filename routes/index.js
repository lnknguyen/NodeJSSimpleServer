var express = require('express');
var router = express.Router();
var baseUrl = "/api/v1";
var pg = require('pg');
var hardString = "postgres://localhost:5432/collection";
var baseSearchString = "select i.id,i.url,i.user_id,i.timestamp,i.location->'lat' as lat,i.location->'lon' as lon,i.location->'city' as city from images i ";

/* GET home page. */
router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
});

router.get(baseUrl + "/image", function(req,res){
        var result = [];
        //var sql = "SELECT * FROM images ORDER BY id ASC;";
        //var sql ="select * from images inner join location on images.location_id=location.location_id;";
        
        var sql = "select id,url,user_id,timestamp,location->'lat' as lat,location->'lon' as lon,location->'city' as city from images;";
        // var sql = "select row_to_json(i) from (select id,url,user_id,timestamp , (select row_to_json(l) from(select * from location )l) as location from images where images.url='lalala')i;"
        pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql);
                query.on('row', function(row){

                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        
                        return res.json(result);
                });
        });
});

//fix later 
router.post(baseUrl + "/image", function(req,res){
        var result = [];
        var sql = "INSERT INTO images(url,timestamp,width,height,description,userid,lat,lon,city) values($1,$2,$3,$4,$5,$6,$7,$8,$9)";
        var data = { url: req.body.url,
                timestamp: req.body.timestamp,
                width:req.body.width,
                height:req.body.height,
                description:req.body.description,
                userId:req.body.userid,
                lat: req.body.lat,
                lon: req.body.lon,
                city: req.body.city
        };
        pg.connect(hardString,function(err,client,done){
                if(err){
                        done();
                        console.log(error);
                        return res.status(500).json({success: false, data: err});
                }
                var query = client.query(sql,[data.url,data.timestamp,data.width,data.height,data.description,data.userId,data.lat,data.lon,data.city]);
                query.on('row',function(row){
                        result.push(row);   
                });

                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });
});


router.post(baseUrl + "/user/find", function(req,res){
        var result = [];
        var sql = "SELECT EXISTS(SELECT 1 FROM users WHERE username=LOWER($1) AND password=$2)";
        var data = {
            username: req.body.username,
           password: req.body.password 
        };
        pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data.username,data.password]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });
});

router.post(baseUrl + "/login", function(req,res){
        var sql = "SELECT * FROM users WHERE username=LOWER($1) AND password=($2)";
        var result = [];
        var data = {
            username: req.body.username,
           password: req.body.password 
        };
        pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data.username,data.password]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });
});

//SEARCH IMAGE

//by username
router.get(baseUrl + "/image/search/user/:user_name", function(req,res){
    var data = req.params.user_name
    var result = [];
    var searchString = "where exists(select 1 from users u where u.username=($1) AND u.user_id=i.user_id)"
    var sql = baseSearchString + searchString;
    //var sql = getImageSql + ' where exists(select 1 from users where (users.username=($1) AND users.user_id=images.user_id))';
    
    pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();

                        return res.json(result);
                });
        });

});

//by city
router.get(baseUrl + "/image/search/city/:city_name", function(req,res){
     var data = req.params.city_name
    var result = [];
    var searchString = "where location->>'city'=($1)"
    var sql = baseSearchString + searchString;
    pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });

});

//by tag
router.get(baseUrl + "/image/search/tag/:tag_name", function(req,res){
     var data = req.params.tag_name
    var result = [];
    var searchString = ", tagmap tm, tag t where tm.tag_id=t.id and tm.image_id=i.id and t.name=($1)"
    var sql = baseSearchString + searchString;
    pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });

});





module.exports = router;
