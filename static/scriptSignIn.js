function validateFiscalCode(event) {
  const fiscalCode = event.target.value;
  const submitButton = document.getElementById('submit-button');
  const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  if (!fiscalCodeRegex.test(fiscalCode)) {
    showToast('Inserire un codice fiscale valido');
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

//confronto e validazione mail
function validateEmailMatch(event) {
  const email = document.getElementById('email').value;
  const confirmEmail = event.target.value;
  const submitButton = document.getElementById('submit-button');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showToast('Inserire una mail valida');
    submitButton.disabled = true;
    return;
  }

  if (email !== confirmEmail) {
    showToast('Le email non corrispondono');
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

//confronto password
function validatePasswordMatch(event) {
  const password = document.getElementById('password').value;
  const confirmPassword = event.target.value;
  const submitButton = document.getElementById('submit-button');
  if (password !== confirmPassword) {
    showToast('Le password non corrispondono');
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

//al submit invio dei dati del form verso la backend API per la registrazione dell'utente
async function submitLogic(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.querySelector('#email').value;
  const confirmEmail = form.querySelector('#confirm-email').value;
  const password = form.querySelector('#password').value;
  const confirmPassword = form.querySelector('#confirm-password').value;
  const role = form.querySelector('#role').value;
  const fiscalCode = form.querySelector('#fiscal-code').value;

  if (email !== confirmEmail) {
    showToast('Le email non corrispondono');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Le password non corrispondono');
    return;
  }

  try {
    const response = await fetch('/api/signIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role, fiscalCode })
    });

    if (response.ok) {
      const result = await response.json();
      showToast(result.message);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } else {
      const errorResult = await response.json();
      showToast(errorResult.error);
    }
  } catch (err) {
    console.error('Errore durante la registrazione:', err);
    showToast('Errore durante la registrazione');
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
