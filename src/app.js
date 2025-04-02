import { string, setLocale } from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import onChange from 'on-change';
import axios from 'axios';
import { renderError, renderContent, renderModal, renderSubmit } from './view.js';
import parserRSS from './parser.js';

function getRSS(url) {
  return axios.get('https://allorigins.hexlet.app/get', {
    params: {
      url,
      disableCache: true,
    },
  })
    .then((response) => response)
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

function app(state, i18n) {
  function handleFormStateChanges(state) {
    if (state.form.error) {
      renderError(state, i18n);
      renderSubmit(true);
    }
  }

  const watchedState = onChange(state, (path) => {
    if (path.startsWith('form')) {
      handleFormStateChanges(watchedState);
    }
    
    if (watchedState.form.state === 'success') {
      renderError(watchedState, i18n);
      renderContent(watchedState, i18n);
      renderSubmit(true);
    }

    if (watchedState.form.state === 'loading') {
      renderSubmit();
    }
  });
  
  const form = document.querySelector('form');
  const modal = document.querySelector('div[id=modal]');

  const schemaRSS = string()
    .url()
    .required(i18n.t(state.feedbackKeys.isNotRSS))
    .test(
      'is-already-in-feeds',
      i18n.t(state.feedbackKeys.isDublicate),
      (value) => !watchedState.data.feeds.includes(value)
    );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentLink = formData.get('url').trim();
    watchedState.form.state = 'loading';
    
    schemaRSS.validate(currentLink)
      .then(() => getRSS(currentLink))
      .then((response) => parserRSS(currentLink, response.data, watchedState, i18n))
      .then(({feed, posts}) => {
        watchedState.form.error = null;
        watchedState.data.feeds.push(feed);
        watchedState.data.posts = [
          ...new Set([
            ...watchedState.data.posts,
            ...posts,
          ]),
        ];
        watchedState.form.state = 'success';
      })
      .catch((error) => {
        watchedState.form.error = error.message;
        watchedState.form.state = 'failed';
      });
  });

  modal.addEventListener('show.bs.modal', (eventModal) => {
    const button = eventModal.relatedTarget;
    const postId = button.getAttribute('data-id');
    const { posts } = watchedState.data;
    const post = posts.filter((el) => el.id === postId);

    if (!watchedState.data.readPosts.includes(postId)) {
      watchedState.data.readPosts.push(postId);
      renderContent(watchedState, i18n);
    }

    renderModal(post[0]);
  });

  handleFormStateChanges(watchedState);
}

export default function runApp () {
  const initialState = {
    form: {
      state: 'filling', // 'loading', 'success', 'failed'
      error: null,
    },
    data: {
      feeds: [],
      posts: [],
      readPosts: [],
    },
    feedbackKeys: {
      isUrl: 'feedbackMessage.isUrl',
      isOk: 'feedbackMessage.isOk',
      isDublicate: 'feedbackMessage.isDublicate',
      isNotRSS: 'feedbackMessage.isNotRSS',
      isRequired: 'feedbackMessage.isRequired',
      isNetworkError: 'feedbackMessage.isNetworkError',
    },
    ui: {
      feeds: 'ui.feeds',
      posts: 'ui.posts',
      buttons: {
        add: 'ui.buttons.add',
        more: 'ui.buttons.more',
      }
    }
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    setLocale({
      string: {
        url: i18nextInstance.t(initialState.feedbackKeys.isUrl),
      },
    });
    app(initialState, i18nextInstance);
  });
}