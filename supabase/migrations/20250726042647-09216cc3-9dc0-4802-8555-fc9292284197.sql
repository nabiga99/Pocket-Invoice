-- Add new fields to businesses table for social media, category, and location
ALTER TABLE businesses ADD COLUMN social_media_links JSONB DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN business_category TEXT;
ALTER TABLE businesses ADD COLUMN town_city TEXT;
ALTER TABLE businesses ADD COLUMN region TEXT;

-- Add location fields to events table  
ALTER TABLE events ADD COLUMN town_city TEXT;
ALTER TABLE events ADD COLUMN region TEXT;
ALTER TABLE events ADD COLUMN gps_address TEXT;

-- Update documents table content structure is already flexible via JSONB
-- No schema changes needed for invoices and receipts as content is JSONB