//logiche al click del pulsante della ricerca degli hotel
async function searhHotels(event) {
    event.preventDefault();

    const city = document.getElementById('city').value;
    let response;
    //se è presente la città cercare gli alberghi per città altrimenti tutti gli alberghi
    if (city) {
        response = await fetch(`/api/hotelsByCity/${city}`);
    }else{
        response = await fetch(`/api/hotels`);
    }
    const hotels = await response.json();

    const table = document.getElementById('records-table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    if (hotels.error || hotels.length === 0) {
        showToastInfo('Nessun Hotel trovato');
        return;
    }

    //popolamento delle righe della tabella
    hotels.forEach(hotel => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hotel.name}</td>
            <td>${hotel.city}</td>
            <td>${hotel.address}</td>
            <td>${hotel.rating}</td>
            <td><button type="button" class="action-button" data-hotel-id="${hotel._id}" onclick="bookingButton(event)">Book now</button></td>
        `;
        tbody.appendChild(row);
    });

    table.style.display = 'table';
}

//logiche al click del pulsante per avviare la prenotazione
async function bookingButton(event){
    if (event.target.classList.contains('action-button')) {
        const hotelId = event.target.getAttribute('data-hotel-id'); //recupero dell'id dell'hotel
        try {
            //prelievo della pagina html del form di prenotazione, caricamento del file JavaScript e inizializzazione del form
            const response = await fetch('/reservationForm.html');
            const formHtml = await response.text();
            const toast = document.getElementById('toastComponent');
            if (toast) {
                toast.innerHTML = `<button class="close-btn" onclick="closeToast()">x</button>` + formHtml;
                toast.classList.add('show');

                // Carica manualmente il file JavaScript
                const script = document.createElement('script');
                script.src = '/static/scriptReservationForm.js';
                script.defer = true;
                script.onload = () => {
                    initializeReservationForm('insert', hotelId);
                };
                document.body.appendChild(script);
            } else {
                console.error('Elemento toast non trovato');
            }
        } catch (err) {
            console.error('Errore nel caricamento del form di prenotazione:', err);
        }
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

    //svuotamento tabella
    const table = document.getElementById('records-table');
    const tbody = table.querySelector('tbody');
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    table.style.display = 'none';
}

//metodo per chiudere il pop-up di processo
function closeToast() {
    const toast = document.getElementById('toastComponent');
    toast.classList.remove('show');
}


