/**
 * GOOGLE APPS SCRIPT — INFO + RDC Backend administré
 * À coller dans l'éditeur Apps Script lié à votre Google Sheet.
 */

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getPublications") {
    return ContentService
      .createTextOutput(JSON.stringify(getActivePublications()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("INFO + RDC GAS Engine Online.");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    submitPublication(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getActivePublications() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PUBLICATIONS");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var today = new Date();
  var results = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var item = {};
    
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }

    // Gestion Expiration Automatique (DATE_FIN)
    if (item.DATE_FIN && new Date(item.DATE_FIN) < today) {
      sheet.getRange(i + 1, headers.indexOf("STATUT") + 1).setValue("expire");
      continue;
    }

    // Filtrer pour n'afficher que le statut "actif"
    if (item.STATUT === "actif") {
      results.push(item);
    }
  }

  return results;
}

function submitPublication(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PUBLICATIONS");
  var id = "PUB-" + Utilities.getUuid().substring(0, 8);
  var now = new Date();

  sheet.appendRow([
    id,
    data.type || "annonce",
    data.categorie || "General",
    data.titre,
    data.texte,
    data.lien,
    now,
    data.date_debut || now,
    data.date_fin || "",
    data.ville || "Kinshasa",
    data.lieu || "",
    data.email || "",
    data.statut || "attente",
    "NON"
  ]);
}
