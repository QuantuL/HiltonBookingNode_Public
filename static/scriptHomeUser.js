//metodo per gestire la visualizzazione dei menù dei singoli record
function toggleDropdown(button) {
  const dropdownContent = button.nextElementSibling;
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

//logiche al caricamento della pagina
document.addEventListener('DOMContentLoaded', async () => {
  const fiscalCode = localStorage.getItem('userFiscalCode'); //fiscalCode salvato nel localStorage in fase di login

  if (!fiscalCode) {
    showToast('Codice fiscale non trovato');
    return;
  }

  //in ascolto dell'evento del click del pulsante per effettuare una nuova prenotazione
  document.getElementById('make-reservation-btn').addEventListener('click', () => {
    window.open('/homeReservation.html', '_blank');
  });
  
  //metodo per prelievo record
  await fetchReservations(fiscalCode);
});

//chiamata alla backend API per prelevare tutte le prenotazioni dell'utente attualmente loggato
async function fetchReservations(fiscalCode) {
  const apiUrl = `/api/reservations/fiscalCode/${fiscalCode}`;
  const recordsTable = document.getElementById('records-table');
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.length === 0) {
      showToast('Nessun dato trovato');
    }
    recordsTable.querySelector('tbody').innerHTML = data.map(getTableRow).join(''); //inserimento righe in tabella
  } catch (err) {
    console.error(`Errore nel recupero dei dati: `, err);
  }
}

//generazione riga per singolo record in tabella
function getTableRow(item) {
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
}

//metodo adibito alla ricerca dei record in tabella
function searchLogic(event) {
  const filter = event.target.value.toLowerCase();
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

//metodo per gestire click sui pulsanti di modifica ed eliminazione
async function multiAction(event) {
  //se è stato cliccato il bottone delete
  if (event.target.classList.contains('delete-btn')) {
    const row = event.target.closest('tr');
    const id = row.querySelector('td').textContent;
    const entityType = document.getElementById('records-section').querySelector('h2').innerText;
    let message = '';
    let reservationId;

    //prelievo id della prenotazione
    reservationId = row.querySelector('td:nth-child(1)').textContent;
    message = `Sei sicuro di voler eliminare la prenotazione numero "${reservationId}"?`;

    //messaggio di conferma per l'eliminazione
    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `
      <button class="close-btn" onclick="closeToast()">x</button>
      <p>${message}</p>
      <button id="confirm-delete-btn">Conferma</button>
    `;
    toast.classList.add('show');

    //al conferma chiamata alla backend API per l'eliminazione della prenotazione
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
      try {
        const response = await fetch(`/api/reservations/${id}`, {
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
  //se invece è stato cliccato il bottone edit
  } else if (event.target.classList.contains('edit-btn')) {
    const row = event.target.closest('tr');
    const id = row.querySelector('td').textContent;

    let formHtml = await fetch('/reservationForm.html').then(res => res.text());  //prelievo della pagina del form
    let scriptSrc = '/static/scriptReservationForm.js';                           //caricamento dello script per la gestione del form

    const toast = document.getElementById('toastComponent');
    toast.innerHTML = `<button class="close-btn" onclick="closeToast()">x</button>` + formHtml;
    toast.classList.add('show');

    const script = document.createElement('script');
    script.src = scriptSrc;                          //caricamento dello script
    script.defer = true;
    script.onload = async () => {                    //al caricamento dello script lanciare il metodo di inizializzazione del form
      await initializeReservationForm('edit', id);
    };
    document.body.appendChild(script);              //aggiunta dello script al body
  }
}

//metodo per gestire i pop-up informatvi
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  } else {
    console.error('Elemento toast non trovato');
  }
}

//metodo per chiudere il pop-up di processo
function closeToast() {
  const toast = document.getElementById('toastComponent');
  toast.classList.remove('show');
}