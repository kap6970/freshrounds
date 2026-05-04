const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, name, phone, address, bags, detergent, rush } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Fresh Rounds Laundry Service',
            description: `${bags} bag(s) · ${detergent}${rush ? ' · Rush delivery' : ''}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://freshroundsva.com/?booked=true',
      cancel_url: 'https://freshroundsva.com/#contact',
      metadata: { name, phone, address, bags: String(bags), detergent, rush: rush ? 'yes' : 'no' },
      payment_intent_data: {
        description: `Fresh Rounds — ${name} — ${bags} bag(s)`,
        metadata: { name, phone, address, bags: String(bags), detergent, rush: rush ? 'yes' : 'no' },
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
