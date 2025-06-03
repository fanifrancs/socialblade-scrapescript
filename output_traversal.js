// opens random n links from given links array
function open_random(n) {
  if (n >= channel_links.length) {
    open_links(channel_links);
  } else {
    // filters the array first
    let shuffled = channel_links.sort(() => 0.5 - Math.random());
    // picks random n links
    shuffled = shuffled.slice(0, n);
    // sends them to the open_link function
    open_links(shuffled);
  }
}

function open_nth_10(n) {
    
}

function open_links(links) {
  links.forEach(link => {
    window.open(link, '_blank');
  })
}

// populate this with the links
const channel_links = [];

// open_random(n)
// open_nth_10(n)