import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend format
    const transformed = registrations.map(reg => ({
      id: reg.id,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      location: reg.location.toLowerCase(),
      weekStart: reg.weekStart.toISOString().split('T')[0],
      createdAt: reg.createdAt.toISOString(),
      status: reg.status.toLowerCase(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const registration = await prisma.registration.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        location: body.location.toUpperCase() as 'SODERMALM' | 'GARDET',
        weekStart: new Date(body.weekStart),
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      location: registration.location.toLowerCase(),
      weekStart: registration.weekStart.toISOString().split('T')[0],
      createdAt: registration.createdAt.toISOString(),
      status: registration.status.toLowerCase(),
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}
