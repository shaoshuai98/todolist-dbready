import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, activityLogs, type NewActivityLog, ActivityType } from '@/lib/db/schema';
import { comparePasswords, setSession } from '@/lib/auth/session';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || '',
    metadata: metadata || null
  };
  await db.insert(activityLogs).values(newActivity);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    const result = signInSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUser.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password. Please try again.' }, { status: 400 });
    }

    const user = foundUser[0];

    const isPasswordValid = await comparePasswords(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password. Please try again.' }, { status: 400 });
    }

    await Promise.all([
      setSession(user),
      logActivity(user.id, ActivityType.SIGN_IN)
    ]);

    return NextResponse.json({ success: true, redirectTo: '/' });
    
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
