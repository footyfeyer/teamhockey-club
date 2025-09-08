// lib/supabaseClient.js

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://xddbeclwfojyrmwykqwz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZGJlY2x3Zm9qeXJtd3lrcXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3MDMsImV4cCI6MjA2MjAzOTcwM30.Pa8CfI046FVDh5qsOvv1-sT1e2Hw8UmzXAmiboY9iBI";

export const supabase = createClient(supabaseUrl, supabaseKey);
