-- Run this ONCE after your first `prisma migrate dev`, against Supabase.
-- Easiest way: paste into the Supabase Dashboard -> SQL Editor -> Run.
-- (Prisma's schema language has no concept of tsvector triggers/GIN indexes,
-- so this piece stays as plain SQL rather than being expressed in schema.prisma.)

CREATE INDEX IF NOT EXISTS idx_tasks_search_vector ON tasks USING GIN (search_vector);

CREATE OR REPLACE FUNCTION tasks_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_search_vector_trigger ON tasks;
CREATE TRIGGER tasks_search_vector_trigger
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION tasks_search_vector_update();
