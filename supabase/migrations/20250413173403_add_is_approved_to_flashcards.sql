-- Add is_approved column to flashcards table
ALTER TABLE flashcards
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Update existing records to have is_approved = true for manually created cards
UPDATE flashcards
SET is_approved = true
WHERE is_manually_created = true;

-- Add comment to the column
COMMENT ON COLUMN flashcards.is_approved IS 'Indicates whether the flashcard has been approved for use'; 