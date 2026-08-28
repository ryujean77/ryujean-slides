/**
 * ==============================================================================
 * 사상체질 프리미엄 스파 제안서 다운로드 리드 수집 백엔드 (Google Apps Script)
 * ==============================================================================
 * 
 * [1분 설정 및 배포 가이드]
 * 1. Google Sheets(https://sheets.new)에서 새 스프레드시트를 만듭니다.
 *    (시트 제목 예시: "사상체질_스파_제안서_다운로드_고객리드_2026")
 * 2. 상단 메뉴: [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 파일의 코드 전체를 복사하여 붙여넣습니다.
 * 4. 우측 상단 [배포] > [새 배포] 클릭
 *    - 유형 선택: "웹 앱 (Web App)"
 *    - 설명: "Sasang SPA Lead Collector Webhook"
 *    - 다음 사용자로 실행: "나(내 계정)"
 *    - 액세스 권한: "모든 사용자(Anyone)"  <-- 반드시 선택!
 * 5. [배포] 버튼 클릭 후 생성된 [웹 앱 URL (https://script.google.com/macros/s/.../exec)]을 복사합니다.
 * 6. 웹 포털 HTML의 GAS_WEBHOOK_URL 변수에 붙여넣으면 즉시 전 세계 실시간 자동 취합이 시작됩니다!
 */

function doPost(e) {
  try {
    var sheet = getOrCreateLeadSheet();
    var data = {};

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var name = data.name || "미입력";
    var phone = data.phone || "미입력";
    var email = data.email || "미입력";
    var company = data.company || data.organization || "개인";
    var fileName = data.file || data.fileName || "spa_proposal_chejil.pdf";
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
      message: "Lead recorded in Google Sheet.",
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
    service: "Sasang SPA Lead Collector API",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateLeadSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "체질스파_신청자_명단";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
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
    headerRange.setBackground("#0d1c15");
    headerRange.setFontColor("#d4af37");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}