import {validateLocalQaClientConfiguration} from '../utils/localQaStartup.js';
import {
  createClient
} from "@supabase/supabase-js";


validateLocalQaClientConfiguration(import.meta.env); // Validate before SDK creation/Auth effects.

const supabaseUrl =
  import.meta.env
    .VITE_SUPABASE_URL;

const supabasePublishableKey =
  import.meta.env
    .VITE_SUPABASE_PUBLISHABLE_KEY;


if (
  !supabaseUrl ||
  !supabasePublishableKey
) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}


export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey
  );