# Book Review API

An Express API for browsing ten sample books and managing each registered user's reviews. This repository is a fork of [IBM's Node.js and Express course project](https://github.com/ibm-developer-skills-network/expressBookReviews).

This fork adds HTTP integration tests, password hashing, JWT validation, request limits and reproducible dependency installation. Books, users, sessions and reviews live in memory and reset when the process restarts.

## Run

Requires Node.js 22+ and npm.

```sh
cd final_project
npm ci
npm test
npm start
```

The server listens on `http://127.0.0.1:5000`. Set `PORT` or `HOST` to change the address.

## Try the API

```sh
curl http://127.0.0.1:5000/isbn/8
curl -X POST http://127.0.0.1:5000/register -H "Content-Type: application/json" -d '{"username":"reader","password":"example-passphrase"}'
curl -X POST http://127.0.0.1:5000/customer/login -H "Content-Type: application/json" -d '{"username":"reader","password":"example-passphrase"}'
```

Copy `accessToken` from the login response:

```sh
curl -X PUT http://127.0.0.1:5000/customer/auth/review/8 -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"review":"A sharp, funny novel."}'
curl -X DELETE http://127.0.0.1:5000/customer/auth/review/8 -H "Authorization: Bearer TOKEN"
```

Login also creates a session cookie. Query-string reviews remain supported for the course exercise; JSON bodies avoid putting review text in URLs.

| Route | Result |
| --- | --- |
| `GET /` | All books |
| `GET /isbn/:isbn` | One book, or 404 |
| `GET /author/:author`, `GET /title/:title` | Case-insensitive substring matches |
| `GET /review/:isbn` | Reviews keyed by username |
| `POST /register` | 201 created, 400 invalid, 409 duplicate, 503 registry full |
| `POST /customer/login` | Token and session, or 401 |
| `PUT /customer/auth/review/:isbn` | Add or replace the caller's review |
| `DELETE /customer/auth/review/:isbn` | Delete only the caller's review |

## Limits and authentication

Usernames are case-sensitive, 3–64 ASCII letters, digits or underscores; prototype-related names are rejected. Passwords have at least 8 characters and at most 128 UTF-8 bytes, and are stored as salted scrypt hashes. The register holds at most 1,000 accounts. Reviews accept 1–5,000 characters, JSON bodies at most 16 KiB.

JWTs expire after one hour and require the configured signing key, HS256 algorithm, issuer and audience. Development generates random process-local keys. Set independent `JWT_SECRET` and `SESSION_SECRET` values of at least 32 bytes to keep keys stable; production mode requires both.

This remains a local course demo: there is no durable database, password reset, distributed session store or login rate limiting. For deployment, those features and HTTPS must be supplied. Production session cookies require HTTPS.

## Development

`npm test` exercises the real HTTP routes with a temporary port, including malformed input and authentication boundaries. `node async_demo.js` demonstrates the four Axios course tasks against a running server; `BOOKS_API_URL` overrides the address. Requests time out after five seconds.

[Course evidence instructions](final_project/README.md) · [Apache 2.0 license](LICENSE)
