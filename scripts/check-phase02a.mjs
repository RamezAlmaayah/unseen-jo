// Real, disposable PostgreSQL/PostGIS execution. Auth JWT and Storage service
// contracts are modeled; this does NOT test the hosted Auth/Storage HTTP services.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { postgis } from '@electric-sql/pglite-postgis'
import { readSupabaseConfig } from '../src/lib/supabase/config.js'

const migrations = (await readdir('supabase/migrations')).filter(f => f.includes('_phase02a_') && f.endsWith('.sql')).sort()
const sql = await Promise.all(migrations.map(f => readFile(`supabase/migrations/${f}`, 'utf8')))
const bootstrap = await readFile('supabase/tests/bootstrap.sql', 'utf8')
const seed = await readFile('supabase/seed.sql', 'utf8')
const results = []
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const A = id(1), B = id(2), ADMIN = id(3), PARTNER = id(4), P = id(101), DRAFT = id(102)
const db = new PGlite({ extensions: { postgis } })
let replica
async function check(name, fn) {
  await fn()
  results.push({ name, status: 'passed' })
  console.log(`PASS ${name}`)
}
async function as(role, user, query, parameters = []) {
  assert.ok(['anon', 'authenticated'].includes(role))
  await db.exec(`begin; set local role ${role};`)
  try {
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [user ?? ''])
    return await db.query(query, parameters)
  } finally { await db.exec('rollback') }
}
async function denied(role, user, query, code = '42501') {
  await assert.rejects(as(role, user, query), error => error.code === code,
    `Expected PostgreSQL ${code}: ${query}`)
}
const count = result => Number(result.rows[0].n)
async function ownerRejected(query, code = '23514') {
  await db.exec('begin')
  try { await assert.rejects(db.query(query), error => error.code === code) }
  finally { await db.exec('rollback') }
}
async function catalog(connection) {
  return (await connection.query(`
    select table_name,column_name,data_type,is_nullable,column_default,generation_expression
    from information_schema.columns where table_schema='public' order by table_name,ordinal_position
  `)).rows
}

try {
  await check('migration SQL contains no destructive commands or application-table overwrites', () => {
    for (const migration of sql) {
      const statements = migration.replace(/--[^\n]*/g, '')
      assert.doesNotMatch(statements, /\b(drop|truncate)\b|delete\s+from|create\s+or\s+replace/ig)
    }
  })
  await check('all migrations execute against real PostgreSQL with real PostGIS', async () => {
    await db.exec(bootstrap)
    for (const migration of sql) await db.exec(migration)
  })
  await check('all 11 application tables have RLS enabled', async () => {
    const tables = (await db.query(`select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relkind='r' order by relname`)).rows
    assert.equal(tables.length, 11)
    assert.ok(tables.every(t => t.relrowsecurity))
  })
  await check('category seed is repeatable and creates no sample places or users', async () => {
    await db.exec(seed); await db.exec(seed)
    assert.equal(count(await db.query('select count(*) as n from public.categories')), 7)
    assert.equal(count(await db.query('select count(*) as n from public.places')), 0)
    assert.equal(count(await db.query('select count(*) as n from auth.users')), 0)
  })
  await check('profile trigger ignores role metadata and creates only ordinary user grants', async () => {
    for (const user of [A, B, ADMIN, PARTNER]) {
      await db.query('insert into auth.users(id,raw_user_meta_data) values($1,$2)',
        [user, { full_name: 'Disposable SQL test', role: 'admin', roles: ['admin'] }])
    }
    assert.equal(count(await db.query('select count(*) as n from public.profiles')), 4)
    assert.equal(count(await db.query("select count(*) as n from public.user_roles where role='admin'")), 0)
    await db.query("insert into public.user_roles(user_id,role) values($1,'admin'),($2,'partner')", [ADMIN, PARTNER])
  })

  // Synthetic fixtures only, never deployed/seeded into the real project.
  await db.query(`insert into public.places(id,slug,name,status,latitude,longitude,price_min_jod,price_max_jod)
    values($1,'sql-test-public','Synthetic SQL fixture','published',31.95,35.91,0,10),
      ($2,'sql-test-draft','Synthetic draft','draft',null,null,null,null)`, [P, DRAFT])
  const category = (await db.query("select id from public.categories where slug='nature'")).rows[0].id
  await db.query('insert into public.place_categories(place_id,category_id) values($1,$3),($2,$3)', [P, DRAFT, category])
  await db.query(`insert into public.place_images(place_id,storage_path,alt_text,is_cover)
    values($1,$3,'Synthetic image fixture',true),($2,$4,'Synthetic draft image',true)`,
  [P, DRAFT, `${P}/test.jpg`, `${DRAFT}/test.jpg`])
  await db.query('insert into public.user_preferences(user_id,available_minutes,budget_max_jod) values($1,120,10)', [A])
  await db.query('insert into public.user_preference_categories(user_id,category_id) values($1,$2)', [A, category])
  await db.query('insert into public.saved_places(user_id,place_id) values($1,$2)', [A, P])
  await db.query("insert into public.recommendation_feedback(user_id,place_id,reaction) values($1,$2,'interested')", [A, P])
  await db.query(`insert into storage.objects(bucket_id,name) values
    ('place-images',$1),('place-images',$2),('profile-avatars',$3)`, [`${P}/test.jpg`, `${DRAFT}/test.jpg`, `${A}/test.jpg`])

  for (const role of ['anon', 'authenticated']) {
    await check(`${role} reads published places and hides drafts/associated images/categories`, async () => {
      for (const table of ['places', 'place_images', 'place_categories']) {
        assert.equal(count(await as(role, role === 'anon' ? null : A, `select count(*) as n from public.${table}`)), 1)
      }
    })
  }
  await check('anonymous users read active categories only', async () => {
    await db.query("insert into public.categories(slug,name,is_active) values('test-inactive','Inactive fixture',false)")
    assert.equal(count(await as('anon', null, 'select count(*) as n from public.categories')), 7)
  })
  for (const table of ['profiles', 'user_roles', 'user_preferences', 'user_preference_categories', 'saved_places', 'recommendation_feedback', 'admin_audit_logs']) {
    await check(`anonymous access denied: ${table}`, () => denied('anon', null, `select * from public.${table}`))
  }
  for (const table of ['user_preferences', 'user_preference_categories', 'saved_places', 'recommendation_feedback']) {
    await check(`private ownership protects ${table} including from unrelated admin`, async () => {
      assert.equal(count(await as('authenticated', A, `select count(*) as n from public.${table}`)), 1)
      for (const user of [B, ADMIN]) assert.equal(count(await as('authenticated', user, `select count(*) as n from public.${table}`)), 0)
      assert.equal((await as('authenticated', B, `delete from public.${table} where user_id='${A}' returning *`)).rows.length, 0)
    })
  }
  await check('profiles expose only own record and permit only allowed field updates', async () => {
    assert.equal(count(await as('authenticated', A, 'select count(*) as n from public.profiles')), 1)
    assert.equal((await as('authenticated', A, `update public.profiles set display_name='Changed' where id='${A}' returning display_name`)).rows[0].display_name, 'Changed')
    assert.equal((await as('authenticated', B, `update public.profiles set display_name='Intrusion' where id='${A}' returning *`)).rows.length, 0)
    await denied('authenticated', A, `update public.profiles set created_at=now() where id='${A}'`)
    await denied('authenticated', A, `insert into public.profiles(id) values('${A}')`)
    await denied('authenticated', A, `update public.profiles set avatar_path='${B}/test.jpg' where id='${A}'`, '23514')
  })
  await check('ordinary users and future partners cannot elevate roles or manage content', async () => {
    for (const user of [A, PARTNER]) {
      await denied('authenticated', user, `insert into public.user_roles(user_id,role) values('${user}','admin')`)
      assert.equal((await as('authenticated', user, `update public.user_roles set role='admin' where user_id='${user}' returning *`)).rows.length, 0)
      await denied('authenticated', user, "insert into public.places(slug,name) values('unauthorized','Unauthorized')")
      assert.equal((await as('authenticated', user, `update public.places set name='Intrusion' where id='${P}' returning *`)).rows.length, 0)
      assert.equal((await as('authenticated', user, `delete from public.places where id='${P}' returning *`)).rows.length, 0)
    }
  })
  await check('authenticated role without a user identity has no private or admin access', async () => {
    assert.equal(count(await as('authenticated', null, 'select count(*) as n from public.user_preferences')), 0)
    await denied('authenticated', null, "insert into public.categories(slug,name) values('no-identity','No identity')")
  })
  await check('trusted admin reads drafts, manages content and roles; writes generate audit rows', async () => {
    assert.equal(count(await as('authenticated', ADMIN, 'select count(*) as n from public.places')), 2)
    await db.exec('begin; set local role authenticated')
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [ADMIN])
      await db.query("insert into public.categories(slug,name) values('admin-fixture','Admin fixture')")
      await db.query("insert into public.user_roles(user_id,role,assigned_by) values($1,'partner',$2)", [B, ADMIN])
      await db.query('update public.places set name=$1 where id=$2', ['Admin changed fixture', DRAFT])
      const audits = (await db.query('select * from public.admin_audit_logs where actor_id=$1', [ADMIN])).rows
      assert.ok(audits.length >= 3)
      assert.ok(audits.some(a => a.entity_table === 'user_roles' && a.action === 'INSERT'))
      assert.ok(audits.some(a => a.changed_columns.includes('name')))
    } finally { await db.exec('rollback') }
  })
  await check('audit logs reject direct client writes, including administrators', async () => {
    for (const user of [A, ADMIN]) {
      await denied('authenticated', user, "insert into public.admin_audit_logs(action,entity_table,entity_key) values('INSERT','forged','{}')")
      await denied('authenticated', user, 'update public.admin_audit_logs set actor_id=null')
      await denied('authenticated', user, 'delete from public.admin_audit_logs')
    }
    assert.equal(count(await as('authenticated', A, 'select count(*) as n from public.admin_audit_logs')), 0)
  })
  await check('private trigger functions cannot be called directly by API roles', async () => {
    for (const fn of ['on_auth_user_created', 'audit_change', 'set_updated_at']) {
      await denied('authenticated', A, `select unseen_private.${fn}()`)
    }
    await denied('anon', null, 'select unseen_private.is_admin()')
    assert.equal((await as('authenticated', A, 'select unseen_private.is_admin() as admin')).rows[0].admin, false)
    assert.equal((await as('authenticated', ADMIN, 'select unseen_private.is_admin() as admin')).rows[0].admin, true)
  })
  await check('preferences/interest creation, own updates and deletes work; cross-user writes fail', async () => {
    await as('authenticated', B, `insert into public.user_preferences(user_id,available_minutes) values('${B}',60)`)
    await as('authenticated', A, `insert into public.user_preference_categories(user_id,category_id) values('${A}',(select id from public.categories where slug='food'))`)
    await denied('authenticated', B, `insert into public.user_preference_categories(user_id,category_id) values('${A}','${category}')`)
    await denied('authenticated', B, `insert into public.user_preferences(user_id) values('${A}')`)
    assert.equal((await as('authenticated', A, `update public.user_preferences set available_minutes=30 where user_id='${A}' returning available_minutes`)).rows[0].available_minutes, 30)
    assert.equal((await as('authenticated', B, `update public.user_preferences set available_minutes=30 where user_id='${A}' returning *`)).rows.length, 0)
    await denied('authenticated', A, `update public.user_preferences set user_id='${B}' where user_id='${A}'`)
    assert.equal((await as('authenticated', A, `delete from public.user_preference_categories where user_id='${A}' returning *`)).rows.length, 1)
  })
  await check('saved places allow own published saves/removal, reject foreign owners, drafts and duplicates', async () => {
    await as('authenticated', B, `insert into public.saved_places(user_id,place_id) values('${B}','${P}')`)
    await denied('authenticated', B, `insert into public.saved_places(user_id,place_id) values('${A}','${P}')`)
    await denied('authenticated', B, `insert into public.saved_places(user_id,place_id) values('${B}','${DRAFT}')`)
    await denied('authenticated', A, `insert into public.saved_places(user_id,place_id) values('${A}','${P}')`, '23505')
    assert.equal((await as('authenticated', A, `delete from public.saved_places where user_id='${A}' returning *`)).rows.length, 1)
  })
  await check('feedback insert/update/delete are owner-only and target published places', async () => {
    await as('authenticated', B, `insert into public.recommendation_feedback(user_id,place_id,reaction) values('${B}','${P}','interested')`)
    await denied('authenticated', B, `insert into public.recommendation_feedback(user_id,place_id,reaction) values('${A}','${P}','interested')`)
    await denied('authenticated', B, `insert into public.recommendation_feedback(user_id,place_id,reaction) values('${B}','${DRAFT}','interested')`)
    assert.equal((await as('authenticated', A, `update public.recommendation_feedback set reaction='not_interested' where user_id='${A}' returning reaction`)).rows[0].reaction, 'not_interested')
    assert.equal((await as('authenticated', B, `update public.recommendation_feedback set reaction='visited' where user_id='${A}' returning *`)).rows.length, 0)
    await denied('authenticated', A, `update public.recommendation_feedback set user_id='${B}' where user_id='${A}'`)
  })
  const invalid = [
    ['negative place price', `update public.places set price_min_jod=-1 where id='${P}'`],
    ['NaN price', `update public.places set price_min_jod='NaN' where id='${P}'`],
    ['reversed price range', `update public.places set price_min_jod=20,price_max_jod=10 where id='${P}'`],
    ['zero duration', `update public.places set duration_min_minutes=0 where id='${P}'`],
    ['reversed duration range', `update public.places set duration_min_minutes=120,duration_max_minutes=60 where id='${P}'`],
    ['invalid latitude', `update public.places set latitude=91 where id='${P}'`],
    ['invalid longitude', `update public.places set longitude=-181 where id='${P}'`],
    ['NaN latitude', `update public.places set latitude='NaN' where id='${P}'`],
    ['half coordinate pair', `update public.places set longitude=null where id='${P}'`],
    ['published demo', `update public.places set is_demo=true where id='${P}'`],
    ['verification without evidence', `update public.places set verified_at=now() where id='${P}'`],
    ['negative budget', `update public.user_preferences set budget_min_jod=-1 where user_id='${A}'`],
    ['invalid group', `update public.user_preferences set travel_group='invalid' where user_id='${A}'`],
    ['invalid image folder', `insert into public.place_images(place_id,storage_path,alt_text) values('${P}','${DRAFT}/wrong.jpg','Wrong folder')`],
    ['image path traversal', `insert into public.place_images(place_id,storage_path,alt_text) values('${P}','${P}/../wrong.jpg','Traversal')`],
  ]
  for (const [name, query] of invalid) await check(`constraint: ${name}`, () => ownerRejected(query))
  await check('FKs reject unknown places, categories and users', async () => {
    await ownerRejected(`insert into public.saved_places(user_id,place_id) values('${A}','${id(999)}')`, '23503')
    await ownerRejected(`insert into public.place_categories(place_id,category_id) values('${P}','${id(999)}')`, '23503')
    await ownerRejected(`insert into public.user_roles(user_id,role) values('${id(999)}','user')`, '23503')
  })
  await check('unique slugs, image paths, one cover per place and feedback relationships', async () => {
    await ownerRejected("insert into public.places(slug,name) values('sql-test-public','Duplicate')", '23505')
    await ownerRejected(`insert into public.place_images(place_id,storage_path,alt_text) values('${P}','${P}/test.jpg','Duplicate')`, '23505')
    await ownerRejected(`insert into public.place_images(place_id,storage_path,alt_text,is_cover) values('${P}','${P}/second.jpg','Second cover',true)`, '23505')
    await ownerRejected(`insert into public.recommendation_feedback(user_id,place_id,reaction) values('${A}','${P}','interested')`, '23505')
  })
  await check('PostGIS generated point uses longitude/latitude and meter-based radius queries', async () => {
    const point = (await db.query(`select extensions.st_x(location::extensions.geometry) as lon,
      extensions.st_y(location::extensions.geometry) as lat,
      extensions.st_distance(location,extensions.st_setsrid(extensions.st_makepoint(35.92,31.95),4326)::extensions.geography) as meters
      from public.places where id=$1`, [P])).rows[0]
    assert.equal(point.lon, 35.91); assert.equal(point.lat, 31.95)
    assert.ok(point.meters > 900 && point.meters < 1000)
    assert.equal(count(await as('anon', null, `select count(*) as n from public.places where extensions.st_dwithin(location,
      extensions.st_setsrid(extensions.st_makepoint(35.92,31.95),4326)::extensions.geography,1000)`)), 1)
    assert.equal((await db.query('select location from public.places where id=$1', [DRAFT])).rows[0].location, null)
  })
  await check('all application FKs have a leading index; spatial index exists', async () => {
    const missing = (await db.query(`select c.conname from pg_constraint c join pg_namespace n on n.oid=c.connamespace
      where n.nspname='public' and c.contype='f' and not exists(
        select 1 from pg_index i where i.indrelid=c.conrelid and i.indisvalid and i.indpred is null
        and not exists(select 1 from unnest(c.conkey) with ordinality as k(att,pos)
          where i.indkey[(k.pos-1)::int] is distinct from k.att))`)).rows
    assert.deepEqual(missing, [])
    assert.ok((await db.query("select indexdef from pg_indexes where indexname='places_location_gist_idx'")).rows[0].indexdef.includes('USING gist'))
  })
  await check('both buckets are private with MIME/size restrictions in stored configuration', async () => {
    const buckets = (await db.query('select * from storage.buckets order by id')).rows
    assert.equal(buckets.length, 2)
    assert.ok(buckets.every(b => b.public === false && !b.allowed_mime_types.includes('image/svg+xml')))
    assert.equal(Number(buckets.find(b => b.id === 'profile-avatars').file_size_limit), 2097152)
    assert.equal(Number(buckets.find(b => b.id === 'place-images').file_size_limit), 5242880)
  })
  await check('storage object SELECT policies hide drafts and other users’ avatars', async () => {
    assert.equal(count(await as('anon', null, 'select count(*) as n from storage.objects')), 1)
    assert.equal(count(await as('authenticated', A, 'select count(*) as n from storage.objects')), 2)
    assert.equal(count(await as('authenticated', B, 'select count(*) as n from storage.objects')), 1)
    assert.equal(count(await as('authenticated', ADMIN, 'select count(*) as n from storage.objects')), 2)
  })
  await check('storage object policies permit own avatar operations and block cross-user/moved paths', async () => {
    await as('authenticated', A, `insert into storage.objects(bucket_id,name) values('profile-avatars','${A}/new.jpg')`)
    await denied('authenticated', B, `insert into storage.objects(bucket_id,name) values('profile-avatars','${A}/intrusion.jpg')`)
    await denied('authenticated', A, `update storage.objects set name='${B}/moved.jpg' where name='${A}/test.jpg'`)
    assert.equal((await as('authenticated', B, `delete from storage.objects where name='${A}/test.jpg' returning *`)).rows.length, 0)
    assert.equal((await as('authenticated', A, `delete from storage.objects where name='${A}/test.jpg' returning *`)).rows.length, 1)
    await denied('anon', null, `insert into storage.objects(bucket_id,name) values('profile-avatars','${A}/anon.jpg')`)
  })
  await check('only admin can manage place-image objects, with a real place folder', async () => {
    await denied('authenticated', A, `insert into storage.objects(bucket_id,name) values('place-images','${P}/new.jpg')`)
    await as('authenticated', ADMIN, `insert into storage.objects(bucket_id,name) values('place-images','${P}/new.jpg')`)
    await denied('authenticated', ADMIN, `insert into storage.objects(bucket_id,name) values('place-images','${id(999)}/new.jpg')`)
    assert.equal((await as('authenticated', A, `delete from storage.objects where bucket_id='place-images' returning *`)).rows.length, 0)
    assert.equal((await as('authenticated', ADMIN, `delete from storage.objects where bucket_id='place-images' returning *`)).rows.length, 2)
  })
  await check('private SECURITY DEFINER functions pin search_path; no public RPC functions added', async () => {
    const functions = (await db.query(`select p.proname,p.prosecdef,p.proconfig from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace where n.nspname='unseen_private'`)).rows
    assert.equal(functions.length, 4)
    assert.ok(functions.every(f => f.proconfig?.some(c => c.startsWith('search_path='))))
    assert.equal(count(await db.query(`select count(*) as n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'`)), 0)
  })
  await check('account deletion cleans private relationships while preserving audit history', async () => {
    const disposable = id(5)
    await db.query('insert into auth.users(id) values($1)', [disposable])
    await db.query('insert into public.user_preferences(user_id) values($1)', [disposable])
    await db.query('insert into public.user_preference_categories(user_id,category_id) values($1,$2)', [disposable, category])
    await db.query('insert into public.saved_places(user_id,place_id) values($1,$2)', [disposable, P])
    await db.query("insert into public.recommendation_feedback(user_id,place_id,reaction) values($1,$2,'interested')", [disposable, P])
    const audit = (await db.query(`insert into public.admin_audit_logs(actor_id,action,entity_table,entity_key)
      values($1,'INSERT','cleanup_test','{}') returning id`, [disposable])).rows[0].id
    await db.query('delete from auth.users where id=$1', [disposable])
    assert.equal(count(await db.query('select count(*) as n from public.profiles where id=$1', [disposable])), 0)
    for (const table of ['user_roles','user_preferences','user_preference_categories','saved_places','recommendation_feedback']) {
      assert.equal(count(await db.query(`select count(*) as n from public.${table} where user_id=$1`, [disposable])), 0)
    }
    assert.equal((await db.query('select actor_id from public.admin_audit_logs where id=$1', [audit])).rows[0].actor_id, null)
  })
  await check('browser config rejects secrets, missing pairs and unsafe URLs; blank config is safe', () => {
    assert.equal(readSupabaseConfig({}), null)
    const valid = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }
    assert.equal(readSupabaseConfig(valid).url, 'https://example.supabase.co')
    for (const key of ['sb_secret_test', 'eyJhbGciOiJIUzI1NiJ9.test.signature', 'service_role']) {
      assert.throws(() => readSupabaseConfig({ ...valid, VITE_SUPABASE_PUBLISHABLE_KEY: key }))
    }
    assert.throws(() => readSupabaseConfig({ VITE_SUPABASE_URL: valid.VITE_SUPABASE_URL }))
    assert.throws(() => readSupabaseConfig({ ...valid, VITE_SUPABASE_URL: 'http://example.com' }))
    assert.throws(() => readSupabaseConfig({ ...valid, VITE_SUPABASE_URL: 'https://user:password@example.com/path' }))
  })
  await check('fresh database replay reproduces the application schema and policy definitions', async () => {
    replica = new PGlite({ extensions: { postgis } })
    await replica.exec(bootstrap)
    for (const migration of sql) await replica.exec(migration)
    await replica.exec(seed)
    assert.deepEqual(await catalog(replica), await catalog(db))
    const policyQuery = "select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by 1,2,3"
    assert.deepEqual((await replica.query(policyQuery)).rows, (await db.query(policyQuery)).rows)
  })
  const metadata = (await db.query('select version() as postgres,extensions.postgis_full_version() as postgis')).rows[0]
  const report = {
    engine: 'PGlite WebAssembly PostgreSQL with experimental PostGIS extension', metadata,
    platformContracts: 'Minimal simulated auth.users/auth.uid and storage tables; no hosted HTTP services.',
    remoteTestsExecuted: false,
    migrations: migrations.map((name, i) => ({ name, sha256: createHash('sha256').update(sql[i]).digest('hex') })),
    passed: results.length, results,
  }
  await mkdir('artifacts/phase02a', { recursive: true })
  await writeFile('artifacts/phase02a/database-tests.json', JSON.stringify(report, null, 2) + '\n')
  console.log(`\n${results.length} checks passed. Remote Supabase/Auth/Storage HTTP checks NOT executed.`)
} finally {
  await replica?.close()
  await db.close()
}
