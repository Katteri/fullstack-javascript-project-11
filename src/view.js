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