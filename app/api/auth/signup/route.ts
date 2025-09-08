import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, activityLogs, type NewUser, type NewActivityLog, ActivityType } from '@/lib/db/schema';
import { hashPassword, setSession } from '@/lib/auth/session';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
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
    
    const result = signUpSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Failed to create user. Please try again.' }, { status: 400 });
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const newUser: NewUser = {
      email,
      passwordHash,
      name: null
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    if (!createdUser) {
      return NextResponse.json({ error: 'Failed to create user. Please try again.' }, { status: 500 });
    }

    await Promise.all([
      logActivity(createdUser.id, ActivityType.SIGN_UP),
      setSession(createdUser)
    ]);

    return NextResponse.json({ success: true, redirectTo: '/' });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
