'use client';
import React from 'react';

export default function CheckoutButton() {
    // Bug 1: Invisible button (opacity 0.05 is barely visible but effectively invisible to some)
    // Plan says: "Invisible button (Opacity 0.05)."
    return (
        <button
            id="checkout-btn"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            style={{ opacity: 0.05 }}
            onClick={() => window.location.href = '/checkout-success'}
        >
            Checkout
        </button>
    );
}
