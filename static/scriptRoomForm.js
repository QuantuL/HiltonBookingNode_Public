//metodo per inizializzare il form a seconda della modalità
async function initializeRoomForm(mode, roomId) {
  localStorage.setItem('mode', mode);
  localStorage.setItem('roomId', roomId);
  const form = document.querySelector('form');
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    //se in edit mode si prelevano i dati della camera da modificare e si popolano i campi del form
    if (mode === 'edit' && roomId) {
      submitButton.textContent = 'Update Room';

      const hotelsResponse = await fetch('/api/hotels');
      const hotels = await hotelsResponse.json();
      const hotelSelect = form.querySelector('#hotel');
      hotels.forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel._id;
        option.obj = hotel;
        option.textContent = hotel.name;
        hotelSelect.appendChild(option);
      });

      // Fetch existing room data and populate the form fields
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
          throw new Error('Room not found');
        }
        const data = await response.json();
        form.querySelector('#hotel').value = data.hotel._id;
        form.querySelector('#roomnumber').value = data.roomnumber;
        form.querySelector('#roomType').value = data.type;
        form.querySelector('#price').value = data.price;
      } catch (err) {
        console.error('Errore nel recupero dei dati della camera:', err);
      }
    //altrimenti cambiare solo la naming del pulsante
    } else {
      submitButton.textContent = 'Add Room';
    }
  } else {
    console.log('Form not found');
  }
}

//al submit del form prelevare i valori dei campi inseriti e chiamare la backend API per l'inserimento o l'aggiornamento della camera
async function submitLogic(event) {
  event.preventDefault();

  const hotelSelect = document.querySelector('#hotel');
  const hotelId = hotelSelect.value;
  const hotelObj = hotelSelect.options[hotelSelect.selectedIndex].obj;
  const roomnumber = document.querySelector('#roomnumber')?.value;
  const roomType = document.querySelector('#roomType')?.value;
  const price = document.querySelector('#price')?.value;

  if (!hotelId || !roomnumber || !roomType || !price) {
    showToastInfo('Tutti i campi sono obbligatori');
    return;
  }

  try {
    let mode = localStorage.getItem('mode');
    let roomId = localStorage.getItem('roomId');
    const payload = { hotel: hotelObj, roomnumber, roomType, price };
    const url = mode === 'insert' ? '/api/rooms' : `/api/rooms/${roomId}`;
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
      showToastInfo(mode === 'insert' ? 'Camera aggiunta con successo' : 'Camera aggiornata con successo');
    } else {
      const errorData = await response.json();
      showToastInfo(mode === 'insert' ? 'Errore durante l\'aggiunta della camera' : 'Errore durante l\'aggiornamento della camera');
    }
  } catch (err) {
    console.error('Errore durante l\'operazione sulla camera:', err);
    showToastInfo(mode === 'insert' ? 'Errore durante l\'aggiunta della camera' : 'Errore durante l\'aggiornamento della camera');
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

