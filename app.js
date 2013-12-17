var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3002');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Credentials', 'true');

    next();
}

function authenticateUser(username, password, done, public_id){
    // Use escape to protect against SQL injection (or use ? method below, same effect)
    // var username = connection.escape(username);
    // var password = connection.escape(password);

    var sql="SELECT * FROM users WHERE username = ? and password = ? limit 1";
    connection.run(sql, [username, password],
        function (err,results) {
            if (err) { return done(err); }
            if(results.length > 0){
                var res=results[0]; 
                //serialize the query result save whole data as session in req.user[] array  
                passport.serializeUser(function(res, done) {
                    done(null,res);
                });
 
                passport.deserializeUser(function(id, done) {
                    done(null,res);
                });
                return done(null, res);
            }else{
                return done(null, false); 
            }
        });
}

function isAuth(req, res, next) {
  console.log(req.isAuthenticated()); // false
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


var express = require('express'), 
http = require('http'), 
mysql = require('mysql'),
path = require('path'),
sqlite3 = require('sqlite3').verbose();

//Setup Authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var app = express();
// all environments
app.configure(function(){
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ 
    secret: 'keyboard cat',
    cookie: {httpOnly: true} 
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.csrf());
  app.use(function (req, res, next) {
    res.locals.csrftoken = req.csrfToken();
    next();
  });
  app.use(app.router);
})

// app.get('/', function( req, res) {
// 	res.render('index');
// });
// Connect to mysql database
// var connection = mysql.createConnection({
// 	host : 'localhost',
// 	user : 'root',
// 	password : 'password',
// 	database : 'nodejs_todo'
// });
// connection.connect(function(err){
//   if(err){
//     console.log("Error Connecting to MySQL");
//     console.log('Error: ', err);
//   }
//   else{
//     console.log("Connection to MySQL Successful");
//   }
// });

//Connect to the local SQLite3 DB
var connection = new sqlite3.Database('db/todo_app');


passport.use(new LocalStrategy(
  function(username, password, done) {
    return authenticateUser(username, password, done);
  }
));
/**
 * Define the routes
 */

//Auth Route
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

//Get all the todos
app.get('/todos', isAuth, function (req, res) {
	connection.run('select * from todos', function(err, docs) {
		res.render('todos', {todos: docs});
	});
});
app.get("/login", function (req, res) {
	res.render("login");
});
// Add a new Todo
app.get("/todos/new", function (req, res) {
	res.render("new");
});
// Save the Newly created Todo Item
app.post("/todos", function (req, res) {
	var description=req.body.description;
	var complete=req.body.complete;
	connection.run('INSERT INTO todos (description, complete) VALUES (? , ?);' , [description, complete], function(err, docs) {
		if (err) res.json(err);
		res.redirect('todos');
	});
});

// Delete a todo item
app.delete("/todos/:id", function (req, res) {
	var id = req.params.id;
	console.log("Todo to delete: ", id);
});

//Create the server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
