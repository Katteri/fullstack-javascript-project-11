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

function updateRSS(state, i18n) {
  console.log('Проверка обновлений RSS...');
  const { feeds, posts } = state.data;
  console.log('Текущее количество фидов и постов:', feeds.length, posts.length);

  const promises = feeds.map((feed) => {
    if (!feed.url) {
      console.error('URL не определен для RSS-потока:', feed);
      return Promise.resolve();
    }

    return getRSS(feed.url)
      .then((response) => parserRSS(feed.url, response.data, state, i18n))
      .then(({ posts: fetchPosts }) => {
        if (!fetchPosts) {
          return;
        }
        
        state.data.posts = [
          ...new Set([
            ...state.data.posts,
            ...fetchPosts,
          ]),
        ];
        state.form.state = 'success';
      })
      .catch((error) => {
        console.log(error);
        state.form.error = error.message;
        state.form.state = 'failed';
      })
  });

  Promise.all(promises)
    .finally(() => {
      console.log('Проверка обновлений завершена, следующая через 5 сек');
      setTimeout(() => updateRSS(state, i18n), 5000);
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

    if (path.startsWith('modal')) {
      renderModal(watchedState.modal);
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
      (url) => {
        const urls = watchedState.data.feeds.map((feed) => feed.url);
        return !urls.includes(url);
      }
    );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentLink = formData.get('url').trim();
    watchedState.form.state = 'loading';
    
    return schemaRSS.validate(currentLink)
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
        watchedState.form.error = error.message === 'Network Error'? i18n.t(state.feedbackKeys.isNetworkError) : error.message;
        watchedState.form.state = 'failed';
      })
      .finally(() => {
        console.log('Добавлен новый фид');
      });
  });

  modal.addEventListener('show.bs.modal', (eventModal) => {
    const button = eventModal.relatedTarget;
    const postId = button.getAttribute('data-id');
    const { posts } = watchedState.data;
    const post = posts.filter((el) => el.id === postId);

    if (!watchedState.data.readPosts.includes(postId)) {
      watchedState.data.readPosts.push(postId);
    }

    watchedState.modal = {
      state: 'show',
      post: post[0],
    };
  });

  modal.addEventListener('hide.bs.modal', () => {
    watchedState.modal = {
      state: 'hide',
      post: null,
    };
  });

  handleFormStateChanges(watchedState);
  setTimeout(() => updateRSS(watchedState, i18n), 5000);
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
    modal: {
      state: 'hide', // 'show'
      post: null,
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