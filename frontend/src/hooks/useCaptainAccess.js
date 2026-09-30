import {useEffect, useState} from 'react';

// Approval is bound to a principal, never to the identity of a session/user object.
export function useCaptainAccess({session, authLoading, client}) {
  const principalId = !authLoading && session?.access_token &&
    session?.user?.is_anonymous !== true ? session?.user?.id ?? null : null;
  const [access, setAccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function revalidate() {
      if (!principalId) {
        setAccess(null);
        return;
      }
      setAccess(previous => ({principalId, status:'pending', error:'',
        record:previous?.principalId === principalId ? previous.record : null}));
      try {
        const {data, error} = await client.from('captain_access')
          .select('user_id, display_name, boat_name, access_role, access_status')
          .eq('user_id', principalId).maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        // A mismatched row can never confer another captain's approval.
        setAccess({principalId, status:'complete', error:'',
          record:data?.user_id === principalId ? data : null});
      } catch {
        if (!cancelled) setAccess({principalId, status:'error', record:null,
          error:'Pelora could not verify your captain access.'});
      }
    }
    revalidate();
    return () => {cancelled = true;};
    // Session changes intentionally trigger revalidation and propagate credentials.
    // They do not establish principal identity or discard an existing approval.
  }, [principalId, session, client]);

  // This render-time comparison rejects sign-out/principal changes immediately,
  // before effect cleanup or a new lookup can run.
  const current = principalId && access?.principalId === principalId ? access : null;
  const approved = Boolean(current?.record?.access_status === 'approved' &&
    ['founder', 'founding_captain'].includes(current?.record?.access_role));
  const pending = Boolean(principalId && (!current || current.status === 'pending'));
  return {principalId, approved, initialLoading:pending && !approved,
    revalidating:pending && approved, accessError:current?.error || ''};
}
