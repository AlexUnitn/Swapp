# Swapp

**Sito web (produzione):** `https://swapp-dqr8.onrender.com/main/index.html`

Swapp è un’applicazione web per la pubblicazione e la gestione di oggetti condivisibili (es. prestito/scambio), composta da:
- **Backend** Node.js/Express con API REST e autenticazione JWT
- **Frontend** statico (HTML/CSS/JavaScript) servito direttamente dal backend

## Indice
- [Architettura e tecnologie](#architettura-e-tecnologie)
- [Struttura del progetto](#struttura-del-progetto)
- [Configurazione ambiente di sviluppo](#configurazione-ambiente-di-sviluppo)
- [Installazione e avvio](#installazione-e-avvio)
- [Test](#test)
- [API](#api)
- [Deployment](#deployment)

## Architettura e tecnologie

### Architettura (overview)
L’applicazione segue una struttura “MVC-like” lato backend:
- **Routes**: definiscono gli endpoint REST e la loro composizione
- **Controllers**: implementano la logica applicativa per ogni endpoint
- **Models**: definiscono gli schemi MongoDB tramite Mongoose
- **Middleware**: include la protezione tramite token JWT (header Authorization)

Il frontend è composto da pagine statiche organizzate per sezione (login, registrazione, chat, ecc.). Il server Express espone sia le API sotto `/api/*`, sia i file statici sotto `/frontend` (con pagina principale in `/frontend/main`).

### Tecnologie usate
- **Node.js + Express**: server HTTP e routing
- **MongoDB + Mongoose**: persistenza dati e schemi
- **JWT (jsonwebtoken)**: autenticazione stateless tramite token
- **bcryptjs**: hashing delle password
- **dotenv**: caricamento variabili d’ambiente da `.env`
- **Jest + Supertest**: test delle API

## Struttura del progetto

### Panoramica cartelle principali

```
.
├─ frontend/                 # Frontend statico (HTML/CSS/JS), servito da Express
│  ├─ main/                  # Home (pagina principale)
│  ├─ login/                 # Login
│  ├─ registration/          # Registrazione
│  ├─ account/               # Profilo
│  ├─ accountsettings/       # Impostazioni account
│  ├─ chats/                 # Chat e messaggistica
│  ├─ itemdetails/           # Dettagli oggetto
│  ├─ search/                # Ricerca
│  ├─ borrowed/              # Oggetti presi in prestito
│  ├─ lent/                  # Oggetti prestati
│  └─ errore/                # Pagine di errore (404)
│
├─ src/                      # Backend Node.js/Express
│  ├─ app.js                 # Entry-point Express: API + static hosting
│  ├─ db.js                  # Connessione a MongoDB
│  ├─ routes/                # Definizione endpoint REST (/api/*)
│  ├─ controllers/           # Logica degli endpoint
│  ├─ models/                # Schemi Mongoose (User, Item, Booking, Message, Report)
│  ├─ middleware/            # Middleware (es. auth JWT)
│  ├─ utils/                 # Utility (validazione, token, ecc.)
│  └─ test/                  # Test API (Jest/Supertest)
│
├─ .env.example              # Esempio variabili d’ambiente
├─ package.json              # Script e dipendenze
└─ README.md
```

### File chiave (backend)
- [app.js](file:///c:/Users/alexz/Desktop/Swapp/src/app.js): configura Express, monta le rotte `/api/*`, serve `frontend/` come statico e avvia il server.
- [db.js](file:///c:/Users/alexz/Desktop/Swapp/src/db.js): connessione Mongoose usando `DATABASE_URL`.
- [middleware/authMiddleware.js](file:///c:/Users/alexz/Desktop/Swapp/src/middleware/authMiddleware.js): validazione del token JWT via header `Authorization`.

## Configurazione ambiente di sviluppo

### Prerequisiti
- **Node.js** (consigliato **>= 18**, necessario per `node --watch` usato in `npm run dev`)
- **npm** (o equivalente, incluso con Node.js)
- Un’istanza **MongoDB** (locale o cloud, es. MongoDB Atlas)

### 1) Creare e configurare il file `.env`
Nel root del progetto è presente un file `.env.example`. Crea un file `.env` nello stesso livello e compila le variabili richieste.

Esempio (PowerShell):

```powershell
Copy-Item .env.example .env
```

Poi modifica `.env` inserendo valori reali.

### 2) Variabili d’ambiente richieste

| Variabile | Obbligatoria | Scopo |
|---|---:|---|
| `DATABASE_URL` | Sì | URI di connessione MongoDB usata da Mongoose |
| `JWT_SECRET` | Sì | Segreto per firmare e verificare i token JWT |

Note:
- Evita spazi attorno a `=` nel file `.env` (es. `JWT_SECRET=...`).

### 3) Esempi pratici di valori

**MongoDB locale**

```env
DATABASE_URL=mongodb://127.0.0.1:27017/swapp
JWT_SECRET=dev-secret-change-me
```

**MongoDB Atlas (indicativo)**

```env
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/swapp?retryWrites=true&w=majority
JWT_SECRET=una-stringa-lunga-e-casuale
```

## Installazione e avvio

### Installazione dipendenze

```bash
npm install
```

### Avvio in sviluppo (watch mode)

```bash
npm run dev
```

### Avvio in produzione

```bash
npm start
```

### URL utili in locale
- Frontend: `http://localhost:3000/main/index.html`
- API base: `http://localhost:3000/api`

## Test
I test sono in `src/test/` e utilizzano Jest + Supertest.

```bash
npm test
```

Requisiti per i test:
- `DATABASE_URL` deve puntare a un database MongoDB raggiungibile.
- Consigliato usare un database dedicato ai test (es. `swapp_test`) per evitare di sporcare i dati di sviluppo.

## API

### Autenticazione
Le rotte protette richiedono l’header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Il token viene restituito dai servizi di login/registrazione.

### Endpoint principali
Base path: `/api`

#### Auth (`/api/auth`)
- `POST /register` registra un nuovo utente e restituisce un token
- `POST /login` effettua login e restituisce un token

Esempio di registrazione:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Mario",
    "lastName": "Rossi",
    "username": "mrossi",
    "email": "mario.rossi@example.com",
    "phoneNumber": "3331234567",
    "fiscalCode": "RSSMRA80A01H501U",
    "password": "Password123!"
  }'
```

#### Users (`/api/users`) — protette
- `GET /` lista utenti (senza password)
- `GET /:id` dettaglio utente
- `PUT /:id` aggiornamento utente
- `DELETE /:id` eliminazione utente

#### Item (`/api/item`)
Rotte attualmente non protette dal middleware di autenticazione.

- `GET /` lista oggetti
- `POST /` crea un oggetto
- `GET /:id` dettaglio oggetto
- `PUT /:id` aggiorna oggetto
- `DELETE /:id` elimina oggetto
- `GET /user/:userId` lista oggetti pubblicati da un utente
- `GET /recipient/:userId` lista oggetti destinati a un utente (se supportato dalla logica applicativa)

Esempio di creazione oggetto:

```bash
curl -X POST http://localhost:3000/api/item \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trapano a batteria",
    "description": "Trapano in buone condizioni, completo di caricatore.",
    "userId": "000000000000000000000000",
    "category": "Electronics",
    "location": { "city": "Trento", "address": "Via Roma 1" },
    "maxLoanDuration": 7,
    "images": []
  }'
```

#### Booking (`/api/booking`) — protette
- `GET /` lista prenotazioni
- `POST /` crea prenotazione
- `GET /:id` dettaglio prenotazione
- `PUT /:id` aggiorna prenotazione
- `DELETE /:id` elimina prenotazione
- `GET /user/:id` prenotazioni relative a un utente

#### Report (`/api/report`) — protette
- `GET /` lista report
- `POST /` crea report
- `GET /:id` dettaglio report

#### Messages (`/api/messages`) — protette
- `GET /?conversationKey=...` messaggi di una conversazione
- `GET /conversations` elenco conversazioni dell’utente
- `POST /` invio messaggio
- `POST /proposal` crea proposta (booking proposal) via chat
- `POST /proposal/:id/respond` risponde a una proposta

## Deployment

### Checklist
- Configura un database MongoDB raggiungibile dal servizio (Atlas o equivalente)
- Imposta le variabili d’ambiente (`DATABASE_URL`, `JWT_SECRET`) sul provider
- Esegui build/avvio con gli script npm del progetto

### Esempio (Render / servizi Node.js simili)
Impostazioni tipiche:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** aggiungi `DATABASE_URL` e `JWT_SECRET`

Nota sulla porta:
- Il server è configurato per ascoltare su **porta 3000**. Se la piattaforma richiede l’uso di `PORT` (variabile d’ambiente), potrebbe essere necessario adeguare la configurazione del servizio o aggiornare il codice per leggere `process.env.PORT`.
