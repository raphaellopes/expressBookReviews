const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const user = users.find((user) => user.username === username);
    return !!user;
}

const authenticatedUser = (username, password)=>{ //returns boolean
    const validusers = users.filter(
        (user) => user.username === username && user.password === password
    );
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).send("Error logging in!");
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
        { data: password },
        'secret-api-key',
        { expiresIn: 60 * 60 }
    );
    req.session.authorization = { accessToken, username };
    return res.status(200).send('User sucessfully logged in!');
  } else {
    return res.status(208).json('Invalid Login. Check username and password');
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.session.authorization;
  const { review } = req.body;
  const { isbn } = req.params;
  const book = books[isbn];

  if (!books) {
    return res.status(404).send(`Book not found for isbn ${isbn}`);
  }
  book.reviews = {
    ...book.reviews,
    [username]: review
  };
  return res.status(200).send(`Review for isbn ${isbn} successfully added`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
