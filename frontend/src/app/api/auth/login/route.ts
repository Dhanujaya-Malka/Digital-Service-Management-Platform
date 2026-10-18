
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error("BACKEND_API_URL is not configured.");
      return NextResponse.json(
        { message: "Login service is not configured." },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(
      `${backendUrl}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Login failed." },
        { status: backendResponse.status }
      );
    }

    if (
      typeof data.token !== "string" ||
      !data.user ||
      typeof data.user.id === "undefined"
    ) {
      return NextResponse.json(
        { message: "Invalid login response from server." },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful.",
      user: data.user,
    });

    response.cookies.set("v2nexus_session", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Number(data.expiresIn) || 3600,
    });

    return response;
  } catch (error) {
    console.error("Login route failed:", error);

    return NextResponse.json(
      { message: "Could not connect to the login service." },
      { status: 502 }
    );
  }
}
