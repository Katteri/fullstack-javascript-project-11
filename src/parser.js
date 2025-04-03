import _ from 'lodash';

export default function parserRSS(url, response, state, i18n) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.contents, 'text/xml');
  const urls = state.data.feeds.map((feed) => feed.url);
  let idFeed;

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(i18n.t(state.feedbackKeys.isNotRSS));
  }

  if (urls.includes(url)) {
    const feed = state.data.feeds.filter((feed) => feed.url === url);
    idFeed = feed[0].id;
  } else {
    idFeed = _.uniqueId();
  }
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  const currentPosts = state.data.posts
    .filter((post) => post.idFeed === idFeed)
    .map((post) => post.link);
  
  const posts = [];
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const itemLink = item.querySelector('link').textContent;
    if (currentPosts.includes(itemLink)) {
      return;
    }
    const post = {
      idFeed,
      id: _.uniqueId(),
      title: item.querySelector('title').textContent,
      link: itemLink,
      description: item.querySelector('description').textContent,
    };
    posts.push(post);
    currentPosts.push(post.link);
  });
  
  return {
    feed: {
      id: idFeed,
      title,
      description,
      url,
    },
    posts,
  }
}