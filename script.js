// ── CONFIGURATION ─────────────────────────────────────────────────
// REPLACE THIS URL with your actual Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzu5qkb7auI5GmhA_SpHV4BC8UJzCNW-tblios3iWnMXlB7gRF-dlSvFRc7WKdH-z34uA/exec';

// SUPABASE CONFIGURATION
// Replace SUPABASE_ANON_KEY with your actual anon/public key from:
// https://supabase.com/dashboard/project/puwwduyqqhkttswgdhpa/settings/api
// The key must be a long JWT starting with "eyJ..."
const SUPABASE_URL = 'https://puwwduyqqhkttswgdhpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1d3dkdXlxcWhrdHRzd2dkaHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTYyODYsImV4cCI6MjA5OTU5MjI4Nn0.9QcwK9b6TscZUC7ZR1ZO85QSG5wgv3slWVFO0uh5vB0';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ──────────────────────────────────────────────────────────────────

// Anti-spam: record when the page loaded
const PAGE_LOAD_TIME = Date.now();

let currentStep = 1;
let previousStep = 1;
const totalSteps = 5;
const DRAFT_KEY = 'blackbook_draft';

const specializations = {
    photographer: [
        "Wedding Photographer", "Portrait & Family Photographer", "Lifestyle Photographer", 
        "Product & E-commerce Photographer", "Food Photographer", "Fashion Photographer", 
        "Real Estate & Architectural Photographer", "Wildlife Photographer", "Landscape Photographer", 
        "Travel Photographer", "Aerial/Drone Photographer", "Street Photographer", 
        "Documentary/Photojournalist", "Fine Art Photographer", "Event Photographer"
    ],
    musician: [
        "Musician/Instrumentalist", "Singer/Vocalist", "Composer/Songwriter", 
        "Music Director/Conductor", "Music Teacher/Educator", "Music Producer", 
        "Audio/Sound Engineer", "Vocal Producer", "Playback Engineer", 
        "Instrument Tech/Backline Tech", "Artist Manager", "A&R (Artist and Repertoire) Representative", 
        "Booking Agent/Talent Buyer", "Tour Manager", "Music Publisher/Administrator", 
        "Music Journalist/Critic", "Marketing/Public Relations (PR) Specialist", "Rights Clearance Professional"
    ]
};

function populateGenres(profession) {
    const genresSelect = document.getElementById('genres');
    const genresGroup = document.getElementById('genresGroup');
    if (!genresSelect || !genresGroup) return;
    
    genresSelect.innerHTML = '<option value="" disabled selected>Select your specialization...</option>';
    
    if (specializations[profession]) {
        genresGroup.classList.remove('hidden');
        specializations[profession].forEach(spec => {
            const opt = document.createElement('option');
            opt.value = spec;
            opt.textContent = spec;
            genresSelect.appendChild(opt);
        });
    } else {
        genresGroup.classList.add('hidden');
    }
}

function updateSecondaryRoles(primaryVal) {
    const secondarySelect = document.getElementById('secondaryRoles');
    if (!secondarySelect) return;
    
    const currentVal = secondarySelect.value;
    
    // Define all options
    const allOptions = [
        { value: 'photographer', text: 'Photographer' },
        { value: 'musician', text: 'Musician' },
        { value: 'other', text: 'Other' }
    ];
    
    // Clear current options
    secondarySelect.innerHTML = '<option value="" disabled selected>Select your secondary role...</option>';
    
    // Add non-matching options
    allOptions.forEach(opt => {
        if (opt.value !== primaryVal) {
            const el = document.createElement('option');
            el.value = opt.value;
            el.textContent = opt.text;
            secondarySelect.appendChild(el);
        }
    });
    
    // Restore previous value if it's still valid
    if (currentVal && currentVal !== primaryVal) {
        secondarySelect.value = currentVal;
    }
}

function updateConditionalStep() {
    const photoGroup = document.getElementById('photographer-questions');
    const musicGroup = document.getElementById('musician-questions');
    if (!photoGroup || !musicGroup) return;

    const primaryVal = document.getElementById('primaryProfession').value;
    const hasSecondary = document.querySelector('input[name="hasSecondary"]:checked')?.value === 'Yes';
    const secondaryVal = hasSecondary ? document.getElementById('secondaryRoles').value : null;

    const isPhotographer = primaryVal === 'photographer' || secondaryVal === 'photographer';
    const isMusician = primaryVal === 'musician' || secondaryVal === 'musician';

    if (isPhotographer) {
        photoGroup.classList.remove('hidden');
    } else {
        photoGroup.classList.add('hidden');
    }

    if (isMusician) {
        musicGroup.classList.remove('hidden');
    } else {
        musicGroup.classList.add('hidden');
    }
}

// ── Dynamic Link Builder ──────────────────────────────────────────
const addedLinks = {}; // Store added links as { platform: url }

function renderAddedLinks() {
    const container = document.getElementById('addedLinksContainer');
    const hiddenContainer = document.getElementById('hiddenLinksContainer');
    if (!container || !hiddenContainer) return;

    container.innerHTML = '';
    hiddenContainer.innerHTML = '';

    Object.entries(addedLinks).forEach(([platform, url]) => {
        // Render Badge
        const badge = document.createElement('div');
        badge.className = 'link-badge';
        // Capitalize platform name slightly for display
        let platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        if (platform === 'appleMusic') platformName = 'Apple Music';
        if (platform === 'studioWebsite') platformName = 'Studio Website';
        
        badge.innerHTML = `
            <span><strong>${platformName}</strong>: ${url}</span>
            <button type="button" class="remove-link-btn" data-platform="${platform}">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        container.appendChild(badge);

        // Render Hidden Input
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = platform;
        hiddenInput.value = url;
        hiddenContainer.appendChild(hiddenInput);
    });

    // Add remove listeners
    document.querySelectorAll('.remove-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plat = e.currentTarget.getAttribute('data-platform');
            delete addedLinks[plat];
            renderAddedLinks();
            saveDraft();
        });
    });
}

function initLinkBuilder() {
    const addBtn = document.getElementById('addLinkBtn');
    if (!addBtn) return;
    
    addBtn.addEventListener('click', () => {
        const platformSelect = document.getElementById('linkPlatform');
        const urlInput = document.getElementById('linkUrl');
        
        const platform = platformSelect.value;
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL first.');
            return;
        }

        // Add to our dictionary
        addedLinks[platform] = url;
        
        // Reset inputs
        urlInput.value = '';
        platformSelect.selectedIndex = 0; // Reset to first option

        // Re-render
        renderAddedLinks();
        saveDraft();
    });
}

// DOM Elements
const form = document.getElementById('submission-form');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const progressWrapper = document.querySelector('.progress-wrapper');
const statusMessage = document.getElementById('status-message');
const stepIndicators = document.querySelectorAll('.step-indicator');

// ── Draft Save / Restore (localStorage) ──────────────────────────
// Saves form progress so users don't lose data if they close the tab.

function saveDraft() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    // Don't save file inputs — they can't be restored
    delete data.profilePhoto;
    data._step = currentStep;
    // Save checkbox states explicitly (FormData skips unchecked)
    data._openToFeatures = document.getElementById('openToFeatures').checked;
    data._consentGiven = document.getElementById('consentGiven').checked;
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
        // localStorage full or unavailable — silently ignore
    }
}

function restoreDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);

        if (data.primaryProfession) {
            populateGenres(data.primaryProfession);
            updateSecondaryRoles(data.primaryProfession);
            updateConditionalStep();
        }

        // Restore dynamic links
        const possiblePlatforms = ['website', 'studioWebsite', 'instagram', 'linkedin', 'behance', 'vimeo', 'youtube', 'facebook', 'twitter', 'spotify', 'soundcloud', 'appleMusic'];
        possiblePlatforms.forEach(plat => {
            if (data[plat]) {
                addedLinks[plat] = data[plat];
            }
        });
        renderAddedLinks();

        // Restore text/select fields
        Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('_')) return;
            const el = form.elements[key];
            if (!el) return;
            if (el.type === 'radio') {
                const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else if (el.type !== 'file' && el.type !== 'checkbox') {
                el.value = value;
            }
        });

        // Restore checkbox states
        if (data._openToFeatures !== undefined) {
            document.getElementById('openToFeatures').checked = data._openToFeatures;
        }
        if (data._consentGiven !== undefined) {
            document.getElementById('consentGiven').checked = data._consentGiven;
        }

        // Call updateConditionalStep again just in case secondary roles changed visibility
        updateConditionalStep();

        // Restore conditional field visibility
        if (data.hasSecondary === 'Yes') toggleSecondaryRoles(true);
        if (data.hasPublication === 'Yes') togglePublications(true);
        if (data.primaryProfession === 'other') {
            document.getElementById('otherProfessionGroup').classList.remove('hidden');
        }

        // Restore step position
        if (data._step && data._step >= 1 && data._step <= totalSteps) {
            currentStep = data._step;
            previousStep = data._step;
        }
    } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
    }
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
}

// ── Toggle Conditional Fields ────────────────────────────────────
function toggleSecondaryRoles(show) {
    const group = document.getElementById('secondaryRolesGroup');
    if (show) {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
        document.getElementById('secondaryRoles').value = '';
    }
    updateConditionalStep();
}

function togglePublications(show) {
    const group = document.getElementById('publicationsGroup');
    if (show) {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
        document.getElementById('publications').value = '';
    }
}

// Watch Primary Profession for "Other" and dynamic genres
document.getElementById('primaryProfession').addEventListener('change', function (e) {
    const val = e.target.value;
    const group = document.getElementById('otherProfessionGroup');
    
    if (val === 'other') {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
        document.getElementById('otherProfession').value = '';
    }

    populateGenres(val);
    updateSecondaryRoles(val);
    updateConditionalStep();
});

document.getElementById('secondaryRoles').addEventListener('change', function () {
    updateConditionalStep();
});

// ── Photo Upload Handling ─────────────────────────────────────────
const photoUploadZone = document.getElementById('photoUploadZone');
const photoInput = document.getElementById('profilePhoto');
const photoPlaceholder = document.getElementById('photoPlaceholder');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewImg = document.getElementById('photoPreviewImg');
const photoRemoveBtn = document.getElementById('photoRemoveBtn');

let profilePhotoBase64 = null;
let profilePhotoName = null;
let profilePhotoType = null;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTO_DIMENSION = 1920; // Resize to max 1920px on longest side

const PLACEHOLDER_HTML = '<i class="fa-solid fa-cloud-arrow-up"></i>'
    + '<p>Drag & drop your photo here</p>'
    + '<span class="help-text">or click to browse · JPG, PNG, WebP · Max 5 MB</span>';

/**
 * Resize an image client-side using canvas to reduce upload payload.
 * Always outputs JPEG at 85% quality. Returns a data URL.
 */
function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;

            // Downscale if larger than max dimension
            if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
                if (width > height) {
                    height = Math.round((height / width) * MAX_PHOTO_DIMENSION);
                    width = MAX_PHOTO_DIMENSION;
                } else {
                    width = Math.round((width / height) * MAX_PHOTO_DIMENSION);
                    height = MAX_PHOTO_DIMENSION;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image.'));
        };

        img.src = objectUrl;
    });
}

async function handlePhotoFile(file) {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showFieldError(photoUploadZone, 'Please upload a JPG, PNG, or WebP image.');
        return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
        showFieldError(photoUploadZone, 'Photo must be under 5 MB.');
        return;
    }

    // Show processing state
    photoPlaceholder.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><p>Processing photo…</p>';

    try {
        const dataUrl = await resizeImage(file);
        profilePhotoBase64 = dataUrl.split(',')[1];
        profilePhotoName = file.name;
        profilePhotoType = 'image/jpeg'; // Always JPEG after canvas conversion

        photoPreviewImg.src = dataUrl;
        photoPlaceholder.innerHTML = PLACEHOLDER_HTML;
        photoPlaceholder.classList.add('hidden');
        photoPreview.classList.remove('hidden');
        clearFieldError(photoUploadZone);
    } catch (err) {
        photoPlaceholder.innerHTML = PLACEHOLDER_HTML;
        showFieldError(photoUploadZone, 'Failed to process image. Please try another file.');
    }
}

function removePhoto() {
    profilePhotoBase64 = null;
    profilePhotoName = null;
    profilePhotoType = null;
    photoInput.value = '';
    photoPreviewImg.src = '';
    photoPreview.classList.add('hidden');
    photoPlaceholder.classList.remove('hidden');
}

// Click to upload
photoInput.addEventListener('change', (e) => {
    handlePhotoFile(e.target.files[0]);
});

// Remove button
photoRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removePhoto();
});

// Drag and drop
photoUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploadZone.classList.add('drag-over');
});

photoUploadZone.addEventListener('dragleave', () => {
    photoUploadZone.classList.remove('drag-over');
});

photoUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploadZone.classList.remove('drag-over');
    handlePhotoFile(e.dataTransfer.files[0]);
});

// ── Field-level Error Messages ────────────────────────────────────

function showFieldError(input, message) {
    clearFieldError(input);
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    const parent = input.closest('.form-group') || input.parentElement;
    parent.appendChild(errorEl);
}

function clearFieldError(input) {
    const parent = input.closest('.form-group') || input.parentElement;
    const existing = parent.querySelector('.field-error');
    if (existing) existing.remove();
}

function getValidationMessage(input) {
    let val = input.value.trim();

    if (input.type === 'checkbox' && input.required && !input.checked) {
        return 'You must accept to continue.';
    }

    if (input.required) {
        // Treat "+91" or "+" with no actual number as empty
        const cleanVal = val.replace(/[\s\+]/g, '');
        if (!val || (input.type === 'tel' && (cleanVal === '91' || cleanVal === ''))) {
            return 'This field is required.';
        }
    }

    // Only validate format if the field actually has a value (and isn't just the default prefix)
    const cleanVal = val.replace(/[\s\+]/g, '');
    if (val && !(input.type === 'tel' && (cleanVal === '91' || cleanVal === ''))) {
        if (input.type === 'email' && !input.validity.valid) {
            return 'Please enter a valid email address.';
        }
        if (input.type === 'tel') {
            const digitsOnly = val.replace(/\D/g, '');
            const noSpaceVal = val.replace(/\s/g, '');

            if (noSpaceVal.startsWith('+91')) {
                if (digitsOnly.length !== 12) { // 91 + 10 digits
                    return 'Indian phone numbers must be exactly 10 digits after +91.';
                }
            } else {
                if (!val.startsWith('+')) {
                    return 'Please include a country code starting with "+" (e.g. +91, +1).';
                }
                if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                    return 'Please enter a valid phone number (7–15 digits) with country code.';
                }
            }
        }
        if (input.type === 'url' && !input.validity.valid) {
            return 'Please enter a valid URL (e.g. https://example.com).';
        }
    }

    return '';
}

// ── Update UI ─────────────────────────────────────────────────────

function updateUI() {
    // Direction-aware animation class
    const direction = currentStep > previousStep ? 'slide-in-right' : 'slide-in-left';

    // Hide all steps, show current with animation
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active', 'slide-in-right', 'slide-in-left');
    });
    const activeStep = document.getElementById(`step-${currentStep}`);
    activeStep.classList.add('active', direction);

    previousStep = currentStep;

    // Update Progress Bar
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Update Step Indicators
    stepIndicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            indicator.classList.add('active');
        } else if (index + 1 < currentStep) {
            indicator.classList.add('completed');
        }
    });

    // Toggle Buttons
    prevBtn.classList.toggle('hidden', currentStep === 1);

    if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }

    // Scroll to top of form smoothly
    document.querySelector('.app-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Validate Current Step ─────────────────────────────────────────

function validateStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    let isValid = true;
    let firstInvalid = null;

    // Clear previous error messages on this step
    currentStepEl.querySelectorAll('.field-error').forEach(el => el.remove());

    inputs.forEach(input => {
        const message = getValidationMessage(input);
        if (message) {
            isValid = false;
            input.classList.add('touched');
            showFieldError(input, message);
            if (!firstInvalid) firstInvalid = input;
        } else {
            input.classList.remove('touched');
            clearFieldError(input);
        }
    });

    if (firstInvalid) {
        firstInvalid.focus();
    }

    return isValid;
}

// Inline validation on blur (shows errors immediately when leaving a field)
form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => {
        const message = getValidationMessage(input);

        if (message) {
            input.classList.add('touched');
            showFieldError(input, message);
        } else {
            input.classList.remove('touched');
            clearFieldError(input);
        }
    });

    // Clear error immediately when user starts correcting
    input.addEventListener('input', () => {
        if (input.classList.contains('touched') && input.value.trim() && input.validity.valid) {
            input.classList.remove('touched');
            clearFieldError(input);
        }
    });
});

// ── Navigation ────────────────────────────────────────────────────

nextBtn.addEventListener('click', () => {
    if (validateStep()) {
        currentStep++;
        saveDraft();
        updateUI();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    saveDraft();
    updateUI();
});

// Prevent form submission on Enter (unless on last step)
form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (currentStep < totalSteps) {
            nextBtn.click();
        } else {
            submitBtn.click();
        }
    }
});

// ── Form Submission ───────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    // Prepare data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Remove the raw file field (we send base64 instead)
    delete data.profilePhoto;

    // Attach photo data if uploaded
    if (profilePhotoBase64) {
        data.photoBase64 = profilePhotoBase64;
        data.photoFileName = profilePhotoName;
        data.photoMimeType = profilePhotoType;
    }

    // Handle unchecked checkboxes (FormData skips them)
    if (!data.hasSecondary) data.hasSecondary = "No";
    if (!data.hasPublication) data.hasPublication = "No";
    if (!data.openToFeatures) data.openToFeatures = "No";
    if (!data.consentGiven) data.consentGiven = "No";

    // Sanitize conditional data based on primary AND secondary profession
    const isPhotographer = data.primaryProfession === 'photographer' || (data.hasSecondary === 'Yes' && data.secondaryRoles === 'photographer');
    const isMusician = data.primaryProfession === 'musician' || (data.hasSecondary === 'Yes' && data.secondaryRoles === 'musician');

    if (!isPhotographer) {
        delete data.equipment;
        delete data.hasStudio;
        delete data.hasPublication;
        delete data.publications;
        data.hasPublication = "No"; // reset default
    }

    if (!isMusician) {
        delete data.primaryInstrument;
        delete data.liveExperience;
        delete data.recordLabel;
    }

    // Anti-spam: include honeypot value and elapsed time
    data._honeypot = data.company || '';
    delete data.company;
    data._elapsedSeconds = Math.floor((Date.now() - PAGE_LOAD_TIME) / 1000);

    // UI Feedback
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';
    submitBtn.disabled = true;
    prevBtn.disabled = true;
    statusMessage.className = 'hidden';

    // Build the Supabase row payload (used regardless of Google Sheets outcome)
    const supabasePayload = {
        fname: data.fname,
        lname: data.lname,
        display_name: data.displayName,
        city: data.city,
        state: data.state,
        work_location: data.workLocation,
        phone: data.phone,
        email: data.email,
        primary_profession: data.primaryProfession,
        other_profession: data.otherProfession,
        has_secondary: data.hasSecondary,
        secondary_roles: data.secondaryRoles,
        genres: data.genres,
        genre_generic: data.genreGeneric,
        experience_years: data.yearsExperience,
        career_stage: data.careerStage,
        education: data.education,
        institution: data.institution,
        awards: data.awards,
        has_publication: data.hasPublication,
        publications: data.publications,
        biz_type: data.bizType,
        studio_name: data.studioName,
        year_est: data.yearEst,
        team_size: data.teamSize,
        project_scale: data.projectScale,
        budget_range: data.budgetRange,
        clients: data.clients,
        industries: data.industries,
        website: data.website,
        studio_website: data.studioWebsite,
        instagram: data.instagram,
        linkedin: data.linkedin,
        behance: data.behance,
        vimeo: data.vimeo,
        youtube: data.youtube,
        facebook: data.facebook,
        twitter: data.twitter,
        spotify: data.spotify,
        soundcloud: data.soundcloud,
        apple_music: data.appleMusic,
        equipment: data.equipment,
        has_studio: data.hasStudio,
        primary_instrument: data.primaryInstrument,
        live_experience: data.liveExperience,
        record_label: data.recordLabel,
        primary_platform: data.primaryPlatform,
        insta_following: data.instaFollowing,
        bio: data.bio,
        working_style: data.workingStyle,
        languages: data.languages,
        open_to: data.openTo,
        referral_source: data.referralSource,
        photo_base64: data.photoBase64 || null,
        open_to_features: data.openToFeatures,
        consent_given: data.consentGiven
    };

    try {
        // Run Google Sheets and Supabase submissions in parallel
        const [sheetsResult, supabaseResult] = await Promise.allSettled([
            // 1. Submit to Google Sheets via Apps Script
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            }).then(r => r.json()),

            // 2. Submit to Supabase directly (runs independently)
            supabaseClient
                .from('submissions')
                .insert([supabasePayload])
        ]);

        // Log outcomes for debugging
        if (sheetsResult.status === 'fulfilled') {
            const sheetsData = sheetsResult.value;
            if (sheetsData.result === 'success' && sheetsData.id) {
                // Backfill the submission_ref from Google Sheets if available
                supabasePayload.submission_ref = sheetsData.id;
                console.log('Google Sheets: submitted with ref', sheetsData.id);
            } else {
                console.warn('Google Sheets returned non-success:', sheetsData);
            }
        } else {
            console.error('Google Sheets submission failed:', sheetsResult.reason);
        }

        if (supabaseResult.status === 'fulfilled') {
            const { error: supabaseError } = supabaseResult.value;
            if (supabaseError) {
                console.error('Supabase Insert Error:', supabaseError);
            } else {
                console.log('Supabase: row inserted successfully.');
            }
        } else {
            console.error('Supabase submission failed:', supabaseResult.reason);
        }

        // Show success if at least one destination accepted the submission
        const sheetsOk = sheetsResult.status === 'fulfilled' && sheetsResult.value?.result === 'success';
        const supabaseOk = supabaseResult.status === 'fulfilled' && !supabaseResult.value?.error;

        if (sheetsOk || supabaseOk) {
            clearDraft();

            // Use the Google Sheets ref if available, otherwise a local timestamp
            const refId = sheetsResult.value?.id || `TBB-${Date.now()}`;
            document.getElementById('submission-ref-id').textContent = refId;

            form.classList.add('hidden');
            progressWrapper.classList.add('hidden');
            document.getElementById('success-screen').classList.remove('hidden');
        } else {
            throw new Error('Both submission destinations failed. Please try again.');
        }

    } catch (error) {
        console.error('Submission Error:', error);
        statusMessage.textContent = 'Error: ' + error.message;
        statusMessage.className = 'error';

        // Reset buttons
        submitBtn.innerHTML = 'Submit Profile';
        submitBtn.disabled = false;
        prevBtn.disabled = false;
    }
});

// ── Phone Number UX ───────────────────────────────────────────────
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', (e) => {
    let val = e.target.value;

    // Smart auto-prefix: If they type a single digit 6-9 (Indian mobile), prepend +91
    if (val.length === 1 && /[6-9]/.test(val)) {
        e.target.value = '+91 ' + val;
    }

    // If they type 0 as first digit, assume they meant an Indian number
    if (val === '0') {
        e.target.value = '+91 ';
    }
});

// ── Initialize ────────────────────────────────────────────────────
initLinkBuilder();
restoreDraft();
updateUI();
