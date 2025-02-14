const express = require('express');                   //import modulo express per creare il server
const path = require('path');                         //import modulo path per gestire i percorsi dei file
const mongoose = require('mongoose');                 //import mongoose per gestire le comunicazioni con il database
const bodyParser = require('body-parser');            //import body-parser per gestire i dati in formato JSON
const Reservation = require('./models/Reservation');  //import modello dei record di tipo Reservation
const Hotel = require('./models/Hotel');              //import modello dei record di tipo Hotel
const Room = require('./models/Room');                //import modello dei record di tipo Room
const User = require('./models/User');                //import modello dei record di tipo User

//Crea l'app Express
const app = express();

//Connessione al database MongoDB in localhost
mongoose.connect('mongodb://localhost:27017/HltnDb').then(() => {
  console.log('Connessione al database MongoDB riuscita');
}).catch((err) => {
  console.error('Errore di connessione al database MongoDB:', err);
});

//Configura la cartella dei file statici
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());

//Route per la pagina di login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Login.html'));
});

//Route per la pagina di registrazione
app.get('/signIn', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signIn.html'));
});

//Route per la pagina homeAdmin
app.get('/homeAdmin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homeAdmin.html'));
});

//Route per la pagina homeUser
app.get('/homeUser', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homeUser.html'));
});

//Route per la pagina di prenotazione
app.get('/homeReservation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'homeReservation.html'));
});

//Route per il form di inserimento di una prenotazione
app.get('/reservationForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reservationForm.html'));
});

//Route per il form di inserimento di un hotel
app.get('/hotelForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'hotelForm.html'));
});

//Route per il form di inserimento di una camera
app.get('/roomForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'roomForm.html'));
});

//GET tutte le prenotazioni
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).send(err);
  }
});

//GET tutte le prenotazioni di un cliente
app.get('/api/reservations/fiscalCode/:fiscalCode', async (req, res) => {
  const { fiscalCode } = req.params;
  try {
    const reservations = await Reservation.find({ 'customer.fiscalCode': fiscalCode });
    console.log('reservation: '+reservations);
    if (!reservations.length) {
      return res.status(404).json({ error: 'Nessuna prenotazione trovata' });
    }
    res.json(reservations);
  } catch (err) {
    console.error('Errore nel recupero delle prenotazioni:', err);
    res.status(500).send(err);
  }
});

//GET una singola prenotazione
app.get('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    console.log('reservation: '+reservation);
    if (!reservation) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }
    res.json(reservation);
  } catch (err) {
    console.error('Errore nel recupero della prenotazione:', err);
    res.status(500).send(err);
  }
});

//GET tutti gli hotel
app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).send(err);
  }
});

//GET un singolo hotel
app.get('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel non trovato' });
    }
    res.json(hotel);
  } catch (err) {
    console.error('Errore nel recupero dell\'hotel:', err);
    res.status(500).send(err);
  }
});

//GET tutti gli hotel per comune
app.get('/api/hotelsByCity/:city', async (req, res) => {
  const { city } = req.params;
  try {
    const hotels = await Hotel.find({ city: new RegExp(city, 'i') });
    if (!hotels.length) {
      return res.status(404).json({ error: 'Nessun Hotel trovato' });
    }
    res.json(hotels);
  } catch (err) {
    console.error('Errore nel recupero degli hotel:', err);
    res.status(500).send(err);
  }
});

//GET tutte le camere
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).send(err);
  }
});

//GET la camera meno costosa di un albergo
app.get('/api/lowerRoom/:hotelId', async (req, res) => {
  const { hotelId } = req.params;
  try {
    const room = await Room.findOne({ 'hotel._id': hotelId }).sort({ price: 1 });
    if (!room) {
      return res.status(404).json({ error: 'Nessuna camera trovata per questo hotel' });
    }
    res.json(room);
  } catch (err) {
    console.error('Errore nel recupero delle camere:', err);
    res.status(500).send(err);
  }
});

//GET una singola camera
app.get('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ error: 'Camera non trovata' });
    }
    res.json(room);
  } catch (err) {
    console.error('Errore nel recupero della camera:', err);
    res.status(500).send(err);
  }
});

//GET una singola camera in base all'hotel e al tipo di camera
app.get('/api/roomPrice/:hotelId/:roomType', async (req, res) => {
  const { hotelId, roomType } = req.params;
  try {
    const room = await Room.findOne({ 'hotel._id': hotelId, type: roomType });
    if (!room) {
      return res.status(404).json({ error: 'Camera non trovata' });
    }
    res.json({ price: room.price });
  } catch (err) {
    console.error('Errore nel recupero del prezzo della camera:', err);
    res.status(500).send(err);
  }
});

//POST per inserire una nuova prenotazione
app.post('/api/reservations', async (req, res) => {
  const { hotel, resroom, customer, checkin, checkout, totalPrice, people } = req.body;
  console.log('Dati ricevuti per la nuova prenotazione:', { hotel, resroom, customer, checkin, checkout, totalPrice, people });

  try {
    let roomsDetails = await Room.find({ 'hotel._id': hotel._id, type: resroom.type });
    hotel.name = roomsDetails[0].hotel.name;
    let isAvaible = false;
    let tempRoom;
    //Per ogni camera della tipologia richiesta verifica se è presente già una prenotazione che si sovrappone
    //con le date richieste, se non viene trovata una prenotazione allora la camera è libera e prenotabile
    for (const el of roomsDetails) {
      tempRoom = await Reservation.find({
        $and: [
          { 'resroom._id': el._id },
          {
            $or: [
              {
                $and: [
                  { checkin: { $lte: checkin } },
                  { checkout: { $lte: checkout } },
                  { checkout: { $gte: checkin } }
                ]
              },
              {
                $and: [
                  { checkin: { $gte: checkin } },
                  { checkout: { $lte: checkout } }
                ]
              },
              {
                $and: [
                  { checkin: { $gte: checkin } },
                  { checkin: { $lte: checkout } },
                  { checkout: { $gte: checkout } }
                ]
              }
            ]
          }
        ]
      });
      if (tempRoom.length == 0) {
        isAvaible = true;
        resroom.roomnumber = el.roomnumber;
        resroom._id = el._id;
        break;
      }
    }
    if (!isAvaible) {
      return res.status(400).json({ error: 'Nessuna camera disponibile per le date selezionate' });
    }
    const newReservation = new Reservation({ hotel, resroom, customer, checkin, checkout, totalPrice, people });
    await newReservation.save();
    console.log('Prenotazione aggiunta con successo:', newReservation);
    res.json({ message: 'Prenotazione aggiunta con successo', reservation: newReservation });
  } catch (err) {
    console.error('Errore durante l\'aggiunta della prenotazione:', err);
    res.status(500).send(err);
  }
});

//POST inserire un nuovo hotel
app.post('/api/hotels', async (req, res) => {
  const { name, city, postalCode, address, rating } = req.body;
  console.log('Dati ricevuti per il nuovo hotel:', { name, city, postalCode, address, rating });

  try {
    const newHotel = new Hotel({ name, city, postalCode, address, rating });
    await newHotel.save();
    console.log('Hotel aggiunto con successo:', newHotel);
    res.json({ message: 'Hotel added successfully', hotel: newHotel });
  } catch (err) {
    console.error('Errore durante l\'aggiunta dell\'hotel:', err);
    res.status(500).send(err);
  }
});

//POST inserire una nuova camera
app.post('/api/rooms', async (req, res) => {
  const { hotel, roomnumber, roomType, price } = req.body;
  console.log('Dati ricevuti per la nuova camera:', { hotel, roomnumber, roomType, price });

  try {
    const newRoom = new Room({
      hotel,
      roomnumber,
      type: roomType,
      price
    });
    await newRoom.save();
    console.log('Camera aggiunta con successo:', newRoom);
    res.json({ message: 'Room added successfully', room: newRoom });
  } catch (err) {
    console.error('Errore durante l\'aggiunta della camera:', err);
    res.status(500).send(err);
  }
});

//POST per la inserire un utente
app.post('/api/signIn', async (req, res) => {
  const { email, password, role, fiscalCode } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Inserire una mail valida' });
  }

  try {
    const existingUser = await User.findOne({$or: [
                                                    { email: email },
                                                    { fiscalCode: fiscalCode }
                                                  ]});
    if (existingUser) {
      return res.status(400).json({ error: 'Utente già registrato' });
    }

    const newUser = new User({ email, password, role, fiscalCode });
    await newUser.save();
    return res.json({ message: 'Registrazione avvenuta con successo' });
  } catch (err) {
    res.status(500).send(err);
  }
});

//POST per verificare i dati di login e rindirizzare alla home page corretta
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Inserire una mail valida' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Utente non censito a sistema' });
    }
    if (user.password !== password) {
      return res.status(400).json({ error: 'Email o password errati' });
    }
    const fiscalCode = user.fiscalCode;
    if (user.role === 'administrator') {
      return res.json({ redirectUrl: '/homeAdmin', fiscalCode });
    } else {
      return res.json({ redirectUrl: '/homeUser', fiscalCode });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//PUT per aggiornare una prenotazione
app.put('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  const { hotel, resroom, customer, checkin, checkout, totalPrice, people } = req.body;
  console.log('Dati ricevuti per l\'aggiornamento della prenotazione:', { id, hotel, resroom, customer, checkin, checkout, totalPrice, people });

  try {
    // Preleva le stanze opportune di quell'hotel
    const roomsDetails = await Room.find({ 'hotel._id': hotel._id, type: resroom.type });
    if (roomsDetails.length === 0) {
      return res.status(404).json({ error: 'Nessuna stanza trovata per questo hotel e tipo di stanza' });
    }
    hotel.name = roomsDetails[0].hotel.name;

    // Crea una mappa con chiave la roomId e come valore l'intero object room
    const roomMap = new Map(roomsDetails.map(room => [room._id.toString(), room]));

    // Preleva le prenotazioni per tutte le stanze in un'unica query
    const reservations = await Reservation.find({
      'resroom._id': { $in: Array.from(roomMap.keys()) },
      $or: [
        { checkin: { $lte: checkin }, checkout: { $gte: checkin } },
        { checkin: { $lte: checkout }, checkout: { $gte: checkout } },
        { checkin: { $gte: checkin }, checkout: { $lte: checkout } }
      ]
    });

    // Crea una mappa delle prenotazioni con chiave resroom._id e valore la prenotazione
    const reservationMap = new Map(reservations.map(reservation => [reservation.resroom._id.toString(), reservation]));

    // Trova la prima stanza disponibile
    let isAvailable = false;
    //scorrendo la lista delle stanze desiderate
    for (const room of roomsDetails) {
      //tento di prelevare la prenotazione associata
      if (!reservationMap.get(room._id.toString())) {
        //se ha esito negativo la stanza è disponibile
        resroom.roomnumber = room.roomnumber;
        resroom._id = room._id;
        isAvailable = true;
        break;
      }
    }

    if (!isAvailable) {
      return res.status(400).json({ error: 'Non è possibile modificare la prenotazione con i nuovi parametri' });
    }

    // Aggiorna la prenotazione con la stanza disponibile
    const updatedReservation = await Reservation.findByIdAndUpdate(id, {
      hotel,
      resroom: {
        _id: resroom._id,
        roomnumber: resroom.roomnumber,
        type: resroom.type
      },
      customer,
      checkin,
      checkout,
      totalPrice,
      people
    }, { new: true });

    if (!updatedReservation) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }

    console.log('Prenotazione aggiornata con successo:', updatedReservation);
    res.json({ message: 'Prenotazione aggiornata con successo', reservation: updatedReservation });
  } catch (err) {
    console.error('Errore durante l\'aggiornamento della prenotazione:', err);
    res.status(500).send(err);
  }
});

//PUT per aggiornare un hotel
app.put('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;
  const { name, city, postalCode, address, rating } = req.body;
  console.log('Dati ricevuti per l\'aggiornamento dell\'hotel:', { id, name, city, postalCode, address, rating });

  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(id, { name, city, postalCode, address, rating }, { new: true });
    if (!updatedHotel) {
      return res.status(404).json({ error: 'Hotel non trovato' });
    }
    console.log('Hotel aggiornato con successo:', updatedHotel);

    //Aggiorna anche tutte le camere associate all'hotel
    await Room.updateMany({ 'hotel._id': id },
      {
        $set: {
          'hotel.name': name,
          'hotel.city': city,
          'hotel.postalCode': postalCode,
          'hotel.address': address,
          'hotel.rating': rating
        }
      }
    );
    console.log('Camere associate all\'hotel aggiornate con successo');

    res.json({ message: 'Hotel e camere associate aggiornati con successo', hotel: updatedHotel });
  } catch (err) {
    console.error('Errore durante l\'aggiornamento dell\'hotel e delle camere associate:', err);
    res.status(500).send(err);
  }
});

//PUT per aggiornare una camera
app.put('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { hotel, roomnumber, roomType, price } = req.body;
  console.log('Dati ricevuti per l\'aggiornamento della camera:', { id, hotel, roomnumber, roomType, price });

  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, {
      hotel,
      roomnumber,
      type: roomType,
      price
    }, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ error: 'Camera non trovata' });
    }
    console.log('Camera aggiornata con successo:', updatedRoom);
    res.json({ message: 'Camera aggiornata con successo', room: updatedRoom });
  } catch (err) {
    console.error('Errore durante l\'aggiornamento della camera:', err);
    res.status(500).send(err);
  }
});

//DELETE per eliminare una prenotazione
app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  console.log('ID della prenotazione da eliminare:', id);

  try {
    const deletedReservation = await Reservation.findByIdAndDelete(id);
    if (!deletedReservation) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }
    console.log('Prenotazione eliminata con successo:', deletedReservation);
    res.json({ message: 'Prenotazione eliminata con successo', reservation: deletedReservation });
  } catch (err) {
    console.error('Errore durante l\'eliminazione della prenotazione:', err);
    res.status(500).send(err);
  }
});

//DELETE per eliminare un hotel
app.delete('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;
  console.log('ID dell\'hotel da eliminare:', id);

  if (await checkActiveReservations('hotel', id)) {
    return res.status(400).json({ error: 'Non è possibile eliminare l\'albergo perché ci sono prenotazioni attive' });
  }

  try {
    //Elimina tutte le camere associate all'hotel
    await Room.deleteMany({ 'hotel._id': new mongoose.Types.ObjectId(id) });
    console.log('Camere associate all\'hotel eliminate con successo');

    //Elimina l'hotel
    const deletedHotel = await Hotel.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    if (!deletedHotel) {
      return res.status(404).json({ error: 'Hotel non trovato' });
    }
    console.log('Hotel eliminato con successo:', deletedHotel);
    res.json({ message: 'Hotel e camere associate eliminati con successo', hotel: deletedHotel });
  } catch (err) {
    console.error('Errore durante l\'eliminazione dell\'hotel e delle camere associate:', err);
    res.status(500).send(err);
  }
});

//DELETE per eliminare una camera
app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  console.log('ID della camera da eliminare:', id);

  try {
    // Verifica se ci sono prenotazioni attive per la camera
    if (await checkActiveReservations('room', id)) {
      return res.status(400).json({ error: 'Non è possibile eliminare la camera perché ci sono prenotazioni attive' });
    }

    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Camera non trovata' });
    }
    console.log('Camera eliminata con successo:', deletedRoom);
    res.json({ message: 'Camera eliminata con successo', room: deletedRoom });
  } catch (err) {
    console.error('Errore durante l\'eliminazione della camera:', err);
    res.status(500).send(err);
  }
});

//Funzione per verificare se ci sono prenotazioni attive
async function checkActiveReservations(entityType, entityId) {
  const query = entityType === 'hotel' ? { 'hotel._id': entityId } : { 'resroom._id': entityId };
  const activeReservations = await Reservation.find({
    ...query,
    checkout: { $gte: new Date() }
  });
  return activeReservations.length > 0;
}

//Porta del server localhost fissa nella porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
