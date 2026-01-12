-- Fix conversation_preferences RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can manage their own preferences" ON conversation_preferences;

-- Create policy for SELECT
CREATE POLICY "Users can select their preferences"
  ON conversation_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for INSERT
CREATE POLICY "Users can insert their preferences"
  ON conversation_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policy for UPDATE
CREATE POLICY "Users can update their preferences"
  ON conversation_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policy for DELETE
CREATE POLICY "Users can delete their preferences"
  ON conversation_preferences FOR DELETE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON conversation_preferences TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
