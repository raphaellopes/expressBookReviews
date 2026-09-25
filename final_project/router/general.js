const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const getBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(books), 2000);
    });
}

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject({ code: 404, message: `Unable to find book ${isbn}`});
            }
        }, 2000);
    });
}

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).send(`Username and Password are required!`);
  }

  if (!isValid(username)) {
    users.push({ username, password });
    return res.status(200).send("User successfully registered. Now you can login");
  } else {
    return res.status(404).send("User already exists!");
  }
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    const data = await getBooks();
    return res.status(200).send(JSON.stringify(data, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;
  try {
    const book = await getBookByISBN(isbn);
    return res.status(200).send(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(error.code).send(error.message);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const data = [];
  const bookArray = Object.entries(books);
  for (const [_, book] of bookArray) {
    if (book.author.toLocaleLowerCase() === author.toLocaleLowerCase()) {
        data.push(book);
    }
  }
  
  return res.status(200).send(JSON.stringify(data, null, 2));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const data = [];
  for (const [_, book] of Object.entries(books)) {
    if (book.title.toLocaleLowerCase() === title.toLocaleLowerCase()) {
        data.push(book);
    }
  }
  return res.status(200).send(JSON.stringify(data, null, 2));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).send(`No book found with isbn ${isbn}`);
  }

  const { reviews = {} } = book;
  return res.status(200).send(JSON.stringify(reviews, null, 2));
});

module.exports.general = public_users;
