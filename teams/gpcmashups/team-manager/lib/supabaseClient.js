// lib/supabaseClient.js

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://ibtymcsmwmtofwuecrfp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidHltY3Ntd210b2Z3dWVjcmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTQ2MTEsImV4cCI6MjA3MjkzMDYxMX0.CHijl28sjBzswANW1W7JwJ5Xj9_-ttAFCmYsCpbMpRQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
