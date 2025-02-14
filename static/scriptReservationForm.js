//metodo per inizializzare il form di prenotazione
async function initializeReservationForm(mode, paramId) {
    localStorage.setItem('mode', mode);
    localStorage.setItem('paramId', paramId);
    const form = document.getElementById('reservation-form');
    if (form) {
        const submitButton = form.querySelector('button[type="submit"]');
        //se si sta inizializzando il form per un edit si preleva a db la prenotazione da modificare e si popolano i campi del form
        if (mode === 'edit' && paramId) {
            submitButton.textContent = 'Update Reservation';
            try {
                const response = await fetch(`/api/reservations/${paramId}`);
                if (!response.ok) {
                    throw new Error('Errore nel recupero della prenotazione');
                }
                const reservationData = await response.json();
                form.querySelector('#room-type').value = reservationData.resroom?.type || '';
                form.querySelector('#people').value = reservationData.people;
                form.querySelector('#check-in').value = reservationData.checkin.split('T')[0];
                form.querySelector('#check-out').value = reservationData.checkout.split('T')[0];
                form.querySelector('#customer-fiscal-code').value = reservationData.customer.fiscalCode;
                form.querySelector('#total-price').value = reservationData.totalPrice;
                localStorage.setItem('currentHotel', reservationData.hotel._id);
            } catch (error) {
                console.error('Errore nel recupero della prenotazione:', error);
                showToastInfo('Errore nel recupero della prenotazione');
            }
        //altrimenti l'altra casistica possibile è l'inserimento e quindi si preleva il prezzo della camera più economica
        //dell'hotel selezioanto per dare un'ida sull'ipotetico costo finale
        } else {
            submitButton.textContent = 'Confirm Reservation';
            try {
                const response = await fetch(`/api/lowerRoom/${paramId}`);
                if (!response.ok) {
                    throw new Error('Errore nel recupero del prezzo della camera');
                }
                const roomData = await response.json();

                if (roomData){
                    const roomPrice = roomData.price;
                    form.querySelector('#total-price').value = 'A partire da: ' + roomPrice;
                } else {
                    showToastInfo('Errore nel recupero del prezzo della camera');
                }
            } catch (error) {
                console.error('Errore nel recupero del prezzo della camera:', error);
                showToastInfo('Errore nel recupero del prezzo della camera');
            }
        }
    }
}

//al conferma si decide a seconda della modalità se fare un inserimento o un aggiornamento e chiamare le rispettive API
async function submitLogic(event) {
    event.preventDefault();

    const form = event.target;
    const roomType = form.querySelector('#room-type').value;
    const people = form.querySelector('#people').value;
    const checkInDate = form.querySelector('#check-in').value;
    const checkOutDate = form.querySelector('#check-out').value;
    const customerFiscalCode = form.querySelector('#customer-fiscal-code').value;
    const totalPrice = form.querySelector('#total-price').value;
    const currentHotelId = localStorage.getItem('currentHotel');

    if (!roomType || !people || !checkInDate || !checkOutDate || !customerFiscalCode) {
        showToastInfo('Per favore, popolare tutti i campi.');
        return;
    }

    try {
        let mode = localStorage.getItem('mode');
        let paramId = localStorage.getItem('paramId');
        const url = mode === 'insert' ? '/api/reservations' : `/api/reservations/${paramId}`;
        const method = mode === 'insert' ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resroom: {type: roomType},
                hotel: { _id: currentHotelId },
                customer: { fiscalCode: customerFiscalCode },
                checkin: checkInDate,
                checkout: checkOutDate,
                totalPrice: totalPrice,
                people: people
            })
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || 'Errore durante l\'invio della prenotazione');
        }

        const message = mode === 'insert' ? 'Prenotazione effettuata con successo' : 'Prenotazione aggiornata con successo';
        const result = await response.json();
        showToastInfo(message);
    } catch (error) {
        console.error('Errore durante l\'invio della prenotazione:', error);
        showToastInfo(error.message);
    }
}

//confronto e validazione codice fiscale
function validateFiscalCode(event) {
    const fiscalCode = event.target.value;
    const submitButton = document.getElementById('reservation-form').querySelector('button[type="submit"]');
    const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  
    if (!fiscalCodeRegex.test(fiscalCode)) {
      showToastInfo('Inserire un codice fiscale valido');
      submitButton.disabled = true;
    } else {
      submitButton.disabled = false;
    }
}

//validazione date
function validateDates() {
    const checkInDate = document.getElementById('check-in');
    const checkOutDate = document.getElementById('check-out');
    const submitButton = document.getElementById('reservation-form').querySelector('button[type="submit"]');

    if (!checkInDate.value){
        return
    }else{
        const today = new Date().toISOString().split('T')[0];
        if (checkInDate.value < today) {
            showToastInfo('La data di check-in deve essere successiva alla data odierna');
            checkInDate.value = '';
            submitButton.disabled = true;
            return;
        }
    }

    if (!checkInDate.value || !checkOutDate.value) {
        return;
    }else{
        if (checkInDate.value >= checkOutDate.value) {
            showToastInfo('La data di check-out deve essere successiva a quella di check-in');
            checkOutDate.value = '';
            submitButton.disabled = true;
            return;
        }
    }
    updateTotalPrice();
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

//metodo per aggiornare il prezzo totale della prenotazione in base alle date, alle persone e alla tipologia della stanza
async function updateTotalPrice() {
    const roomType = document.getElementById('room-type').value;
    const people = document.getElementById('people').value;
    const checkInDate = document.getElementById('check-in').value;
    const checkOutDate = document.getElementById('check-out').value;
    const currentHotelId = localStorage.getItem('currentHotel');

    if (!roomType || !people || !checkInDate || !checkOutDate) {
        return;
    }

    try {
        const response = await fetch(`/api/roomPrice/${currentHotelId}/${roomType}`);   //perlievo ad del costo del tipo di camera
        if (!response.ok) {
            throw new Error('Errore nel recupero del prezzo della camera');
        }
        //prezzo calcolato come: prezzo per notte = prezzo base + (numero di persone - 1) * 35
        //il prezzo base è il prezzo della camera per notte, per ogni persona in più si aggiungono 35 euro
        const priceData = await response.json();
        let totalPrice = priceData.price;
        if (people > 1) {
            totalPrice += 35 * (people - 1);
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        totalPrice *= daysDifference;   //il prezzo totale è il prezzo per notte moltiplicato per il numero di notti
        
        document.getElementById('total-price').value = totalPrice;
    } catch (error) {
        console.error('Errore nel recupero del prezzo della camera:', error);
        showToastInfo('Errore nel recupero del prezzo della camera');
    }
}


