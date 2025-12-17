import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const q = searchParams.get('q');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    // Filter by owner
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.deliveryDate = {};
      if (startDate) {
        whereClause.deliveryDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.deliveryDate.lte = new Date(endDate);
      }
    }

    // Search by owner name
    if (q) {
      whereClause.owner = {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      };
    }

    const deliveryNotes = await db.deliveryNote.findMany({
      where: whereClause,
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: deliveryNotes,
    });
  } catch (error) {
    console.error('Error fetching delivery notes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch delivery notes',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerId, deliveryDate, notes, vehicleIds } = body;

    // Validate required fields
    if (!ownerId || !deliveryDate || !vehicleIds || !Array.isArray(vehicleIds)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: ownerId, deliveryDate, vehicleIds',
        },
        { status: 400 }
      );
    }

    // Verify owner exists
    const owner = await db.owner.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Owner not found',
        },
        { status: 404 }
      );
    }

    // Verify vehicles exist
    const vehicles = await db.vehicle.findMany({
      where: { id: { in: vehicleIds } },
    });

    if (vehicles.length !== vehicleIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more vehicles not found',
        },
        { status: 404 }
      );
    }

    // Create delivery note
    const deliveryNote = await db.deliveryNote.create({
      data: {
        ownerId,
        deliveryDate: new Date(deliveryDate),
        notes: notes || null,
        vehicleIds: vehicleIds,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: deliveryNote,
    });
  } catch (error) {
    console.error('Error creating delivery note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create delivery note',
      },
      { status: 500 }
    );
  }
}
