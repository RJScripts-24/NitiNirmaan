-- 1. Create a System User (to own the templates)
-- We need a fixed UUID so we can reference it.
DO $$
DECLARE
  system_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Insert into auth.users if not exists
  -- Note: This requires privileges usually available in Supabase SQL Editor
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

  -- Insert into public.profiles if not exists (triggers might have handled this, but to be safe)
  INSERT INTO public.profiles (id, full_name, organization_name, unlocked_stakeholders)
  VALUES (system_user_id, 'System Admin', 'NitiNirmaan HQ', '["admin"]')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- 2. Clear existing templates to avoid duplicates during re-runs
DELETE FROM public.projects WHERE is_template = true;

-- 3. Insert Real-World Patterns
INSERT INTO public.projects (
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
-- 1. EDUCATION (FLN / Rural)
(
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
-- 2. EDUCATION (National Policy)
(
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
