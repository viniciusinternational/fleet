import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deliveryNote = await db.deliveryNote.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!deliveryNote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery note not found',
        },
        { status: 404 }
      );
    }

    // Fetch vehicles by IDs
    const vehicleIds = deliveryNote.vehicleIds as string[];
    const vehicles = await db.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      include: {
        owner: true,
      },
    });

    // Transform vehicles to match DeliveryVehicle interface
    const deliveryVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      status: vehicle.status,
      trim: vehicle.trim,
      engineType: vehicle.engineType,
    }));

    const result = {
      ...deliveryNote,
      vehicles: deliveryVehicles,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch delivery note',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ownerId, deliveryDate, notes, vehicleIds } = body;

    // Check if delivery note exists
    const existingNote = await db.deliveryNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery note not found',
        },
        { status: 404 }
      );
    }

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

    // Update delivery note
    const deliveryNote = await db.deliveryNote.update({
      where: { id },
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
    console.error('Error updating delivery note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update delivery note',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if delivery note exists
    const existingNote = await db.deliveryNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery note not found',
        },
        { status: 404 }
      );
    }

    // Delete delivery note
    await db.deliveryNote.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting delivery note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete delivery note',
      },
      { status: 500 }
    );
  }
}
