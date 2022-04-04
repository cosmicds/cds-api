export interface User {
    id: number;
    email: string;
    password: string;
    verified: number;
    verification_code: string;
    institution: string | null;
    age: number | null;
    gender: string | null;
    ip: string | null;
    lat: string | null;
    lon: string | null;
    profile_created: Date;
    visits: number;
    last_visit: Date;
    last_visit_ip: string | null;
}
