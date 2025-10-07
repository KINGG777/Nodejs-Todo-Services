// src/db/memory.js
// src/db/memory.js
const { v4: uuidv4 } = require('uuid'); // Change to this if it's still: const uuidv4 = require('uuid').v4;
let todos = []; // The in-memory store

const db = {
  list: async () => {
    return todos;
  },
  create: async (title) => {
    if (!title || typeof title !== 'string') {
        throw new Error('Title is required and must be a string.');
    }
    const newTodo = {
      id: uuidv4(),
      title: title,
      done: false,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    return newTodo;
  },
  // Function for testing/resetting the store
  __reset: () => {
    todos = [];
  }
};

module.exports = db;
