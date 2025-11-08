-- Add verified field to user_trainings_attended table
ALTER TABLE user_trainings_attended
ADD COLUMN verified BOOLEAN DEFAULT false NOT NULL;