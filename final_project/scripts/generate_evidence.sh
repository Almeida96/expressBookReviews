#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
OUT="${OUT:-evidence}"
mkdir -p "$OUT"
COOKIE="$(mktemp)"
trap 'rm -f "$COOKIE"' EXIT
USER_NAME="student_$(date +%s)"
PASSWORD="book-review-demo-pass"

capture() {
  local name="$1"
  shift
  {
    printf 'Request: curl'
    printf ' %q' "$@"
    printf '\n\nResponse:\n'
    curl -sS -i "$@"
    printf '\n'
  } > "$OUT/$name.txt"
}

capture getallbooks "$BASE_URL/"
capture getbooksbyISBN "$BASE_URL/isbn/1"
capture getbooksbyauthor "$BASE_URL/author/Jane%20Austen"
capture getbooksbytitle "$BASE_URL/title/Pride%20and%20Prejudice"
capture getbookreview "$BASE_URL/review/1"
capture register -H "Content-Type: application/json" -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}" "$BASE_URL/register"
capture login -c "$COOKIE" -b "$COOKIE" -H "Content-Type: application/json" -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}" "$BASE_URL/customer/login"
capture reviewadded -c "$COOKIE" -b "$COOKIE" -X PUT "$BASE_URL/customer/auth/review/1?review=Great%20book"
capture deletereview -c "$COOKIE" -b "$COOKIE" -X DELETE "$BASE_URL/customer/auth/review/1"

{
  printf 'Repository: https://github.com/Almeida96/expressBookReviews\n'
  printf 'Fork source: https://github.com/ibm-developer-skills-network/expressBookReviews\n'
  printf 'Verify fork: curl -s https://api.github.com/repos/Almeida96/expressBookReviews\n'
} > "$OUT/githubrepo.txt"

echo "Evidence files created in $OUT/"
echo 'For screenshot-based submission, open each .txt and capture its command and HTTP response.'
