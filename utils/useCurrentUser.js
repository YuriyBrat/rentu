// hooks/useCurrentUser.js
import { useEffect, useState } from 'react';

export default function useCurrentUser() {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch('/api/crm/me')
         .then((r) => r.json())
         .then((data) => {
            setUser(data?.user || null);
         })
         .finally(() => setLoading(false));
   }, []);

   return { user, loading };
}