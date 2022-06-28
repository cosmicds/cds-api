SELECT 
    *
FROM
    HubbleMeasurements
WHERE
    student_id IN (SELECT 
    student_id
FROM
    HubbleMeasurements
WHERE
    rest_wave_value IS NOT NULL
        AND obs_wave_value IS NOT NULL
        AND est_dist_value IS NOT NULL
        AND velocity_value IS NOT NULL
        AND ang_size_value IS NOT NULL
	GROUP BY student_id
	HAVING COUNT(student_id) = 5);
