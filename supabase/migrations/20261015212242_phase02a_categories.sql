-- Vocabulary from the existing UI, not tourism facts or sample user accounts.
insert into public.categories(slug,name,sort_order) values
  ('nature','Nature',10), ('food','Food',20), ('history','History',30),
  ('culture','Culture',40), ('adventure','Adventure',50),
  ('photography','Photography',60), ('family','Family',70)
on conflict (slug) do nothing;
