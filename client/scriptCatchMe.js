const $elementCatchMe = document.querySelector('.catch-me');
function randomPosition(max) {
  return Math.random() * max;
}

function moveText() {
  let newX = randomPosition(window.innerWidth - $elementCatchMe.offsetWidth);
  let newY = randomPosition(window.innerHeight - $elementCatchMe.offsetHeight);
  $elementCatchMe.style.left = `${newX}px`;
  $elementCatchMe.style.top = `${newY}px`;
}

moveText();
$elementCatchMe.addEventListener('mouseenter', moveText);

window.addEventListener('resize', moveText);

document.addEventListener('click', e => {
  if (e.target.matches('.logout') || e.target.matches('.logout *')) {
    fetch('/logout', {
      method: 'POST'
    }).then(() => {
      window.location.href = '/login';
    });
  }
});
