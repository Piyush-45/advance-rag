// lib/tenant.ts
export function namespaceForTenant(tenantId: string) {
  return `tenant:${tenantId}`;
}
