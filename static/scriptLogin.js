//al submit del form di login e chiamata alla backend API per verificare il login
async function submitLogic(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('userFiscalCode', data.fiscalCode); // Memorizza il codice fiscale nel localStorage
      window.location.href = data.redirectUrl;
    } else {
      showToast(data.error);
    }
  } catch (err) {
    console.error('Errore durante il login:', err);
    showToast('Errore durante il login');
  }
}

//metodo per gestire i pop-up informatvi
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
