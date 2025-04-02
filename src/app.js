import { string, setLocale } from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import onChange from 'on-change';
import { renderError } from './view.js';

function app(state, i18n) {
  function handleFormStateChanges(state) {
    if (state.form.error) {
      renderError(state, i18n);
      console.log(state.form);
    }
  }

  const watchedState = onChange(state, (path) => {
    if (path.startsWith('form')) {
      handleFormStateChanges(watchedState);
    }
    
    if (watchedState.form.state === 'success') {
      input.value = '';
      input.focus();
    }
  });
  
  const form = document.querySelector('form');
  const input = document.querySelector('input[id=url-input]');

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
      .then(() => {
        watchedState.data.feeds.push(currentLink);
        watchedState.form.error = null;
        watchedState.form.state = 'success';  
        console.log(watchedState.form);      
      })
      .catch(({ errors }) => {
        watchedState.form.error = errors;
        watchedState.form.state = 'failed';
      });
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