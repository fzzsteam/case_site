import "server-only";

export function getMysqlUrl(): string {
  const url = process.env.MYSQL_URL;
  if (!url) throw new Error("MySQL is not configured");
  return url;
}
