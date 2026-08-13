-- Migra datos existentes al nuevo modelo de rachas O(1).
-- Ejecutar DESPUÉS de aplicar la migración de schema.

-- 1. Poblar lastActivityDate desde el ActivityLog más reciente con actividad
UPDATE "User" u
SET "lastActivityDate" = sub.last_date
FROM (
  SELECT
    "userId",
    MAX("date") as last_date
  FROM "ActivityLog"
  WHERE "questionsAnswered" > 0
     OR "nodesCompleted" > 0
     OR "simulacrosCompleted" > 0
  GROUP BY "userId"
) sub
WHERE u.id = sub."userId";

-- 2. Para usuarios sin actividad registrada, usar lastInteraction como fallback
UPDATE "User"
SET "lastActivityDate" = DATE("lastInteraction")
WHERE "lastActivityDate" IS NULL
  AND "lastInteraction" IS NOT NULL;

-- 3. Migrar protectores de racha desde UserItem a user.streakFreezes
UPDATE "User" u
SET "streakFreezes" = COALESCE((
  SELECT SUM("quantity")
  FROM "UserItem"
  WHERE "userId" = u.id
    AND "itemKey" = 'STREAK_FREEZE_1D'
), 0);

-- 4. Recalcular racha para usuarios con actividad reciente
-- Esto corrige rachas que estaban desactualizadas por el bug de diseño anterior.
-- Solo actualizamos usuarios cuya última actividad fue hoy o ayer (racha vigente).
WITH ranked_logs AS (
  SELECT
    "userId",
    "date",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "date" DESC) as rn
  FROM "ActivityLog"
  WHERE "questionsAnswered" > 0
     OR "nodesCompleted" > 0
     OR "simulacrosCompleted" > 0
),
streak_calc AS (
  SELECT
    "userId",
    COUNT(*) as streak_days
  FROM ranked_logs
  WHERE rn <= (
    SELECT COUNT(*)
    FROM ranked_logs rl2
    WHERE rl2."userId" = ranked_logs."userId"
  )
  GROUP BY "userId"
)
UPDATE "User" u
SET "streak" = sc.streak_days
FROM streak_calc sc
WHERE u.id = sc."userId"
  AND u."lastActivityDate" >= CURRENT_DATE - INTERVAL '1 day';
