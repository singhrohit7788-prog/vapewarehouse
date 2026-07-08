// Age gate
const gate = document.getElementById('ageGate');
const ageYes = document.getElementById('ageYes');
const ageNo = document.getElementById('ageNo');

if (gate){
  if (sessionStorage.getItem('vw_age_ok') === 'true'){
    gate.classList.add('hidden');
  }
  ageYes.addEventListener('click', () => {
    sessionStorage.setItem('vw_age_ok', 'true');
    gate.classList.add('hidden');
  });
  ageNo.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
}

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

// VW Rewards — Supabase-backed signup + points lookup
// 1. Create a free project at https://supabase.com
// 2. Run the SQL from setup-supabase.sql in the SQL editor
// 3. Paste your project URL + anon key below
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const sb = (SUPABASE_URL.startsWith('http'))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const emailForm = document.getElementById('emailForm');
const codeForm = document.getElementById('codeForm');
const pointsView = document.getElementById('pointsView');
const rwMsg = document.getElementById('rwMsg');
const codeEmailLabel = document.getElementById('codeEmailLabel');
const pointsEmailLabel = document.getElementById('pointsEmailLabel');
const pointsValue = document.getElementById('pointsValue');
const signOutBtn = document.getElementById('signOutBtn');

let pendingEmail = '';

function showStep(step){
  [emailForm, codeForm, pointsView].forEach(el => el && el.classList.add('hidden'));
  if (step) step.classList.remove('hidden');
}

function setMsg(text, isError){
  if (!rwMsg) return;
  rwMsg.textContent = text || '';
  rwMsg.classList.toggle('error', !!isError);
}

async function loadPoints(session){
  const { data, error } = await sb
    .from('members')
    .select('points')
    .eq('id', session.user.id)
    .single();

  pointsEmailLabel.textContent = session.user.email;
  pointsValue.textContent = error ? '—' : data.points;
  showStep(pointsView);
  setMsg('');
}

if (sb && emailForm){
  // Restore session on page load
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) loadPoints(session);
  });

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('rwEmail').value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid){ setMsg('Please enter a valid email address.', true); return; }

    const btn = emailForm.querySelector('button');
    btn.disabled = true;
    setMsg('Sending code…');

    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    btn.disabled = false;

    if (error){ setMsg('Something went wrong. Please try again.', true); return; }

    pendingEmail = email;
    codeEmailLabel.textContent = email;
    setMsg('');
    showStep(codeForm);
  });

  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('rwCode').value.trim();
    if (token.length !== 6){ setMsg('Enter the 6-digit code from your email.', true); return; }

    const btn = codeForm.querySelector('button');
    btn.disabled = true;
    setMsg('Verifying…');

    const { data, error } = await sb.auth.verifyOtp({ email: pendingEmail, token, type: 'email' });
    btn.disabled = false;

    if (error || !data.session){ setMsg('That code didn\'t work. Please try again.', true); return; }

    loadPoints(data.session);
  });

  signOutBtn.addEventListener('click', async () => {
    await sb.auth.signOut();
    showStep(emailForm);
    setMsg('');
  });
} else if (emailForm){
  setMsg('Rewards sign-in isn\'t configured yet.', true);
}
