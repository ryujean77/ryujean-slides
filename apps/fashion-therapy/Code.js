/**
 * Google Apps Script Server Code
 * 임동구 박사 사상체질 강연제안서 Web App & 리드 수집 시스템
 */

var SPREADSHEET_NAME = "도서관강연제안서_다운로드_신청자명단";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('임동구 박사 사상체질 융복합 라이프케어 강연제안서')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }
    var res = recordLead(data);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function recordLead(leadData) {
  try {
    var sheet = getOrCreateLeadSheet();
    var timestamp = new Date();
    var name = leadData.name || '';
    var email = leadData.email || '';
    var org = leadData.org || '';
    var phone = leadData.phone || '';
    var projectType = leadData.projectType || '도서관강연제안서';
    var userAgent = leadData.userAgent || '';

    sheet.appendRow([
      timestamp,
      name,
      email,
      org,
      phone,
      projectType,
      '다운로드 승인 및 완료',
      userAgent
    ]);

    return {
      status: 'success',
      message: '구글 시트(신청자명단)에 정상적으로 저장되었습니다.',
      downloadFile: 'presentation.pptx'
    };
  } catch (err) {
    return {
      status: 'error',
      message: '저장 실패: ' + err.toString()
    };
  }
}

function getOrCreateLeadSheet() {
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    var defaultSheet = ss.getActiveSheet();
    defaultSheet.setName('신청자명단');
    defaultSheet.appendRow([
      '신청일시 (Timestamp)',
      '이름 (성함)',
      '이메일 주소',
      '소속 기관 / 도서관명',
      '연락처',
      '제안서 구분',
      '처리상태',
      '접속환경'
    ]);
    
    // Header styling
    var headerRange = defaultRange = defaultSheet.getRange(1, 1, 1, 8);
    defaultSheet.getRange(1, 1, 1, 8).setBackground('#c2410c');
    defaultSheet.getRange(1, 1, 1, 8).setFontColor('#ffffff');
    defaultSheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    defaultSheet.getRange(1, 1, 1, 8).setHorizontalAlignment('center');
    defaultSheet.setFrozenRows(1);
    
    // Auto resize
    for (var col = 1; col <= 8; col++) {
      defaultSheet.setColumnWidth(col, col === 1 ? 160 : (col === 3 ? 220 : 140));
    }
  }
  return ss.getSheetByName('신청자명단') || ss.getActiveSheet();
}
