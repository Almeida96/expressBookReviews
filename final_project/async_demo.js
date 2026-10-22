// Run the API first with npm start, then execute node async_demo.js.
const {
  getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle
} = require('./router/general');

(async () => {
  try {
    console.log('All books:', JSON.stringify(await getAllBooks(), null, 2));
    console.log('Book ISBN 1:', JSON.stringify(await getBookByISBN('1'), null, 2));
    console.log('Books by Jane Austen:', JSON.stringify(await getBooksByAuthor('Jane Austen'), null, 2));
    console.log('Books titled Pride and Prejudice:', JSON.stringify(await getBooksByTitle('Pride and Prejudice'), null, 2));
  } catch (error) {
    console.error('Unable to load books:', error.response?.data || error.message);
    process.exitCode = 1;
  }
})();
