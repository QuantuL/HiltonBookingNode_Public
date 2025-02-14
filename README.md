# HiltonBookingNode_Public

La seguente applicazione fa parte del Project Work di Marco Arci, matricola: 0312301963.

Per la corretta esecuzione serve effettuare alcuni passaggi:
    -installare mongoDb Compass al seguente link: https://www.mongodb.com/try/download/compass
    -cliccare sul pulsante "New Connection" e lasciare il seguente URI: mongodb://localhost:27017
    -cliccare sul pulsante "+" per aggiungere un nuovo Database chiamato "HltnDb" e connetion name "reservations"
    -creare le ulteriori collection "hotels", "rooms" e "users"
    -facoltativo: per ogni collection importare la base di dati creato ad hoc e disponibile su git
    -installare Visual Studio Code dal sito: https://code.visualstudio.com/download
    -aprire vsCode e clonare il repository git con il comando: git clone https://github.com/QuantuL/HiltonBookingNode_Public
    -verificare il branch:
        -main:
            -installare NodeJs con npm dal seguente sito: https://nodejs.org/en/download
            -installare i moduli necesari con il seguente comando:
                -npm install express mongoose body-parser
        -mainWithModules:
            -non fare nulla
    -node app.js
    -aprire un qualsiasi browser
    -navigare nell'url: http://localhost:3000/
    
