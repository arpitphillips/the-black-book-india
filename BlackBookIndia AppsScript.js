// ═══════════════════════════════════════════════════════════════════
//  THE BLACK BOOK INDIA — Google Apps Script Backend
//  Paste this entire file into your Apps Script editor.
//  File → Save → Deploy → New Deployment → Web App
// ═══════════════════════════════════════════════════════════════════

// ── CONFIGURATION ─────────────────────────────────────────────────
// After creating your Google Sheet, paste its ID here.
// The Sheet ID is the long string in the URL:
// https://docs.google.com/spreadsheets/d/ >>>THIS PART<<< /edit
var SHEET_ID = '1mi4Wma1GRJ3FeGKeJlBFLDUESNjJUXWMiTGG8dTvZTM';

// The exact name of the tab/sheet where submissions go.
var SHEET_TAB_NAME = 'Submissions';

// Email to receive a notification on every new submission.
var NOTIFY_EMAIL = 'creativeblackbook@gmail.com';

// Set to true to send email notifications on every submission.
var SEND_EMAIL_NOTIFICATIONS = true;

// ── COLUMN HEADERS ────────────────────────────────────────────────
// These are written to Row 1 automatically when you run setup().
// The order here matches exactly the order data is written per row.
var HEADERS = [
  'Timestamp',
  'Submission ID',
  'Status',                    // For your review workflow: Pending / Approved / Rejected

  // Section 1 — Identity
  'First Name',
  'Last Name',
  'Display Name',
  'City',
  'State',
  'Available to Work In',
  'Email',
  'Phone',
  'Website',

  // Section 2 — Profession
  'Primary Profession',
  'Other Profession (if specified)',
  'Has Secondary Roles',
  'Secondary Roles',

  // Section 3 — Specialisation
  'Specialisation / Genres',
  'Specialisation (Free Text)',

  // Section 4 — Experience
  'Years of Experience',
  'Career Stage',
  'Education',
  'Institution',
  'Awards & Recognitions',
  'Published Work',
  'Publications Listed',

  // Section 5 — Business
  'Business Type',
  'Studio / Company Name',
  'Year Established',
  'Team Size',
  'Studio Website',
  'Typical Project Scale',
  'Budget Range',
  'Notable Clients',
  'Industries Served',

  // Section 6 — Social
  'Instagram',
  'LinkedIn',
  'YouTube',
  'Facebook',
  'Behance',
  'Vimeo',
  'Twitter / X',
  'Primary Platform',
  'Instagram Following',

  // Section 7 — Bio & Preferences
  'Professional Bio',
  'Working Style',
  'Languages of Work',
  'Open To',
  'Profile Photo URL',
  'Referral Source',
  'Consent Given',
  'Open to Features'
];

// ── doPost: Receives data from the HTML form ──────────────────────
function doPost(e) {
  try {
    // Parse the incoming JSON payload
    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_TAB_NAME);

    // Auto-setup headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    }

    // Generate a unique Submission ID
    var submissionId = 'BB-' + new Date().getFullYear() + '-' + String(sheet.getLastRow()).padStart(5, '0');

    // Build the row in the same order as HEADERS
    var row = [
      new Date(),                                          // Timestamp
      submissionId,                                        // Submission ID
      'Pending Review',                                    // Status

      // Section 1
      clean(data.fname),
      clean(data.lname),
      clean(data.displayName),
      clean(data.city),
      clean(data.state),
      clean(data.workLocation),
      clean(data.email),
      clean(data.phone),
      clean(data.website),

      // Section 2
      clean(data.primaryProfession),
      clean(data.otherProfession),
      clean(data.hasSecondary),
      clean(data.secondaryRoles),

      // Section 3
      clean(data.genres),
      clean(data.genreGeneric),

      // Section 4
      clean(data.yearsExperience),
      clean(data.careerStage),
      clean(data.education),
      clean(data.institution),
      clean(data.awards),
      clean(data.hasPublication),
      clean(data.publications),

      // Section 5
      clean(data.bizType),
      clean(data.studioName),
      clean(data.yearEst),
      clean(data.teamSize),
      clean(data.studioWebsite),
      clean(data.projectScale),
      clean(data.budgetRange),
      clean(data.clients),
      clean(data.industries),

      // Section 6
      clean(data.instagram),
      clean(data.linkedin),
      clean(data.youtube),
      clean(data.facebook),
      clean(data.behance),
      clean(data.vimeo),
      clean(data.twitter),
      clean(data.primaryPlatform),
      clean(data.instaFollowing),

      // Section 7
      clean(data.bio),
      clean(data.workingStyle),
      clean(data.languages),
      clean(data.openTo),
      clean(data.photoUrl),
      clean(data.referralSource),
      clean(data.consentGiven),
      clean(data.openToFeatures)
    ];

    sheet.appendRow(row);

    // Auto-format the new row
    var newRowIndex = sheet.getLastRow();
    formatNewRow(sheet, newRowIndex);

    // Send email notification
    if (SEND_EMAIL_NOTIFICATIONS) {
      sendNotificationEmail(data, submissionId);
    }

    // Return success to the form
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', id: submissionId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log the error and return it
    Logger.log('ERROR: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── doGet: Health check (visit the URL in a browser to test) ──────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Black Book India backend is live.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HELPER: Clean undefined / null values ─────────────────────────
function clean(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val).trim();
}

// ── HELPER: Format header row ─────────────────────────────────────
function formatHeaderRow(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#111111');
  headerRange.setFontColor('#B8962E');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setFontFamily('Arial');
  sheet.setFrozenRows(1);

  // Set column widths for key columns
  sheet.setColumnWidth(1, 160);   // Timestamp
  sheet.setColumnWidth(2, 100);   // Submission ID
  sheet.setColumnWidth(3, 110);   // Status
  sheet.setColumnWidth(4, 120);   // First Name
  sheet.setColumnWidth(5, 120);   // Last Name
  sheet.setColumnWidth(6, 150);   // Display Name
  sheet.setColumnWidth(9, 180);   // Available to work
  sheet.setColumnWidth(10, 200);  // Email
  sheet.setColumnWidth(13, 180);  // Primary Profession
  sheet.setColumnWidth(16, 200);  // Genres
  sheet.setColumnWidth(40, 400);  // Bio
}

// ── HELPER: Format each new data row ──────────────────────────────
function formatNewRow(sheet, rowIndex) {
  var range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);
  range.setFontSize(10);
  range.setFontFamily('Arial');
  range.setVerticalAlignment('top');
  range.setWrap(true);

  // Alternate row shading for readability
  if (rowIndex % 2 === 0) {
    range.setBackground('#F7F5F0');
  } else {
    range.setBackground('#FFFFFF');
  }

  // Colour the Status cell
  var statusCell = sheet.getRange(rowIndex, 3);
  statusCell.setBackground('#FFF3CD');
  statusCell.setFontColor('#856404');
  statusCell.setFontWeight('bold');

  // Set row height
  sheet.setRowHeight(rowIndex, 60);
}

// ── HELPER: Email notification ─────────────────────────────────────
function sendNotificationEmail(data, submissionId) {
  var name = clean(data.fname) + ' ' + clean(data.lname);
  var profession = clean(data.primaryProfession);
  var city = clean(data.city);
  var email = clean(data.email);

  var subject = '✦ New Black Book Submission: ' + name + ' (' + profession + ', ' + city + ')';

  var body = 'A new creative professional has registered with The Black Book India.\n\n'
    + '─────────────────────────────────\n'
    + 'SUBMISSION ID: ' + submissionId + '\n'
    + 'NAME: ' + name + '\n'
    + 'PROFESSION: ' + profession + '\n'
    + 'CITY: ' + city + '\n'
    + 'EMAIL: ' + email + '\n'
    + 'GENRES: ' + clean(data.genres) + '\n'
    + 'CAREER STAGE: ' + clean(data.careerStage) + '\n'
    + 'BUSINESS TYPE: ' + clean(data.bizType) + '\n'
    + '─────────────────────────────────\n\n'
    + 'Log in to review this submission:\n'
    + 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit\n\n'
    + 'The Black Book India — Admin';

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

// ── SETUP FUNCTION: Run this ONCE manually from the editor ─────────
// Extensions → Apps Script → select setupSheet → Run
function setupSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Create Submissions tab if it doesn't exist
  var sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB_NAME);
    Logger.log('Created sheet: ' + SHEET_TAB_NAME);
  }

  // Write headers
  sheet.clearContents();
  sheet.appendRow(HEADERS);
  formatHeaderRow(sheet);

  // Create a Review Dashboard tab
  var dashboard = ss.getSheetByName('Review Dashboard');
  if (!dashboard) {
    dashboard = ss.insertSheet('Review Dashboard');
  }
  dashboard.clearContents();
  dashboard.getRange('A1').setValue('THE BLACK BOOK INDIA — REVIEW DASHBOARD');
  dashboard.getRange('A1').setFontSize(16).setFontWeight('bold');
  dashboard.getRange('A3').setValue('Instructions:');
  dashboard.getRange('A3').setFontWeight('bold');
  dashboard.getRange('A4').setValue('1. Go to the Submissions tab to see all incoming registrations.');
  dashboard.getRange('A5').setValue('2. Change the Status column (Column C) to: Approved / Rejected / Pending Review.');
  dashboard.getRange('A6').setValue('3. You will receive an email at ' + NOTIFY_EMAIL + ' for every new submission.');
  dashboard.getRange('A7').setValue('4. Approved profiles can be exported for the public directory.');
  dashboard.getRange('A8').setValue('');
  dashboard.getRange('A9').setValue('Status colour guide:');
  dashboard.getRange('A9').setFontWeight('bold');
  dashboard.getRange('A10').setValue('🟡 Pending Review — New submission, not yet checked');
  dashboard.getRange('A11').setValue('🟢 Approved — Profile cleared for publication');
  dashboard.getRange('A12').setValue('🔴 Rejected — Does not meet quality / completeness standard');
  dashboard.getRange('A13').setValue('🔵 Follow-up — More information needed from the applicant');

  // Create a Stats tab
  var stats = ss.getSheetByName('Stats');
  if (!stats) {
    stats = ss.insertSheet('Stats');
  }
  stats.clearContents();
  stats.getRange('A1').setValue('THE BLACK BOOK INDIA — LIVE STATS');
  stats.getRange('A1').setFontSize(14).setFontWeight('bold');
  stats.getRange('A3').setValue('Total Submissions');
  stats.getRange('B3').setFormula('=COUNTA(Submissions!A:A)-1');
  stats.getRange('A4').setValue('Pending Review');
  stats.getRange('B4').setFormula('=COUNTIF(Submissions!C:C,"Pending Review")');
  stats.getRange('A5').setValue('Approved');
  stats.getRange('B5').setFormula('=COUNTIF(Submissions!C:C,"Approved")');
  stats.getRange('A6').setValue('Rejected');
  stats.getRange('B6').setFormula('=COUNTIF(Submissions!C:C,"Rejected")');
  stats.getRange('A7').setValue('');
  stats.getRange('A8').setValue('--- PROFESSION BREAKDOWN ---');
  stats.getRange('A8').setFontWeight('bold');

  // Profession breakdown formulas
  var professions = [
    'photographer','filmmaker','cinematographer','camera-operator',
    'makeup-artist','hair-stylist','costume-stylist','art-director',
    'creative-director','graphic-designer','motion-designer','actor',
    'voice-artist','director','writer-script','copywriter','lyricist',
    'singer','composer','sound-designer','editor-video','editor-photo',
    'set-designer','producer','pr-content','stage-performer',
    'dancer-choreographer','illustrator'
  ];
  professions.forEach(function(p, i) {
    stats.getRange('A' + (9 + i)).setValue(p);
    stats.getRange('B' + (9 + i)).setFormula('=COUNTIF(Submissions!M:M,"' + p + '")');
  });

  Logger.log('✅ Black Book India Sheet setup complete!');
  Logger.log('Setup complete! Your Black Book India sheet is ready. Next step: Deploy this script as a Web App and paste the URL into your HTML form.');
}

// ── STATUS COLOUR UPDATER: Run via a trigger or manually ──────────
// This keeps Status cell colours in sync when you change them manually.
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== SHEET_TAB_NAME) return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (col !== 3 || row < 2) return; // Only watch column C (Status)

  var val = e.range.getValue();
  var cell = e.range;

  if (val === 'Approved') {
    cell.setBackground('#D4EDDA').setFontColor('#155724');
  } else if (val === 'Rejected') {
    cell.setBackground('#F8D7DA').setFontColor('#721C24');
  } else if (val === 'Pending Review') {
    cell.setBackground('#FFF3CD').setFontColor('#856404');
  } else if (val === 'Follow-up') {
    cell.setBackground('#CCE5FF').setFontColor('#004085');
  }
}
