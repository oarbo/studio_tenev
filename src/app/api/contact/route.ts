import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, projectType, location, message } = data;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Navn og e-post er påkrevd.' },
        { status: 400 }
      );
    }

    // Format the inquiry for logging
    const inquiry = {
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone: phone || null,
      projectType: projectType || null,
      location: location || null,
      message: message || null,
    };

    console.log('--- Ny prosjekthenvendelse mottatt ---');
    console.log(JSON.stringify(inquiry, null, 2));

    // Optional email sending hook if configured in environment
    // E.g. using Resend:
    // if (process.env.RESEND_API_KEY) {
    //   ...
    // }

    return NextResponse.json({
      success: true,
      message: 'Henvendelse er registrert.',
    });
  } catch (error) {
    console.error('Feil ved mottak av henvendelse:', error);
    return NextResponse.json(
      { error: 'Kunne ikke behandle henvendelsen.' },
      { status: 500 }
    );
  }
}
