import { CustomPopover } from './CustomPopover.js';
const thePopover = new CustomPopover();
const $ = el => document.querySelector(el);
const $form = $('form');
const $inputText = $('input[type="text"]');
const $inputPassword = $('input[type="password"]');

$form.addEventListener('submit', async e => {
  e.preventDefault();

  const peticion = await fetch($form.action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: $inputText.value,
      password: $inputPassword.value
    })
  });
  const response = await peticion.json();

  if (response.success) {
    thePopover.showMessage('success', { message: response.message });
    setTimeout(() => {
      window.location.href = '/private';
    }, 3000)
    return;
  }

  thePopover.showMessage('error', { message: response.message });
});

