const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'theblackbookproject - SUBMISSIONS - Submissions.csv');
const outputFile = path.join(__dirname, 'data_ready.csv');

// Mapping of Google Sheet headers to Supabase column names
const headerMap = {
    'Timestamp': 'created_at',
    'Submission ID': 'submission_ref',
    'Status': 'status',
    'First Name': 'fname',
    'Last Name': 'lname',
    'Display Name': 'display_name',
    'City': 'city',
    'State': 'state',
    'Available to Work In': 'work_location',
    'Email': 'email',
    'Phone': 'phone',
    'Website': 'website',
    'Primary Profession': 'primary_profession',
    'Other Profession (if specified)': 'other_profession',
    'Has Secondary Roles': 'has_secondary',
    'Secondary Roles': 'secondary_roles',
    'Specialisation / Genres': 'genres',
    'Specialisation (Free Text)': 'genre_generic',
    'Years of Experience': 'experience_years',
    'Career Stage': 'career_stage',
    'Education': 'education',
    'Institution': 'institution',
    'Awards & Recognitions': 'awards',
    'Published Work': 'has_publication',
    'Publications Listed': 'publications',
    'Business Type': 'biz_type',
    'Studio / Company Name': 'studio_name',
    'Year Established': 'year_est',
    'Team Size': 'team_size',
    'Studio Website': 'studio_website',
    'Studio website': 'studio_website', // Added lowercase 'w' just in case
    'Typical Project Scale': 'project_scale',
    'Budget Range': 'budget_range',
    'Notable Clients': 'clients',
    'Industries Served': 'industries',
    'Instagram': 'instagram',
    'LinkedIn': 'linkedin',
    'YouTube': 'youtube',
    'Facebook': 'facebook',
    'Behance': 'behance',
    'Vimeo': 'vimeo',
    'Twitter / X': 'twitter',
    'Primary Platform': 'primary_platform',
    'Instagram Following': 'insta_following',
    'Professional Bio': 'bio',
    'Working Style': 'working_style',
    'Languages of Work': 'languages',
    'Open To': 'open_to',
    'Profile Photo URL': 'photo_base64',
    'Referral Source': 'referral_source',
    'Consent Given': 'consent_given',
    'Open to Features': 'open_to_features'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

try {
    if (!fs.existsSync(inputFile)) {
        console.error('❌ Error: Input file not found!');
        process.exit(1);
    }

    const content = fs.readFileSync(inputFile, 'utf-8');
    
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) {
        throw new Error('CSV file is empty.');
    }

    let headers = lines[0];
    for (const [sheetHeader, dbColumn] of Object.entries(headerMap)) {
        const escapedHeader = escapeRegExp(sheetHeader);
        const regex = new RegExp(`"${escapedHeader}"|${escapedHeader}(?=,|$)`, 'gi'); // Added 'i' flag for case insensitivity
        headers = headers.replace(regex, (match) => {
            return match.startsWith('"') ? `"${dbColumn}"` : dbColumn;
        });
    }

    lines[0] = headers;
    
    fs.writeFileSync(outputFile, lines.join('\n'), 'utf-8');
    console.log('✅ Success! Created data_ready.csv with corrected headers.');
} catch (error) {
    console.error('❌ An error occurred:', error.message);
}
