/**
 * Created by Nrsimha on 11/8/16.
 */

var Xray = require('x-ray');
var mongo = require('./mongo');
var db;
var rdb;
var r = require('rethinkdb');

mongo.connect(function(_db){
    db = _db;
});

mongo.connectrdb(function (_db) {

  rdb = _db;

});

var moment = require('moment');


var xray = Xray({
    filters: {
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        },
        reverse: function (value) {
            return typeof value === 'string' ? value.split('').reverse().join('') : value
        },
        slice: function (value, start , end) {
            return typeof value === 'string' ? value.slice(start, end) : value
        }
    }
}).concurrency(5);

exports.crawl = function() {
    var end;
    console.log("Running Crawler");
    // console.log(db);
    // xray('http://google.com', 'title')(function (err, title) {
    //     // console.log(title);
    // });

    var start = new Date();

    xray('https://slickdeals.net', '.fpGridBox', [{
        title: '.itemImageAndName a.itemImageLink@title',
        href: '.itemImageAndName a.itemImageLink@href',
        image: 'div.imageContainer img@src',
        price: '.fpGridBox .itemInfoLine .itemPrice | trim'
    }])(function (err, title) {
            title.forEach(function (element) {

                xray(element.href, '#titleInfoRow', {
                    date: '.date',
                    time: '.time'
                })(function(err, data){
                    if(data.date == 'Today')
                        data.date = moment().format("MM-DD-YYYY");
                    else if(data.date == 'Yesterday')
                        data.date = moment().subtract(1, 'days').format("MM-DD-YYYY");

                    products = db.collection('products');

                    products.updateOne({"title": element.title},
                        {$set: {"title": element.title, "href": element.href,"image":element.image, "postDate": data.date, "postTime": data.time}},
                        {upsert: true}, function (err) {
                            if (err)
                                console.log(err);
                        });

                  r.table('todos').insert({"title": element.title, "price": element.price,"image":element.image, "postDate": data.date, "postTime": data.time}, {returnChanges: true}).run(rdb, function(err, result) {
                    if(err) {
                      // console.log(err);
                      return next(err);

                    }

                    // console.log(result.changes[0].new_val);
                  });


                });
        });

    });

    xray('https://slickdeals.net/forums/forumdisplay.php?f=9', '[id^=sdpostrow_]', [{
        title: '[id^=td_threadtitle_] .threadtitleline > a | trim',
        href: '[id^=td_threadtitle_] .threadtitleline > a@href | trim',
        postDate: '[id^=td_postdate_] .smallfont | trim'
    }])
        .paginate('.search_pagenav_text@href')
        .limit(20)(function (err, title) {
                title.forEach(function (element) {


                    var a = element.postDate.split('\n');
                    element["postTime"] = a[1].trim();
                    if(a[0] == 'Today')
                       element.postDate = moment().format("MM-DD-YYYY");
                    else if(a[0] == 'Yesterday')
                        element.postDate = moment().subtract(1, 'days').format("MM-DD-YYYY");

                    else
                        element.postDate = a[0];

                    product = db.collection('deals');
                    product.updateOne({"title": element.title},
    {$set: {"title": element.title, "href": element.href, "postDate": element.postDate, "postTime": element.postTime}}, {upsert: true}, function (err) {
                        if (err)
                            console.log(err);
                    });

                })

            });
}


exports.getData = function(req,res){

    db.collection('products').find({}).toArray(function(err, data){
        res.status(200).json(data);
    });
}


exports.searchData = function(req,res){

  console.log(req);
  var data = req.body['demo'];
  console.log(data);

  var regex = { title: { $regex: ''+data+'', $options: 'i' } };
  console.log(regex);

  //db.collection('deals').find(regex).limit(10).toArray(function(err, deals){
    db.collection('products').find(regex).limit(10).toArray(function(err, products){
      var data = products;
      res.status(200).json(data);
    });
  //});
}