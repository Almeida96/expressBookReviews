# Book Review API — Node.js and Express Final Project

Implementation of the IBM/Coursera **Developing Back-End Apps with Node.js and Express** final project, based on the original `expressBookReviews` starter.

## Getting started

Requirements: Node.js 18+ and npm.

```bash
cd final_project
npm install
npm start
```

By default, the application runs at **http://localhost:5000**.

## Public endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | List every available book |
| GET | `/isbn/:isbn` | Lookup by ISBN |
| GET | `/author/:author` | Lookup by author |
| GET | `/title/:title` | Lookup by title |
| GET | `/review/:isbn` | Show a book's reviews |
| POST | `/register` | Register a new user |
| POST | `/customer/login` | Log in, receive JWT and session cookie |
| PUT | `/customer/auth/review/:isbn` | Create/update user's review |
| DELETE | `/customer/auth/review/:isbn` | Delete user's review |

## Sample commands

```bash
curl http://localhost:5000/
curl http://localhost:5000/isbn/1
curl 'http://localhost:5000/author/Jane%20Austen'
curl 'http://localhost:5000/title/Pride%20and%20Prejudice'
curl http://localhost:5000/review/1

curl -X POST http://localhost:5000/register -H 'Content-Type: application/json' -d '{"username":"student","password":"testpass"}'
curl -c cookies.txt -X POST http://localhost:5000/customer/login -H 'Content-Type: application/json' -d '{"username":"student","password":"testpass"}'
curl -b cookies.txt -X PUT 'http://localhost:5000/customer/auth/review/1?review=Excellent'
curl -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1
```

## Assignment 11: Axios / async

`router/general.js` exports:
- `getAllBooks()`: Promise-based implementation
- `getBookByISBN(isbn)`: async/await
- `getBooksByAuthor(author)`: async/await
- `getBooksByTitle(title)`: async/await

In a second terminal, with the API running:

```bash
node async_demo.js
```

## Generating the submission evidence

With the API running:

```bash
bash scripts/generate_evidence.sh
```

This generates `evidence/githubrepo.txt`, `getallbooks.txt`, `getbooksbyISBN.txt`, `getbooksbyauthor.txt`, `getbooksbytitle.txt`, `getbookreview.txt`, `register.txt`, `login.txt`, `reviewadded.txt` and `deletereview.txt`. Each response is from an actual local HTTP request; no response is fabricated. Save screenshots of the commands/output if your course asks for screenshots.

Automated tests:

```bash
npm test
```

## Notes

This is a learning project: users, plaintext passwords and book reviews are stored in memory and reset on restart. For a production service, use a database, password hashing, secure secrets, rate limiting, and HTTPS.
