// Logica compartida de auth para login.html y register.html

function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  const s = document.getElementById('successMsg');
  if (s) s.classList.add('hidden');
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  const e = document.getElementById('errorMsg');
  if (e) e.classList.add('hidden');
}

function setLoading(loading) {
  const btn = document.querySelector('.auth-btn');
  const text = document.getElementById('btnText');
  const loader = document.getElementById('btnLoader');
  if (!btn) return;
  btn.disabled = loading;
  if (text) text.classList.toggle('hidden', loading);
  if (loader) loader.classList.toggle('hidden', !loading);
}

async function authAction(url, body, redirect = true) {
  const errorEl = document.getElementById('errorMsg');
  if (errorEl) errorEl.classList.add('hidden');

  setLoading(true);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      data = {
        success: false,
        message: 'El servidor no respondio con JSON valido'
      };
    }

    if (data.success && redirect) {
      window.location.href = data.redirect_to || '/';
    } else if (!data.success) {
      showError(data.message || 'Error desconocido');
    }

    return data;
  } catch (err) {
    showError('Error de conexion con el servidor');
    return null;
  } finally {
    setLoading(false);
  }
}