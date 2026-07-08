// Countdown — set your real launch date here
const LAUNCH = new Date();
LAUNCH.setDate(LAUNCH.getDate() + 90);

const el = {
  d: document.getElementById('d'),
  h: document.getElementById('h'),
  m: document.getElementById('m'),
  s: document.getElementById('s'),
};

function pad(n){ return String(Math.max(n,0)).padStart(2,'0'); }

function tick(){
  const diff = LAUNCH - new Date();

  if (diff <= 0){
    el.d.textContent = '00';
    el.h.textContent = '00';
    el.m.textContent = '00';
    el.s.textContent = '00';
    clearInterval(timer);
    return;
  }

  el.d.textContent = pad(Math.floor(diff / 86400000));
  el.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
  el.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
  el.s.textContent = pad(Math.floor((diff % 60000) / 1000));
}

tick();
const timer = setInterval(tick, 1000);

// VIP form
const form = document.getElementById('vipForm');
const emailInput = document.getElementById('vipEmail');
const msg = document.getElementById('vipMsg');

if (form){
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid){
      msg.textContent = 'Please enter a valid email address.';
      msg.classList.add('error');
      return;
    }

    // TODO: replace with a real signup endpoint (Mailchimp, Formspree, etc.)
    msg.classList.remove('error');
    msg.textContent = `You're on the list — we'll email ${email} when we launch.`;
    form.reset();
  });
}
