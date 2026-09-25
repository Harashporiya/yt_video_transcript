import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import axios from "axios"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 2 * 24 * 60 * 60, // matches the backend JWT lifetime
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // The backend verifies this token with Google instead of trusting a raw email
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/google`, {
                        idToken: account.id_token
                    });

                    if (response.status === 200 || response.status === 201) {
                        user.id = response.data.user.id;
                        (user as any).backendToken = response.data.token;
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Google Auth Backend Sync Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {

            if (account && user) {
                token.backendToken = (user as any).backendToken;
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.userId as string;
                (session as any).backendToken = token.backendToken as string;
            }
            return session;
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
