import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const useLookups = () => {
    const [governments, setGovernments] = useState([]);
    const [zones, setZones] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [zonesLoading, setZonesLoading] = useState(false);

    useEffect(() => {
        const fetchInitialLookups = async () => {
            setLoading(true);
            try {
                const [levelsRes, governmentsRes, subjectsRes] = await Promise.all([
                    axios.get('/levels'),
                    axios.get('/governments'),
                    axios.get('/subjects')
                ]);

                if (levelsRes.data.success) {
                    setLevels(levelsRes.data.data);
                }

                if (governmentsRes.data.success) {
                    setGovernments(governmentsRes.data.data);
                }

                if (subjectsRes.data.success) {
                    setSubjects(subjectsRes.data.data);
                }

            } catch (error) {
                console.error("Failed to fetch lookups:", error);
                // Fallback or error handling could go here
            } finally {
                setLoading(false);
            }
        };

        fetchInitialLookups();
    }, []);

    const getZonesByGovernment = useCallback(async (govId) => {
        if (!govId) {
            setZones([]);
            return;
        }

        setZonesLoading(true);
        try {
            const response = await axios.get(`/governments/${govId}/zones`);
            if (response.data.success) {
                setZones(response.data.data);
            } else {
                setZones([]);
            }
        } catch (error) {
            console.error(`Failed to fetch zones for government ${govId}:`, error);
            setZones([]);
        } finally {
            setZonesLoading(false);
        }
    }, []);

    return {
        governments,
        zones,
        subjects,
        levels,
        getZonesByGovernment,
        loading,
        zonesLoading
    };
};

export default useLookups;
