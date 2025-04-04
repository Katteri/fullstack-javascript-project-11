export function renderError(state, i18n) {
  const input = document.querySelector('input[id=url-input]');
  const feedback = document.querySelector('p.feedback');

  if (state.form.error) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = state.form.error;
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t(state.feedbackKeys.isOk);
  }
}

export function renderModal(modal) {
  if (modal.state === 'hide' || !modal.post) {
    return;
  }

  const modalContainer = document.getElementById('modal');
  const modalTitle = modalContainer.querySelector('h5.modal-title');
  const modalDescription = modalContainer.querySelector('div.modal-body');
  const modalLinkBtn = modalContainer.querySelector('a.full-article');

  modalTitle.textContent = modal.post.title;
  modalDescription.textContent = modal.post.description;
  modalLinkBtn.href = modal.post.link;
}

function renderPosts(containerName, posts, readPosts, textButton) {
  const container = document.querySelector(containerName);
  const ul = container.querySelector('ul');

  posts.forEach((post) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const button = document.createElement('button');

    if (readPosts.includes(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    a.href = post.link;
    a.textContent = post.title;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.dataset.Id = post.id;

    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.textContent = textButton;

    li.appendChild(a);
    li.appendChild(button);
    ul.appendChild(li);
  });
}

function renderFeeds(containerName, feeds) {
  const container = document.querySelector(containerName);
  const ul = container.querySelector('ul');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');

    h3.textContent = feed.title;
    p.textContent = feed.description;

    li.appendChild(h3);
    li.appendChild(p);
    ul.appendChild(li);
  });
}

function renderContainer(containerName, title) {
  const container = document.querySelector(containerName);
  const div = document.createElement('div');
  const divName = document.createElement('div');
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');

  div.classList.add('card', 'border-0');
  divName.classList.add('card-body');
  h2.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  h2.textContent = title;

  divName.appendChild(h2);
  div.appendChild(divName);
  div.appendChild(ul);

  container.innerHTML = '';
  container.appendChild(div);
}

export function renderContent(state, i18n) {
  const input = document.querySelector('input[id=url-input]');
  input.value = '';
  input.focus();

  renderContainer('div.posts', i18n.t(state.ui.posts));
  renderContainer('div.feeds', i18n.t(state.ui.feeds));

  renderPosts('div.posts', state.data.posts, state.data.readPosts, i18n.t(state.ui.buttons.more));
  renderFeeds('div.feeds', state.data.feeds);
}

export function renderSubmit(state = false) {
  const btnSubmit = document.querySelector('button[type=submit]');
  if (state) {
    btnSubmit.removeAttribute('disabled');
  } else {
    btnSubmit.setAttribute('disabled', '');
  }
}
