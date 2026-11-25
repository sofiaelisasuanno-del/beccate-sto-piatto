LAPAPPA v2.3 ☽𖦹☾ — Beccate sto piatto

COME AGGIORNARE (i tuoi dati restano: vivono nel telefono, non su GitHub)
1. Apri https://github.com/sofiaelisasuanno-del/beccate-sto-piatto/upload/main
2. Seleziona TUTTI i file di questa cartella (non ci sono sottocartelle) e premi "Commit changes" in fondo alla pagina.
3. Quando in Actions il caricamento è verde, apri https://sofiaelisasuanno-del.github.io/beccate-sto-piatto/?v=23#home

NOVITÀ v2.3
- Oggi: il riquadro della Ruota dell'Anno sta sotto frutta e ortaggi e cambia colore con sabba, esbat (luna piena) o luna nuova:
  colori in cerchi, temi da onorare, pietre per l'altare, cibi in tavola e date delle prossime lune.
- Header: solo LAPAPPA ☽𖦹☾, niente rovi e niente sottotitolo.
- Frigo: si aggiunge solo scegliendo dal database di 267 alimenti vegetali (tendina con ricerca e sinonimi).
  Gli ingredienti già inseriti vengono collegati da soli; quelli non riconosciuti mostrano "⚠ da collegare".
- Ricette: 1689 varianti riviste (proteine, fibre, legumi, integrali, verdure in ogni pasto principale), collegate al database ingredienti.
- Pappa buona: pulsante "✎ Ingredienti" su ogni pasto per sostituire, togliere o aggiungere ingredienti; i valori si ricalcolano.
  Anche i pasti fuori programma si possono comporre con gli ingredienti.
- Storico della bonanza: pasti su sfondo verde chiaro, più leggibili.
- Oggi mi sento: ora esatta ed emozioni (8 primarie + 21 sfumature) che entrano nell'indice mentale.
  Ogni registrazione resta separata; nei grafici vedi la giornata ora per ora e gli sbalzi (min–max).
- Grimorio: backup in un tocco con condivisione (Drive, Telegram, mail), password facoltativa,
  copie automatiche giornaliere sul telefono (ultime 7) e ripristino guidato.

FILE DI DATI (solo consultazione, l'app non li carica)
- ingredienti_database.csv: nome, categoria, kcal, proteine, carboidrati, grassi, fibre, ferro, calcio, ricco di ferro, unità, peso pezzo, sinonimi.
- ricette_database.csv: colonne nutrizionali + per ogni ingrediente (fino a 8) nome, grammi e kcal.
- ricette_ingredienti.csv: una riga per ogni ingrediente di ogni ricetta, con tutti i nutrienti (formato lungo, comodo in pandas/Power BI).
Separatore ; e virgola decimale (Excel italiano).

NOTE
Valori per 100 g da tabelle CREA e USDA FoodData Central; prodotti confezionati = media di mercato: controlla l'etichetta dei tuoi.
"Ricco di ferro" per gli alimenti = almeno 4,2 mg/100 g (30% del valore di riferimento UE); per le ricette = almeno 8 mg a porzione.
Non caricare backup o PDF su GitHub.
