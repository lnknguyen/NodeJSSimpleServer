var express = require('express');
var router = express.Router();
var baseUrl = "/api/v1";
var pg = require('pg');
var hardString = process.env.DATABASE_URL || "postgres://localhost:5432/collection";
//var hardString = 'postgres://fiaebvkrtkmxta:l4UtJuxt1VZXWz7RfQPxKYjT21@ec2-54-197-247-170.compute-1.amazonaws.com:5432/db98o9j2bnjjmf?ssl=true'
var baseSearchString = "select * from images i inner join location l on (i.id = l.image_id)";

/* GET home page. */
router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
});

router.get(baseUrl + "/image", function(req,res){
        var result = [];
        //var sql = "SELECT * FROM images ORDER BY id ASC;";
        //var sql ="select * from images inner join location on images.location_id=location.location_id;";
        
        //var sql = "select id,url,user_id,timestamp,location->'lat' as lat,location->'lon' as lon,location->'city' as city from images;";
        var sql = baseSearchString
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

 
router.post(baseUrl + "/create/image", function(req,res){
        var result = [];
        var sql = "WITH t1 AS ("
                +"INSERT INTO images(url,timestamp,description,user_id) values($1,$2,$3,$4) "
                +"RETURNING id), "
                    +" t2 AS("
                    +"SELECT * FROM tag WHERE name = ANY($5::text[])),"
                        +"t3 AS("
                        +"INSERT INTO location(lat,lon,city,image_id) values($6,$7,$8,(select t1.id from t1)))"
                        +" INSERT INTO tagmap(image_id,tag_id) "
                        +" SELECT t1.id, t2.id FROM t1, t2";
        
        var data = { url: req.body.url,
                timestamp: req.body.timestamp,
                descriptionText:req.body.descriptionText,
                userId:req.body.userid,
                lat: req.body.lat,
                lon: req.body.lon,
                city: req.body.city,
                tagarray: req.body['tagarray[]']
        };

        var locationJsonString = '{"lat":' + data.lat + ',"lon":' + data.lon + ',"city":"'+ data.city.toString() +'"}'
        
        pg.connect(hardString,function(err,client,done){
                if(err){
                        done();
                        console.log(error);
                        return res.status(500).json({success: false, data: err});
                }
             
                var query = client.query(sql,[data.url,data.timestamp,data.descriptionText,data.userId,[data.tagarray],data.lat,data.lon,data.city]);
                query.on('row',function(row){
                        result.push(row);   
                });

                query.on('end',function(){
                        done();
                        return res.json(result);
                });
        });
});

router.post(baseUrl + "/create/user", function(req,res){
        var result = [];
        var sql = "INSERT INTO users(email,password,username) VALUES($1,$2,$3)";
        
        var data = {email: req.body.email,
                password: req.body.password,
                username: req.body.username
        };

        
        pg.connect(hardString,function(err,client,done){
                if(err){
                        done();
                        console.log(error);
                        return res.status(500).json({success: false, data: err});
                }
             
                var query = client.query(sql,[data.email,data.password,data.username]);
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
        var sql = "SELECT EXISTS(SELECT 1 FROM users WHERE email ilike $1 AND password=$2)";
        var data = {
            email: req.body.email,
           password: req.body.password 
        };
        
        pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data.email,data.password]);
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
        var sql = "SELECT id,username,email,firstname,lastname FROM users WHERE email ilike $1 AND password=($2)";
        var result = [];
        var data = {
            email: req.body.email,
           password: req.body.password 
        };
        pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                var query = client.query(sql,[data.email,data.password]);
                query.on('row', function(row){
                        result.push(row);
                });
                query.on('end',function(){
                        done();
                        console.log(result)
                        return res.json(result);
                });
        });
});

//get all tags
router.get(baseUrl + "/search/tag", function(req,res){
    var result = [];
    
    var sql = "select name from tag"

    
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

//set tags for image
router.post(baseUrl + "/tag", function(req,res){
    var result = [];
    
    var sql = "select name from tag"

    
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

//get tag for images
router.get(baseUrl + "/tag/:img_id", function(req,res){
    var data = req.params.img_id
    var result = [];
    
    var sql = ""

    
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



//SEARCH IMAGE

//by username
router.get(baseUrl + "/image/search/user/:user_name", function(req,res){
    var data = req.params.user_name
    var result = [];
    var searchString = "where exists(select 1 from users u where u.username=($1) AND u.id=i.user_id)"
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
    var searchString = "select * from images i inner join location l on (i.id = l.image_id and l.city = $1)"
    var sql = searchString;
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

//get all city
router.get(baseUrl + "/search/city", function(req,res){
     //var data = req.params.city_name
    var result = [];
    
    var sql = "select distinct city from location"
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

//get all username
router.get(baseUrl + "/search/user", function(req,res){
     //var data = req.params.city_name
    var result = [];
    
    var sql = "select username from users"
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

//get tags for image
router.get(baseUrl + "/tag/search/:image_id", function(req,res){
     //var data = req.params.city_name
    var result = [];
    var data = req.params.image_id
    var sql = "select t.name from tag t, tagmap tm where tm.image_id=($1) and tm.tag_id=t.id"
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

//test some shit
router.post(baseUrl + "/tagtest", function(req,res){
    var result = [];
    var data = {tagarray: req.body['tagarray[]'],
                imgid: req.body.imgid}
    console.log(data.imgid)
    var sql = "INSERT INTO testmap(imageid,tagid) SELECT $1 id,x FROM unnest($2::text[])x"
    pg.connect(hardString, function(err,client,done){
                if(err){
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data:err});
                }
                
                var query = client.query(sql,[data.imgid,[data.tagarray]]);
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
