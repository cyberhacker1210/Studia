import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, language } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send to Web3Forms
    const formData = {
      access_key: '0a691a94-8de8-445c-82b1-a5accf0d48f7', // ⚠️ REMPLACE PAR TA VRAIE CLÉ
      subject: `🎉 New Studia Waitlist Signup!`,
      from_name: 'Studia Waitlist',
      email: email,
      message: `New signup!\n\nEmail: ${email}\nLanguage: ${language}\nTime: ${new Date().toLocaleString()}\n\nTotal signups so far: Check your inbox!`,
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    console.log(`✅ Signup: ${email} (${language})`);

    return NextResponse.json(
      { message: 'Successfully added to waitlist!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}
