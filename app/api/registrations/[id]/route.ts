import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.registration.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const registration = await prisma.registration.update({
      where: { id: params.id },
      data: {
        status: body.status.toUpperCase() as 'CONFIRMED' | 'WAITLIST' | 'CANCELLED',
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
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}
