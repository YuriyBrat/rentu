export { default } from "next-auth/middleware";

export const config = {
   matcher: ["/crm/:path*"], // захищає всі сторінки CRM
};
