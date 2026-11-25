# Gestor de tasques

API REST amb Node.js, Express, Mongoose i MongoDB per crear i gestionar tasques. Les dades s'emmagatzemen a MongoDB, no en un array temporal.

## Requisits

- Node.js i npm.
- MongoDB en execució local o una URI de connexió accessible.
- Postman per importar i provar la col·lecció inclosa.

## Instal·lació i arrencada

1. Instal·la les dependències:

   ```bash
   npm install
   ```

2. Crea el fitxer `.env` a partir de `.env.example`. A PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Canvia `MONGO_URI` si la base de dades no és local. No pugis mai `.env` a GitHub.

3. Engega el servidor en mode desenvolupament:

   ```bash
   npm run dev
   ```

   També pots iniciar-lo amb `npm start`. Per defecte, l'API escolta al port 3000 i MongoDB desa les dades a la base `taskmanager`.

## Model de tasca

| Camp | Tipus | Regles |
| --- | --- | --- |
| `title` | String | Obligatori; s'eliminen els espais dels extrems. |
| `description` | String | Opcional. |
| `cost` | Number | Obligatori i igual o superior a zero. |
| `hours_estimated` | Number | Obligatori i igual o superior a zero. |
| `hours_real` | Number | Opcional i igual o superior a zero. |
| `image` | String | Opcional; URL o ruta de la imatge. |
| `completed` | Boolean | Per defecte, `false`. |
| `finished_at` | Date | `null` fins que la tasca es completa. |
| `createdAt` | Date | Generat automàticament per Mongoose. |

En crear una tasca completada o en marcar-la com a completada, `finished_at` rep la data actual. Si es torna a marcar com a no completada, el camp torna a `null`. Els camps `finished_at`, `createdAt` i `_id` no es poden modificar enviant-los al cos de la petició.

## Rutes

| Mètode | Ruta | Resposta |
| --- | --- | --- |
| `POST` | `/api/tasks` | Crea una tasca; retorna `201` o `400` si les dades no són vàlides. |
| `GET` | `/api/tasks` | Retorna totes les tasques (`200`). |
| `GET` | `/api/tasks/:id` | Retorna una tasca (`200`), `400` si l'ID no és vàlid o `404` si no existeix. |
| `PUT` | `/api/tasks/:id` | Actualitza els camps enviats; retorna `200`, `400` per dades/ID invàlids o `404` si no existeix. |
| `DELETE` | `/api/tasks/:id` | Elimina la tasca (`200`), `400` si l'ID no és vàlid o `404` si no existeix. |

Per crear una tasca, envia un cos JSON com aquest:

```json
{
  "title": "Dissenyar una pàgina web",
  "description": "Crear una pàgina web responsiva",
  "cost": 500,
  "hours_estimated": 20,
  "image": "https://example.com/images/task.jpg"
}
```

`PUT` admet actualitzacions parcials, per exemple `{"completed": true, "hours_real": 15}`. Els errors de validació retornen un missatge i una llista `details`; els errors inesperats retornen `500` sense exposar detalls interns. Les rutes inexistents retornen `404` en JSON.

## Proves

Importa `postman/gestor-tasques.postman_collection.json` a Postman. La col·lecció inclou les set peticions requerides amb les respostes desades com a Examples. Executa-les en ordre: el POST inicial desa automàticament l'ID a `taskId`.

També pots executar les proves d'integració amb MongoDB en marxa:

```bash
npm test
```

Les proves fan servir una base temporal amb un nom únic i l'eliminen en acabar.
