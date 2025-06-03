const load_more_btn = document.querySelector('.self-end');
const channel_selector = 'a[href^="/youtube/channel/"]';

let channel_html_collection;
let channel_html_array = [];
let filtered_html_array = [];

// final output
let channel_links = [];

let btn_interval_id = null;
let html_scraping_interval_id = null;

// subscriber counts where scraper stops and then filters
const min_subscriber_count = 700000;
const max_subscriber_count = 800000;

// interval that runs to click the button every seconds specified
function start_btn_click_interval() {
  if (btn_interval_id === null) {
    btn_interval_id = setInterval(() => {
      load_more_btn.click();
    }, 1500);
  }
}

// interval that runs to scrape the html every seconds specified
function start_scraper_interval() {
  if (html_scraping_interval_id === null) {
    html_scraping_interval_id = setInterval(() => {
      scrape_channels_html();
    }, 10000)
  }
}

// Clear the btn interval
function stop_btn_click_interval() {
  if (btn_interval_id !== null) {
    clearInterval(btn_interval_id);
    btn_interval_id = null;
  }
}

// Clear the scraper interval
function stop_scraper_interval() {
  if (html_scraping_interval_id !== null) {
    clearInterval(html_scraping_interval_id);
    html_scraping_interval_id = null;
  }
}

// scraper that scrapes the DOM
function scrape_channels_html() {
  // grabs and stores the channels displayed as HTML collection
  channel_html_collection = document.querySelectorAll(channel_selector);

  // converts the collection to an array
  channel_html_array = Array.from(channel_html_collection);

  // gets the last channel displayed
  const last_channel_html = channel_html_array[channel_html_array.length - 1];

  // gets the number of subscribers the last channel has
  const last_channel_subscriber_count = get_channel_subscriber_count(last_channel_html);

  console.log(last_channel_subscriber_count);

  // check for scraping condition
  scrape_check(last_channel_subscriber_count);
}

function get_channel_subscriber_count(channel_html){
  let channel_subscriber = channel_html.querySelector('[data-metric="subscribers"] h4');
  let channel_subscriber_count;
  if (channel_subscriber.textContent.endsWith('M')) {
    channel_subscriber_count = Number(channel_subscriber.textContent.slice(0, -1)) * 1000000;
  } else if (channel_subscriber.textContent.endsWith('K')) {
    channel_subscriber_count = Number(channel_subscriber.textContent.slice(0, -1)) * 1000;
  }
  return(channel_subscriber_count);
}

// function that checks the scraping based on conditions specified
function scrape_check(channel_subscriber_count) {
  if (channel_subscriber_count < min_subscriber_count) {
    stop_btn_click_interval();
    stop_scraper_interval();
    filter_channels(channel_html_array);
  }
}

function filter_channels() {
  filtered_html_array = channel_html_array.filter(channel_html =>
    get_channel_subscriber_count(channel_html) >= min_subscriber_count &&
    get_channel_subscriber_count(channel_html) <= max_subscriber_count
  )
  get_channel_links();
}

function get_channel_links() {
  filtered_html_array.forEach(channel_html => {
    const channel_link = channel_html.href;
    // replaces socialblade domain with youtube's
    const yt_channel_link = channel_link.replace('https://socialblade.com/youtube', 'https://youtube.com');
    channel_links.push(yt_channel_link);
  })
  console.log(channel_links);
  console.log('Number of channels: ', channel_links.length);
  download_txt_file();

  // opens random n links after 3 sec
  setTimeout(() => {open_random(15)}, 3000);
}

// takes the final array, stores it in a text file and downloads it
function download_txt_file() {
  const content = JSON.stringify(channel_links);

  const blob = new Blob([content], { type: 'text/plain' });

  const download_link = document.createElement('a');
  download_link.href = URL.createObjectURL(blob);
  download_link.download = 'channels.txt';

  document.body.appendChild(download_link);
  download_link.click();

  // Clean up
  document.body.removeChild(download_link);
  URL.revokeObjectURL(download_link.href);
}

function open_random(n) {
  if (n >= channel_links.length) {
    open_links(channel_links);
  } else {
    let shuffled = channel_links.sort(() => 0.5 - Math.random());
    // picks random n links
    shuffled = shuffled.slice(0, n);
    // sends them to the open_link function
    open_links(shuffled);
  }
}

function open_links(links) {
  links.forEach(link => {
    window.open(link, '_blank');
  })
}

start_btn_click_interval();
start_scraper_interval();