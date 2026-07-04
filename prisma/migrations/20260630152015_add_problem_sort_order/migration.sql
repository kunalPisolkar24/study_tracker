-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- Backfill sort_order for existing problems (sequential within each topic+subtopic group)
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY topic_id, COALESCE(sub_topic_id, '')
      ORDER BY created_at ASC
    ) - 1 AS new_order
  FROM "problems"
)
UPDATE "problems" p
SET sort_order = n.new_order
FROM numbered n
WHERE p.id = n.id;
