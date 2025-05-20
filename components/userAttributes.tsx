'use client';

import { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

export type UserAttributes = Partial<Record<string, string>>;

export default function useUserAttributes() {
    const [attributes, setAttributes] = useState<UserAttributes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const getUserAttributes = async () => {
            try {
                const fetched = await fetchUserAttributes();
                const filtered = Object.fromEntries(
                    Object.entries(fetched).filter(([_, v]) => v !== undefined)
                );
                setAttributes(filtered);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        getUserAttributes();
    }, []);

    return { attributes, loading, error };
}
