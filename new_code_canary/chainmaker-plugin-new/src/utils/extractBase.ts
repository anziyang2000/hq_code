export function extractBaseNodeIp(nodeIp: string | undefined): string | undefined {
    if (!nodeIp) return undefined;
    try {
        const url = new URL(nodeIp);
        return `${url.protocol}//${url.hostname}`; // eg: http://192.168.10.127
    } catch {
        return nodeIp.split(':').slice(0, 2).join(':'); // fallback
    }
}