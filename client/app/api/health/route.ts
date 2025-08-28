// Health check API route for Next.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        backend: 'connected', // You can add actual backend connection check here
      }
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString() 
      }, 
      { status: 500 }
    );
  }
}
