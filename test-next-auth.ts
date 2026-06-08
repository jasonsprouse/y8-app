import NextAuth from "next-auth";
import { authOptions } from "./utils/auth";

const handler = NextAuth(authOptions);
console.log("handler is:", handler);
