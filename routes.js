function setup(app, handlers) {
  	app.get('/rest/todos', handlers.todos.getTodos);
  	app.get('/rest/todos/new', handlers.todos.getNewTodo);
  	app.post('/rest/todos', handlers.todos.createTodo);
	app.del('/rest/todos/:id', handlers.todos.deleteTodo);
}
 
exports.setup = setup;