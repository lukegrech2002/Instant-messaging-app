//Node Modules
var express = require('express');
var bodyParser = require("body-parser");
var mysql = require('mysql');

//Creating an instance of express
var app = express();

app.use(function(request, result, next){
    result.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

var http = require('http').createServer(app);
let port = 4000;
var io = require('socket.io')(http);
var server = http.listen(port, function(){
    console.log('Listening on port ' + port);
});

app.use(express.static('public'));

//Creating a connection with the database login details
var con = mysql.createConnection({
    host: "localhost",
    user: "lukeg",
    password: "lg2020",
    database: "lavavibe"
});

//Connecting to database
con.connect(
    function(err) {
        if (err) throw err; //Checking for errors
        console.log("Connected to Database");
    }
);

let users = [];
let connections = []; 
let loginStatus = "";

//Starting socket connection
io.on('connection', (socket) => {
    connections.push(socket); 
    console.log('Established socket connection. ID:', socket.id);

    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();

        //Removing connection from connected array
        connections.splice(connections.indexOf(socket), 1);

        //Displaying sockets connected after socket disconnection
        console.log('A socket has disconnected', connections.length);
    });

    //Login
    socket.on('new_user', function(data){
        let loginUsername = data.username;
        let loginPassword = data.password;
        let loginSQL ="SELECT * FROM profile WHERE username = '" + loginUsername + "'";

        if (loginUsername && loginPassword) {
            //Checking for login details in database
            con.query('SELECT * FROM profile WHERE username = ? AND password = ?', [loginUsername, loginPassword], function(error, results, fields) {
                if (results.length > 0) {
                    
                    con.query(loginSQL, function (err, result) {
                        if (err) throw err;             

                        io.emit('logged in user details', result.forEach(function (loggedInUserDetails) {
                            username: loggedInUserDetails.username
                        }));
                    });

                    loginStatus = "Login Successful";
                    io.emit('login_status', loginStatus);

                    socket.username = loginUsername;
                    users.push(socket.username);
                    updateUsernames();
                }else{
                    loginStatus = "Incorrect Credentials";
                    io.emit('login_status', loginStatus);
                }			
            });
        }
    });

    //Online users
    function updateUsernames(){
        io.emit('get_users', users);
    }

    socket.on("delete_message", function(messageId){
        con.query("DELETE FROM messages WHERE message_id ='"+ messageId +"'", function(error, result){
            io.emit("delete_message", messageId);
        });
    });

    socket.on("new_message", function (data){
        con.query("INSERT INTO messages (content, username)" + "VALUES ('" + data + "', '" + socket.username + "')", function(error,result){
            io.emit("new_message", {
                message_id: result.insertId,
                message: data,
                user: socket.username
            });
        });
    });
});

//Body parser for POST
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/get_messages', function(req, res){
    con.query("SELECT * FROM messages", function(error, messages){
        //Retreiving Messages in JSON Format from database
        res.end(JSON.stringify(messages));
    });
});

app.get('/get_messages', function(req, res){
    res.send("Helloworld");
});

app.post('/register', function(request, response){
    let username = request.body.username;
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let age = request.body.age;
    let gender = request.body.gender;
    let email = request.body.email;
    let password = request.body.password;

    console.log("Data received");

    // Inserting user details in database
    var sql = "INSERT INTO profile (username, first_name, last_name, age, gender, email_address, password) " +
    "VALUES ('"+ username +"', '"+ firstName +"', '"+ lastName +"', '"+  age +"','"+ gender +"', '"
    + email +"','"+ password +"')";

    //Execute the query
    con.query(sql, function (err, result) {
        if (err) throw err;

        //Outputing results
        console.log(result.affectedRows + ' rows updated. Users Profile ID is: ' + result.insertId);
    });

    //Redirecting to Login page on registration
    return response.redirect("http://localhost:4000");
});

