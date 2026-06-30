// ── CONFIGURATION ─────────────────────────────────────────────────
// REPLACE THIS URL with your actual Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFXOBghj8GLiuIldrXa9tbYaIntjPvxNlIjFGd15-91QblBuj6W4mqqS5LC_mP6-bY/exec';
// ──────────────────────────────────────────────────────────────────

let currentStep = 1;
const totalSteps = 7;

// DOM Elements
const form = document.getElementById('submission-form');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const statusMessage = document.getElementById('status-message');
const stepIndicators = document.querySelectorAll('.step-indicator');

// Toggle Conditional Fields
function toggleSecondaryRoles(show) {
    const group = document.getElementById('secondaryRolesGroup');
    if (show) {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
        document.getElementById('secondaryRoles').value = '';
    }
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

// Watch Primary Profession for "Other"
document.getElementById('primaryProfession').addEventListener('change', function (e) {
    const group = document.getElementById('otherProfessionGroup');
    if (e.target.value === 'other') {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
        document.getElementById('otherProfession').value = '';
    }
});

// Update UI based on current step
function updateUI() {
    // Hide all steps, show current
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${currentStep}`).classList.add('active');

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
    if (currentStep === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

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

// Validate Current Step
function validateStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                isValid = false;
                input.classList.add('touched');
            } else {
                input.classList.remove('touched');
            }
        } else if (!input.value.trim()) {
            isValid = false;
            input.classList.add('touched');
        } else {
            input.classList.remove('touched');
        }
    });

    if (!isValid) {
        // Find the first invalid input and focus it
        const firstInvalid = currentStepEl.querySelector('input.touched, select.touched, textarea.touched');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }

    return isValid;
}

// Add touched class on blur for inline validation
form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('touched');
        } else {
            input.classList.remove('touched');
        }
    });
});

// Next Button Click
nextBtn.addEventListener('click', () => {
    if (validateStep()) {
        currentStep++;
        updateUI();
    }
});

// Previous Button Click
prevBtn.addEventListener('click', () => {
    currentStep--;
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

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    if (APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE') {
        alert("Configuration Error: Please replace APPS_SCRIPT_URL in script.js with your actual Google Apps Script Web App URL.");
        return;
    }

    // Prepare data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Handle unchecked checkboxes (FormData skips them)
    if (!data.hasSecondary) data.hasSecondary = "No";
    if (!data.hasPublication) data.hasPublication = "No";
    if (!data.openToFeatures) data.openToFeatures = "No";
    if (!data.consentGiven) data.consentGiven = "No";

    // UI Feedback
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    prevBtn.disabled = true;
    statusMessage.className = 'hidden';

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            // The following header might cause CORS preflight issues depending on how GAS is set up.
            // Text/plain is a common workaround for GAS CORS.
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });

        const result = await response.json();

        if (result.result === 'success') {
            // Hide form, show success screen
            document.getElementById('submission-form').classList.add('hidden');
            document.getElementById('submission-ref-id').textContent = result.id;
            document.getElementById('success-screen').classList.remove('hidden');
        } else {
            throw new Error(result.message || 'Unknown error occurred.');
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

// Initialize UI
updateUI();
