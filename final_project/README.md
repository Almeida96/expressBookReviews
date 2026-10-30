# Course exercises and evidence

See the [root README](../README.md) for setup, routes, authentication and current limits.

With the API running, generate the course's HTTP examples:

```sh
bash scripts/generate_evidence.sh
node async_demo.js
```

The Bash script requires curl and writes local files under `evidence/`. These include a demo password, a short-lived token and a session cookie: they are ignored by Git. The CI workflow uploads fresh demo evidence for the course; use no real credentials or personal data in this exercise.

The upstream assignment is [IBM's Express Book Reviews project](https://github.com/ibm-developer-skills-network/expressBookReviews). Sample data and the original course structure are retained.
