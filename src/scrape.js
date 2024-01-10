import puppeteer from 'puppeteer';

async function fetchQuotes() {
    // initialize a headless browser
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
    
    // open a new tab in the browser
    const page = await browser.newPage();

    // nav to the page we want to scrape
    // in this case it is https://www.brainyquote.com/authors/fyodor-dostoevsky-quotes
    // wait until the page is fully loaded
    await page.goto('https://www.brainyquote.com/authors/fyodor-dostoevsky-quotes', {
        waitUntil: 'domcontentloaded'
    });

    // get the quote elements
    // remember the css selector in the README is .grid-item .b-qt div
    // since we want the text and not the element we use the innerText property
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

    // print the quotes 
    console.log(quotes);

    // close the browser
    await browser.close();
}

fetchQuotes();