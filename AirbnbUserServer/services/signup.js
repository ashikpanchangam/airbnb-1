/**
 * Created by ASHIK'S PC on 11/20/2016.
 */

var mongo = require('../db/mongo');
var mysql = require('../db/mysql');
var bcrypt = require('bcrypt-nodejs');
var mysqlModule = require('mysql');
var mongoURL = "mongodb://54.70.90.14:27017/test";

exports.handle_userSignUp_request = function (msg, callback) {
    console.log("Using the 'userSignUp_queue'");                //subscribing to the signUp_queue
    var json_response = {};

    var email = msg.email;
    var first_name = msg.first_name;
    var last_name = msg.last_name;
    var password = msg.password;
    var dob = msg.dob;
    var is_host = false;

    function globalUserIdGenerator()
    {
        function digit1()
        {
            var value = Math.floor((Math.random() * 9) + 1);
            return value.toString();
        }

        function digit()
        {
            var value = Math.floor((Math.random() * 9) + 0);
            return value.toString();
        }
        return digit1() + digit() + digit() + '-' + digit() + digit() + '-' + digit() + digit() + digit() + digit();
    }

    var user_id = globalUserIdGenerator();

    var selectQuery;
    var insertQuery;

    console.log(msg);                                       //print the message

    selectQuery = "select count(*) as resultCount from airbnb_mysql.user where email='"+email+"'";

    insertQuery = "INSERT INTO airbnb_mysql.user (user_id, email, first_name, last_name, password, dob, is_host) " +
        "VALUES ('"+user_id+"', '"+email+"', '"+first_name+"', '"+last_name+"', '"+password+"', '"+dob+"', '"+is_host+"')";

    mysql.fetchData(function (error, results) {
        if(results[0].resultCount == 0)
        {
            mysql.fetchData(function (error, results) {
                if(error)
                {
                    json_response ={
                        "statusCode" : 401,
                        "results" : error.code
                    };
                    callback(null, json_response);
                }
                else
                {
                    json_response ={
                        "statusCode" : 200,
                        "results" : results,
                        "statusMessage": "Successfully created an account"
                    };
                    callback(null, json_response);
                }
            }, insertQuery)
        }
        else
        {
            json_response ={
                "statusCode" : 403,
                "results" : results,
                "statusMessage": "Email exists already"
            };
            callback(null, json_response);
        }
    }, selectQuery)
};

exports.handle_userLogin_request = function(msg, callback){

    var json_response = {};
    var email = msg.email;
    var password = msg.password;

    var query = "select * from airbnb_mysql.user where email='"+ email +"'";

    mysql.fetchData(function(error, results) {
        if(error)
        {
            json_response ={
                "statusCode" : 401,
                "results" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            if(results.length <= 0)
            {
                json_response ={
                    "statusCode" : 403,
                    "statusMessage" : "Invalid email id"
                };
                callback(null, json_response);
            }
            else
            {
                bcrypt.compare(password, results[0].password, function(err,correctPassword) {

                    if(correctPassword)
                    {
                        json_response ={
                            "statusCode" : 200,
                            "statusMessage" : "Successfully logged in",
                            "results" : results
                        };
                        callback(null, json_response);
                    }
                    else
                    {
                        json_response ={
                            "statusCode" : 403,
                            "statusMessage" : "Invalid login credentials"
                        };
                        callback(null, json_response);
                    }
                });
            }
        }
    }, query);
};


exports.handle_becomeHost_request = function (msg, callback) {
    var json_response = {};
    var query;
    var user_id = msg.user_id;
    console.log("Using the 'becomeHost_queue'");

    query = "UPDATE airbnb_mysql.user SET is_host='"+true+"' WHERE user_id='"+user_id+"'";

    mysql.fetchData(function(error, results) {
        if(error)
        {
            json_response ={
                "statusCode" : 401,
                "results" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            json_response ={
                "statusCode" : 200,
                "results" : results,
                "statusMessage" : "Successfully became a host"
            };
            callback(null, json_response);
        }
    }, query)
};


exports.handle_adminSignUp_request = function (msg, callback) {
    console.log("Using the 'adminSignUp_queue'");                //subscribing to the signUp_queue
    var json_response = {};

    var email = msg.email;
    var first_name = msg.first_name;
    var last_name = msg.last_name;
    var password = msg.password;

    function adminIdGenerator()
    {
        function digit1()
        {
            var value = Math.floor((Math.random() * 9) + 1);
            return value.toString();
        }

        function digit()
        {
            var value = Math.floor((Math.random() * 9) + 0);
            return value.toString();
        }
        return digit1() + digit() + digit() + '-' + digit() + digit() + '-' + digit() + digit() + digit() + digit();
    }

    var admin_id = adminIdGenerator();

    var selectQuery;
    var insertQuery;

    console.log(msg);                                       //print the message

    selectQuery = "select count(*) as resultCount from airbnb_mysql.admin where email='"+email+"'";

    insertQuery = "INSERT INTO airbnb_mysql.admin (admin_id, email, first_name, last_name, password) " +
        "VALUES ('"+admin_id+"', '"+email+"', '"+first_name+"', '"+last_name+"', '"+password+"')";

    mysql.fetchData(function (error, results) {
        if(results[0].resultCount == 0)
        {
            mysql.fetchData(function (error, results) {
                if(error)
                {
                    json_response ={
                        "statusCode" : 401,
                        "results" : error.code
                    };
                    callback(null, json_response);
                }
                else
                {
                    json_response ={
                        "statusCode" : 200,
                        "results" : results,
                        "statusMessage": "Successfully created an account"
                    };
                    callback(null, json_response);
                }
            }, insertQuery)
        }
        else
        {
            json_response ={
                "statusCode" : 403,
                "results" : results,
                "statusMessage": "Email exists already"
            };
            callback(null, json_response);
        }
    }, selectQuery)
};

exports.handle_adminLogin_request = function(msg, callback)
{
    console.log("Using the adminLogin_request");
    var json_response = {};
    var email = msg.email;
    var password = msg.password;

    var query = "select * from airbnb_mysql.user where email='"+ email +"'";

    mysql.fetchData(function(error, results) {
        if(error)
        {
            console.log(error);                                 //Print the error

            json_response ={
                "statusCode" : 401,
                "results" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            console.log(results);                               //Print the results
            if(results.length <= 0)
            {
                json_response ={
                    "statusCode" : 403,
                    "statusMessage" : "Invalid email id"
                };
                callback(null, json_response);
            }
            else
            {
                bcrypt.compare(password, results[0].password, function(err,correctPassword) {

                    console.log ("The correct password is" + correctPassword);
                    console.log ("The entered password" + password);
                    console.log ("password " + results[0].password);

                    if(correctPassword)
                    {
                        json_response ={
                            "statusCode" : 200,
                            "statusMessage" : "Successful login",
                            "results" : results
                        };
                        callback(null, json_response);
                    }
                    else
                    {
                        json_response ={
                            "statusCode" : 403,
                            "statusMessage" : "Invalid login credentials"
                        };
                        callback(null, json_response);
                    }
                });
            }
        }
    }, query);
};

exports.handle_saveHostDetails_request = function (msg, callback) {
    var json_response = {};
    var user_id = msg.user_id;
    var video = msg.video;
    
    var address = msg.address;
    var city= msg.city;
    var state= msg.state;
    var zip_code= msg.zip_code;
    var phone_number= msg.phone_number;

    var location = msg.location;
    var location_lat = msg.location_lat;
    var location_long = msg.location_lng;

    var query = "UPDATE airbnb_mysql.user set address = '" + address
        + "',city = '" + city + "',state = '" + state + "',zip_code = '" + zip_code
        + "',phone_number = '" + phone_number + "',location = '" + location
        + "',location_lat = '" + location_lat + "',location_long = '" + location_long + "' where user_id ='" + user_id + "'";

    mysql.fetchData(function(error,results){

        if(error)
        {
            console.log(error.code);
            json_response ={
                "statusCode" : 401,
                "statusMessage" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            mongo.connect(mongoURL, function(){
                var coll = mongo.collection('host_details');
                coll.insertOne({user_id: parseInt(user_id),video:video}, function(error, results){

                    if (error)
                    {
                        json_response ={
                            "statusCode" : 401,
                            "statusMessage" : "Unexpected error occurred"
                        };
                        callback(null, json_response);
                    }
                    else
                    {
                        json_response ={
                            "statusCode" : 200,
                            "statusMessage" : "Success"
                        };
                        callback(null, json_response);
                    }
                });
            });
        }
    }, query);
};


//TODO - Create a table for storing credit card details.
exports.handle_addCreditCard_request = function(msg, callback){
    console.log("....Using the saveCardDetails_queue....");
    var json_response = {};

    var user_id = msg.user_id;

    var credit_card_number = msg.credit_card_number;
    var credit_card_holder = msg.credit_card_holder;
    var credit_card_expiry = msg.credit_card_expiry;



};

exports.handle_deleteUserAccount_request = function (msg, callback) {
    console.log("Using the 'deleteUserAccount_queue'");
    var json_response = {};
    var query;
    var user_id = msg.user_id;

    query = "DELETE from airbnb_mysql.user WHERE user_id='"+user_id+"'";

    mysql.fetchData(function(error, results) {
        if(error)
        {
            json_response ={
                "statusCode" : 401,
                "results" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            json_response ={
                "statusCode" : 200,
                "results" : results,
                "statusMessage" : "Successfully deleted the account"
            };
            callback(null, json_response);
        }
    }, query)
};

exports.handle_deleteHostAccount_request = function (msg, callback) {
    console.log("Using the 'deleteHostAccount_queue'");
    var json_response = {};
    var user_id = msg.user_id;

    var query = "UPDATE airbnb_mysql.user set is_host = '" + false + "' where user_id ='" + user_id + "'";

    mysql.fetchData(function(error, results) {
        if(error)
        {
            json_response ={
                "statusCode" : 401,
                "results" : error.code
            };
            callback(null, json_response);
        }
        else
        {
            json_response ={
                "statusCode" : 200,
                "results" : results,
                "statusMessage" : "Successfully deleted the account"
            };
            callback(null, json_response);
        }
    }, query)
};