-- 1. Create a System User (to own the templates)
-- We need a fixed UUID so we can reference it.
DO $$
DECLARE
  system_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = system_user_id) THEN
    INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      system_user_id,
      'authenticated',
      'authenticated',
      'system@nitinirmaan.ai',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"NitiNirmaan System"}',
      now(),
      now()
    );
  END IF;

  -- Insert into public.profiles if not exists
  INSERT INTO public.profiles (id, full_name, organization_name, unlocked_stakeholders)
  VALUES (system_user_id, 'System Admin', 'NitiNirmaan HQ', '["admin"]')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- 2. Clear existing templates to avoid duplicates during re-runs
DELETE FROM public.projects WHERE is_template = true;

-- 3. Insert Real-World Patterns with FIXED UUIDs
INSERT INTO public.projects (
  id,
  owner_id,
  title,
  description,
  is_template,
  simulation_status,
  primary_domain,
  operating_scale,
  geography,
  intervention_levers,
  institution,
  metadata
)
VALUES
-- 1. EDUCATION (FLN / Rural) - Pratham
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'Pratham Read India (TaRL)',
  'A proven model to improve foundational literacy and numeracy (FLN) using the "Teaching at the Right Level" (TaRL) methodology. Instead of teaching by grade, children are grouped by ability.',
  true,
  'verified',
  'FLN',
  'District',
  'Rural',
  ARRAY['Pedagogy', 'Capacity Building', 'Community Engagement'],
  'Pratham Education Foundation',
  '{
    "core_outcome": "Every child in school and learning well",
    "success_rate": "High",
    "beneficiaries": "Children aged 6-14",
    "key_components": ["Learning Camps", "Volunteer Training", "Assessment Tools"]
  }'::jsonb
),
-- 2. EDUCATION (National Policy) - NIPUN Bharat
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '00000000-0000-0000-0000-000000000000',
  'NIPUN Bharat Mission',
  'National Initiative for Proficiency in Reading with Understanding and Numeracy. Aims to ensure every child achieves desired learning competencies in reading, writing, and numeracy by the end of Grade 3.',
  true,
  'verified',
  'FLN',
  'National',
  'Mixed',
  ARRAY['Governance', 'Curriculum Design', 'Teacher Training'],
  'Ministry of Education, GOI',
  '{
    "core_outcome": "Universal acquisition of FLN skills by Grade 3",
    "success_rate": "Ongoing",
    "beneficiaries": "Children aged 3-9",
    "key_components": ["Lakshya Targets", "Vidya Pravesh", "NISHTHA Training"]
  }'::jsonb
),
-- 3. EDUCATION (School-to-Work / Dropouts)
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'Anandshala (Quest Alliance)',
  'A model to make schools deeper learning environments to prevent dropouts. Focuses on student engagement, parent-teacher partnerships, and making schools joyful spaces.',
  true,
  'verified',
  'School-to-Work',
  'District',
  'Rural',
  ARRAY['Community Engagement', 'School Leadership', 'Pedagogy'],
  'Quest Alliance',
  '{
    "core_outcome": "Stay, Engage, Learn",
    "success_rate": "High",
    "beneficiaries": "Adolescents (Grades 5-8)",
    "key_components": ["Joyful Learning", "SMC Strengthening", "Data Driven Decisions"]
  }'::jsonb
),
-- 4. GOVERNANCE (Data Driven)
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'Aspirational Districts Programme',
  'Transformation of 112 most under-developed districts across India. Driven by the 3Cs: Convergence (of schemes), Collaboration (center-state), and Competition (district ranking).',
  true,
  'verified',
  'Governance',
  'District',
  'Rural',
  ARRAY['Governance', 'Data Monitoring', 'Public Service Delivery'],
  'NITI Aayog',
  '{
    "core_outcome": "Rapid transformation of key socio-economic indicators",
    "success_rate": "Very High",
    "beneficiaries": "Citizens of 112 districts",
    "key_components": ["Delta Ranking", "Champions of Change Dashboard", "District Fellows"]
  }'::jsonb
),
-- 5. HEALTH & NUTRITION (Scale)
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'PM POSHAN (Mid-Day Meal)',
  'World''s largest school feeding program. Provides hot cooked meals to children in primary and upper primary classes in government schools to improve nutrition and attendance.',
  true,
  'verified',
  'Health & Nutrition',
  'National',
  'Rural',
  ARRAY['Service Delivery', 'Community Participation', 'Infrastructure'],
  'Ministry of Education',
  '{
    "core_outcome": "Improved nutritional status and school retention",
    "success_rate": "High",
    "beneficiaries": "120 Million Children",
    "key_components": ["Kitchen-cum-stores", "Tithi Bhojan", "Social Audit"]
  }'::jsonb
),
-- 6. LIVELIHOODS (SHG Model)
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'NRLM (DAY-NRLM)',
  'Deendayal Antyodaya Yojana - National Rural Livelihoods Mission. Focuses on mobilizing rural poor women into Self Help Groups (SHGs) and linking them to banks for sustainable livelihoods.',
  true,
  'verified',
  'Livelihoods',
  'National',
  'Rural',
  ARRAY['Capacity Building', 'Financial Inclusion', 'Institution Building'],
  'Ministry of Rural Development',
  '{
    "core_outcome": "Poverty alleviation through self-employment",
    "success_rate": "High",
    "beneficiaries": "Rural Poor Women",
    "key_components": ["Social Mobilization", "Financial Inclusion", "Livelihood Promotion"]
  }'::jsonb
),
-- 7. EDTECH (Digital Public Infrastructure)
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'DIKSHA (One Nation One Platform)',
  'National Digital Infrastructure for Teachers. Offers energized textbooks (QR coded), training modules (NISHTHA), and e-content for students and teachers across India.',
  true,
  'verified',
  'EdTech',
  'National',
  'Mixed',
  ARRAY['EdTech', 'Teacher Training', 'Curriculum Design'],
  'NCERT / MoE',
  '{
    "core_outcome": "Equitable access to quality e-learning resources",
    "success_rate": "High",
    "beneficiaries": "Teachers and Students globally",
    "key_components": ["Sunbird Architecture", "QR Coded Textbooks", "Teacher Courses"]
  }'::jsonb
);

-- 4. Seed Nodes & Edges for Pratham
INSERT INTO public.nodes (id, project_id, type, position, data) VALUES
('p-node-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'stakeholder', '{"x": 100, "y": 100}', '{"label": "Rural Children (Gr 3-5)"}'),
('p-node-2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'intervention', '{"x": 400, "y": 100}', '{"label": "Learning Camps (TaRL)"}'),
('p-node-3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'outcome', '{"x": 700, "y": 100}', '{"label": "Foundational Literacy"}'),
('p-node-4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'stakeholder', '{"x": 100, "y": 250}', '{"label": "Community Volunteers"}'),
('p-node-5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'resource', '{"x": 400, "y": 250}', '{"label": "Teaching Materials"}');

INSERT INTO public.edges (id, project_id, source, target, label) VALUES
('p-edge-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p-node-1', 'p-node-2', 'Attends'),
('p-edge-2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p-node-2', 'p-node-3', 'Improves'),
('p-edge-3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p-node-4', 'p-node-2', 'Facilitates'),
('p-edge-4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p-node-5', 'p-node-2', 'Used in');

-- 5. Seed Nodes & Edges for NIPUN Bharat
INSERT INTO public.nodes (id, project_id, type, position, data) VALUES
('n-node-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'stakeholder', '{"x": 50, "y": 50}', '{"label": "Ministry of Education"}'),
('n-node-2', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'intervention', '{"x": 300, "y": 50}', '{"label": "Vidya Pravesh Module"}'),
('n-node-3', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'outcome', '{"x": 600, "y": 50}', '{"label": "Grade 3 Competency"}'),
('n-node-4', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'practiceChange', '{"x": 300, "y": 200}', '{"label": "Play-based Pedagogy"}');

INSERT INTO public.edges (id, project_id, source, target, label) VALUES
('n-edge-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'n-node-1', 'n-node-2', 'Launches'),
('n-edge-2', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'n-node-2', 'n-node-3', 'Ensures'),
('n-edge-3', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'n-node-4', 'n-node-3', 'Supports');
