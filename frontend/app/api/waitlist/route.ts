import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const WAITLIST_KEY = 'studia:waitlist';

// POST - Add email to waitlist
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

    // Get existing emails
    const emails: any[] = (await kv.get(WAITLIST_KEY)) || [];

    // Check if email already exists
    const emailExists = emails.some(
      (entry: any) => entry.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Add new email
    const newEntry = {
      id: emails.length + 1,
      email,
      language,
      createdAt: new Date().toISOString(),
    };

    emails.push(newEntry);

    // Save to KV
    await kv.set(WAITLIST_KEY, emails);

    console.log(`✅ New signup: ${email} (${language})`);

    return NextResponse.json(
      { message: 'Successfully added to waitlist!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}

// GET - View all emails (Admin only)
export async function GET(request: Request) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.ADMIN_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all emails
    const emails: any[] = (await kv.get(WAITLIST_KEY)) || [];

    return NextResponse.json({
      total: emails.length,
      emails: emails,
    });
  } catch (error) {
    console.error('❌ Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}