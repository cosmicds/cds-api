export function randomString(): string {
    return (Math.random()*1e32).toString(36);
}
