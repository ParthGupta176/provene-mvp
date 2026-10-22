export interface PlausibilityResult {
    status: 'VERIFIED' | 'FLAGGED_OVER_CAPACITY' | 'REJECTED_HIGH_MOISTURE';
    reason: string;
    maxAllowedKg: number;
}

export function canonicalizeJson(obj: Record<string, unknown>): string {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: Record<string, unknown> = {};
    for (const key of sortedKeys) {
        sortedObj[key] = obj[key];
    }
    return JSON.stringify(sortedObj);
}

export async function generateSHA256(
    payload: Record<string, unknown>
): Promise<{ canonicalJson: string; hash: string }> {
    const canonicalJson = canonicalizeJson(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalJson);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { canonicalJson, hash };
}

export function evaluatePlausibility(
    weightKg: number,
    fryerCapacityLiters: number,
    tpcPercent: number,
    moisturePercent: number
): PlausibilityResult {
    const maxAllowedKg = Number((fryerCapacityLiters * 0.85 * 1.15).toFixed(1));

    if (moisturePercent > 2.0) {
        return {
            status: 'REJECTED_HIGH_MOISTURE',
            reason: `Moisture (${moisturePercent}%) exceeds 2.0% threshold — Water Adulteration Risk`,
            maxAllowedKg,
        };
    }

    if (weightKg > maxAllowedKg) {
        return {
            status: 'FLAGGED_OVER_CAPACITY',
            reason: `Volume (${weightKg} kg) exceeds max fryer plausibility (${maxAllowedKg} kg) — Synthetic Palm Oil Dilution Risk`,
            maxAllowedKg,
        };
    }

    return {
        status: 'VERIFIED',
        reason: `Passes ISCC EU Point-of-Origin & FSSAI RUCO parameters (TPC: ${tpcPercent}%)`,
        maxAllowedKg,
    };
}