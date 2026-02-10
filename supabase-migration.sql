-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_name TEXT NOT NULL DEFAULT 'Unnamed Device',
  device_fingerprint TEXT UNIQUE NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  battery_charging BOOLEAN,
  uptime_seconds BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create session_types table
CREATE TABLE session_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url_template TEXT NOT NULL,
  icon_url TEXT,
  allow_url_preview BOOLEAN NOT NULL DEFAULT false,
  iframe_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  session_type_id UUID NOT NULL REFERENCES session_types(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed')),
  created_by TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create device_students table
CREATE TABLE device_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  student_names TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create device_activity table
CREATE TABLE device_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  screenshot_url TEXT,
  student_work_url TEXT,
  mouse_activity_count INTEGER NOT NULL DEFAULT 0,
  keyboard_activity_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_devices_fingerprint ON devices(device_fingerprint);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
CREATE INDEX idx_device_students_device_id ON device_students(device_id);
CREATE INDEX idx_device_students_session_id ON device_students(session_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_device_activity_device_id ON device_activity(device_id);
CREATE INDEX idx_device_activity_session_id ON device_activity(session_id);
CREATE INDEX idx_device_activity_recorded_at ON device_activity(recorded_at);

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (kiosks need to read)
CREATE POLICY "Allow public read access to devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on devices" ON devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on devices" ON devices FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to session_types" ON session_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert on session_types" ON session_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on session_types" ON session_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on session_types" ON session_types FOR DELETE USING (true);

CREATE POLICY "Allow public read access to sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on sessions" ON sessions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on sessions" ON sessions FOR DELETE USING (true);

CREATE POLICY "Allow public read access to device_students" ON device_students FOR SELECT USING (true);
CREATE POLICY "Allow public insert on device_students" ON device_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on device_students" ON device_students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on device_students" ON device_students FOR DELETE USING (true);

CREATE POLICY "Allow public read access to device_activity" ON device_activity FOR SELECT USING (true);
CREATE POLICY "Allow public insert on device_activity" ON device_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on device_activity" ON device_activity FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on settings" ON settings FOR UPDATE USING (true);

-- Insert default session types
INSERT INTO session_types (name, url_template, allow_url_preview, iframe_enabled) VALUES
  ('SPIKE', 'https://spike.legoeducation.com', false, true),
  ('Canva', 'https://www.canva.com', true, true),
  ('Google Docs', 'https://docs.google.com', true, true),
  ('Scratch', 'https://scratch.mit.edu', false, true),
  ('TinkerCAD', 'https://www.tinkercad.com', true, true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE devices;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE device_students;
ALTER PUBLICATION supabase_realtime ADD TABLE device_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE session_types;

