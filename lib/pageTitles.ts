export function apexPageTitle(pathname: string, searchParams?: URLSearchParams): string {
  if (pathname.startsWith("/feedback/")) return "Chat thread";
  if (pathname.startsWith("/tenants/") && pathname !== "/tenants") return "Tenant detail";
  if (pathname === "/tenants" && searchParams?.get("filter") === "inactive") {
    return "Inactive tenants";
  }

  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/reports": "Analytics",
    "/tenants": "All tenants",
    "/users": "Tenant users",
    "/pricing": "Pricing catalog",
    "/audit": "Audit log",
    "/payments/setup": "Setup payments",
    "/payments/quarterly": "Quarterly payments",
    "/signups": "New signups",
    "/feedback": "Pharmacy chat",
  };
  return map[pathname] || "Medicare Console";
}
