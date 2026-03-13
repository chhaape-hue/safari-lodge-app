import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"

export const supabase = createClient(url, key, {
  auth: {
    // Bypass Web Lock API to prevent "lock request is aborted" errors
    // when multiple tabs are open concurrently.
    lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> => fn(),
  },
})
