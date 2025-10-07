// src/routes/todo.js
const express = require('express');
const router = express.Router();
const db = require('../db/memory'); // Use memory store

// GET /api/v1/todos
router.get('/', async (req, res) => {
  const list = await db.list();
  res.json(list);
});

// POST /api/v1/todos
router.post('/', async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  try {
    const newTodo = await db.create(title);
    // Requirement: returns { id, title, done }
    res.status(201).json({ id: newTodo.id, title: newTodo.title, done: newTodo.done });
  } catch (error) {
    // Should not happen with the current memory implementation but good practice
    res.status(500).json({ error: 'Internal server error during creation.' });
  }
});

module.exports = router;
