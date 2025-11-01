import { expect, test } from 'vitest';
import { scrapeContent } from './webScraping';

const INNER_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac ornare mi."
    />
    <title>Lorem Ipsum</title>
    <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.5"></script>
    <style>
      .body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Lorem Ipsum</h1>
      <h2>Consectetur Adipiscing Elit</h2>
      <h3>Nam Ac Ornare Mi</h3>
      <a href="http://localhost:8080/home" target="_blank">Go To Home</a>
    </main>
    <script>
      console.log("Lorem Ipsum Dolor Sit Amet");
    </script>
  </body>
</html>
`;

test('it should scrape web page content', () => {
  const data = scrapeContent('http://localhost:8080', INNER_HTML);
  expect(data.title).toEqual('Lorem Ipsum');
  expect(data.headings).toHaveLength(3);
});
