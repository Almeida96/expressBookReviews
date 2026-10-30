const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const accounts = require('../accounts');
const public_users = express.Router();

// Public book and account routes
public_users.post('/register', async (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const status = await accounts.register(username, password);
    const messages = { 201: 'User successfully registered', 400: 'Invalid username or password format', 409: 'Username already exists', 503: 'Account limit reached' };
    return res.status(status).json({ message: messages[status] });
  } catch (error) { next(error); }
});

public_users.get('/', (req, res) => res.status(200).json(books));

public_users.get('/isbn/:isbn', (req, res) => {
  const book = Object.hasOwn(books, req.params.isbn) ? books[req.params.isbn] : null;
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ message: 'Book not found' });
});

public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) =>
      book.author.toLowerCase().includes(req.params.author.toLowerCase()))
  );
  return res.status(200).json(matches);
});

public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) =>
      book.title.toLowerCase().includes(req.params.title.toLowerCase()))
  );
  return res.status(200).json(matches);
});

public_users.get('/review/:isbn', (req, res) => {
  const book = Object.hasOwn(books, req.params.isbn) ? books[req.params.isbn] : null;
  return book
    ? res.status(200).json(book.reviews)
    : res.status(404).json({ message: 'Book not found' });
});

// Assignment task 11: the four asynchronous Axios functions.
// Run final_project/async_demo.js to exercise them against the running server.
const api = axios.create({ baseURL: process.env.BOOKS_API_URL || 'http://localhost:5000', timeout: 5000 });

function getAllBooks() {
  return new Promise((resolve, reject) => {
    api.get('/').then(response => resolve(response.data)).catch(reject);
  });
}

async function getBookByISBN(isbn) {
  const response = await api.get(`/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await api.get(`/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await api.get(`/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
