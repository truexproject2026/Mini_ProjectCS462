import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metricsPath = path.join(process.cwd(), 'models', 'metrics.json');
    
    if (!fs.existsSync(metricsPath)) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Metrics not found. Please run train_model.py first.' 
      }, { status: 404 });
    }

    const data = fs.readFileSync(metricsPath, 'utf-8');
    const metrics = JSON.parse(data);

    return NextResponse.json({ 
      status: 'success', 
      metrics 
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
