"use server";

import { cookies } from "next/headers";

export const adminLogoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
};
