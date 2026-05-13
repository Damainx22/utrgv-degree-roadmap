CREATE TABLE IF NOT EXISTS degree_plans (
    id            SERIAL PRIMARY KEY,
    program_id    INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id     INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    year          INT NOT NULL CHECK (year BETWEEN 1 AND 6),
    semester      VARCHAR(10) NOT NULL CHECK (semester IN ('Fall', 'Spring', 'Summer')),
    display_order INT DEFAULT 0,
    notes         TEXT,
    UNIQUE(program_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_degree_plans_program ON degree_plans(program_id);
