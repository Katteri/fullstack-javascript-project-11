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
    idFeed = feed.id;
  } else {
    idFeed = _.uniqueId();
  }

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  const posts = [];
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const post = {
      idFeed,
      id: _.uniqueId(),
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
    };
    posts.push(post);
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