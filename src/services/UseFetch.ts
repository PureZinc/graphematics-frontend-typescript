import { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

type FetchData<T> = {
    data: T | null,
    loading: boolean,
    error: string | null
}
const useFetch = <T>(url: string, method = 'GET', body = null, token = null): FetchData<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            };

            try {
                const response = await fetch(BASE_URL + url, options);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body, token]);

    return { data, loading, error };
};

export default useFetch;