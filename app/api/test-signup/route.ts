import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, type NewUser } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/session';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    console.log('Received data:', data);
    
    const result = signUpSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.errors }, { status: 400 });
    }

    const { email, password } = result.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const newUser: NewUser = {
      email,
      passwordHash,
      name: null
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();
    
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: createdUser.id 
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
