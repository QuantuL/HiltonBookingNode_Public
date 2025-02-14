//metodo per inizializzare il form a seconda della modalità
function initializeHotelForm(mode, hotelId) {
  localStorage.setItem('mode', mode);
  localStorage.setItem('hotelId', hotelId);
  const form = document.querySelector('form');
  const submitButton = form.querySelector('button[type="submit"]');
  if (form) {
    //se in edit mode si prelevano i dati dell'hotel da modificare e si popolano i campi del form
    if (mode === 'edit' && hotelId) {
      submitButton.textContent = 'Update Hotel';

      fetch(`/api/hotels/${hotelId}`)
        .then(response => response.json())
        .then(data => {
          document.querySelector('#hotelName').value = data.name;
          document.querySelector('#city').value = data.city;
          document.querySelector('#postalCode').value = data.postalCode;
          document.querySelector('#address').value = data.address;
          document.querySelector('#rating').value = data.rating;
        })
        .catch(err => {
          console.error('Errore nel recupero dei dati dell\'hotel:', err);
        });
    //altrimenti cambiare solo la naming del pulsante
    } else {
      submitButton.textContent = 'Add Hotel';
    }
  } else {
    console.log('Form not found');
  }
}

//al submit del form prelevare i valori dei campi inseriti e chiamare la backend API per l'inserimento o l'aggiornamento dell'hotel
async function submitLogic(event) {
  event.preventDefault();

  const form = event.target;
  const hotelName = form.querySelector('#hotelName')?.value;
  const city = form.querySelector('#city')?.value;
  const postalCode = form.querySelector('#postalCode')?.value;
  const address = form.querySelector('#address')?.value;
  const rating = form.querySelector('#rating')?.value;

  if (!hotelName || !city || !postalCode || !address || !rating) {
    showToastInfo('Tutti i campi sono obbligatori');
    return;
  }

  try {
    let mode = localStorage.getItem('mode');
    let hotelId = localStorage.getItem('hotelId');
    const payload = { name: hotelName, city, postalCode, address, rating };
    const url = mode === 'insert' ? '/api/hotels' : `/api/hotels/${hotelId}`;
    const method = mode === 'insert' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const responseData = await response.json();
      showToastInfo(mode === 'insert' ? 'Hotel aggiunto con successo' : 'Hotel aggiornato con successo');
    } else {
      const errorData = await response.json();
      showToastInfo(mode === 'insert' ? 'Errore durante l\'aggiunta dell\'hotel' : 'Errore durante l\'aggiornamento dell\'hotel');
    }
  } catch (err) {
    showToastInfo(mode === 'insert' ? 'Errore durante l\'aggiunta dell\'hotel' : 'Errore durante l\'aggiornamento dell\'hotel');
  }
}

//metodo per gestire i pop-up informatvi
function showToastInfo(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
