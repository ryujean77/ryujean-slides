/**
 * ==============================================================================
 * 사상체질 프리미엄 스파 제안서 다운로드 리드 수집 백엔드 (Google Apps Script)
 * ==============================================================================
 */

var TARGET_SPREADSHEET_ID = "";

function doPost(e) {
  try {
    var sheet = getOrCreateLeadSheet();
    var data = {};

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var name = data.name || "미입력";
    var phone = data.phone || "미입력";
    var email = data.email || "미입력";
    var company = data.company || data.organization || "개인";
    var fileName = data.file || data.fileName || "사상체질_프리미엄_스파_프로젝트_기획제안서_풀버전.pdf";
    var sourceUrl = data.url || data.referer || "GitHub Pages";

    // 구글 시트에 실시간 새 행 추가
    sheet.appendRow([
      timestamp,
      name,
      phone,
      email,
      company,
      fileName,
      sourceUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded successfully in Google Sheet.",
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Sasang SPA Lead Collector API (Live)",
    sheetId: TARGET_SPREADSHEET_ID,
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateLeadSheet() {
  var ss;
  if (TARGET_SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  var sheetName = "체질스파_신청자_명단";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    var headers = [
      "신청일시 (KST)",
      "신청자 성함",
      "연락처 (휴대폰)",
      "이메일 주소",
      "회사 / 소속 기관",
      "다운로드 제안서 파일",
      "유입 웹 경로"
    ];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1c362b");
    headerRange.setFontColor("#c9a876");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
