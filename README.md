# SpotiVote
basic spotify search with vote system

## 1. Descrizione ed Obiettivi del Progetto
Obiettivo: sviluppare una piattaforma che permetta agli utenti di esprimere le loro preferenze musicali in modo semplice

## 2. Istruzioni su come usare il progetto
### Prerequisiti:
1. Account Spotify
2. Una app con *Web API* (https://developer.spotify.com/dashboard)
3. Client ID e secret del app
   
### Come eseguire il progetto:
1. Clonare repository:
    ```bash
    git clone https://github.com/FLOPPATO/SpotiVote.git
    ```
2. Configurare .env
    ```
    PORT -> porta sulla quale il server ascolta
    CLIENT_ID -> id client api spotify
    CLIENT_SECRET -> ^^
    CLEARDB -> TRUE/FLASE ripulisce il database all'avvio/non ripulisce il database
    DBHOST -> indirizzo del database
    DBUSER -> user database
    DBPWD -> password database
    ```
3. Aprire start.bat
4. A fine installazione, il server è pronto

### Uso:
Una volta avviato, la "homepage" sara presente su localhost:PORT/

## 3. Scelte Architetturali Fatte e Loro Motivazione
- **Linguaggio**: abbiamo scelto JavaScript con Node.js per la parte server, perche è ideale alla gestione di richieste per API esterne 
- **Spotify API**: l'uso della API di Spotify per la ricerca delle canzoni tramite il loro server
### Scomposizione in Servizi e Loro Ruolo nel Progetto
il progetto diviso in:
- **autenticazione**: gestisce il token per l'API di Spotify
- **Voti**: registra e salva i voti dai client
- **UI**: parte front-end tramite web

## 4. Architettura dei Servizi e Loro Implementazione
Serivzi:
- **/search**: semplifica la ricerca delle canzoni gestendo il token per l'API di Spotify 
- **/vote**: registra il voto sul database affinche l'utente non abbia gia votato e il suo voto sia presente

## 5. Stato del Progetto
### Problemi e Cose da Risolvere
- **Implementazione**: offrire servizio per riceve statistiche dal database, controllo piu accurato cookie(UUID)
- **Integrazione**: finalizzare feedback con il frontend

### Funzionalità o Parti che Saranno Presenti nella Versione Finale
- visualizzazione delle canzoni votate...
