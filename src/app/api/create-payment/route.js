import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/libs/firebase';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Input validation helper
function validatePaymentInput(amount, courseId) {
  const errors = [];
  
  // Amount validation
  if (typeof amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (amount > 100000) {
    errors.push('Amount cannot exceed ₹100,000');
  } else if (!Number.isInteger(amount)) {
    errors.push('Amount must be a whole number');
  }
  
  // Course ID validation
  if (typeof courseId !== 'string') {
    errors.push('Course ID must be a string');
  } else if (courseId.length === 0) {
    errors.push('Course ID cannot be empty');
  } else if (courseId.length > 50) {
    errors.push('Course ID too long');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(courseId)) {
    errors.push('Course ID contains invalid characters');
  }
  
  return errors;
}

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(userId) || [];
  
  // Remove old requests
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(userId, validRequests);
  return true;
}

export async function POST(req) {
  try {
    // Verify authentication first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Note: In a real implementation, you'd verify the Firebase token here
    // For now, we assume the frontend sends a valid token
    
    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { amount, courseId, userId } = requestData;

    // Validate required fields
    if (!amount || !courseId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, courseId, userId' },
        { status: 400 }
      );
    }

    // Validate input types and values
    const validationErrors = validatePaymentInput(amount, courseId);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // User ID validation
    if (typeof userId !== 'string' || userId.length === 0 || userId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Create Razorpay order with validated data
    const options = {
      amount: Math.floor(amount) * 100, // Ensure integer
      currency: "INR",
      receipt: `course_${courseId}_${userId}_${Date.now()}`.slice(0, 40) // Razorpay receipt limit
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ 
      orderId: order.id,
      amount: Math.floor(amount),
      currency: "INR"
    });
    
  } catch (error) {
    console.error('Payment creation failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Don't leak internal errors to client
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Explicitly deny other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}