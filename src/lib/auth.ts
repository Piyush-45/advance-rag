import { getServerSession } from "next-auth";
export const auth = () => getServerSession(); // simple helper
