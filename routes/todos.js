/**
 * Define the routes
 */
 //Get all the todos
app.get('/todos', function (req, res) {
	connection.query('select * from todos', function(err, docs) {
		res.render('todos', {todos: docs});
	});
});
// Add a new Todo
app.get("/todos/new", function (req, res) {
	res.render("new");
});
// Save the Newly created Todo Item
app.post("/todos", function (req, res) {
	var description=req.body.description;
	var complete=req.body.complete;
	connection.query('INSERT INTO todos (description, complete) VALUES (? , ?);' , [description, complete], function(err, docs) {
		if (err) res.json(err);
		res.redirect('todos');
	});
});

// Delete a todo item
app.delete("/todos/:id", function (req, res) {
	var id = req.params.id;
	console.log("Todo to delete: ", id);
	res.send('Deleting Todo ID: ', id);
	// var complete=req.body.complete;
	// connection.query('INSERT INTO todos (description, complete) VALUES (? , ?);' , [description, complete], function(err, docs) {
	// 	if (err) res.json(err);
	// 	res.redirect('todos');
	// });
});