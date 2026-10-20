Beccate sto' piatto v0.6

Carica nella radice del repository i file:
index.html, app.js, calendar.js, bonanza.js, sleep.js, wellbeing.js, sw.js, icon.svg, manifest.webmanifest.

Funzioni nuove:
- Rigenerazione individuale e settimanale con esclusione dei pasti scaduti e approvati.
- Ora limite locale: colazione 10:30; pranzo 14:00; spuntino 17:30; cena 22:00.
- Approva piatto salva ricetta immutabile nello Storico della bonanza; nello Storico si puo' aggiungere/sostituire solo foto.
- Diario "Oggi mi sento" con ore e qualità del sonno, descrizioni multiple.
- Home con andamento del benessere degli ultimi 14 giorni.
- Niente riferimenti testuali ai marchi dei modelli AI nell'interfaccia.

AVVERTENZE:
- Dati conservati sul browser locale, NON cifrati. Foto IndexedDB NON incluse nei backup.
- Le ricette vengono generate da regole statiche, non da un modello generativo online.
- Punteggi benessere/nutrizione orientativi, non diagnostici.
- Usa sempre lo stesso browser/dispositivo e non cancellare i dati del sito.
- Il caricamento su GitHub Pages puo' impiegare alcuni minuti.
- I pasti approvati restano nel diario, e la foto NON prova il consumo del pasto.
- Le ore limite usano l'orologio del dispositivo (fuso orario locale).
