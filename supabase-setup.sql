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
    career_stage        TEXT,
    education           TEXT,
    institution         TEXT,
    awards              TEXT,
    equipment           TEXT,
    has_studio          TEXT,
    primary_instrument  TEXT,
    live_experience     TEXT,
    record_label        TEXT,
    has_publication     TEXT DEFAULT 'No',
    publications        TEXT,

    -- Step 4: Business Details
    biz_type        TEXT,
    studio_name     TEXT,
    year_est        TEXT,
    team_size       TEXT,
    project_scale   TEXT,
    budget_range    TEXT,
    clients         TEXT,
    industries      TEXT,

    -- Step 5: Online Presence
    website         TEXT,
    studio_website  TEXT,
    instagram       TEXT,
    linkedin        TEXT,
    behance         TEXT,
    vimeo           TEXT,
    youtube         TEXT,
    facebook        TEXT,
    twitter         TEXT,
    spotify         TEXT,
    soundcloud      TEXT,
    apple_music     TEXT,
    primary_platform TEXT,
    insta_following TEXT,

    -- Step 6: Bio & Goals
    bio             TEXT,
    working_style   TEXT,
    languages       TEXT,
    open_to         TEXT,
    referral_source TEXT,

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

-- ============================================================
-- MIGRATION SCRIPT (Run this if you already created the table)
-- ============================================================
/*
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS has_studio TEXT,
ADD COLUMN IF NOT EXISTS primary_instrument TEXT,
ADD COLUMN IF NOT EXISTS live_experience TEXT,
ADD COLUMN IF NOT EXISTS record_label TEXT,
ADD COLUMN IF NOT EXISTS spotify TEXT,
ADD COLUMN IF NOT EXISTS soundcloud TEXT,
ADD COLUMN IF NOT EXISTS apple_music TEXT;
*/
