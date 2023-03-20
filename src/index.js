const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user?.username === username);

  if (!user) {
    response.status(404).json({ error: "user not found" });
  }

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  const { user } = request;

  const userExists = users.find((user) => user.username === user.username);

  if (userExists) {
    return response.status(400).json({
      error: "user already exists",
    });
  }

  const body = {
    ...request.body,
    id: uuidv4(),
    todos: [],
  };

  users.push(body);

  return response.status(201).send(body);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const body = {
    ...request.body,
    id: uuidv4(),
    done: false,
    created_at: new Date(),
    deadline: new Date(request.body.deadline),
  };

  user.todos.push(body);

  return response.status(201).send(body);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const body = request.body;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(!todoExists){
    response.status(404).json({ error: "todo not found" });
  }

  const todos = user.todos.map((todos) => {
    return todos.id === id
      ? {
          ...todos,
          ...body,
        }
      : todos;
  });

  user.todos = todos;

  return response.send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const body = request.body;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(!todoExists){
    response.status(404).json({ error: "todo not found" });
  }

  const todos = user.todos.map((todos) => {
    return todos.id === id
      ? {
          ...todos,
          ...body,
        }
      : todos;
  });

  user.todos = todos;

  return response.send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find((todo) => todo.id === id);
  
  if(!todoExists){
    response.status(404).json({ error: "todo not found" });
  }

  const todos = user.todos.filter((todos) => todos.id !== id);

  user.todos = todos;

  return response.status(204).send();
});

module.exports = app;
