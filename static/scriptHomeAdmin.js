//logiche al caricamento della pagina home per utenti Administrator
document.addEventListener('DOMContentLoaded', async () => {
  //Se presente prelevare la sezione selezionata altrimenti inserire prenotazioni di default
  const selectedSection = localStorage.getItem('selectedSection') || 'prenotazioni';
  handleMenuChange(selectedSection);

  document.getElementById('menu-dropdown').value = selectedSection;
});

//metodo per determinare quale pagina mostrare e record da prelevare in base alla selezione del menù
function handleMenuChange(value) {
  const recordsTable = document.getElementById('records-table');
  const addReservationBtn = document.getElementById('add-reservation-btn');
  const addHotelBtn = document.getElementById('add-hotel-btn');
  const addRoomBtn = document.getElementById('add-room-btn');

  localStorage.setItem('selectedSection', value);       //aggiornamento variabile della selezione del menù nel local storage

  if (value === 'prenotazioni') {
    fetchData('/api/reservations', 'Reservations', recordsTable, addReservationBtn, addHotelBtn, addRoomBtn);
  } else if (value === 'alberghi') {
    fetchData('/api/hotels', 'Hotels', recordsTable, addHotelBtn, addReservationBtn, addRoomBtn);
  } else if (value === 'camere') {
    fetchData('/api/rooms', 'Rooms', recordsTable, addRoomBtn, addReservationBtn, addHotelBtn);
  }
}

//in ascolto sul campo di input adibito alla ricerca dei record in tabella
function searhLogic(event) {
  const filter = event.target.value.toLowerCase();
  const rows = document.querySelectorAll('#records-table tbody tr');
  if (filter.length >= 3) {
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(filter));
      row.style.display = match ? '' : 'none';
    });
  } else {
    rows.forEach(row => {
      row.style.display = '';
    });
  }
}

//metodo richiamato se viene cliccato il pulsante per inserire una nuova prenotazione
function addReservationButton() {
  window.open('/homeReservation.html', '_blank');
}

//in ascolto dell'evento di click sul pulsante per aggiungere un hotel
async function addHotelButton() {
  try {
    const response = await fetch('/hotelForm.html');
    const formHtml = await response.text();
    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `<button class="close-btn" onclick="closeToast()">x</button>` + formHtml;
    toast.classList.add('show');

    //carica manualmente il file JavaScript
    const script = document.createElement('script');
    script.src = '/static/scriptHotelForm.js';
    script.defer = true;
    script.onload = () => {
      //inizializzazione del form dell'hotel in insert mode
      initializeHotelForm('insert');
    };
    document.body.appendChild(script);
  } catch (err) {
    console.error('Errore nel caricamento del form dell\'hotel:', err);
  }
}

//in ascolto dell'evento di click sul pulsante per aggiungere una camera
async function addRoomButton() {
  try {
    const hotelsResponse = await fetch('/api/hotels');
    const hotels = await hotelsResponse.json();

    const response = await fetch('/roomForm.html');
    const formHtml = await response.text();
    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `<button class="close-btn" onclick="closeToast()">x</button>` + formHtml;
    toast.classList.add('show');

    //popola le opzioni degli hotel
    const hotelSelect = toast.querySelector('#hotel');
    hotels.forEach(hotel => {
      const option = document.createElement('option');
      option.value = hotel._id;
      option.obj = hotel;
      option.textContent = hotel.name;
      hotelSelect.appendChild(option);
    });

    //carica manualmente il file JavaScript
    const script = document.createElement('script');
    script.src = '/static/scriptRoomForm.js';
    script.defer = true;
    script.onload = () => {
      //inizializza il form della camera in insert mode
      initializeRoomForm('insert');
    };
    document.body.appendChild(script);
  } catch (err) {
    console.error('Errore nel caricamento del form della camera:', err);
  }
}

//metodo per chiudere il pop-up di processo
function closeToast() {
  const toast = document.getElementById('toastComponent');
  toast.classList.remove('show');
}

//logiche al click sui pulsanti di modifica ed eliminazione
async function multiAction(event) {
  //logiche in caso di click su pulsante di eliminazione
  if (event.target.classList.contains('delete-btn')) {
    const row = event.target.closest('tr');
    const id = row.querySelector('td').textContent;
    const entityType = document.getElementById('records-section').querySelector('h2').innerText;
    let message = '';
    let name, roomnumber, hotelName, reservationId;
    //gestione dei messaggi di processo per confermare l'eliminazione
    switch (entityType) {
      case 'Hotels':
        name = row.querySelector('td:nth-child(2)').textContent;
        message = `Sei sicuro di voler eliminare l'hotel "${name}" e le rispettive camere collegate?`;
        break;
      case 'Rooms':
        roomnumber = row.querySelector('td:nth-child(2)').textContent;
        hotelName = row.querySelector('td:nth-child(3)').textContent;
        message = `Sei sicuro di voler eliminare la camera "${roomnumber}" dell'hotel "${hotelName}"?`;
        break;
      case 'Reservations':
        reservationId = row.querySelector('td:nth-child(1)').textContent;
        message = `Sei sicuro di voler eliminare la prenotazione numero "${reservationId}"?`;
        break;
    }

    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `
      <button class="close-btn" onclick="closeToast()">x</button>
      <p>${message}</p>
      <button id="confirm-delete-btn">Conferma</button>
    `;
    toast.classList.add('show');

    //in ascolto sul click del conferma del toast di eliminazione
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
      try {
        const response = await fetch(`/api/${entityType.toLowerCase()}/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          row.remove();
          showToast(`Eliminazione avvenuta con successo`);
        } else {
          showToast(`Errore durante l'eliminazione`);
        }
      } catch (err) {
        console.error(`Errore durante l'eliminazione`, err);
        showToast(`Errore durante l'eliminazione`);
      } finally {
        closeToast();
      }
    });
  //logiche in caso di click su pulsante di modifica
  } else if (event.target.classList.contains('edit-btn')) {
    const row = event.target.closest('tr');
    const id = row.querySelector('td').textContent;
    console.log('@@@: '+id);
    const entityType = document.getElementById('records-section').querySelector('h2').innerText;
    //caricamento del form di modifica in base all'entità selezionata
    let formHtml, scriptSrc, apiUrl;
    if (entityType === 'Hotels') {
      formHtml = await fetch('/hotelForm.html').then(res => res.text());
      scriptSrc = '/static/scriptHotelForm.js';
      apiUrl = `/api/hotels/${id}`;
    } else if (entityType === 'Rooms') {
      formHtml = await fetch('/roomForm.html').then(res => res.text());
      scriptSrc = '/static/scriptRoomForm.js';
      apiUrl = `/api/rooms/${id}`;
    } else if (entityType === 'Reservations') {
      formHtml = await fetch('/reservationForm.html').then(res => res.text());
      scriptSrc = '/static/scriptReservationForm.js';
      apiUrl = `/api/reservations/${id}`;
    }

    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `<button class="close-btn" onclick="closeToast()">x</button>` + formHtml;
    toast.classList.add('show');

    //caricamento del file javascript per la gestione del form corrispondente
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.defer = true;
    script.onload = async () => {
      if (entityType === 'Hotels') {
        initializeHotelForm('edit', id);
      } else if (entityType === 'Rooms') {
        await initializeRoomForm('edit', id);
      } else if (entityType === 'Reservations') {
        await initializeReservationForm('edit', id);
      }
    };
    document.body.appendChild(script);
  }
}

//prelievo dei record dal db e caricamento di quest'ultimi a frontend
async function fetchData(apiUrl, sectionTitle, recordsTable, showBtn, hideBtn1, hideBtn2) {
  const recordsSection = document.getElementById('records-section');
  recordsSection.querySelector('h2').innerText = sectionTitle;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.length === 0) {
      showToast('Nessun dato trovato');
    }
    recordsTable.querySelector('thead').innerHTML = getTableHeader(sectionTitle);
    recordsTable.querySelector('tbody').innerHTML = data.map(item => getTableRow(item, sectionTitle)).join('');
    showBtn.style.display = 'block';
    hideBtn1.style.display = 'none';
    hideBtn2.style.display = 'none';
  } catch (err) {
    console.error(`Errore nel recupero dei dati da ${apiUrl}:`, err);
  }
}

//metodo per gestire la visualizzazione dei menù dei singoli record
function toggleDropdown(button) {
  const dropdownContent = button.nextElementSibling;
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
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

//metodo per generare l'header della tabella in base alla selezione del menù
function getTableHeader(sectionTitle) {
  if (sectionTitle === 'Reservations') {
    return `
      <tr>
        <th>ID</th>
            <th>Fiscal Code</th>
            <th>Hotel</th>
            <th>Room</th>
            <th>People</th>
            <th>Check-in Date</th>
            <th>Check-out Date</th>
            <th>Price</th>
            <th>Actions</th>
      </tr>
    `;
  } else if (sectionTitle === 'Hotels') {
    return `
      <tr>
        <th>ID</th>
        <th>Hotel Name</th>
        <th>Location</th>
        <th>Rating</th>
        <th>Actions</th>
      </tr>
    `;
  } else if (sectionTitle === 'Rooms') {
    return `
      <tr>
        <th>ID</th>
        <th>Room Number</th>
        <th>Hotel</th>
        <th>Type</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    `;
  }
}

//metodo per generare le righe della tabella in base alla selezione del menù e i record prelevati
function getTableRow(item, sectionTitle) {
  if (sectionTitle === 'Reservations') {
      return `
        <tr>
          <td>${item._id}</td>
          <td>${item.customer.fiscalCode}</td>
          <td>${item.hotel.name}</td>
          <td>${item.resroom.roomnumber || 'N/A'}</td>
          <td>${item.people}</td>
          <td>${new Date(item.checkin).toLocaleDateString()}</td>
          <td>${new Date(item.checkout).toLocaleDateString()}</td>
          <td>${item.totalPrice}</td>
          <td>
            <div class="dropdown">
              <button class="dropbtn" onclick="toggleDropdown(this)">▼</button>
              <div class="dropdown-content">
                <button class="edit-btn" onclick="multiAction(event)">Edit</button>
                <button class="delete-btn" onclick="multiAction(event)">Delete</button>
              </div>
            </div>
          </td>
        </tr>
      `;
    } else if (sectionTitle === 'Hotels') {
    return `
      <tr>
        <td>${item._id}</td>
        <td>${item.name}</td>
        <td>${item.city}, ${item.postalCode}, ${item.address}</td>
        <td>${item.rating}</td>
        <td>
          <div class="dropdown">
            <button class="dropbtn" onclick="toggleDropdown(this)">▼</button>
            <div class="dropdown-content">
              <button class="edit-btn" onclick="multiAction(event)">Edit</button>
              <button class="delete-btn" onclick="multiAction(event)">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  } else if (sectionTitle === 'Rooms') {
    return `
      <tr>
        <td>${item._id}</td>
        <td>${item.roomnumber}</td>
        <td>${item.hotel?.name || 'N/A'}</td>
        <td>${item.type}</td>
        <td>${item.price}</td>
        <td>
          <div class="dropdown">
            <button class="dropbtn" onclick="toggleDropdown(this)">▼</button>
            <div class="dropdown-content">
              <button class="edit-btn" onclick="multiAction(event)">Edit</button>
              <button class="delete-btn" onclick="multiAction(event)">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }
}
