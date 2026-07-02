-- ============================================================
-- THE BLACK BOOK INDIA — Supabase Schema Setup
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fiwzgtxfabzlxxnqgjhd/sql
-- ============================================================

-- 1. Create the submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    -- Primary key & metadata
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_ref  TEXT,
    status          TEXT DEFAULT 'Pending Review',
    created_at      TIMESTAMPTZ DEFAULT now(),

    -- Step 1: Identity & Location
    fname           TEXT,
    lname           TEXT,
    display_name    TEXT,
    city            TEXT,
    state           TEXT,
    work_location   TEXT,
    email           TEXT,
    phone           TEXT,

    -- Step 2: Professional Focus
    primary_profession  TEXT,
    other_profession    TEXT,
    has_secondary       TEXT DEFAULT 'No',
    secondary_roles     TEXT,
    genres              TEXT,
    genre_generic       TEXT,

    -- Step 3: Experience & Credentials
    experience_years    TEXT,
    institution         TEXT,
    awards              TEXT,
    has_publication     TEXT DEFAULT 'No',
    publications        TEXT,

    -- Step 4: Work & Rates
    budget_range    TEXT,
    clients         TEXT,
    industries      TEXT,

    -- Step 5: Online Presence
    website         TEXT,
    studio_website  TEXT,
    instagram       TEXT,
    vimeo           TEXT,
    linkedin        TEXT,

    -- Step 6: Bio & Goals
    bio             TEXT,
    open_to         TEXT,

    -- Step 7: Photo & Consent
    photo_base64    TEXT,
    open_to_features TEXT DEFAULT 'No',
    consent_given   TEXT DEFAULT 'No'
);

-- Add a comment describing the table
COMMENT ON TABLE public.submissions IS 'The Black Book India — Creative professional directory submissions';


-- 2. Enable Row Level Security (mandatory for any public-facing table)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;


-- 3. RLS Policy: Allow anonymous inserts from the frontend form
--    The anon key can INSERT new rows, but cannot read, update, or delete.
CREATE POLICY "Allow anonymous form submissions"
    ON public.submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);


-- 4. RLS Policy: Only the service_role (your backend/dashboard) can read all data
CREATE POLICY "Service role full access"
    ON public.submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 5. Grant the anon role permission to INSERT into this table
--    (Required depending on your project's Data API settings)
GRANT INSERT ON public.submissions TO anon;


-- 6. Indexes for performance and duplicate detection
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions (email);
CREATE INDEX IF NOT EXISTS idx_submissions_phone ON public.submissions (phone);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);


-- ============================================================
-- DONE! Your table is ready to receive submissions.
-- ============================================================
