import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'waitlist.json');

// Ensure data directory exists
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
}

// POST - Add email to waitlist
export async function POST(request: Request) {
  try {
    ensureDataFile();

    const { email, language } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Read existing emails
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    const emails = JSON.parse(fileContent);

    // Check if email already exists
    const emailExists = emails.some((entry: any) => entry.email.toLowerCase() === email.toLowerCase());

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

    // Save to file
    fs.writeFileSync(dataFilePath, JSON.stringify(emails, null, 2));

    console.log(`✅ New waitlist signup: ${email} (${language})`);

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    ensureDataFile();

    // Read emails
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    const emails = JSON.parse(fileContent);

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