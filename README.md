# dostoevsky-quote-scraper
## Author: Liam Eckert

## Introduction

I decided to learn more about web-scraping by writing a Dostoevsky quote scraper. 

Although I am writing this to only scrape Dostoevsky quotes the following steps can easily be applied to any other website.

It will help a lot if you understand HTML-DOM as we will be using it to find the elements we want to scrape.

## Step 1: Installing dependencies
Initialize NPM in your project directory if you haven't already.

```bash
npm init -y
```

I also modified the package.json field "type" to allow us to use ES6 modules:
```json
"type": "module"
```

Install the puppeteer package:

```bash
npm install puppeteer 
```

Puppeteer is a libary that works by controlling a headless version of Chromium (the open-source version of Google Chrome). It will make it easy for us to scrape the website.

## Step 2: Inspecting the website
**NOTE: Check the robots meta tag before scraping a website for more info read about ROBOTS [here](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)**

The first thing we need to do is inspect the website we want to scrape.

I am using the [Brainy Quote Dostoevsky page](https://www.brainyquote.com/authors/fyodor-dostoevsky-quotes) for this tutorial.

Upon inspecting the page we notice that each quote is contained in a div with the class "grid-item qb clearfix bqQt" and that the quote itself is contained in a div the class "b-qt" with another div inside with no class.

The container div has multiple classes so we will focus on just "grid-item" for now.

If we wrote a selector for this it would look like this:

```css
.grid-item .b-qt div {
    /* CSS */
}
```

## Step 3: Scraping a single quote
Now that we know what we want to scrape we can get to work.

Create a file called scrape.js and import puppeteer:

```javascript
import puppeteer from 'puppeteer';
```

Now we can write the scraper:

```javascript
async function fetchQuotes() {
    // initialize a headless browser
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
}
```
Currently we are only initializing a visible browser window.

Now we need to navigate to the page we want to scrape add the following code to the fetchQuotes function:

```javascript
// open a new tab in the browser
const page = await browser.newPage();

// nav to the page we want to scrape
// in this case it is https://www.brainyquote.com/authors/fyodor-dostoevsky-quotes
// wait until the page is fully loaded
await page.goto('https://www.brainyquote.com/authors/fyodor-dostoevsky-quotes', {
    waitUntil: 'domcontentloaded'
});
```

Now the that CSS selector I wrote earlier comes in handy. We can use the page.evaluate function to run a function in the context of the page we are scraping almost like we are in the console for that page.

```javascript
// get the quote elements
// remember the css selector in the README is .grid-item .b-qt div
// since we want the text and not the element we use the innerText property
const quotes = await page.evaluate(() => {
    // first fetch the quote container
    const container = document.querySelector('.grid-item');

    // next fetch the quote text from the container
    const quoteContainer = container.querySelector('.b-qt');

    const quote = quoteContainer.querySelector('div').innerText;
        
    return quote;
});
```

Now all we need to do is log the quotes and close the browser:

```javascript
console.log(quotes);

await browser.close();
```

If you run the file you should see the first quote logged to the console.

```bash
node src/scrape.js

# output
Power is given only to those who dare to lower themselves and pick it up. Only one thing matters, one thing; to be able to dare!
```

This is cool but we want to scrape all the quotes on the page.

## Step 4: Scraping all the quotes
To scrape all the quotes we need to modify the code we wrote in step 3.

Notice how in the page.evaluate lambda function we define the const container using document's method querySelector. This method only returns the first element that matches the selector. We need to use querySelectorAll instead.

```javascript
const containers = document.querySelectorAll('.grid-item');
```

Now containers is a list of all the elements that match the selector.

The issue we could run into is some quotes are photos. We need to filter out null results. The following is our modified page.evaluate function:

```javascript
const quotes = await page.evaluate(() => {
    // first fetch the quote containers array
    const containers = document.querySelectorAll('.grid-item');
    
    // next we map over the container array to get the quote text
    const quoteList = Array.from(containers).map(container => {
    
        // check for null values
        if (container) {
            const quoteDiv = container.querySelector('.b-qt');

            if (quoteDiv) {
                return quoteDiv.innerText;
            }else{
                return null;
            }
        }else{
            return null;
        }
    });

    // filter out the null values
    // this is because not all the containers have a quote
    // some have images instead
    const finalList = quoteList.filter(quote => quote !== null);

    return finalList;
});
```

Now if you run the file you should see a list of all the quotes on the page.

## Step 5: What's next?
Now that you know how to scrape a website you can scrape any website you want.

But what should we do with all these quotes?

I considered a couple options:

1. Store them in a database
2. Write them to a file
3. Setup an email service to send me a quote every day

I decided to go with option 2 and then maybe option 3 later.

## Step 6: Writing to a file
To write to a file we first need to consider how will we format the quotes?

I seperate each quote with a newline character so that each quote is on a new line.

First create a file called quotes.txt in the root of your project directory.

Now we need to modify the fetchQuotes function to write to the file.

Be sure to import the fs module first with:

```javascript
import fs from 'fs';
```

Now we can write our function to write to the file:

```javascript
function writeQuotesToFile(fname, quotes) {
    const quoteString = quotes.join('\n');

    fs.writeFile(fname, quoteString, (err) => {
        if (err) {
            console.log(err);
        }else{
            console.log('Quotes written to file');
        }
    });
}
```

Next modify the fetchQuotes function to return the quotes array:

```javascript
return quotes;
```

Now we just call our scrape function and pass the quotes array to the writeQuotesToFile function:

```javascript
const quotes = await fetchQuotes();

writeQuotesToFile('quotes.txt', quotes);
```

Now if you run the file you should see the quotes written to the file.

## That's it!
Now you know how to scrape a website and write the results to a file.

I hope you enjoyed this tutorial and learned something new.